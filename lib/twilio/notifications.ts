import { twilioClient, twilioFromPhone, twilioOwnerPhone } from './client'
import { logger } from '../logger'

export interface BookingItem {
  bookingId: string
  roomName: string
  roomType: string
  pricePerNight: number
  totalPrice: number
}

export interface BookingNotificationData {
  guestName: string
  phone: string
  checkIn: string
  checkOut: string
  totalNights: number
  totalPrice: number
  bookings: BookingItem[]
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
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`
  }
  if (digits.length === 10) {
    return `+91${digits}`
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
  const { guestName, checkIn, checkOut, bookings } = data
  const ids = bookings.map(b => b.bookingId).join(',')
  return `Booking confirmed: ${guestName}. Dates: ${checkIn} to ${checkOut}. IDs: ${ids}`
}

export function buildUserCancellationMessage(data: CancellationNotificationData): string {
  return `Booking cancelled: ${data.guestName}. ID: ${data.bookingId}. Room: ${data.roomName}. Dates: ${data.checkIn} to ${data.checkOut}.`
}

export function buildOwnerBookingMessage(data: BookingNotificationData): string {
  const { guestName, checkIn, checkOut, bookings } = data
  const ids = bookings.map(b => b.bookingId).join(',')
  return `New booking: ${guestName}. Dates: ${checkIn} to ${checkOut}. IDs: ${ids}`
}

export function buildOwnerCancellationMessage(data: CancellationNotificationData): string {
  return `Cancelled booking: ${data.guestName}. ID: ${data.bookingId}. Room: ${data.roomName}. Dates: ${data.checkIn} to ${data.checkOut}.`
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