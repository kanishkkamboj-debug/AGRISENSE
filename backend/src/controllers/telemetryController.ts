import { Request, Response } from "express";
import { TelemetryModel } from "../models/Telemetry";
import { DeviceModel } from "../models/Device";
import { validateTelemetryPayload } from "../../../shared/schemas/telemetry.schema";
import { DataFreshnessService } from "../services/DataFreshnessService";
import { logger } from "../utils/logger";

// Array of active SSE clients
const sseClients: Response[] = [];

export function broadcastTelemetryToSse(telemetry: any): void {
  const dataString = `data: ${JSON.stringify(telemetry)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(dataString);
    } catch (e) {
      // client connection closed
    }
  });
}

export class TelemetryController {
  // Device Ingestion: POST /api/v1/device/telemetry
  static async ingestTelemetry(req: Request, res: Response): Promise<void> {
    try {
      const validation = validateTelemetryPayload(req.body);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_FAILED", message: "Invalid telemetry ingestion payload", details: validation.errors },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { deviceId, timestamp, measurements } = req.body;
      const fieldId = req.body.fieldId || "FIELD-PUNJAB-01";

      const freshnessState = DataFreshnessService.getFreshnessState(timestamp);

      // Structure measurements map ensuring 4-state measurement typing
      const structuredMeasurements: Record<string, any> = {};
      for (const [param, valObj] of Object.entries(measurements as Record<string, any>)) {
        structuredMeasurements[param] = {
          value: valObj.value !== undefined ? valObj.value : null,
          unit: valObj.unit || "",
          state: valObj.value !== null ? "MEASURED" : "UNAVAILABLE",
          quality: valObj.quality || (valObj.value !== null ? "VALID" : "MISSING"),
          lastUpdated: timestamp,
          source: valObj.source || "RS485",
        };
      }

      const telemetryRecord = {
        deviceId,
        fieldId,
        timestamp,
        measurements: structuredMeasurements,
        qualitySummary: "VALID",
        freshnessState,
        dataMode: "REAL",
        syncStatus: "SYNCHRONIZED",
      };

      const telemetryDoc = new TelemetryModel(telemetryRecord);
      await telemetryDoc.save();

      // Update Device heartbeat and status in Device Registry
      await DeviceModel.findOneAndUpdate(
        { deviceId },
        {
          $set: {
            fieldId,
            status: "ONLINE",
            lastHeartbeat: new Date().toISOString(),
            lastTelemetry: timestamp,
            "health.bufferedTelemetryCount": 0,
          },
          $inc: { "health.packetsReceived": 1 },
        },
        { upsert: true }
      );

      // Broadcast to live SSE Web UI clients!
      broadcastTelemetryToSse({
        id: telemetryDoc._id.toString(),
        ...telemetryRecord,
      });

      logger.info(`TELEMETRY_INGESTED deviceId=${deviceId} timestamp=${timestamp}`);

      res.status(200).json({
        success: true,
        data: {
          ackId: telemetryDoc._id.toString(),
          synchronizedCount: 1,
          message: "Telemetry ingested, stored, and broadcasted to Web UI",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error(`TELEMETRY_INGEST_ERROR: ${err.message}`);
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to ingest telemetry" },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Device Heartbeat: POST /api/v1/device/heartbeat
  static async deviceHeartbeat(req: Request, res: Response): Promise<void> {
    try {
      const { deviceId, health } = req.body;
      if (!deviceId) {
        res.status(400).json({ success: false, error: { code: "MISSING_DEVICE_ID", message: "deviceId is required" }, timestamp: new Date().toISOString() });
        return;
      }

      await DeviceModel.findOneAndUpdate(
        { deviceId },
        {
          $set: {
            status: "ONLINE",
            lastHeartbeat: new Date().toISOString(),
            health: health || {},
          },
        },
        { upsert: true }
      );

      res.status(200).json({ success: true, message: "Heartbeat acknowledged", timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }

  // SSE Stream Endpoint: GET /api/v1/public/telemetry/stream
  static sseStream(req: Request, res: Response): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    sseClients.push(res);
    logger.info(`SSE_CLIENT_CONNECTED totalClients=${sseClients.length}`);

    req.on("close", () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) {
        sseClients.splice(idx, 1);
      }
      logger.info(`SSE_CLIENT_DISCONNECTED totalClients=${sseClients.length}`);
    });
  }

  // Public GET /api/v1/public/telemetry/latest
  static async getLatestTelemetry(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
      const doc = await TelemetryModel.findOne({ fieldId }).sort({ timestamp: -1 }).lean();

      if (!doc) {
        // Return null/empty telemetry state when DB is empty (NO FAKE FALLBACK DATA!)
        res.status(200).json({
          success: true,
          data: null,
          dataMode: "REAL",
          message: "No sensor data recorded yet. Waiting for physical Raspberry Pi telemetry.",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: doc._id.toString(),
          deviceId: doc.deviceId,
          fieldId: doc.fieldId,
          timestamp: doc.timestamp,
          measurements: doc.measurements ? Object.fromEntries(doc.measurements as unknown as Map<string, any>) : {},
          qualitySummary: doc.qualitySummary,
          freshnessState: DataFreshnessService.getFreshnessState(doc.timestamp),
          dataMode: doc.dataMode,
        },
        dataMode: doc.dataMode,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }

  // Public GET /api/v1/public/telemetry/history
  static async getTelemetryHistory(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
      const limit = parseInt(req.query.limit as string) || 48;

      const docs = await TelemetryModel.find({ fieldId }).sort({ timestamp: -1 }).limit(limit).lean();

      const items = docs.map((doc) => ({
        id: doc._id.toString(),
        deviceId: doc.deviceId,
        fieldId: doc.fieldId,
        timestamp: doc.timestamp,
        measurements: doc.measurements ? Object.fromEntries(doc.measurements as unknown as Map<string, any>) : {},
        qualitySummary: doc.qualitySummary,
        freshnessState: DataFreshnessService.getFreshnessState(doc.timestamp),
        dataMode: doc.dataMode,
      }));

      res.status(200).json({
        success: true,
        data: items,
        dataMode: "REAL",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }
}
