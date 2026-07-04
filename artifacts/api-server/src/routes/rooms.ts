import { Router } from "express";
import { getAvailableRooms } from "../lib/db-ops";
import { CheckRoomsSchema, validateRequestSize } from "../lib/validation";

const router = Router();

router.get("/", async (req, res) => {
  const checkIn = (req.query.checkIn as string) ?? "";
  const checkOut = (req.query.checkOut as string) ?? "";

  if (!checkIn || !checkOut) {
    res.status(400).json({ error: "Missing checkIn or checkOut parameter" });
    return;
  }

  if (!validateRequestSize(`${checkIn}${checkOut}`, 100)) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  try {
    CheckRoomsSchema.parse({ checkIn, checkOut });
  } catch {
    req.log.warn({ checkIn, checkOut }, "Invalid date format in rooms request");
    res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    return;
  }

  req.log.info({ checkIn, checkOut }, "Fetching available rooms");
  const availableRooms = await getAvailableRooms(checkIn, checkOut);
  res.json(availableRooms);
});

export default router;
