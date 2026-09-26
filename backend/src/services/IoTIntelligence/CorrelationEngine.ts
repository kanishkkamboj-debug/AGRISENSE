import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { MultiSensorCorrelation } from "../../../../shared/types/intelligence";

export class CorrelationEngine {
  static analyze(ctx: AgriculturalContext, history: TelemetryRecord[]): MultiSensorCorrelation {
    const temp = ctx.telemetry.measurements.ambient_temperature?.value ?? ctx.telemetry.measurements.soil_temperature?.value;
    const humidity = ctx.telemetry.measurements.ambient_humidity?.value ?? ctx.telemetry.measurements.soil_humidity?.value;
    const moisture = ctx.telemetry.measurements.soil_moisture?.value;
    const rain = ctx.telemetry.measurements.rainfall?.value ?? 0;
    const mq = (ctx.telemetry.measurements as any).mq_raw?.value ?? (ctx.telemetry.measurements as any).mq_signal?.value;

    const detectedCombinations: string[] = [];

    // Pattern 1: Rapid Drying & Thermal Stress
    let dryingStressPattern = false;
    if (temp !== null && temp !== undefined && temp > 30 && humidity !== null && humidity !== undefined && humidity < 50) {
      if (moisture !== null && moisture !== undefined && moisture < 35 && rain === 0) {
        dryingStressPattern = true;
        detectedCombinations.push("High Temp (>30°C) + Low Humidity (<50%) + Low Moisture (<35%) -> Drying/Thermal Stress");
      }
    }

    // Pattern 2: Confirmed Rain Response
    let confirmedRainPattern = false;
    if (rain > 0 && moisture !== null && moisture !== undefined && moisture > 45) {
      confirmedRainPattern = true;
      detectedCombinations.push("Rain Sensor Active + Soil Moisture Rise -> Confirmed Rainfall Infiltration");
    }

    // Pattern 3: Unexpected Soil Response
    let unexpectedSoilResponsePattern = false;
    if (rain > 5 && moisture !== null && moisture !== undefined && moisture < 30) {
      unexpectedSoilResponsePattern = true;
      detectedCombinations.push("Active Rain Event (>5mm) without corresponding soil moisture increase -> Potential Runoff or Sensor Placement Issue");
    }

    // Pattern 4: Gas / Weather Correlation
    let gasWeatherCorrelation: "CORRELATED" | "INDEPENDENT" | "UNAVAILABLE" = "UNAVAILABLE";
    if (mq !== null && mq !== undefined && temp !== null && temp !== undefined) {
      if (history.length >= 3) {
        const histMq = history.map((h) => (h.measurements as any).mq_raw?.value || 0).filter((v) => v > 0);
        if (histMq.length > 0) {
          const avgMq = histMq.reduce((a, b) => a + b, 0) / histMq.length;
          gasWeatherCorrelation = Math.abs(mq - avgMq) > 50 ? "CORRELATED" : "INDEPENDENT";
        }
      } else {
        gasWeatherCorrelation = "INDEPENDENT";
      }
    }

    let summaryText = "No acute cross-sensor anomalies detected.";
    if (dryingStressPattern) summaryText = "Rapid thermal & soil moisture depletion pattern active.";
    else if (unexpectedSoilResponsePattern) summaryText = "Rainfall event active without expected soil moisture infiltration.";
    else if (confirmedRainPattern) summaryText = "Environmental cooling and moisture infiltration pattern active.";

    return {
      dryingStressPattern,
      confirmedRainPattern,
      unexpectedSoilResponsePattern,
      gasWeatherCorrelation,
      summaryText,
      detectedCombinations,
    };
  }
}
