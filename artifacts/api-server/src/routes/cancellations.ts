import { Router } from "express";
import { lookupBooking, cancelBooking } from "../lib/db-ops";
import { UpdateBookingSchema, validateRequestSize } from "../lib/validation";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const body = JSON.stringify(req.body);

    if (!validateRequestSize(body, 50_000)) {
      res.status(413).json({ error: "Request too large" });
      return;
    }

    const data = req.body as { action?: string; [key: string]: unknown };

    if (!data || typeof data !== "object") {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    if (data.action === "lookup") {
      await handleLookup(req, res, data);
      return;
    }

    if (data.action === "cancel") {
      await handleCancel(req, res, data);
      return;
    }

    res.status(400).json({ error: 'Unknown action. Use "lookup" or "cancel".' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    req.log.error({ error: message }, "Cancellations API error");
    res.status(500).json({ error: "Unable to process request. Please try again." });
  }
});

async function handleLookup(req: any, res: any, data: Record<string, unknown>) {
  const guestName = typeof data.guestName === "string" ? data.guestName.trim() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";

  if (!guestName || !phone) {
    res.status(400).json({ error: "Name and phone number are required." });
    return;
  }

  try {
    const booking = await lookupBooking(guestName, phone);
    if (!booking) {
      req.log.info("Cancellations lookup: not found");
      res.status(404).json({ found: false, message: "No active booking matches those details." });
      return;
    }
    req.log.info({ bookingId: booking.id }, "Cancellations lookup: found");
    res.json({
      found: true,
      booking: {
        id: booking.id,
        guestName: booking.guestName,
        roomId: booking.roomId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        status: booking.status,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.toLowerCase().includes("invalid")) {
      res.status(400).json({ error: "Invalid name or phone format." });
      return;
    }
    throw err;
  }
}

async function handleCancel(req: any, res: any, data: Record<string, unknown>) {
  let parsed;
  try {
    parsed = UpdateBookingSchema.pick({
      id: true,
      guestName: true,
      phone: true,
      status: true,
    }).parse({
      id: data.bookingId,
      guestName: data.guestName,
      phone: data.phone,
      status: "cancelled",
    });
  } catch (err: any) {
    res.status(400).json({ error: err?.issues?.[0]?.message ?? "Invalid cancellation details." });
    return;
  }

  const updated = await cancelBooking(parsed.id, parsed.guestName, parsed.phone);
  if (!updated) {
    req.log.warn({ bookingId: parsed.id }, "Cancellation failed: mismatch or not found");
    res.status(404).json({ found: false, success: false, error: "Booking not found or details do not match." });
    return;
  }

  req.log.info({ bookingId: updated.id }, "Booking cancelled");
  res.json({
    found: true,
    success: true,
    bookingId: updated.id,
    checkIn: updated.checkIn,
    checkOut: updated.checkOut,
  });
}

export default router;
