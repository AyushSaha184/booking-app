import { z } from "zod";

const PHONE_REGEX = /^\+?[\d\s\-]{10,15}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const CreateBookingSchema = z.object({
  guestName: z.string().min(1, "Name is required").max(100, "Name too long"),
  phone: z
    .string()
    .min(10, "Invalid phone number")
    .max(15, "Invalid phone number")
    .regex(PHONE_REGEX, "Invalid phone format"),
  roomId: z.string().min(1, "Room selection required"),
  checkIn: z
    .string()
    .regex(DATE_REGEX, "Invalid date format")
    .refine((date) => {
      const d = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    }, "Check-in date cannot be in the past"),
  checkOut: z.string().regex(DATE_REGEX, "Invalid date format"),
  guests: z
    .number()
    .int()
    .min(1, "At least 1 guest")
    .max(20, "Too many guests"),
}).refine(
  (data) => {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    return checkOut > checkIn;
  },
  { message: "Check-out must be after check-in", path: ["checkOut"] }
);

export const LookupBookingSchema = z.object({
  guestName: z.string().min(1, "Name is required").max(100),
  phone: z.string().min(10).max(15).regex(PHONE_REGEX),
});

export const CancelBookingSchema = z.object({
  bookingId: z.string().min(1),
  guestName: z.string().min(1).max(100),
  phone: z.string().min(10).max(15).regex(PHONE_REGEX),
});

export const UpdateBookingSchema = z
  .object({
    id: z
      .string()
      .min(1, "Booking ID is required")
      .startsWith("BK-", "Invalid booking ID format"),
    guestName: z.string().min(1, "Name is required").max(100, "Name too long"),
    phone: z
      .string()
      .min(10, "Invalid phone number")
      .max(15, "Invalid phone number")
      .regex(PHONE_REGEX, "Invalid phone format"),
    roomId: z.string().min(1, "Room selection required"),
    checkIn: z.string().regex(DATE_REGEX, "Invalid date format"),
    checkOut: z.string().regex(DATE_REGEX, "Invalid date format"),
    guests: z
      .number()
      .int()
      .min(1, "At least 1 guest")
      .max(20, "Too many guests"),
    status: z.enum(["confirmed", "cancelled"]),
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);
      return checkOut > checkIn;
    },
    { message: "Check-out must be after check-in", path: ["checkOut"] }
  );

export const CheckRoomsSchema = z
  .object({
    checkIn: z.string().regex(DATE_REGEX, "Invalid date format. Use YYYY-MM-DD"),
    checkOut: z.string().regex(DATE_REGEX, "Invalid date format. Use YYYY-MM-DD"),
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);
      return checkOut > checkIn;
    },
    { message: "Check-out must be after check-in", path: ["checkOut"] }
  );

export function validateRequestSize(
  body: string,
  maxBytes: number = 100_000
): boolean {
  return Buffer.byteLength(body, "utf8") <= maxBytes;
}

export function getClientIp(req: { headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const fwd = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return fwd.split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }
  return "127.0.0.1";
}
