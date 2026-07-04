import { Router } from "express";
import { atomicCreateBooking, getRoomById } from "../lib/db-ops";
import { CreateBookingSchema, validateRequestSize, getClientIp } from "../lib/validation";
import { checkRateLimit } from "../lib/ratelimit";
import { sendBookingNotifications } from "../lib/notifications";
import { syncBookingToSheet } from "../lib/sheets";

const router = Router();

router.post("/", async (req, res) => {
  const ip = getClientIp(req as any);

  const rl = checkRateLimit(ip);
  if (!rl.success) {
    req.log.warn({ ip, remaining: rl.remaining }, "Bookings rate limit exceeded");
    res.setHeader("X-RateLimit-Remaining", String(rl.remaining));
    res.setHeader("X-RateLimit-Reset", String(rl.reset));
    res.status(429).json({ error: "Too many requests. Please wait before trying again." });
    return;
  }

  try {
    const body = JSON.stringify(req.body);
    if (!validateRequestSize(body, 100_000)) {
      res.status(413).json({ error: "Request body too large" });
      return;
    }

    let parsed;
    try {
      parsed = CreateBookingSchema.parse(req.body);
    } catch (err: any) {
      res.status(400).json({ error: err?.issues?.[0]?.message ?? "Invalid booking data" });
      return;
    }

    const result = await atomicCreateBooking(parsed);

    if (!result.success) {
      req.log.warn({ error: result.error, retry: result.retry }, "Booking atomic check failed");
      res.status(result.retry ? 409 : 400).json({ error: result.error });
      return;
    }

    req.log.info({ bookingId: result.booking.id, roomId: result.booking.roomId }, "Booking created");

    const room = await getRoomById(result.booking.roomId);
    const checkInDate  = new Date(result.booking.checkIn);
    const checkOutDate = new Date(result.booking.checkOut);
    const totalNights  = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice   = totalNights * (room?.pricePerNight ?? 0);

    sendBookingNotifications({
      bookingId:    result.booking.id,
      guestName:    result.booking.guestName,
      phone:        result.booking.phone,
      roomName:     room?.name     ?? "Unknown Room",
      roomType:     room?.type     ?? "Standard",
      checkIn:      result.booking.checkIn,
      checkOut:     result.booking.checkOut,
      guests:       result.booking.guests,
      pricePerNight: room?.pricePerNight ?? 0,
      totalNights,
      totalPrice,
    }).catch(err => {
      req.log.error({ error: (err as Error).message }, "Booking notification error (non-blocking)");
    });

    syncBookingToSheet(result.booking).catch(err => {
      req.log.error({ error: (err as Error).message, bookingId: result.booking.id }, "Sheets sync error (non-blocking)");
    });

    res.json({ success: true, booking: result.booking });
  } catch (err: unknown) {
    req.log.error({ error: (err instanceof Error ? err.message : String(err)) }, "Booking endpoint error");
    res.status(500).json({ error: "Failed to create booking" });
  }
});

export default router;
