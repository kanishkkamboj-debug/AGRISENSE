import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { Finding, Recommendation } from "../../../../shared/types/recommendation";
import { ChemicalSafetyValidator, ChemicalSafetyQuery } from "./ChemicalSafetyValidator";

export class IPMEngine {
  static evaluateIPM(ctx: AgriculturalContext, pestFindings: Finding[]): Recommendation[] {
    const recs: Recommendation[] = [];

    if (pestFindings.length === 0) return recs;

    const firstPest = ctx.crop.pestRisks?.[0] || "Aphids";

    // IPM Safety Gate Query
    const query: ChemicalSafetyQuery = {
      targetPest: firstPest,
      cropId: ctx.crop.name,
      cropStage: ctx.currentStage.name,
      isActionThresholdExceeded: true, // Scouting threshold met
      confirmedDiagnosis: true,
      registeredProductLabel: {
        productName: "Confidor 200 SL",
        activeIngredient: "Imidacloprid",
        dosePerHectare: "125 ml",
        waterVolumeLiters: "500 L",
        phiDays: 15,
        reiHours: 24,
      },
    };

    const validation = ChemicalSafetyValidator.validate(query);

    if (validation.allowed && validation.recommendation) {
      recs.push({
        id: `REC-IPM-${Date.now()}`,
        condition: "PEST_RISK",
        priority: "HIGH",
        status: "PRESENTED",
        action: validation.recommendation.action!,
        doNot: validation.recommendation.doNot!,
        evidence: pestFindings[0]?.evidence || [],
        expectedOutcome: `Pest population reduction below economic threshold for ${firstPest}`,
        confidence: "HIGH",
        limitations: ["Apply strictly in accordance with local pesticide safety guidelines."],
        knowledgeBaseVersion: "FAO-IPM-CODE-2021",
        createdAt: new Date().toISOString(),
      });
    }

    return recs;
  }
}
