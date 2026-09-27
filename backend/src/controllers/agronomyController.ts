import { Request, Response } from "express";
import { CROP_PROFILES } from "../../../knowledge-base/crops";
import { AGRONOMIC_RULES } from "../../../knowledge-base/guidelines/agronomic-rules";
import { ContextBuilder } from "../services/ContextService/ContextBuilder";
import { IntelligenceEngine } from "../services/IntelligenceEngine/IntelligenceEngine";
import { CropGrowthStage } from "../../../shared/types/agriculture";

export class AgronomyController {
  static async evaluate(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = req.body.fieldId || (req.query.fieldId as string) || "FIELD-PUNJAB-01";
      const cropId = req.body.cropId || (req.query.cropId as string) || "wheat";
      const growthStageId = req.body.growthStage || (req.query.growthStage as string) || undefined;

      const crop = CROP_PROFILES[cropId] || CROP_PROFILES.wheat;
      const stage = (growthStageId && crop.growthStages.find((s: CropGrowthStage) => s.id === growthStageId)) || crop.growthStages[0];

      const context = await ContextBuilder.buildContext(fieldId);
      context.crop = crop;
      context.currentStage = stage;
      context.field.currentCropId = crop.id;
      context.field.currentCropStage = stage.id;

      // Evaluate deterministic Intelligence Engine
      const analysisResult = IntelligenceEngine.evaluate(context);

      const isOffline = context.telemetry.freshnessState === "OFFLINE";
      const moisture = context.telemetry.measurements.soil_moisture?.value ?? null;
      const targetMoistureMin = crop.soil.moisture.min;
      const targetMoistureMax = crop.soil.moisture.max;

      const detectedConditions: string[] = [];
      const rulesTriggered: any[] = [];

      if (isOffline) {
        detectedConditions.push("DEVICE_OFFLINE");
      }

      if (moisture !== null) {
        if (moisture < targetMoistureMin) {
          detectedConditions.push(`MOISTURE_DEFICIT (< ${targetMoistureMin}%)`);
        } else if (moisture > targetMoistureMax) {
          detectedConditions.push(`MOISTURE_EXCESS (> ${targetMoistureMax}%)`);
        }
      } else {
        detectedConditions.push("INSUFFICIENT_TELEMETRY");
      }

      // Match triggered agronomic rules
      for (const rule of AGRONOMIC_RULES) {
        let isTriggered = false;
        let thresholdText = "";

        if (rule.condition === "WATERLOGGING_RISK" && moisture !== null && moisture > 80) {
          isTriggered = true;
          thresholdText = `Soil Moisture ${moisture}% > 80%`;
        } else if (rule.condition === "DROUGHT_RISK" && moisture !== null && moisture < targetMoistureMin) {
          isTriggered = true;
          thresholdText = `Soil Moisture ${moisture}% < ${targetMoistureMin}% (${crop.name} Minimum Threshold)`;
        } else if (rule.condition === "NUTRIENT_DEFICIENCY_RISK" && context.telemetry.measurements.nitrogen?.value === null) {
          isTriggered = true;
          thresholdText = `Nitrogen parameter missing / unmeasured`;
        }

        if (isTriggered) {
          rulesTriggered.push({
            ruleId: rule.id,
            condition: rule.condition,
            threshold: thresholdText,
            crop: crop.name,
            growthStage: stage.name,
            source: rule.source || "Configured agronomic rule set",
            action: rule.action,
          });
        }
      }

      // Default decision source metadata
      const hasPauSource = rulesTriggered.some((r) => typeof r.source === "object" && (r.source?.organization?.includes("PAU") || r.source?.organization?.includes("ICAR")));
      const decisionSource = hasPauSource ? "ICAR/PAU Deterministic Rule Engine" : "Configured agronomic rule set";

      const topRec = analysisResult.recommendation[0];
      const irrigationAction = analysisResult.recommendation.find((r) => r.action.type === "IRRIGATION")?.action.title || "No irrigation action required at this timestamp.";
      const fertilizerAction = analysisResult.recommendation.find((r) => r.action.type === "NUTRIENT")?.action.title || "No fertilizer top-dressing required.";
      const pesticideAction = analysisResult.recommendation.find((r) => r.action.type === "PEST" || r.action.type === "DISEASE")?.action.title || "No chemical spray recommended (scout field first).";

      const responsePayload = {
        status: analysisResult.condition.code,
        riskLevel: analysisResult.condition.severity,
        crop: {
          cropId: crop.id,
          cropName: crop.name,
          growthStage: stage.name,
          moistureTargetRange: crop.soil.moisture,
          tempTargetRange: crop.temperature,
          npkTargetRange: crop.nutrients,
        },
        detectedConditions,
        reasoning: analysisResult.diagnosis.findings.map((f) => f.description),
        recommendations: analysisResult.recommendation.map((r) => r.action.title),
        irrigationAction,
        fertilizerAction,
        pesticideAction,
        doNotActions: topRec?.doNot || ["Do not over-irrigate unnecessarily"],
        confidence: analysisResult.confidence,
        rulesTriggered,
        decisionSource,
        evaluatedAt: new Date().toISOString(),
      };

      res.status(200).json({
        success: true,
        data: responsePayload,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
        timestamp: new Date().toISOString(),
      });
    }
  }

  static getCropRules(req: Request, res: Response): void {
    const cropId = req.params.cropId || "wheat";
    const crop = CROP_PROFILES[cropId];

    if (!crop) {
      res.status(404).json({
        success: false,
        error: { code: "CROP_NOT_FOUND", message: `Crop profile '${cropId}' not found` },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        cropId: crop.id,
        cropName: crop.name,
        scientificName: crop.scientificName,
        soilMoistureRanges: crop.soil.moisture,
        temperatureRanges: crop.temperature,
        humidityRanges: crop.humidity,
        NPKRanges: crop.nutrients,
        growthStages: crop.growthStages,
        stressConditions: crop.stressConditions,
        diseaseRisks: crop.diseaseRisks,
        pestRisks: crop.pestRisks,
        recommendations: crop.recommendations,
        decisionSource: "ICAR/PAU Deterministic Rule Engine",
      },
      timestamp: new Date().toISOString(),
    });
  }
}
