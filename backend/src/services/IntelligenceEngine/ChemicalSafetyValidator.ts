import { Recommendation } from "../../../../shared/types/recommendation";

export interface ChemicalSafetyQuery {
  targetPest: string;
  cropId: string;
  cropStage: string;
  isActionThresholdExceeded: boolean;
  confirmedDiagnosis: boolean;
  registeredProductLabel?: {
    productName: string;
    activeIngredient: string;
    dosePerHectare: string;
    waterVolumeLiters: string;
    phiDays: number; // Pre-Harvest Interval
    reiHours: number; // Restricted Entry Interval
  };
}

export class ChemicalSafetyValidator {
  static validate(query: ChemicalSafetyQuery): { allowed: boolean; recommendation?: Partial<Recommendation>; blockReason?: string } {
    if (!query.confirmedDiagnosis) {
      return {
        allowed: false,
        blockReason: "CHEMICAL_RECOMMENDATION_BLOCKED: Pest/disease diagnosis has not been confirmed with physical evidence or scouting count.",
      };
    }

    if (!query.isActionThresholdExceeded) {
      return {
        allowed: false,
        blockReason: "CHEMICAL_RECOMMENDATION_BLOCKED: Pest population density is below the Economic Action Threshold. Non-chemical IPM measures required.",
      };
    }

    if (!query.registeredProductLabel) {
      return {
        allowed: false,
        blockReason: "CHEMICAL_RECOMMENDATION_BLOCKED: Approved local registration or chemical label product information unavailable for this crop and pest combination.",
      };
    }

    const label = query.registeredProductLabel;

    return {
      allowed: true,
      recommendation: {
        condition: "PEST_RISK",
        priority: "HIGH",
        action: {
          title: `Apply Registered Product: ${label.productName} (${label.activeIngredient})`,
          steps: [
            `Target: ${query.targetPest} on ${query.cropId}`,
            `Recommended Dose: ${label.dosePerHectare} mixed in ${label.waterVolumeLiters} Liters water per hectare.`,
            `Safety Window: Pre-Harvest Interval (PHI) = ${label.phiDays} days; Restricted Entry Interval (REI) = ${label.reiHours} hours.`,
            "Wear mandatory PPE (gloves, mask, goggles) during preparation and spraying.",
            "Do not spray during high winds (>15 km/h) or expected rain within 6 hours.",
          ],
          type: "PEST",
        },
        doNot: ["Exceed label dose", "Spray without protective gear", "Spray near water bodies"],
        knowledgeBaseVersion: "FAO-IPM-CODE-2021",
      },
    };
  }
}
