import { Router } from "express";
import { TelemetryController } from "../controllers/telemetryController";
import { authenticateDevice } from "../middleware/deviceAuth";
import { deviceIngestionLimiter } from "../middleware/rateLimiter";

const router = Router();

// Ingestion requires device token authentication & rate limiting
router.post("/telemetry", deviceIngestionLimiter, authenticateDevice, TelemetryController.ingestTelemetry);
router.post("/heartbeat", deviceIngestionLimiter, authenticateDevice, TelemetryController.deviceHeartbeat);
router.get("/status", TelemetryController.getDeviceStatus);
router.get("/devices/:deviceId/status", TelemetryController.getDeviceStatus);

export default router;
