import { NextResponse } from 'next/server'
import { updateBookingFromSheet } from '@/lib/db/bookings'

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
      console.error('SHEETS_WEBHOOK_SECRET is not configured')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      )
    }

    if (!secret || !timingSafeEqual(secret, expectedSecret)) {
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

    let data: unknown
    try {
      data = JSON.parse(body)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    // 3. Update the database
    const result = await updateBookingFromSheet(data)

    if (!result.success) {
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

    return NextResponse.json({
      success: true,
      bookingId: result.booking.id,
    })
  } catch (err: unknown) {
    console.error('Sheets webhook error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
