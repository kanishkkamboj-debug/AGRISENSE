import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { Finding, Evidence } from "../../../../shared/types/recommendation";

export class SoilAnalyzer {
  static analyze(ctx: AgriculturalContext): { findings: Finding[]; evidence: Evidence[] } {
    const findings: Finding[] = [];
    const evidence: Evidence[] = [];

    const sm = ctx.telemetry.measurements.soil_moisture;
    const st = ctx.telemetry.measurements.soil_temperature;
    const sph = ctx.telemetry.measurements.soil_ph;

    const targetMoistureMin = ctx.crop.soil.moisture.min;
    const targetMoistureMax = ctx.crop.soil.moisture.max;

    if (sm && sm.value !== null) {
      const ev: Evidence = {
        parameter: "soil_moisture",
        value: sm.value,
        unit: sm.unit,
        source: ctx.telemetry.deviceId,
        timestamp: ctx.telemetry.timestamp,
        quality: sm.quality,
      };
      evidence.push(ev);

      if (sm.value > 85) {
        findings.push({
          description: `Soil moisture (${sm.value}%) severely exceeds crop upper bound (${targetMoistureMax}%)`,
          severity: "HIGH",
          evidence: [ev],
        });
      } else if (sm.value < targetMoistureMin) {
        findings.push({
          description: `Soil moisture (${sm.value}%) is below crop minimum threshold (${targetMoistureMin}%)`,
          severity: sm.value < 20 ? "HIGH" : "MEDIUM",
          evidence: [ev],
        });
      }
    }

    if (sph && sph.value !== null) {
      const ev: Evidence = {
        parameter: "soil_ph",
        value: sph.value,
        unit: sph.unit,
        source: ctx.telemetry.deviceId,
        timestamp: ctx.telemetry.timestamp,
        quality: sph.quality,
      };
      evidence.push(ev);

      if (sph.value < ctx.crop.soil.preferredPH.min) {
        findings.push({
          description: `Soil pH (${sph.value}) is acidic for ${ctx.crop.name} (preferred: ${ctx.crop.soil.preferredPH.min}-${ctx.crop.soil.preferredPH.max})`,
          severity: "MEDIUM",
          evidence: [ev],
        });
      } else if (sph.value > ctx.crop.soil.preferredPH.max) {
        findings.push({
          description: `Soil pH (${sph.value}) is alkaline for ${ctx.crop.name} (preferred: ${ctx.crop.soil.preferredPH.min}-${ctx.crop.soil.preferredPH.max})`,
          severity: "MEDIUM",
          evidence: [ev],
        });
      }
    }

    return { findings, evidence };
  }
}
