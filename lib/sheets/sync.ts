import { getSheetsClient } from './client'
import { withSheetsLock, withRetry } from './mutex'
import { logger } from '../logger'

function formatDateTime(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

export async function syncBookingToSheet(booking: {
  id: string
  guestName: string
  phone: string
  roomIds?: string[]
  roomId?: string
  checkIn: string
  checkOut: string
  guests: number
  status: string
  createdAt: Date | null
}): Promise<boolean> {
  return withSheetsLock(booking.id, async () => {
    try {
      await withRetry(async () => {
        const sheets = getSheetsClient()
        const sheetId = process.env.GOOGLE_SHEET_ID!

        const checkResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'Bookings!A:A',
        })

        const existingRows = checkResponse.data.values ?? []
        const alreadyExists = existingRows.some(row => row[0] === booking.id)

        if (alreadyExists) {
          logger.info('Booking already exists in Google Sheet', { bookingId: booking.id })
          return
        }

        const roomIdsStr = Array.isArray(booking.roomIds)
          ? booking.roomIds.join(', ')
          : booking.roomId || ''

        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: 'Bookings!A:I',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[
              booking.id,
              booking.guestName,
              booking.phone,
              roomIdsStr,
              booking.checkIn,
              booking.checkOut,
              booking.guests,
              booking.status,
              formatDateTime(booking.createdAt ?? new Date()),
            ]],
          },
        })
        logger.info('Booking appended to Google Sheet', { bookingId: booking.id })
      }, 3, 1000)

      return true
    } catch (err) {
      logger.error('Google Sheets sync failed', { bookingId: booking.id, error: err instanceof Error ? err.message : String(err) })
      return false
    }
  })
}

export async function updateBookingStatusInSheet(bookingId: string, status: string): Promise<boolean> {
  return withSheetsLock(`${bookingId}:status`, async () => {
    try {
      await withRetry(async () => {
        const sheets = getSheetsClient()
        const sheetId = process.env.GOOGLE_SHEET_ID!

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'Bookings!A:A',
        })

        const rows = response.data.values ?? []
        const rowIndex = rows.findIndex(row => row[0] === bookingId)

        if (rowIndex === -1) {
          logger.warn('Booking ID not found in sheet for status update', { bookingId })
          return
        }

        const rowNumber = rowIndex + 1
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `Bookings!H${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[status]] },
        })
        logger.info('Google Sheet booking status updated', { bookingId, status, rowNumber })
      }, 3, 1000)

      return true
    } catch (err) {
      logger.error('Google Sheets status update failed', { bookingId, status, error: err instanceof Error ? err.message : String(err) })
      return false
    }
  })
}