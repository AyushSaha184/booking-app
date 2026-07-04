import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromPhone = process.env.TWILIO_PHONE_NUMBER
const ownerPhone = process.env.TWILIO_OWNER_PHONE_NUMBER

if (!accountSid || !authToken) {
  console.warn('Twilio credentials not configured. SMS notifications will be skipped.')
}

if (!fromPhone) {
  console.warn('TWILIO_PHONE_NUMBER is not set. SMS notifications will fail.')
}

if (!ownerPhone) {
  console.warn('TWILIO_OWNER_PHONE_NUMBER is not set. Owner will not receive booking notifications.')
}

export const twilioFromPhone = fromPhone
export const twilioOwnerPhone = ownerPhone

export const twilioClient =
  accountSid && authToken
    ? twilio(accountSid, authToken)
    : null