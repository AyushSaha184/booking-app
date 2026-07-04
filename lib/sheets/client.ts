import { google } from 'googleapis'

export function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not configured')
  }
  let credentials: Record<string, unknown>
  try {
    credentials = JSON.parse(raw)
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON')
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}
