import { logger } from "./logger";

export interface BookingNotificationData {
  bookingId: string;
  guestName: string;
  phone: string;
  roomName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  pricePerNight: number;
  totalNights: number;
  totalPrice: number;
}

export interface CancellationNotificationData {
  bookingId: string;
  guestName: string;
  phone: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
}

function getClient() {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  const twilio = require("twilio");
  return twilio(sid, token) as import("twilio").Twilio;
}

const FROM_PHONE  = () => process.env.TWILIO_FROM_PHONE ?? null;
const OWNER_PHONE = () => process.env.TWILIO_OWNER_PHONE ?? null;

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

async function sendSMS(to: string, body: string): Promise<void> {
  const client = getClient();
  const from   = FROM_PHONE();
  if (!client || !from) {
    logger.warn({ to }, "Twilio not configured — SMS skipped");
    return;
  }
  try {
    const msg = await client.messages.create({ body, from, to: formatPhoneE164(to) });
    logger.info({ to, sid: msg.sid }, "SMS sent");
  } catch (err: unknown) {
    logger.error({ to, error: (err as Error).message }, "SMS send failed");
  }
}

function buildUserBookingMsg(d: BookingNotificationData) {
  return `Hi ${d.guestName}! Your booking is confirmed.\n\nRef: ${d.bookingId}\nRoom: ${d.roomName} (${d.roomType})\nDates: ${fmtDate(d.checkIn)} → ${fmtDate(d.checkOut)}\nGuests: ${d.guests} | Nights: ${d.totalNights}\nTotal: ₹${d.totalPrice.toLocaleString("en-IN")}\n\nWe look forward to welcoming you!\n— Dorshi Resort`;
}

function buildOwnerBookingMsg(d: BookingNotificationData) {
  return `NEW BOOKING\n\nGuest: ${d.guestName}\nPhone: ${d.phone}\nRef: ${d.bookingId}\nRoom: ${d.roomName} (${d.roomType})\nDates: ${fmtDate(d.checkIn)} → ${fmtDate(d.checkOut)}\nGuests: ${d.guests} | Nights: ${d.totalNights}\nRevenue: ₹${d.totalPrice.toLocaleString("en-IN")}\n\nStatus: CONFIRMED`;
}

function buildUserCancelMsg(d: CancellationNotificationData) {
  return `Hi ${d.guestName},\n\nYour booking has been cancelled.\n\nRef: ${d.bookingId}\nRoom: ${d.roomName}\nDates: ${fmtDate(d.checkIn)} → ${fmtDate(d.checkOut)}\n\nWe hope to welcome you again soon.\n— Dorshi Resort`;
}

function buildOwnerCancelMsg(d: CancellationNotificationData) {
  return `BOOKING CANCELLED\n\nGuest: ${d.guestName}\nPhone: ${d.phone}\nRef: ${d.bookingId}\nRoom: ${d.roomName}\nDates: ${fmtDate(d.checkIn)} → ${fmtDate(d.checkOut)}\n\nStatus: CANCELLED`;
}

export async function sendBookingNotifications(data: BookingNotificationData): Promise<void> {
  const owner = OWNER_PHONE();
  await Promise.all([
    sendSMS(data.phone, buildUserBookingMsg(data)),
    owner ? sendSMS(owner, buildOwnerBookingMsg(data)) : Promise.resolve(),
  ]);
}

export async function sendCancellationNotifications(data: CancellationNotificationData): Promise<void> {
  const owner = OWNER_PHONE();
  await Promise.all([
    sendSMS(data.phone, buildUserCancelMsg(data)),
    owner ? sendSMS(owner, buildOwnerCancelMsg(data)) : Promise.resolve(),
  ]);
}
