import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { Recommendation } from "../../../../shared/types/recommendation";

export interface FertilizerCalculationResult {
  hasSufficientEvidence: boolean;
  nutrientGap: {
    nDeficitPpm: number;
    pDeficitPpm: number;
    kDeficitPpm: number;
  };
  recommendation: Recommendation | null;
  reason: string;
}

export class FertilizerEngine {
  static analyze(ctx: AgriculturalContext): FertilizerCalculationResult {
    const m = ctx.telemetry.measurements || {};
    const crop = ctx.crop;
    const stage = ctx.currentStage;
    const fieldArea = ctx.field.areaHectares;

    const nMeas = m.nitrogen?.value;
    const pMeas = m.phosphorus?.value;
    const kMeas = m.potassium?.value;

    const hasN = nMeas !== null && nMeas !== undefined;
    const hasP = pMeas !== null && pMeas !== undefined;
    const hasK = kMeas !== null && kMeas !== undefined;

    if (!hasN && !hasP && !hasK) {
      return {
        hasSufficientEvidence: false,
        nutrientGap: { nDeficitPpm: 0, pDeficitPpm: 0, kDeficitPpm: 0 },
        recommendation: null,
        reason: "INSUFFICIENT EVIDENCE: NPK sensor measurements are unavailable. Soil test or sensor telemetry required before prescribing fertilizer rates.",
      };
    }

    const nTarget = crop.nutrients?.n?.optimal ?? 100;
    const pTarget = crop.nutrients?.p?.optimal ?? 30;
    const kTarget = crop.nutrients?.k?.optimal ?? 150;

    const nDeficit = hasN ? Math.max(0, nTarget - nMeas) : 0;
    const pDeficit = hasP ? Math.max(0, pTarget - pMeas) : 0;
    const kDeficit = hasK ? Math.max(0, kTarget - kMeas) : 0;

    const steps: string[] = [];
    const doNot: string[] = [];

    if (nDeficit > 10) {
      steps.push(`Apply Nitrogen top-dressing for ${crop.name} (${stage.name} stage). Deficit: ${nDeficit.toFixed(1)} ppm.`);
      doNot.push("Do not apply Nitrogen when soil is waterlogged or prior to heavy rain.");
    }

    if (pDeficit > 5) {
      steps.push(`Apply Phosphorus (SSP/DAP) during soil cultivation. Deficit: ${pDeficit.toFixed(1)} ppm.`);
    }

    if (kDeficit > 15) {
      steps.push(`Apply Muriate of Potash (MOP) to support grain/fruit filling. Deficit: ${kDeficit.toFixed(1)} ppm.`);
    }

    let rateText = "";
    if (fieldArea && fieldArea > 0) {
      const approxUreaKg = (nDeficit * fieldArea * 0.45).toFixed(1);
      rateText = `Prescribed Urea Application: ~${approxUreaKg} kg for ${fieldArea} Hectares based on ICAR agronomic stoichiometry.`;
    } else {
      rateText = "FIELD AREA MISSING: Per-hectare rate unavailable. Enter valid field acreage to compute total product weight.";
    }

    const ts = ctx.telemetry.timestamp || new Date().toISOString();

    const rec: Recommendation = {
      id: `REC-FERT-${Date.now()}`,
      condition: "NUTRIENT_DEFICIENCY" as any,
      priority: nDeficit > 25 ? "HIGH" : "MEDIUM",
      status: "PRESENTED",
      action: {
        title: `Nutrient Management Plan (${crop.name} — ${stage.name})`,
        steps: steps.length > 0 ? steps : ["Soil nutrient levels are balanced within optimal targets."],
        type: "NUTRIENT",
      },
      doNot: doNot.length > 0 ? doNot : ["Avoid excessive fertilizer applications beyond recommended split doses"],
      evidence: [
        { parameter: "nitrogen", value: nMeas ?? null, unit: "ppm", source: "RS485", timestamp: ts, quality: hasN ? "VALID" : "MISSING" },
        { parameter: "phosphorus", value: pMeas ?? null, unit: "ppm", source: "RS485", timestamp: ts, quality: hasP ? "VALID" : "MISSING" },
        { parameter: "potassium", value: kMeas ?? null, unit: "ppm", source: "RS485", timestamp: ts, quality: hasK ? "VALID" : "MISSING" },
      ],
      expectedOutcome: rateText,
      confidence: hasN && hasP && hasK ? "HIGH" : "MEDIUM",
      limitations: fieldArea ? [] : ["Field acreage missing; total dosage calculation limited"],
      knowledgeBaseVersion: "ICAR-PAU-2026.1",
      createdAt: new Date().toISOString(),
    };

    return {
      hasSufficientEvidence: true,
      nutrientGap: { nDeficitPpm: nDeficit, pDeficitPpm: pDeficit, kDeficitPpm: kDeficit },
      recommendation: rec,
      reason: "Nutrient gap calculated from measured NPK telemetry against crop agronomic targets.",
    };
  }
}
