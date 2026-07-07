import { NextResponse } from 'next/server'
import { updateBookingFromSheet } from '@/lib/db/bookings'
import { db } from '@/lib/db/client'
import { bookings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { logger } from '@/lib/logger'

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const encoder = new TextEncoder()
  const bufA = encoder.encode(a)
  const bufB = encoder.encode(b)
  let result = 0
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i]
  }
  return result === 0
}

export async function POST(req: Request) {
  try {
    // 1. Validate webhook secret
    const secret = req.headers.get('x-webhook-secret')
    const expectedSecret = process.env.SHEETS_WEBHOOK_SECRET

    if (!expectedSecret) {
      logger.error('SHEETS_WEBHOOK_SECRET is not configured')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      )
    }

    if (!secret || !timingSafeEqual(secret, expectedSecret)) {
      logger.warn('Unauthorized webhook attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse and validate body
    const body = await req.text()
    if (!body || body.length > 50_000) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    let data: any
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

    // 3. Handle deletion action
    if (data.action === 'delete' || data.action === 'remove') {
      const bookingId = data.id || data.bookingId
      if (typeof bookingId !== 'string' || !bookingId.startsWith('BK-')) {
        return NextResponse.json(
          { error: 'Invalid Booking ID format. Must start with BK-' },
          { status: 400 }
        )
      }

      logger.info('Sheets webhook requested booking deletion', { bookingId })

      const [deleted] = await db()
        .delete(bookings)
        .where(eq(bookings.id, bookingId))
        .returning()

      if (!deleted) {
        logger.warn('Sheets webhook deletion: booking not found', { bookingId })
        return NextResponse.json(
          { error: `Booking ${bookingId} not found` },
          { status: 404 }
        )
      }

      logger.info('Sheets webhook deleted booking successfully', { bookingId })
      return NextResponse.json({
        success: true,
        deleted: true,
        bookingId,
      })
    }

    // 4. Update the database
    const result = await updateBookingFromSheet(data)

    if (!result.success) {
      logger.warn('Webhook booking update failed', { error: result.error, code: result.code })
      const statusMap = {
        NOT_FOUND: 404,
        VALIDATION: 400,
        CONFLICT: 409,
        INTERNAL: 500,
      } as const

      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: statusMap[result.code] }
      )
    }

    logger.info('Sheets webhook booking update succeeded', { bookingId: result.booking.id })

    return NextResponse.json({
      success: true,
      bookingId: result.booking.id,
    })
  } catch (err: unknown) {
    logger.error('Sheets webhook execution error', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
