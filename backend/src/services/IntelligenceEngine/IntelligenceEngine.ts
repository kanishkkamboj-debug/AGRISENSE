import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { AnalysisResult, Finding, Evidence, Recommendation } from "../../../../shared/types/recommendation";
import { SoilAnalyzer } from "./SoilAnalyzer";
import { NutrientAnalyzer } from "./NutrientAnalyzer";
import { IrrigationAnalyzer } from "./IrrigationAnalyzer";
import { DisasterEngine } from "./DisasterEngine";
import { DataFreshnessService } from "../DataFreshnessService";

export class IntelligenceEngine {
  static evaluate(ctx: AgriculturalContext): AnalysisResult {
    const findings: Finding[] = [];
    const evidenceList: Evidence[] = [];
    const recommendations: Recommendation[] = [];

    // 1. Evaluate Disaster Engine (Waterlogging / Flood / Severe Drought)
    const disasterRes = DisasterEngine.analyze(ctx);
    findings.push(...disasterRes.findings);
    recommendations.push(...disasterRes.recommendations);

    // 2. Evaluate Soil & Moisture Analyzer
    const soilRes = SoilAnalyzer.analyze(ctx);
    findings.push(...soilRes.findings);
    evidenceList.push(...soilRes.evidence);

    // 3. Evaluate Nutrient Analyzer
    const nutrientRes = NutrientAnalyzer.analyze(ctx);
    findings.push(...nutrientRes.findings);
    evidenceList.push(...nutrientRes.evidence);

    // 4. Evaluate Irrigation Analyzer
    const irrRes = IrrigationAnalyzer.analyze(ctx);
    findings.push(...irrRes.findings);
    if (irrRes.recommendation) {
      recommendations.push(irrRes.recommendation);
    }

    // Determine primary condition & severity
    let primaryCode = "NORMAL";
    let primarySeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";

    if (disasterRes.recommendations.some((r) => r.condition === "FLOOD_RISK")) {
      primaryCode = "FLOOD_RISK";
      primarySeverity = "CRITICAL";
    } else if (disasterRes.recommendations.some((r) => r.condition === "WATERLOGGING_RISK")) {
      primaryCode = "WATERLOGGING_RISK";
      primarySeverity = "HIGH";
    } else if (recommendations.some((r) => r.condition === "MOISTURE_STRESS")) {
      primaryCode = "MOISTURE_STRESS";
      primarySeverity = "HIGH";
    }

    // Default routine recommendation if no acute condition exists
    if (recommendations.length === 0) {
      recommendations.push({
        id: `REC-ROUTINE-${Date.now()}`,
        condition: "NORMAL" as any,
        priority: "ROUTINE",
        status: "PRESENTED",
        action: {
          title: "Maintain Optimal Growth Operating Zone",
          steps: [
            "Soil moisture and pH are within optimal parameters.",
            "Continue routine twice-weekly field scouting.",
            "Monitor nitrogen status prior to next growth stage transition.",
          ],
          type: "GENERAL",
        },
        doNot: ["Over-irrigate unnecessarily"],
        evidence: evidenceList,
        expectedOutcome: "Sustain steady vegetative growth trajectory",
        confidence: "HIGH",
        limitations: [],
        knowledgeBaseVersion: "ICAR-PAU-2026.1",
        createdAt: new Date().toISOString(),
      });
    }

    // Assess Data Quality summary
    const validCnt = evidenceList.filter((e) => e.quality === "VALID").length;
    const missingCnt = evidenceList.filter((e) => e.quality === "MISSING").length;
    const overallQuality = DataFreshnessService.isFresh(ctx.telemetry.timestamp) ? "VALID" : "STALE";

    return {
      condition: {
        code: primaryCode as any,
        severity: primarySeverity,
      },
      diagnosis: {
        findings,
        evidence: evidenceList,
      },
      recommendation: recommendations,
      verification: recommendations[0]?.verification,
      confidence: missingCnt > 2 ? "LOW" : overallQuality === "VALID" ? "HIGH" : "MEDIUM",
      dataQuality: {
        overall: overallQuality as any,
        validParameters: validCnt,
        missingParameters: missingCnt,
        staleParameters: overallQuality === "STALE" ? 1 : 0,
      },
      generatedAt: new Date().toISOString(),
      engineVersion: "1.0.0",
      knowledgeBaseVersion: "ICAR-PAU-2026.1",
    };
  }
}
