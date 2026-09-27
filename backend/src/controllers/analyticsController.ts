import { Request, Response } from "express";
import { TelemetryModel } from "../models/Telemetry";
import { CROP_PROFILES } from "../../../knowledge-base/crops";

function parseMeasurements(measurements: any): Record<string, any> {
  if (!measurements) return {};
  if (measurements instanceof Map) {
    return Object.fromEntries(measurements);
  }
  if (typeof measurements === "object") {
    return measurements;
  }
  return {};
}

export class AnalyticsController {
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
      const deviceId = (req.query.deviceId as string) || undefined;
      const cropId = (req.query.cropId as string) || "wheat";
      const range = (req.query.range as string) || "24h";

      const crop = CROP_PROFILES[cropId] || CROP_PROFILES.wheat;

      // Calculate time cutoff from range parameter
      const nowMs = Date.now();
      let cutoffMs = nowMs - 24 * 3600 * 1000; // default 24h

      if (range === "1h") cutoffMs = nowMs - 1 * 3600 * 1000;
      else if (range === "6h") cutoffMs = nowMs - 6 * 3600 * 1000;
      else if (range === "24h") cutoffMs = nowMs - 24 * 3600 * 1000;
      else if (range === "7d") cutoffMs = nowMs - 7 * 24 * 3600 * 1000;
      else if (range === "30d") cutoffMs = nowMs - 30 * 24 * 3600 * 1000;

      const cutoffIso = new Date(cutoffMs).toISOString();

      const query: any = { fieldId };
      if (deviceId) {
        query.deviceId = deviceId;
      }
      query.timestamp = { $gte: cutoffIso };

      let docs = await TelemetryModel.find(query).sort({ timestamp: 1 }).lean();

      // Fallback: If no records within exact time window, fetch recent records for the field
      if (docs.length === 0) {
        const fallbackQuery: any = { fieldId };
        if (deviceId) fallbackQuery.deviceId = deviceId;
        docs = await TelemetryModel.find(fallbackQuery).sort({ timestamp: 1 }).limit(100).lean();
      }

      const parameters = [
        "soil_moisture",
        "soil_temperature",
        "ambient_temperature",
        "ambient_humidity",
        "soil_ph",
        "nitrogen",
        "phosphorus",
        "potassium",
        "rainfall",
      ];

      const aggregates: Record<string, { avg: number | null; min: number | null; max: number | null; trend: string }> = {};

      for (const param of parameters) {
        let sum = 0;
        let count = 0;
        let min = 9999;
        let max = -9999;
        const values: number[] = [];

        for (const doc of docs) {
          const m = parseMeasurements(doc.measurements);
          const item = m[param];
          const val = item && typeof item.value === "number" ? item.value : null;

          if (val !== null) {
            sum += val;
            count++;
            values.push(val);
            if (val < min) min = val;
            if (val > max) max = val;
          }
        }

        if (count > 0) {
          const avg = parseFloat((sum / count).toFixed(1));
          let trend = "stable";
          if (values.length >= 2) {
            const first = values[0];
            const last = values[values.length - 1];
            const diff = last - first;
            if (diff > 0.5) trend = "rising";
            else if (diff < -0.5) trend = "falling";
            else trend = "stable";
          }

          aggregates[param] = {
            avg,
            min: min === 9999 ? null : min,
            max: max === -9999 ? null : max,
            trend,
          };
        } else {
          aggregates[param] = {
            avg: null,
            min: null,
            max: null,
            trend: "Insufficient historical data",
          };
        }
      }

      // Compute sensor availability percentage
      const availabilityPercent = docs.length > 0 ? Math.min(100, Math.round((docs.length / 48) * 100)) : 0;

      // Crop-specific interpretation of historical aggregates
      const moistureAvg = aggregates.soil_moisture?.avg;
      let cropInterpretation = "";
      if (moistureAvg !== null && moistureAvg !== undefined) {
        if (moistureAvg < crop.soil.moisture.min) {
          cropInterpretation = `Historical average moisture (${moistureAvg}%) was BELOW ${crop.name} minimum threshold (${crop.soil.moisture.min}%).`;
        } else if (moistureAvg > crop.soil.moisture.max) {
          cropInterpretation = `Historical average moisture (${moistureAvg}%) EXCEEDED ${crop.name} maximum threshold (${crop.soil.moisture.max}%).`;
        } else {
          cropInterpretation = `Historical average moisture (${moistureAvg}%) was within OPTIMAL range for ${crop.name} (${crop.soil.moisture.min}% - ${crop.soil.moisture.max}%).`;
        }
      } else {
        cropInterpretation = "No historical telemetry available for this period.";
      }

      const telemetryItems = docs.map((doc) => ({
        id: doc._id.toString(),
        deviceId: doc.deviceId,
        fieldId: doc.fieldId,
        timestamp: doc.timestamp,
        measurements: parseMeasurements(doc.measurements),
      }));

      res.status(200).json({
        success: true,
        data: {
          fieldId,
          deviceId: deviceId || "AGRISENSE-ESP8266-001",
          crop: {
            id: crop.id,
            name: crop.name,
            targetMoisture: crop.soil.moisture,
          },
          range,
          dataPoints: docs.length,
          availability: availabilityPercent,
          aggregates,
          stats: aggregates, // Compatibility alias
          cropInterpretation,
          telemetry: telemetryItems,
          message: docs.length === 0 ? "No telemetry recorded for this period." : undefined,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
