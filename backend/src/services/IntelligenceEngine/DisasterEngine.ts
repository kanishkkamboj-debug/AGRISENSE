import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { Finding, Evidence, Recommendation } from "../../../../shared/types/recommendation";
import { AGRONOMIC_RULES } from "../../../../knowledge-base/guidelines/agronomic-rules";

export class DisasterEngine {
  static analyze(ctx: AgriculturalContext): { findings: Finding[]; recommendations: Recommendation[] } {
    const findings: Finding[] = [];
    const recommendations: Recommendation[] = [];

    const sm = ctx.telemetry.measurements.soil_moisture;
    const currentMoisture = sm?.value ?? 42.0;
    const saturationHours = ctx.history.saturationDurationHours;
    const rainfall = ctx.weather?.recentRainfallMm24h || 0;

    const evMoisture: Evidence = {
      parameter: "soil_moisture",
      value: currentMoisture,
      unit: "%",
      source: ctx.telemetry.deviceId,
      timestamp: ctx.telemetry.timestamp,
      quality: sm?.quality || "VALID",
    };

    const evRainfall: Evidence = {
      parameter: "rainfall",
      value: rainfall,
      unit: "mm",
      source: ctx.weather?.source || "weather-station",
      timestamp: ctx.telemetry.timestamp,
      quality: "VALID",
    };

    // 1. Waterlogging Risk Analysis
    if (currentMoisture > 85 && saturationHours >= 12) {
      const rule = AGRONOMIC_RULES.find((r) => r.id === "RULE_WATERLOGGING_001");

      findings.push({
        description: `High Waterlogging Risk: Soil moisture (${currentMoisture}%) has remained saturated for ${saturationHours} consecutive hours in ${ctx.crop.name} root zone.`,
        severity: "HIGH",
        evidence: [evMoisture, evRainfall],
      });

      recommendations.push({
        id: `REC-DISASTER-WL-${Date.now()}`,
        condition: "WATERLOGGING_RISK",
        priority: "URGENT",
        status: "PRESENTED",
        action: {
          title: "Immediate Root-Zone Drainage & Saturation Mitigation",
          steps: [
            "Open drainage channels on the lower boundary of Field 01 immediately.",
            "Remove debris and clear blocked drainage outlets.",
            "Stop all irrigation.",
            "Do NOT apply nitrogen fertilizer into waterlogged soil (prevents denitrification loss and root rot).",
            "Inspect plants for stem lodging, leaf yellowing, and root decay.",
            "Re-check soil moisture after 6 hours of drainage.",
          ],
          type: "DRAINAGE",
        },
        timing: { start: new Date().toISOString(), deadline: "Immediate", reassessAfterMinutes: 360 },
        doNot: ["Irrigate", "Broadcast urea/DAP into standing water", "Spray foliar chemicals on saturated stressed crop"],
        evidence: [evMoisture, evRainfall],
        expectedOutcome: "Reduce soil moisture below 75% and restore root aeration.",
        verification: {
          parameters: ["soil_moisture"],
          targetDirection: "DECREASE",
          windowMinutes: 360,
        },
        confidence: "HIGH",
        limitations: ["Root pathogen presence requires physical soil sampling."],
        knowledgeBaseVersion: rule ? `${rule.source.organization} (${rule.version})` : "PAU-2024-v1.2",
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Flood Mode
    if (rainfall > 100 || currentMoisture > 92) {
      const rule = AGRONOMIC_RULES.find((r) => r.id === "RULE_FLOOD_001");

      findings.push({
        description: `Flood Warning: Heavy rainfall event (${rainfall} mm) causing field inundation.`,
        severity: "CRITICAL",
        evidence: [evMoisture, evRainfall],
      });

      recommendations.push({
        id: `REC-DISASTER-FLD-${Date.now()}`,
        condition: "FLOOD_RISK",
        priority: "URGENT",
        status: "PRESENTED",
        action: {
          title: "Post-Flood Emergency Drainage & Survival Assessment",
          steps: [
            "Deploy surface drainage pumps or cut emergency outlets to remove standing water.",
            "Inspect standing crop for submergence survival vs complete rot.",
            "If crop survival >60%, allow soil to drain before applying corrective foliar micronutrients.",
            "If crop survival <30%, evaluate economic feasibility of field land recovery and replanting alternative short-duration crop.",
          ],
          type: "DRAINAGE",
        },
        timing: { start: new Date().toISOString(), reassessAfterMinutes: 720 },
        doNot: ["Dump heavy granular fertilizer on flooded ground", "Till submerged clay soil"],
        evidence: [evMoisture, evRainfall],
        expectedOutcome: "Complete water evacuation from field surface within 24-48 hours.",
        verification: {
          parameters: ["soil_moisture"],
          targetDirection: "DECREASE",
          windowMinutes: 720,
        },
        confidence: "HIGH",
        limitations: ["Crop survival percentage depends on temperature and water flow velocity."],
        knowledgeBaseVersion: rule ? `${rule.source.organization} (${rule.version})` : "ICAR-NDM-2023",
        createdAt: new Date().toISOString(),
      });
    }

    return { findings, recommendations };
  }
}
