import { Router } from "express";
import { TelemetryController } from "../controllers/telemetryController";
import { authenticateDevice } from "../middleware/deviceAuth";
import { deviceIngestionLimiter } from "../middleware/rateLimiter";

const router = Router();

// Ingestion requires device token authentication & rate limiting
router.post("/telemetry", deviceIngestionLimiter, authenticateDevice, TelemetryController.ingestTelemetry);
router.post("/heartbeat", deviceIngestionLimiter, authenticateDevice, TelemetryController.deviceHeartbeat);

export default router;
