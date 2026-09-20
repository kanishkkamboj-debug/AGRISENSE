import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { Finding, Evidence } from "../../../../shared/types/recommendation";

export class NutrientAnalyzer {
  static analyze(ctx: AgriculturalContext): { findings: Finding[]; evidence: Evidence[] } {
    const findings: Finding[] = [];
    const evidence: Evidence[] = [];

    const n = ctx.telemetry.measurements.nitrogen;
    const p = ctx.telemetry.measurements.phosphorus;
    const k = ctx.telemetry.measurements.potassium;

    const nTarget = ctx.currentStage.nutrientRequirement.n;

    if (!n || n.value === null || n.state === "UNAVAILABLE") {
      findings.push({
        description: "Nitrogen sensor data unavailable. Soil test or physical hardware connection required.",
        severity: "LOW",
        evidence: [
          {
            parameter: "nitrogen",
            value: null,
            unit: "mg/kg",
            source: ctx.telemetry.deviceId,
            timestamp: ctx.telemetry.timestamp,
            quality: "MISSING",
          },
        ],
      });
    } else {
      const ev: Evidence = {
        parameter: "nitrogen",
        value: n.value,
        unit: n.unit,
        source: ctx.telemetry.deviceId,
        timestamp: ctx.telemetry.timestamp,
        quality: n.quality,
      };
      evidence.push(ev);

      if (n.value < nTarget.min) {
        findings.push({
          description: `Nitrogen level (${n.value} mg/kg) is below stage requirement (${nTarget.min} mg/kg)`,
          severity: "MEDIUM",
          evidence: [ev],
        });
      }
    }

    return { findings, evidence };
  }
}
