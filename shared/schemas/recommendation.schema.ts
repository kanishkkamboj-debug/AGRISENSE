import { Recommendation } from "../types/recommendation";

export function validateRecommendation(rec: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!rec || typeof rec !== "object") {
    return { valid: false, errors: ["Recommendation must be a non-null object"] };
  }

  const r = rec as Partial<Recommendation>;

  if (!r.id) errors.push("Missing recommendation id");
  if (!r.condition) errors.push("Missing recommendation condition");
  if (!r.priority) errors.push("Missing recommendation priority");
  if (!r.status) errors.push("Missing recommendation status");
  if (!r.action || !r.action.title || !Array.isArray(r.action.steps)) {
    errors.push("Missing or invalid action in Recommendation");
  }
  if (!Array.isArray(r.doNot)) errors.push("Recommendation.doNot must be an array");
  if (!Array.isArray(r.evidence)) errors.push("Recommendation.evidence must be an array");
  if (!r.knowledgeBaseVersion) errors.push("Missing knowledgeBaseVersion");

  return {
    valid: errors.length === 0,
    errors,
  };
}
