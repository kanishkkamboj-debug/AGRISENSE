import { VerificationPlan } from "../types/recommendation";

export function validateVerificationPlan(plan: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!plan || typeof plan !== "object") {
    return { valid: false, errors: ["VerificationPlan must be a non-null object"] };
  }

  const p = plan as Partial<VerificationPlan>;

  if (!Array.isArray(p.parameters) || p.parameters.length === 0) {
    errors.push("VerificationPlan must specify target parameters");
  }

  if (!p.targetDirection || !["INCREASE", "DECREASE", "STABILIZE"].includes(p.targetDirection)) {
    errors.push("Invalid targetDirection in VerificationPlan");
  }

  if (typeof p.windowMinutes !== "number" || p.windowMinutes <= 0) {
    errors.push("windowMinutes must be a positive number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
