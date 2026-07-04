import { NextResponse } from 'next/server'
import { atomicCreateBooking } from '@/lib/db/atomic'
import { getRoomById } from '@/lib/db/rooms'
import { sendBookingNotifications } from '@/lib/twilio/notifications'
import { syncBookingToSheet } from '@/lib/sheets/sync'
import { validateRequestSize, CreateBookingSchema } from '@/lib/validation'
import { checkRateLimit } from '@/lib/ratelimit'
import { logger } from '@/lib/logger'

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return '127.0.0.1'
}

export async function POST(req: Request) {
  const ip = getClientIp(req)

  try {
    const { success, remaining, reset } = await checkRateLimit(ip)

    if (!success) {
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
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      )
    }

    let data: unknown
    try {
      data = JSON.parse(body)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    if (typeof data !== 'object' || data === null) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    let parsed
    try {
      parsed = CreateBookingSchema.parse(data)
    } catch (err: any) {
      return NextResponse.json(
        { error: err?.issues?.[0]?.message ?? 'Invalid booking data' },
        { status: 400 }
      )
    }

    const result = await atomicCreateBooking(parsed)

    if (!result.success) {
      logger.warn('Booking creation atomic check failed', { error: result.error, retry: result.retry })
      const statusCode = result.retry ? 409 : 400
      return NextResponse.json({ error: result.error }, { status: statusCode })
    }

    logger.info('Booking successfully created', { bookingId: result.booking.id, roomId: result.booking.roomId })

    const room = await getRoomById(result.booking.roomId)
    const checkInDate = new Date(result.booking.checkIn)
    const checkOutDate = new Date(result.booking.checkOut)
    const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = totalNights * (room?.pricePerNight || 0)

    sendBookingNotifications({
      bookingId: result.booking.id,
      guestName: result.booking.guestName,
      phone: result.booking.phone,
      roomName: room?.name || 'Unknown Room',
      roomType: room?.type || 'Standard',
      checkIn: result.booking.checkIn,
      checkOut: result.booking.checkOut,
      guests: result.booking.guests,
      pricePerNight: room?.pricePerNight || 0,
      totalNights,
      totalPrice,
    }).catch((err) => {
      logger.error('Booking notification error (non-blocking)', { error: err instanceof Error ? err.message : String(err) })
    })

    syncBookingToSheet(result.booking).catch(err => {
      logger.error('Background Sheets sync failed', { error: err instanceof Error ? err.message : String(err), bookingId: result.booking?.id })
    })

    return NextResponse.json({ success: true, booking: result.booking })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message.includes('ZodError') || message.includes('validation')) {
      logger.warn('Booking validation error', { error: message })
      return NextResponse.json(
        { error: 'Invalid booking data' },
        { status: 400 }
      )
    }
    logger.error('Booking endpoint execution error', { error: message })
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
