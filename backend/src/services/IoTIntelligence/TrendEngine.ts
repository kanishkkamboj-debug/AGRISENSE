import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { DerivedTelemetrySignal } from "../../../../shared/types/intelligence";

export class TrendEngine {
  static analyzeParameter(
    parameterName: string,
    currentTelemetry: TelemetryRecord,
    history: TelemetryRecord[]
  ): DerivedTelemetrySignal {
    const currentVal = currentTelemetry.measurements[parameterName as keyof typeof currentTelemetry.measurements];
    const isAvailable = currentVal && currentVal.value !== null && currentVal.state !== "UNAVAILABLE";

    if (!isAvailable || currentVal.value === null) {
      return {
        parameter: parameterName,
        value: null,
        unit: currentVal?.unit || "",
        state: "UNAVAILABLE",
        quality: "MISSING",
        trend: "UNAVAILABLE",
        changeRatePerHour: null,
        min24h: null,
        max24h: null,
        avg24h: null,
        stabilityIndex: "UNAVAILABLE",
      };
    }

    const currentNumeric = currentVal.value;

    // Filter valid historical values for parameter
    const validHistory = history
      .map((t) => ({
        ts: Date.parse(t.timestamp),
        val: t.measurements[parameterName as keyof typeof t.measurements]?.value,
      }))
      .filter((h): h is { ts: number; val: number } => h.val !== null && h.val !== undefined && !isNaN(h.ts));

    if (validHistory.length === 0) {
      return {
        parameter: parameterName,
        value: currentNumeric,
        unit: currentVal.unit,
        state: currentVal.state,
        quality: currentVal.quality,
        trend: "STABLE",
        changeRatePerHour: 0,
        min24h: currentNumeric,
        max24h: currentNumeric,
        avg24h: currentNumeric,
        stabilityIndex: "STABLE",
      };
    }

    const values = validHistory.map((h) => h.val);
    const min24h = Math.min(...values, currentNumeric);
    const max24h = Math.max(...values, currentNumeric);
    const sum = values.reduce((a, b) => a + b, currentNumeric);
    const avg24h = parseFloat((sum / (values.length + 1)).toFixed(1));

    // Calculate hourly rate of change over recent points
    let changeRatePerHour = 0;
    const sorted = [...validHistory].sort((a, b) => a.ts - b.ts);
    const oldest = sorted[0];
    const newestTs = Date.parse(currentTelemetry.timestamp);
    const durationHours = Math.max(0.1, (newestTs - oldest.ts) / (1000 * 3600));
    const totalDiff = currentNumeric - oldest.val;
    changeRatePerHour = parseFloat((totalDiff / durationHours).toFixed(2));

    // Determine trend
    let trend: "RISING" | "FALLING" | "STABLE" = "STABLE";
    if (changeRatePerHour > 0.5) trend = "RISING";
    else if (changeRatePerHour < -0.5) trend = "FALLING";

    // Determine stability index
    const variance = values.reduce((acc, v) => acc + Math.pow(v - avg24h, 2), 0) / Math.max(1, values.length);
    const stdDev = Math.sqrt(variance);
    let stabilityIndex: "STABLE" | "MODERATE" | "VOLATILE" = "STABLE";
    if (stdDev > 5) stabilityIndex = "VOLATILE";
    else if (stdDev > 2) stabilityIndex = "MODERATE";

    return {
      parameter: parameterName,
      value: currentNumeric,
      unit: currentVal.unit,
      state: currentVal.state,
      quality: currentVal.quality,
      trend,
      changeRatePerHour,
      min24h: parseFloat(min24h.toFixed(1)),
      max24h: parseFloat(max24h.toFixed(1)),
      avg24h,
      stabilityIndex,
    };
  }
}
