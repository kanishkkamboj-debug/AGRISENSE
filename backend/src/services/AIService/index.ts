import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../../../../shared/types/recommendation";
import { logger } from "../../utils/logger";

export class AIService {
  private static aiClient: GoogleGenerativeAI | null = null;

  private static getClient(): GoogleGenerativeAI | null {
    if (!this.aiClient && process.env.GEMINI_API_KEY) {
      this.aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return this.aiClient;
  }

  static async generateExplanation(analysis: AnalysisResult): Promise<{ text: string; isAiGenerated: boolean }> {
    const client = this.getClient();

    if (!client) {
      logger.info("GEMINI_OFFLINE using deterministic rule-based natural language explanation.");
      return {
        text: this.getDeterministicFallback(analysis),
        isAiGenerated: false,
      };
    }

    try {
      const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are AgriSense AI, an expert precision agriculture advisor.
Translate the following structured agricultural analysis JSON into clear, encouraging, action-oriented advisory language for a farmer.

RULES:
1. Speak directly to the farmer.
2. Clearly state WHAT to do, WHY to do it, WHAT to avoid, and WHEN to re-check.
3. NEVER invent or hallucinate any sensor numbers, dates, or crop thresholds not present in the input JSON.
4. Keep the summary under 150 words.

ANALYSIS JSON:
${JSON.stringify(analysis, null, 2)}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();

      return {
        text: text.trim(),
        isAiGenerated: true,
      };
    } catch (err: any) {
      logger.warn(`GEMINI_API_CALL_FAILED (${err.message}). Falling back to deterministic explanation.`);
      return {
        text: this.getDeterministicFallback(analysis),
        isAiGenerated: false,
      };
    }
  }

  private static getDeterministicFallback(analysis: AnalysisResult): string {
    const cond = analysis.condition.code;
    const rec = analysis.recommendation[0];

    if (cond === "WATERLOGGING_RISK") {
      return "⚠️ URGENT WATERLOGGING ADVISORY: Soil moisture has exceeded crop safety thresholds for over 12 hours. Please open your lower field surface drainage channels immediately and suspend all irrigation and nitrogen fertilizer applications. Re-check the field after 6 hours.";
    }

    if (cond === "FLOOD_RISK") {
      return "🚨 EMERGENCY FLOOD ADVISORY: Heavy rainfall has inundated your field. Drain standing surface water using pumps or gravity ditches. Assess crop survival rate once water recedes before applying any inputs.";
    }

    if (cond === "MOISTURE_STRESS") {
      return "💧 IRRIGATION ADVISORY: Soil moisture is below the recommended minimum for your crop growth stage. Please schedule drip or furrow irrigation to restore optimal moisture.";
    }

    return `🌱 CROP OPERATING NORMAL: Field conditions are within optimal parameters for your crop growth stage (${rec?.action?.title || "Continue routine monitoring"}). Keep regular scouting active and inspect pest traps twice this week.`;
  }
}
