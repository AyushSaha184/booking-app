import { getSheetsClient } from './client'
import { withSheetsLock, withRetry } from './mutex'

export async function syncBookingToSheet(booking: {
  id: string
  guestName: string
  phone: string
  roomId: string
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
          return
        }

        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: 'Bookings!A:I',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[
              booking.id,
              booking.guestName,
              booking.phone,
              booking.roomId,
              booking.checkIn,
              booking.checkOut,
              booking.guests,
              booking.status,
              booking.createdAt?.toISOString() ?? new Date().toISOString(),
            ]],
          },
        })
      }, 3, 1000)

      return true
    } catch (err) {
      console.error('Google Sheets sync failed:', err)
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

        if (rowIndex === -1) return

        const rowNumber = rowIndex + 1
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `Bookings!H${rowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[status]] },
        })
      }, 3, 1000)

      return true
    } catch (err) {
      console.error('Google Sheets status update failed:', err)
      return false
    }
  })
}