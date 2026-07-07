import { NextResponse } from 'next/server'
import { atomicCreateMultipleBookings } from '@/lib/db/atomic'
import { getRoomById } from '@/lib/db/rooms'
import { sendBookingNotifications } from '@/lib/twilio/notifications'
import { syncBookingToSheet } from '@/lib/sheets/sync'
import { validateRequestSize, CreateMultiBookingSchema } from '@/lib/validation'
import { checkRateLimit } from '@/lib/ratelimit'
import { logger } from '@/lib/logger'

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  return '127.0.0.1'
}

export async function POST(req: Request) {
  const ip = getClientIp(req)

  try {
    const { success: rateLimitOk, remaining, reset } = await checkRateLimit(ip)

    if (!rateLimitOk) {
      logger.warn('Bookings API rate limit exceeded', { ip, remaining, reset })
      const response = NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      )
      response.headers.set('X-RateLimit-Remaining', String(remaining))
      response.headers.set('X-RateLimit-Reset', String(reset))
      return response
    }

    const body = await req.text()

    if (!validateRequestSize(body, 100_000)) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
    }

    let data: unknown
    try {
      data = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (typeof data !== 'object' || data === null) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Validate with multi-booking schema
    let parsed: ReturnType<typeof CreateMultiBookingSchema.parse>
    try {
      parsed = CreateMultiBookingSchema.parse(data)
    } catch (err: any) {
      return NextResponse.json(
        { error: err?.issues?.[0]?.message ?? 'Invalid booking data' },
        { status: 400 }
      )
    }

    // Deduplicate room IDs (guard against client sending duplicates)
    const uniqueRoomIds = [...new Set(parsed.roomIds)]
    if (uniqueRoomIds.length === 0) {
      return NextResponse.json({ error: 'Please select at least one room' }, { status: 400 })
    }

    const result = await atomicCreateMultipleBookings({ ...parsed, roomIds: uniqueRoomIds })

    if (!result.success) {
      logger.warn('Multi-booking atomic check failed', { error: result.error, retry: result.retry })
      const statusCode = result.retry ? 409 : 400
      return NextResponse.json({ error: result.error }, { status: statusCode })
    }

    logger.info('Multi-booking successfully created', {
      count: result.bookings.length,
      bookingIds: result.bookings.map((b) => b.id),
    })

    // Fire notifications + sheet sync for each booking (non-blocking)
    for (const booking of result.bookings) {
      const room = await getRoomById(booking.roomId)
      const checkInDate = new Date(booking.checkIn)
      const checkOutDate = new Date(booking.checkOut)
      const totalNights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const totalPrice = totalNights * (room?.pricePerNight || 0)

      sendBookingNotifications({
        bookingId: booking.id,
        guestName: booking.guestName,
        phone: booking.phone,
        roomName: room?.name || 'Unknown Room',
        roomType: room?.type || 'Standard',
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        pricePerNight: room?.pricePerNight || 0,
        totalNights,
        totalPrice,
      }).catch((err) => {
        logger.error('Booking notification error (non-blocking)', {
          error: err instanceof Error ? err.message : String(err),
          bookingId: booking.id,
        })
      })

      syncBookingToSheet(booking).catch((err) => {
        logger.error('Background Sheets sync failed', {
          error: err instanceof Error ? err.message : String(err),
          bookingId: booking.id,
        })
      })
    }

    return NextResponse.json({
      success: true,
      bookings: result.bookings,
      // Backward-compat: expose first booking as `booking`
      booking: { id: result.bookings[0].id },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message.includes('ZodError') || message.includes('validation')) {
      logger.warn('Booking validation error', { error: message })
      return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 })
    }
    logger.error('Booking endpoint execution error', { error: message })
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
