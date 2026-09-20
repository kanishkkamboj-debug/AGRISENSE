import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

const DEVICE_SECRET = process.env.DEVICE_INGESTION_SECRET || "agrisense_device_secret_token_key_2026";
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000; // 5 minutes

export function authenticateDevice(req: Request, res: Response, next: NextFunction): void {
  const deviceId = (req.headers["x-device-id"] as string) || req.body?.deviceId;
  const deviceToken = (req.headers["x-device-token"] as string) || req.body?.deviceToken;
  const timestamp = (req.headers["x-timestamp"] as string) || req.body?.timestamp;

  if (!deviceId || !deviceToken) {
    logger.warn(`DEVICE_AUTH_FAILED missing_credentials ip=${req.ip}`);
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED_DEVICE", message: "Device ID and Token authentication required." },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Token validation
  if (deviceToken !== DEVICE_SECRET) {
    logger.warn(`DEVICE_AUTH_FAILED invalid_token deviceId=${deviceId}`);
    res.status(403).json({
      success: false,
      error: { code: "INVALID_DEVICE_TOKEN", message: "Device token validation failed." },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Replay Protection
  if (timestamp) {
    const payloadTime = Date.parse(timestamp);
    if (!isNaN(payloadTime)) {
      const timeDiff = Math.abs(Date.now() - payloadTime);
      if (timeDiff > MAX_CLOCK_SKEW_MS) {
        logger.warn(`REPLAY_PROTECTION_TRIGGERED deviceId=${deviceId} skewMs=${timeDiff}`);
        res.status(400).json({
          success: false,
          error: { code: "CLOCK_SKEW_EXCEEDED", message: "Replay protection: timestamp skew exceeds 5 minutes." },
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }
  }

  req.body.deviceId = deviceId;
  next();
}
