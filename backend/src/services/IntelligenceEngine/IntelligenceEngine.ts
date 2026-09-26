import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { AnalysisResult, Finding, Evidence, Recommendation } from "../../../../shared/types/recommendation";
import { SoilAnalyzer } from "./SoilAnalyzer";
import { NutrientAnalyzer } from "./NutrientAnalyzer";
import { IrrigationAnalyzer } from "./IrrigationAnalyzer";
import { DisasterEngine } from "./DisasterEngine";
import { DataFreshnessService } from "../DataFreshnessService";

import { ContextSnapshotModel } from "../../models/ContextSnapshot";

export class IntelligenceEngine {
  static evaluate(ctx: AgriculturalContext): AnalysisResult {
    const findings: Finding[] = [];
    const evidenceList: Evidence[] = [];
    const recommendations: Recommendation[] = [];

    const isDeviceOffline = ctx.telemetry.freshnessState === "OFFLINE";

    if (isDeviceOffline) {
      findings.push({
        description: `CRITICAL: IoT Device (${ctx.telemetry.deviceId}) is OFFLINE. Last received telemetry: ${ctx.telemetry.timestamp}. Data shown is historical reference only.`,
        severity: "CRITICAL",
        evidence: [
          {
            parameter: "device_status",
            value: "OFFLINE",
            unit: "",
            source: ctx.telemetry.deviceId,
            timestamp: ctx.telemetry.timestamp,
            quality: "MISSING",
          },
        ],
      });
    }

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
    let primaryCode = isDeviceOffline ? "OFFLINE" : "NORMAL";
    let primarySeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = isDeviceOffline ? "HIGH" : "LOW";

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

    // Data Completeness Calculation (Req 86)
    const hasMoisture = ctx.telemetry.measurements.soil_moisture?.value !== null && ctx.telemetry.measurements.soil_moisture?.value !== undefined;
    const hasTemp = ctx.telemetry.measurements.soil_temperature?.value !== null && ctx.telemetry.measurements.soil_temperature?.value !== undefined;
    const hasPh = ctx.telemetry.measurements.soil_ph?.value !== null && ctx.telemetry.measurements.soil_ph?.value !== undefined;
    const hasN = ctx.telemetry.measurements.nitrogen?.value !== null && ctx.telemetry.measurements.nitrogen?.value !== undefined;

    const iotCompleteness = isDeviceOffline ? 0 : Math.round(((hasMoisture ? 1 : 0) + (hasTemp ? 1 : 0) + (hasPh ? 1 : 0) + (hasN ? 1 : 0)) / 4 * 100);
    const weatherCompleteness = ctx.weather ? 100 : 0;
    const cropCompleteness = ctx.crop ? 100 : 0;
    const gisCompleteness = ctx.field ? 100 : 0;
    const soilCompleteness = hasMoisture && hasPh ? 100 : hasMoisture || hasPh ? 50 : 0;
    const npkCompleteness = hasN ? 100 : 0;

    // Save Context Snapshot for Auditing (Req 87)
    if (process.env.NODE_ENV !== "test") {
      const analysisId = `ANALYSIS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      ContextSnapshotModel.create({
        fieldId: ctx.field.fieldId,
        analysisId,
        telemetrySnapshot: ctx.telemetry,
        weatherSnapshot: ctx.weather,
        fieldSnapshot: ctx.field,
        cropSnapshot: { id: ctx.crop.id, stage: ctx.currentStage.id },
        sensorHealthSnapshot: { completeness: iotCompleteness, isOffline: isDeviceOffline },
        ruleSnapshot: { primaryCode, primarySeverity },
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    }

    // Assess Data Quality summary
    const validCnt = evidenceList.filter((e) => e.quality === "VALID").length;
    const missingCnt = evidenceList.filter((e) => e.quality === "MISSING").length;
    const overallQuality = isDeviceOffline ? "OFFLINE" : DataFreshnessService.isFresh(ctx.telemetry.timestamp) ? "VALID" : "STALE";

    const confidenceLevel = isDeviceOffline || missingCnt > 3 ? "LOW" : overallQuality === "VALID" ? "HIGH" : "MEDIUM";

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
      confidence: confidenceLevel as any,
      dataCompleteness: {
        iot: iotCompleteness,
        weather: weatherCompleteness,
        crop: cropCompleteness,
        gis: gisCompleteness,
        soil: soilCompleteness,
        npk: npkCompleteness,
      },
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
