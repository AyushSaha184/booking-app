import { Router } from "express";
import { atomicCreateBooking, getRoomById } from "../lib/db-ops";
import { CreateBookingSchema, validateRequestSize, getClientIp } from "../lib/validation";

const router = Router();

router.post("/", async (req, res) => {
  const ip = getClientIp(req as any);

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
      const statusCode = result.retry ? 409 : 400;
      res.status(statusCode).json({ error: result.error });
      return;
    }

    req.log.info({ bookingId: result.booking.id, roomId: result.booking.roomId }, "Booking created");

    const room = await getRoomById(result.booking.roomId);
    const checkInDate = new Date(result.booking.checkIn);
    const checkOutDate = new Date(result.booking.checkOut);
    const totalNights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = totalNights * (room?.pricePerNight || 0);

    res.json({ success: true, booking: result.booking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    req.log.error({ error: message }, "Booking endpoint error");
    res.status(500).json({ error: "Failed to create booking" });
  }
});

export default router;
