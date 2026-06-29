import { NextResponse } from 'next/server'
import { lookupBooking, cancelBooking } from '@/lib/db/bookings'
import { checkRateLimit } from '@/lib/ratelimit'
import { UpdateBookingSchema, validateRequestSize } from '@/lib/validation'
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
      logger.warn('Cancellations API rate limit exceeded', { ip, remaining, reset })
      const response = NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      )
      response.headers.set('X-RateLimit-Remaining', String(remaining))
      response.headers.set('X-RateLimit-Reset', String(reset))
      return response
    }

    const body = await req.text()

    if (!validateRequestSize(body, 50_000)) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }

    let data: { action?: string }
    try {
      data = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (data.action === 'lookup') {
      return handleLookup(data)
    }

    if (data.action === 'cancel') {
      return handleCancel(data)
    }

    return NextResponse.json(
      { error: 'Unknown action. Use "lookup" or "cancel".' },
      { status: 400 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    logger.error('Cancellations API request failed', { error: message })
    return NextResponse.json(
      { error: 'Unable to process request. Please try again.' },
      { status: 500 }
    )
  }
}

function handleLookup(data: Record<string, unknown>) {
  const guestName = typeof data.guestName === 'string' ? data.guestName.trim() : ''
  const phone = typeof data.phone === 'string' ? data.phone.trim() : ''

  if (!guestName || !phone) {
    return NextResponse.json(
      { error: 'Name and phone number are required.' },
      { status: 400 }
    )
  }

  return lookupBooking(guestName, phone)
    .then((booking) => {
      if (!booking) {
        logger.info('Cancellations lookup: not found')
        return NextResponse.json(
          { found: false, message: 'No active booking matches those details.' },
          { status: 404 }
        )
      }
      logger.info('Cancellations lookup: found', { bookingId: booking.id })
      return NextResponse.json({
        found: true,
        booking: {
          id: booking.id,
          guestName: booking.guestName,
          roomId: booking.roomId,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
          status: booking.status,
        },
      })
    })
    .catch((err: unknown) => {
      if (err instanceof Error && err.message.toLowerCase().includes('invalid')) {
        return NextResponse.json(
          { error: 'Invalid name or phone format.' },
          { status: 400 }
        )
      }
      throw err
    })
}

function handleCancel(data: Record<string, unknown>) {
  let parsed
  try {
    parsed = UpdateBookingSchema.pick({
      id: true,
      guestName: true,
      phone: true,
      status: true,
    }).parse({
      id: data.bookingId,
      guestName: data.guestName,
      phone: data.phone,
      status: 'cancelled',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.issues?.[0]?.message ?? 'Invalid cancellation details.' },
      { status: 400 }
    )
  }

  return cancelBooking(parsed.id, parsed.guestName, parsed.phone)
    .then((updated) => {
      if (!updated) {
        logger.warn('Cancellation failed: verification mismatch or not found', { bookingId: parsed.id })
        return NextResponse.json(
          { success: false, error: 'Booking not found or details do not match.' },
          { status: 404 }
        )
      }
      logger.info('Cancelled booking via API', { bookingId: updated.id })
      return NextResponse.json({
        success: true,
        bookingId: updated.id,
        checkIn: updated.checkIn,
        checkOut: updated.checkOut,
      })
    })
}
