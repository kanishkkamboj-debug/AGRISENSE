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
      const missingEv: Evidence = {
        parameter: "nitrogen",
        value: null,
        unit: "mg/kg",
        source: ctx.telemetry.deviceId,
        timestamp: ctx.telemetry.timestamp,
        quality: "MISSING",
      };
      evidence.push(missingEv);
      findings.push({
        description: "Nitrogen sensor data unavailable. Soil test or physical hardware connection required.",
        severity: "LOW",
        evidence: [missingEv],
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

    if (!p || p.value === null || p.state === "UNAVAILABLE") {
      evidence.push({
        parameter: "phosphorus",
        value: null,
        unit: "mg/kg",
        source: ctx.telemetry.deviceId,
        timestamp: ctx.telemetry.timestamp,
        quality: "MISSING",
      });
    } else {
      evidence.push({
        parameter: "phosphorus",
        value: p.value,
        unit: p.unit,
        source: ctx.telemetry.deviceId,
        timestamp: ctx.telemetry.timestamp,
        quality: p.quality,
      });
    }

    if (!k || k.value === null || k.state === "UNAVAILABLE") {
      evidence.push({
        parameter: "potassium",
        value: null,
        unit: "mg/kg",
        source: ctx.telemetry.deviceId,
        timestamp: ctx.telemetry.timestamp,
        quality: "MISSING",
      });
    } else {
      evidence.push({
        parameter: "potassium",
        value: k.value,
        unit: k.unit,
        source: ctx.telemetry.deviceId,
        timestamp: ctx.telemetry.timestamp,
        quality: k.quality,
      });
    }

    return { findings, evidence };
  }
}
