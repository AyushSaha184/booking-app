import { google } from 'googleapis'

export function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not configured')
  }
  let credentials: Record<string, any>
  try {
    let jsonStr = raw.trim()
    if (!jsonStr.startsWith('{') && jsonStr.length > 20) {
      try {
        jsonStr = Buffer.from(jsonStr, 'base64').toString('utf-8')
      } catch {}
    }
    credentials = JSON.parse(jsonStr)
    if (typeof credentials.private_key === 'string') {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n')
    }
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON')
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

