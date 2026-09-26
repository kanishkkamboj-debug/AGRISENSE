import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { RainIntelligence } from "../../../../shared/types/intelligence";

export class RainIntelligenceEngine {
  static analyze(ctx: AgriculturalContext, history: TelemetryRecord[]): RainIntelligence {
    const rainMeas = ctx.telemetry.measurements.rainfall;
    const isRaining = rainMeas ? (rainMeas.value !== null && rainMeas.value > 0) : false;

    // Calculate rain duration and last rain time from history
    let rainDurationMinutes = 0;
    let timeSinceLastRainHours: number | null = null;
    const nowMs = Date.parse(ctx.telemetry.timestamp);

    const rainPoints = history
      .map((t) => ({
        ts: Date.parse(t.timestamp),
        val: t.measurements.rainfall?.value ?? 0,
      }))
      .filter((h) => !isNaN(h.ts))
      .sort((a, b) => a.ts - b.ts);

    const activeRainPoints = rainPoints.filter((p) => p.val > 0);
    if (activeRainPoints.length > 0) {
      if (isRaining) {
        const startTs = activeRainPoints[0].ts;
        rainDurationMinutes = Math.max(10, Math.floor((nowMs - startTs) / (1000 * 60)));
      }
      const lastRainPoint = activeRainPoints[activeRainPoints.length - 1];
      timeSinceLastRainHours = parseFloat(((nowMs - lastRainPoint.ts) / (1000 * 3600)).toFixed(1));
    }

    // Soil response
    const sm = ctx.telemetry.measurements.soil_moisture;
    let rainToSoilResponse: "CONFIRMED_RECOVERY" | "NO_SOIL_RESPONSE" | "UNAVAILABLE" = "UNAVAILABLE";
    if (sm && sm.value !== null && sm.state !== "UNAVAILABLE") {
      if (activeRainPoints.length > 0) {
        const preRainSm = history.find((t) => Date.parse(t.timestamp) < activeRainPoints[0].ts)?.measurements.soil_moisture?.value;
        if (preRainSm !== undefined && preRainSm !== null) {
          rainToSoilResponse = sm.value > preRainSm + 2 ? "CONFIRMED_RECOVERY" : "NO_SOIL_RESPONSE";
        } else {
          rainToSoilResponse = sm.value > 50 ? "CONFIRMED_RECOVERY" : "NO_SOIL_RESPONSE";
        }
      } else {
        rainToSoilResponse = "NO_SOIL_RESPONSE";
      }
    }

    // Temperature cooling response
    const tempMeas = ctx.telemetry.measurements.ambient_temperature || ctx.telemetry.measurements.soil_temperature;
    let rainToTempResponse: "COOLING_EFFECT" | "NO_CHANGE" | "UNAVAILABLE" = "UNAVAILABLE";
    if (tempMeas && tempMeas.value !== null && tempMeas.state !== "UNAVAILABLE") {
      if (activeRainPoints.length > 0) {
        const preTemp = history[0]?.measurements.ambient_temperature?.value;
        if (preTemp !== undefined && preTemp !== null && tempMeas.value < preTemp - 1) {
          rainToTempResponse = "COOLING_EFFECT";
        } else {
          rainToTempResponse = "NO_CHANGE";
        }
      } else {
        rainToTempResponse = "NO_CHANGE";
      }
    }

    // Rainfall effectiveness
    let rainfallEffectiveness: "EFFECTIVE" | "INSUFFICIENT" | "EXCESSIVE" | "UNAVAILABLE" = "UNAVAILABLE";
    if (isRaining || activeRainPoints.length > 0) {
      if (sm && sm.value !== null) {
        if (sm.value > 85) rainfallEffectiveness = "EXCESSIVE";
        else if (sm.value > 40) rainfallEffectiveness = "EFFECTIVE";
        else rainfallEffectiveness = "INSUFFICIENT";
      }
    }

    return {
      isRaining,
      rainDurationMinutes,
      timeSinceLastRainHours,
      rainToSoilResponse,
      rainToTempResponse,
      rainfallEffectiveness,
    };
  }
}
