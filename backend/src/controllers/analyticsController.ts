import { Request, Response } from "express";
import { TelemetryModel } from "../models/Telemetry";
import { MockDataService } from "../services/MockDataService";

export class AnalyticsController {
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
      const range = (req.query.range as string) || "24h";

      const docs = await TelemetryModel.find({ fieldId }).sort({ timestamp: -1 }).limit(100).lean();

      let telemetryList = docs;
      if (telemetryList.length === 0) {
        telemetryList = [MockDataService.getMockTelemetry("normal") as any];
      }

      // Compute parameter statistics
      const paramStats: Record<string, { current: number | null; min: number; max: number; avg: number; trend: string }> = {};

      const params = ["soil_moisture", "soil_temperature", "soil_humidity", "soil_ph"];

      for (const p of params) {
        let sum = 0;
        let count = 0;
        let min = 999;
        let max = -999;
        let current: number | null = null;

        for (let i = 0; i < telemetryList.length; i++) {
          const m = telemetryList[i].measurements as Record<string, any>;
          const val = m instanceof Map ? m.get(p)?.value : m?.[p]?.value;
          if (val !== undefined && val !== null) {
            if (i === 0) current = val;
            sum += val;
            count++;
            if (val < min) min = val;
            if (val > max) max = val;
          }
        }

        const avg = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
        if (min === 999) min = 0;
        if (max === -999) max = 0;

        paramStats[p] = {
          current,
          min,
          max,
          avg,
          trend: current !== null && current > avg ? "UP" : "DOWN",
        };
      }

      res.status(200).json({
        success: true,
        data: {
          fieldId,
          range,
          stats: paramStats,
          samplesCount: telemetryList.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }
}
