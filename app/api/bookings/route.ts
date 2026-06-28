import { NextResponse } from 'next/server'
import { atomicCreateBooking } from '@/lib/db/atomic'
import { syncBookingToSheet } from '@/lib/sheets/sync'
import { validateRequestSize, CreateBookingSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  try {
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