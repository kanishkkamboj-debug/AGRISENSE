import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { SoilIntelligence } from "../../../../shared/types/intelligence";

export class SoilIntelligenceEngine {
  static analyze(ctx: AgriculturalContext, history: TelemetryRecord[]): SoilIntelligence {
    const sm = ctx.telemetry.measurements.soil_moisture;
    const isAvailable = sm && sm.value !== null && sm.state !== "UNAVAILABLE";

    if (!isAvailable || sm.value === null) {
      return {
        moistureTrend: "UNAVAILABLE",
        dryingRatePerHour: null,
        wettingRatePerHour: null,
        timeSinceLastWetMinutes: null,
        timeSinceLastIrrigationMinutes: null,
        moistureDeficitPercent: null,
        moistureRecoveryScore: "UNAVAILABLE",
        volatilityScore: "UNAVAILABLE",
        conditionClassification: "UNAVAILABLE",
        currentVs24hAvgPercent: null,
      };
    }

    const currentMoisture = sm.value;
    const targetMin = ctx.crop.soil.moisture.min;
    const targetMax = ctx.crop.soil.moisture.max;
    const targetOpt = (targetMin + targetMax) / 2;

    // Extract historical moisture readings with timestamps
    const sorted = [...history]
      .map((t) => ({
        ts: Date.parse(t.timestamp),
        val: t.measurements.soil_moisture?.value,
      }))
      .filter((h): h is { ts: number; val: number } => h.val !== null && h.val !== undefined && !isNaN(h.ts))
      .sort((a, b) => a.ts - b.ts);

    let dryingRatePerHour: number | null = null;
    let wettingRatePerHour: number | null = null;
    let moistureTrend: "RISING" | "FALLING" | "STABLE" = "STABLE";

    if (sorted.length >= 2) {
      const oldest = sorted[0];
      const durationHours = Math.max(0.1, (Date.parse(ctx.telemetry.timestamp) - oldest.ts) / (1000 * 3600));
      const delta = currentMoisture - oldest.val;
      const rate = delta / durationHours;

      if (rate < -0.3) {
        dryingRatePerHour = parseFloat(Math.abs(rate).toFixed(2));
        moistureTrend = "FALLING";
      } else if (rate > 0.3) {
        wettingRatePerHour = parseFloat(rate.toFixed(2));
        moistureTrend = "RISING";
      }
    }

    // Time since last wet (> 50% moisture or rain)
    let timeSinceLastWetMinutes: number | null = null;
    const lastWetRecord = [...sorted].reverse().find((h) => h.val > 55);
    if (lastWetRecord) {
      timeSinceLastWetMinutes = Math.max(0, Math.floor((Date.parse(ctx.telemetry.timestamp) - lastWetRecord.ts) / (1000 * 60)));
    }

    // Moisture deficit relative to optimal target
    const moistureDeficitPercent = parseFloat(Math.max(0, targetOpt - currentMoisture).toFixed(1));

    // Calculate 24h average comparison
    let currentVs24hAvgPercent: number | null = null;
    if (sorted.length > 0) {
      const avg24h = sorted.reduce((sum, item) => sum + item.val, 0) / sorted.length;
      currentVs24hAvgPercent = parseFloat((currentMoisture - avg24h).toFixed(1));
    }

    // Moisture recovery score after irrigation/rain
    let moistureRecoveryScore: "EFFECTIVE" | "POOR" | "INSUFFICIENT_DATA" = "INSUFFICIENT_DATA";
    if (sorted.length >= 3) {
      const minHist = Math.min(...sorted.map((s) => s.val));
      const recoveryGain = currentMoisture - minHist;
      if (recoveryGain > 10) moistureRecoveryScore = "EFFECTIVE";
      else if (recoveryGain > 2) moistureRecoveryScore = "POOR";
    }

    // Volatility score
    let volatilityScore: "LOW" | "MODERATE" | "HIGH" = "LOW";
    if (sorted.length >= 4) {
      const avg = sorted.reduce((s, x) => s + x.val, 0) / sorted.length;
      const stdDev = Math.sqrt(sorted.reduce((s, x) => s + Math.pow(x.val - avg, 2), 0) / sorted.length);
      if (stdDev > 8) volatilityScore = "HIGH";
      else if (stdDev > 3) volatilityScore = "MODERATE";
    }

    // Classification
    let conditionClassification: "OPTIMAL" | "DRY" | "WET" | "WATERLOGGED" = "OPTIMAL";
    if (currentMoisture > 85) conditionClassification = "WATERLOGGED";
    else if (currentMoisture > targetMax) conditionClassification = "WET";
    else if (currentMoisture < targetMin) conditionClassification = "DRY";

    return {
      moistureTrend,
      dryingRatePerHour,
      wettingRatePerHour,
      timeSinceLastWetMinutes,
      timeSinceLastIrrigationMinutes: timeSinceLastWetMinutes,
      moistureDeficitPercent,
      moistureRecoveryScore,
      volatilityScore,
      conditionClassification,
      currentVs24hAvgPercent,
    };
  }
}
