import { Recommendation, VerificationPlan } from "../../../../shared/types/recommendation";
import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { logger } from "../../utils/logger";

export class VerificationService {
  static verifyOutcome(
    recommendation: Recommendation,
    initialTelemetry: TelemetryRecord,
    currentTelemetry: TelemetryRecord
  ): "IMPROVED" | "PARTIAL" | "NOT_IMPROVED" {
    const plan: VerificationPlan | undefined = recommendation.verification;

    if (!plan || plan.parameters.length === 0) {
      return "IMPROVED";
    }

    const param = plan.parameters[0];
    const initialVal = initialTelemetry.measurements[param as keyof typeof initialTelemetry.measurements]?.value;
    const currentVal = currentTelemetry.measurements[param as keyof typeof currentTelemetry.measurements]?.value;

    if (initialVal === null || initialVal === undefined || currentVal === null || currentVal === undefined) {
      logger.info(`VERIFICATION_INSUFFICIENT_DATA recId=${recommendation.id} parameter=${param}`);
      return "PARTIAL";
    }

    if (plan.targetDirection === "DECREASE") {
      if (currentVal < initialVal) {
        logger.info(`VERIFICATION_SUCCESS recId=${recommendation.id} ${initialVal} -> ${currentVal} (DECREASE)`);
        return "IMPROVED";
      } else {
        logger.warn(`VERIFICATION_FAILED recId=${recommendation.id} ${initialVal} -> ${currentVal} (NO DECREASE)`);
        return "NOT_IMPROVED";
      }
    }

    if (plan.targetDirection === "INCREASE") {
      if (currentVal > initialVal) {
        logger.info(`VERIFICATION_SUCCESS recId=${recommendation.id} ${initialVal} -> ${currentVal} (INCREASE)`);
        return "IMPROVED";
      } else {
        logger.warn(`VERIFICATION_FAILED recId=${recommendation.id} ${initialVal} -> ${currentVal} (NO INCREASE)`);
        return "NOT_IMPROVED";
      }
    }

    return "IMPROVED";
  }
}
