import { logger } from "./logger";

function getClient() {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId  = process.env.GOOGLE_SHEET_ID;
  if (!credJson || !sheetId) return null;

  try {
    const { google } = require("googleapis") as typeof import("googleapis");
    const creds = JSON.parse(credJson) as {
      client_email: string;
      private_key: string;
    };
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return { sheets: google.sheets({ version: "v4", auth }), sheetId };
  } catch (err: unknown) {
    logger.error({ error: (err as Error).message }, "Google Sheets client init failed");
    return null;
  }
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 1000): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
  throw lastErr;
}

export async function syncBookingToSheet(booking: {
  id: string; guestName: string; phone: string; roomId: string;
  checkIn: string; checkOut: string; guests: number; status: string;
  createdAt: Date | null | string;
}): Promise<boolean> {
  const ctx = getClient();
  if (!ctx) {
    logger.warn({ bookingId: booking.id }, "Google Sheets not configured — sync skipped");
    return false;
  }

  try {
    return await withRetry(async () => {
      const { sheets, sheetId } = ctx;

      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Bookings!A:A",
      });
      const rows = existing.data.values ?? [];
      if (rows.some(r => r[0] === booking.id)) {
        logger.info({ bookingId: booking.id }, "Booking already in sheet");
        return true;
      }

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Bookings!A:I",
        valueInputOption: "USER_ENTERED",
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
            booking.createdAt instanceof Date
              ? booking.createdAt.toISOString()
              : (booking.createdAt ?? new Date().toISOString()),
          ]],
        },
      });

      logger.info({ bookingId: booking.id }, "Booking appended to Google Sheet");
      return true;
    });
  } catch (err: unknown) {
    logger.error({ bookingId: booking.id, error: (err as Error).message }, "Google Sheets sync failed");
    return false;
  }
}

export async function updateBookingStatusInSheet(bookingId: string, status: string): Promise<boolean> {
  const ctx = getClient();
  if (!ctx) {
    logger.warn({ bookingId }, "Google Sheets not configured — status update skipped");
    return false;
  }

  try {
    return await withRetry(async () => {
      const { sheets, sheetId } = ctx;

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Bookings!A:A",
      });
      const rows = res.data.values ?? [];
      const rowIdx = rows.findIndex(r => r[0] === bookingId);
      if (rowIdx === -1) {
        logger.warn({ bookingId }, "Booking not found in sheet for status update");
        return false;
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Bookings!H${rowIdx + 1}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[status]] },
      });
      logger.info({ bookingId, status }, "Sheet booking status updated");
      return true;
    });
  } catch (err: unknown) {
    logger.error({ bookingId, error: (err as Error).message }, "Sheet status update failed");
    return false;
  }
}
