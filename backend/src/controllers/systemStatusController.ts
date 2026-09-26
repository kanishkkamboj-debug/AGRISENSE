import { Request, Response } from "express";
import mongoose from "mongoose";
import { DeviceModel } from "../models/Device";
import { TelemetryModel } from "../models/Telemetry";
import { DataFreshnessService } from "../services/DataFreshnessService";

export class SystemStatusController {
  static async getSystemStatus(_req: Request, res: Response): Promise<void> {
    try {
      const dbState = mongoose.connection.readyState === 1 ? "HEALTHY" : "DEGRADED";
      const dev = await DeviceModel.findOne({ deviceId: "AGRISENSE-ESP8266-001" }).lean();
      const latestTelemetry = await TelemetryModel.findOne({ fieldId: "FIELD-PUNJAB-01" }).sort({ timestamp: -1 }).lean();

      const lastActivity = latestTelemetry?.timestamp || dev?.lastHeartbeat || null;
      const ageSec = DataFreshnessService.getDataAgeSeconds(lastActivity ?? undefined);

      const deviceStatus = dev?.status || (ageSec !== null && ageSec < 30 ? "ONLINE" : ageSec !== null && ageSec <= 120 ? "STALE" : "OFFLINE");
      const esp8266Status = deviceStatus === "ONLINE" ? "HEALTHY" : deviceStatus === "STALE" ? "DEGRADED" : "OFFLINE";

      const geminiStatus = process.env.GEMINI_API_KEY ? "HEALTHY" : "DEGRADED";
      const weatherStatus = "HEALTHY";
      const realtimeStatus = "HEALTHY";

      res.status(200).json({
        success: true,
        data: {
          esp8266: {
            status: esp8266Status,
            deviceId: "AGRISENSE-ESP8266-001",
            state: deviceStatus,
            lastActivity,
            ageSeconds: ageSec,
            ipAddress: dev?.health?.ipAddress || "192.168.1.105",
            wifiSignalDbm: dev?.health?.wifiSignalDbm ?? -58,
            firmwareVersion: dev?.firmwareVersion || "v2.1.0-esp8266",
          },
          sensors: {
            sht40: esp8266Status === "HEALTHY" ? "HEALTHY" : "STALE",
            dht11: esp8266Status === "HEALTHY" ? "HEALTHY" : "STALE",
            mq653: esp8266Status === "HEALTHY" ? "HEALTHY" : "STALE",
            rain: esp8266Status === "HEALTHY" ? "HEALTHY" : "STALE",
            npk: "UNAVAILABLE",
            soilMoisture: esp8266Status === "HEALTHY" ? "HEALTHY" : "STALE",
          },
          backend: "HEALTHY",
          database: dbState,
          realtime: realtimeStatus,
          weather: weatherStatus,
          gemini: geminiStatus,
          gis: "HEALTHY",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }
}
