import { Request, Response } from "express";
import { ContextBuilder } from "../services/ContextService/ContextBuilder";
import { IntelligenceEngine } from "../services/IntelligenceEngine/IntelligenceEngine";
import { ActionPlanner } from "../services/FarmerAdvisoryService/ActionPlanner";
import { AIService } from "../services/AIService";
import { AdvisoryResponse } from "../../../shared/types/api";

export class AdvisoryController {
  static async getAdvisory(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";

      // 1. Build synchronized Context via ContextBuilder
      const context = await ContextBuilder.buildContext(fieldId);

      // 2. Evaluate Multi-Analyzer Intelligence Engine
      const analysisResult = IntelligenceEngine.evaluate(context);

      // 3. Compile Farmer Action Plan
      const farmerActionPlan = ActionPlanner.compileActionPlan(analysisResult);

      // 4. Generate Natural Language Explanation via Gemini (with offline fallback)
      const { text: nleText, isAiGenerated } = await AIService.generateExplanation(analysisResult);

      const response: AdvisoryResponse = {
        analysisResult,
        naturalLanguageExplanation: nleText,
        farmerActionPlan,
        generatedAt: new Date().toISOString(),
        isAiAvailable: isAiGenerated,
      };

      res.status(200).json({
        success: true,
        data: response,
        dataMode: context.telemetry.dataMode,
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
}
