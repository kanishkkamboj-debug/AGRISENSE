import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { PredictiveDepletion } from "../../../../shared/types/intelligence";

export class PredictiveLayer {
  static predictDepletion(ctx: AgriculturalContext, history: TelemetryRecord[]): PredictiveDepletion {
    const sm = ctx.telemetry.measurements.soil_moisture;
    const isAvailable = sm && sm.value !== null && sm.state !== "UNAVAILABLE";

    if (!isAvailable || sm.value === null) {
      return {
        moistureEstimate6h: null,
        moistureEstimate12h: null,
        moistureEstimate24h: null,
        isPredictionReliable: false,
        predictionReason: "Soil moisture sensor is UNAVAILABLE or offline",
      };
    }

    const validHistory = history
      .map((t) => t.measurements.soil_moisture?.value)
      .filter((v): v is number => v !== null && v !== undefined);

    // Requirement: Do not extrapolate without sufficient historical telemetry
    if (validHistory.length < 10) {
      return {
        moistureEstimate6h: null,
        moistureEstimate12h: null,
        moistureEstimate24h: null,
        isPredictionReliable: false,
        predictionReason: "Insufficient historical telemetry for prediction (minimum 10 records required)",
      };
    }

    const currentMoisture = sm.value;
    // Calculate average hourly depletion rate over history
    const oldest = validHistory[0];
    const delta = currentMoisture - oldest;
    const hourlyRate = delta / Math.max(1, validHistory.length);

    const est6h = Math.max(0, Math.min(100, parseFloat((currentMoisture + hourlyRate * 6).toFixed(1))));
    const est12h = Math.max(0, Math.min(100, parseFloat((currentMoisture + hourlyRate * 12).toFixed(1))));
    const est24h = Math.max(0, Math.min(100, parseFloat((currentMoisture + hourlyRate * 24).toFixed(1))));

    return {
      moistureEstimate6h: est6h,
      moistureEstimate12h: est12h,
      moistureEstimate24h: est24h,
      isPredictionReliable: true,
      predictionReason: "Calculated from 10+ historical telemetry data points",
    };
  }
}
