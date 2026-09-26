import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { EnvironmentalStressIndex } from "../../../../shared/types/intelligence";

export class StressEngine {
  static evaluateStress(ctx: AgriculturalContext): EnvironmentalStressIndex {
    const isOffline = ctx.telemetry.freshnessState === "OFFLINE";
    const primaryEvidence: string[] = [];
    const missingEvidence: string[] = [];

    const temp = ctx.telemetry.measurements.ambient_temperature?.value ?? ctx.telemetry.measurements.soil_temperature?.value;
    const humidity = ctx.telemetry.measurements.ambient_humidity?.value ?? ctx.telemetry.measurements.soil_humidity?.value;
    const moisture = ctx.telemetry.measurements.soil_moisture?.value;

    if (temp === null || temp === undefined) missingEvidence.push("temperature");
    if (humidity === null || humidity === undefined) missingEvidence.push("humidity");
    if (moisture === null || moisture === undefined) missingEvidence.push("soil_moisture");
    if (ctx.telemetry.measurements.nitrogen?.value === null || ctx.telemetry.measurements.nitrogen?.state === "UNAVAILABLE") {
      missingEvidence.push("nitrogen");
    }

    if (isOffline) {
      return {
        stressLevel: "UNAVAILABLE",
        heatStress: false,
        humidityStress: false,
        moistureStress: false,
        primaryEvidence: ["Device is OFFLINE. Cannot evaluate live environmental stress."],
        missingEvidence,
      };
    }

    let heatStress = false;
    let humidityStress = false;
    let moistureStress = false;

    if (temp !== null && temp !== undefined && temp > 32) {
      heatStress = true;
      primaryEvidence.push(`Elevated temperature (${temp}°C) exceeds optimum vegetative threshold.`);
    }

    if (humidity !== null && humidity !== undefined && (humidity < 40 || humidity > 85)) {
      humidityStress = true;
      primaryEvidence.push(`Sub-optimal humidity (${humidity}%).`);
    }

    if (moisture !== null && moisture !== undefined && (moisture < ctx.crop.soil.moisture.min || moisture > 80)) {
      moistureStress = true;
      primaryEvidence.push(
        moisture < ctx.crop.soil.moisture.min
          ? `Soil moisture deficit (${moisture}% < min ${ctx.crop.soil.moisture.min}%).`
          : `Excess soil moisture saturation (${moisture}%).`
      );
    }

    let stressLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
    const activeStressCount = (heatStress ? 1 : 0) + (humidityStress ? 1 : 0) + (moistureStress ? 1 : 0);

    if (activeStressCount >= 3) stressLevel = "CRITICAL";
    else if (activeStressCount === 2) stressLevel = "HIGH";
    else if (activeStressCount === 1) stressLevel = "MODERATE";

    if (primaryEvidence.length === 0) {
      primaryEvidence.push("Environmental and soil parameters are balanced within optimal operating bounds.");
    }

    return {
      stressLevel,
      heatStress,
      humidityStress,
      moistureStress,
      primaryEvidence,
      missingEvidence,
    };
  }
}
