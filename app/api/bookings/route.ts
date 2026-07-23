import { NextResponse } from 'next/server'
import { atomicCreateMultipleBookings } from '@/lib/db/atomic'
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

    // Deduplicate room IDs
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

    logger.info('Single multi-room booking created successfully', {
      bookingId: result.booking.id,
      roomCount: uniqueRoomIds.length,
      roomIds: uniqueRoomIds,
    })

    // Sync SINGLE booking row to Google Sheet (awaited for Vercel serverless execution)
    try {
      await syncBookingToSheet({
        id: result.booking.id,
        guestName: result.booking.guestName,
        phone: result.booking.phone,
        roomIds: uniqueRoomIds,
        checkIn: result.booking.checkIn,
        checkOut: result.booking.checkOut,
        guests: result.booking.guests,
        status: result.booking.status,
        createdAt: result.booking.createdAt ? new Date(result.booking.createdAt) : new Date(),
      })
    } catch (err) {
      logger.error('Background Sheets sync failed', {
        error: err instanceof Error ? err.message : String(err),
        bookingId: result.booking.id,
      })
    }

    logger.info('Booking created with pending payment status (SMS deferred)', {
      bookingId: result.booking.id,
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: result.booking.id,
        roomIds: uniqueRoomIds,
        status: result.booking.status,
      },
      bookings: [{
        id: result.booking.id,
        roomIds: uniqueRoomIds,
        status: result.booking.status,
      }],
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
