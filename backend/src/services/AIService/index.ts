import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../../../../shared/types/recommendation";
import { AgriculturalContext } from "../../../../shared/types/agriculture";
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
      const isOffline = (analysis.dataQuality?.overall as any) === "OFFLINE" || (analysis.condition?.code as any) === "OFFLINE";

      const prompt = `You are AgriSense AI, an expert precision agriculture advisor.
Translate the following structured agricultural analysis JSON into clear, encouraging, action-oriented advisory language for a farmer.

CRITICAL HARDWARE RULES:
1. Speak directly to the farmer.
2. CURRENT DEVICE STATUS = ${isOffline ? "OFFLINE" : "ONLINE"}.
3. If device is OFFLINE: You MUST explicitly distinguish historical/last known measurements from live measurements. Explain that current soil moisture/NPK cannot be verified until reconnected, and issue conditional recommendations. NEVER present historical numbers as live current state.
4. Clearly state WHAT to do, WHY to do it, WHAT to avoid, and WHEN to re-check.
5. NEVER invent or hallucinate any sensor numbers, dates, or crop thresholds not present in the input JSON.
6. Keep the summary under 150 words.

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

  static async askAgriSense(query: string, ctx: AgriculturalContext): Promise<{ answer: string; isAiGenerated: boolean }> {
    const client = this.getClient();
    const isOffline = ctx.telemetry.freshnessState === "OFFLINE";

    if (!client) {
      if (query.toLowerCase().includes("irrigate")) {
        return {
          answer: isOffline
            ? "⚠️ Current soil moisture cannot be verified because the IoT device is offline. Reconnect the device and obtain a current moisture measurement before making an irrigation decision."
            : "💧 Irrigation should be based on your crop stage threshold. Current telemetry indicates soil moisture is monitored.",
          isAiGenerated: false,
        };
      }
      return {
        answer: isOffline
          ? `⚠️ Device ${ctx.telemetry.deviceId} is currently OFFLINE. Last received packet was at ${ctx.telemetry.timestamp}. Reconnect hardware to view live field telemetry.`
          : `🌱 Field ${ctx.field.name} is currently monitoring ${ctx.crop.name} (${ctx.currentStage.name} stage).`,
        isAiGenerated: false,
      };
    }

    try {
      const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are AgriSense AI, an intelligent precision agriculture chat assistant.
Answer the farmer's question using ONLY the provided real field context.

RULES:
1. Answer strictly based on actual available context.
2. CURRENT DEVICE STATUS = ${isOffline ? "OFFLINE" : "ONLINE"}.
3. If information is missing or device is OFFLINE, explicitly state what is missing or offline. NEVER invent telemetry values.
4. Keep the response under 120 words, actionable and friendly.

FARMER QUESTION: "${query}"

FIELD CONTEXT JSON:
${JSON.stringify(ctx, null, 2)}`;

      const res = await model.generateContent(prompt);
      return {
        answer: res.response.text().trim(),
        isAiGenerated: true,
      };
    } catch (err: any) {
      return {
        answer: `AgriSense Assistant: Unable to reach AI service (${err.message}). Current device status: ${isOffline ? "OFFLINE" : "ONLINE"}.`,
        isAiGenerated: false,
      };
    }
  }

  private static getDeterministicFallback(analysis: AnalysisResult): string {
    const cond = analysis.condition.code;
    const rec = analysis.recommendation[0];
    const isOffline = (analysis.dataQuality?.overall as any) === "OFFLINE" || (cond as any) === "OFFLINE";

    if (isOffline) {
      return "⚠️ AGRISENSE DEVICE OFFLINE: Hardware telemetry stream is interrupted. Displayed readings are historical for reference only. Reconnect your ESP8266 IoT device to receive real-time biophysical advisories.";
    }

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
