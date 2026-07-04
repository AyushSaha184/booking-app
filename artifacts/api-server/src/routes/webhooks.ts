import { Router } from "express";
import { updateBookingFromSheet } from "../lib/db-ops";

const router = Router();

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

router.post("/sheets", async (req, res) => {
  try {
    const secret = req.headers["x-webhook-secret"] as string;
    const expectedSecret = process.env.SHEETS_WEBHOOK_SECRET;

    if (!expectedSecret) {
      req.log.error("SHEETS_WEBHOOK_SECRET not configured");
      res.status(500).json({ error: "Webhook not configured" });
      return;
    }

    if (!secret || !timingSafeEqual(secret, expectedSecret)) {
      req.log.warn("Unauthorized webhook attempt");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body = JSON.stringify(req.body);
    if (!body || body.length > 50_000) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const result = await updateBookingFromSheet(req.body);

    if (!result.success) {
      req.log.warn({ error: result.error, code: result.code }, "Webhook booking update failed");
      const statusMap = { NOT_FOUND: 404, VALIDATION: 400, CONFLICT: 409, INTERNAL: 500 } as const;
      res.status(statusMap[result.code]).json({ error: result.error, code: result.code });
      return;
    }

    req.log.info({ bookingId: result.booking.id }, "Sheets webhook update succeeded");
    res.json({ success: true, bookingId: result.booking.id });
  } catch (err: unknown) {
    req.log.error({ error: err instanceof Error ? err.message : String(err) }, "Sheets webhook error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
