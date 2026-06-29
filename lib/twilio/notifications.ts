import { twilioClient, twilioFromPhone, twilioOwnerPhone } from './client'
import { logger } from '../logger'

export interface BookingNotificationData {
  bookingId: string
  guestName: string
  phone: string
  roomName: string
  roomType: string
  checkIn: string
  checkOut: string
  guests: number
  pricePerNight: number
  totalNights: number
  totalPrice: number
}

export interface CancellationNotificationData {
  bookingId: string
  guestName: string
  phone: string
  roomName: string
  checkIn: string
  checkOut: string
}

function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('1') && digits.length === 11) {
    return `+${digits}`
  }
  if (digits.length === 10) {
    return `+1${digits}`
  }
  return phone.startsWith('+') ? phone : `+${digits}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function buildUserBookingMessage(data: BookingNotificationData): string {
  const {
    bookingId,
    guestName,
    roomName,
    roomType,
    checkIn,
    checkOut,
    guests,
    totalNights,
    totalPrice,
  } = data

  return `Hi ${guestName}! Your booking is confirmed.

Reservation ID: ${bookingId}
Room: ${roomName} (${roomType})
Dates: ${formatDate(checkIn)} → ${formatDate(checkOut)}
Guests: ${guests}
Nights: ${totalNights}
Total: $${totalPrice.toFixed(2)}

We look forward to welcoming you! If you need to modify or cancel your booking, contact us anytime.

— Resort Booking Team`
}

export function buildUserCancellationMessage(data: CancellationNotificationData): string {
  return `Hi ${data.guestName},

Your booking has been cancelled successfully.

Reservation ID: ${data.bookingId}
Room: ${data.roomName}
Dates: ${formatDate(data.checkIn)} → ${formatDate(data.checkOut)}

We're sorry to see you go. If you'd like to rebook in the future, we'd love to welcome you!

— Resort Booking Team`
}

export function buildOwnerBookingMessage(data: BookingNotificationData): string {
  const {
    bookingId,
    guestName,
    phone,
    roomName,
    roomType,
    checkIn,
    checkOut,
    guests,
    totalNights,
    totalPrice,
  } = data

  return `NEW BOOKING ALERT

Guest: ${guestName}
Phone: ${phone}
Booking ID: ${bookingId}
Room: ${roomName} (${roomType})
Dates: ${formatDate(checkIn)} → ${formatDate(checkOut)}
Guests: ${guests}
Nights: ${totalNights}
Revenue: $${totalPrice.toFixed(2)}

Status: CONFIRMED

— Booking System`
}

export function buildOwnerCancellationMessage(data: CancellationNotificationData): string {
  return `BOOKING CANCELLED ALERT

Guest: ${data.guestName}
Phone: ${data.phone}
Booking ID: ${data.bookingId}
Room: ${data.roomName}
Dates: ${formatDate(data.checkIn)} → ${formatDate(data.checkOut)}

Status: CANCELLED

— Booking System`
}

async function sendSMS(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!twilioFromPhone) {
    logger.warn('Twilio SMS attempt failed: phone number not configured')
    return { success: false, error: 'Twilio phone number not configured' }
  }

  if (!twilioClient) {
    logger.warn('Twilio SMS attempt failed: client not configured')
    return { success: false, error: 'Twilio client not configured' }
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: twilioFromPhone,
      to: formatPhoneE164(to),
    })

    logger.info('SMS notification successfully sent', { recipient: to, sid: message.sid })
    return { success: true, sid: message.sid }
  } catch (error: unknown) {
    const err = error as Error
    logger.error('Failed to send SMS notification', { recipient: to, error: err.message || String(error) })
    return { success: false, error: err.message || 'Unknown error' }
  }
}

export async function sendUserBookingSMS(data: BookingNotificationData): Promise<{ success: boolean; sid?: string; error?: string }> {
  const body = buildUserBookingMessage(data)
  return sendSMS(data.phone, body)
}

export async function sendOwnerBookingSMS(data: BookingNotificationData): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!twilioOwnerPhone) {
    return { success: false, error: 'Owner phone number not configured' }
  }
  const body = buildOwnerBookingMessage(data)
  return sendSMS(twilioOwnerPhone, body)
}

export async function sendUserCancellationSMS(data: CancellationNotificationData): Promise<{ success: boolean; sid?: string; error?: string }> {
  const body = buildUserCancellationMessage(data)
  return sendSMS(data.phone, body)
}

export async function sendOwnerCancellationSMS(data: CancellationNotificationData): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!twilioOwnerPhone) {
    return { success: false, error: 'Owner phone number not configured' }
  }
  const body = buildOwnerCancellationMessage(data)
  return sendSMS(twilioOwnerPhone, body)
}

export async function sendBookingNotifications(data: BookingNotificationData): Promise<{
  user: { success: boolean; sid?: string; error?: string }
  owner: { success: boolean; sid?: string; error?: string }
}> {
  const [user, owner] = await Promise.all([
    sendUserBookingSMS(data),
    sendOwnerBookingSMS(data),
  ])

  return { user, owner }
}

export async function sendCancellationNotifications(data: CancellationNotificationData): Promise<{
  user: { success: boolean; sid?: string; error?: string }
  owner: { success: boolean; sid?: string; error?: string }
}> {
  const [user, owner] = await Promise.all([
    sendUserCancellationSMS(data),
    sendOwnerCancellationSMS(data),
  ])

  return { user, owner }
}