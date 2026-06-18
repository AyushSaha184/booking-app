import { NextResponse } from 'next/server'
import { atomicCreateBooking } from '@/lib/db/atomic'
import { syncBookingToSheet } from '@/lib/sheets/sync'
import { validateRequestSize } from '@/lib/validation'

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

    const result = await atomicCreateBooking(data as any)

    if (!result.success) {
      const statusCode = result.retry ? 409 : 400
      return NextResponse.json({ error: result.error }, { status: statusCode })
    }

    syncBookingToSheet(result.booking).catch(err => {
      console.error('Background Sheets sync failed:', err)
    })

    return NextResponse.json({ success: true, booking: result.booking })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message.includes('ZodError') || message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid booking data' },
        { status: 400 }
      )
    }
    console.error('Booking error:', err)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}