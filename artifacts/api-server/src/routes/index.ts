import { Router, type IRouter } from "express";
import healthRouter from "./health";
import roomsRouter from "./rooms";
import bookingsRouter from "./bookings";
import cancellationsRouter from "./cancellations";
import webhooksRouter from "./webhooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/rooms", roomsRouter);
router.use("/bookings", bookingsRouter);
router.use("/cancellations", cancellationsRouter);
router.use("/webhooks", webhooksRouter);

export default router;
