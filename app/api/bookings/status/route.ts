import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/ratelimit'
import { logger } from '@/lib/logger'
import { getSheetsClient } from '@/lib/sheets/client'
import { getBookingsWithRooms, updateBookingFromSheet } from '@/lib/db/bookings'

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  return '127.0.0.1'
}

export async function GET(req: Request) {
  const ip = getClientIp(req)

  try {
    const { success: rateLimitOk } = await checkRateLimit(ip)
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get('id')
    const idsParam = searchParams.get('ids')

    const rawIds = idsParam || idParam
    if (!rawIds) {
      return NextResponse.json({ error: 'Missing id or ids parameter' }, { status: 400 })
    }

    const ids = rawIds.split(',').map(id => id.trim()).filter(Boolean)
    if (ids.length === 0) {
      return NextResponse.json({ error: 'No booking IDs provided' }, { status: 400 })
    }

    // 1. Fetch current bookings with linked roomIds
    let fetchedBookings = await getBookingsWithRooms(ids)

    // 2. Fallback check: If any booking is still pending, check Google Sheet directly
    const hasPending = fetchedBookings.some(b => b.status === 'pending')
    if (hasPending && process.env.GOOGLE_SHEET_ID) {
      try {
        const sheets = getSheetsClient()
        const sheetId = process.env.GOOGLE_SHEET_ID
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'Bookings!A:I',
        })

        const rows = response.data.values ?? []
        let updatedAny = false

        for (const booking of fetchedBookings) {
          if (booking.status === 'pending') {
            const row = rows.find(r => r[0] === booking.id)
            if (row && row[7]) {
              const sheetStatus = String(row[7]).trim().toLowerCase()
              let normalizedStatus: string | null = null

              if (['yes', 'y', 'confirmed', 'approved', 'true', '1'].includes(sheetStatus)) {
                normalizedStatus = 'confirmed'
              } else if (['no', 'n', 'cancelled', 'canceled', 'rejected', 'declined', 'false', '0'].includes(sheetStatus)) {
                normalizedStatus = 'cancelled'
              }

              if (normalizedStatus && normalizedStatus !== booking.status) {
                const sheetRoomIds = row[3]
                  ? String(row[3]).split(',').map(s => s.trim()).filter(Boolean)
                  : booking.roomIds

                await updateBookingFromSheet({
                  id: booking.id,
                  guestName: booking.guestName,
                  phone: booking.phone,
                  roomIds: sheetRoomIds,
                  checkIn: booking.checkIn,
                  checkOut: booking.checkOut,
                  guests: booking.guests,
                  status: normalizedStatus,
                })
                updatedAny = true
              }
            }
          }
        }

        if (updatedAny) {
          fetchedBookings = await getBookingsWithRooms(ids)
        }
      } catch (sheetErr) {
        logger.warn('Direct sheet fallback status check failed', { error: String(sheetErr) })
      }
    }

    const firstBooking = fetchedBookings[0]

    return NextResponse.json({
      success: true,
      booking: firstBooking ? {
        id: firstBooking.id,
        status: firstBooking.status,
        guestName: firstBooking.guestName,
        roomIds: firstBooking.roomIds,
        checkIn: firstBooking.checkIn,
        checkOut: firstBooking.checkOut,
        guests: firstBooking.guests,
        createdAt: firstBooking.createdAt,
      } : null,
      bookings: fetchedBookings.map(b => ({
        id: b.id,
        status: b.status,
        guestName: b.guestName,
        roomIds: b.roomIds,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        guests: b.guests,
        createdAt: b.createdAt,
      })),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Status endpoint execution error', { error: message })
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}
