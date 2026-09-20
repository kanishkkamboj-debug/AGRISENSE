import { AnalysisResult } from "../types/recommendation";

export function validateAnalysisResult(result: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!result || typeof result !== "object") {
    return { valid: false, errors: ["AnalysisResult must be a non-null object"] };
  }

  const r = result as Partial<AnalysisResult>;

  if (!r.condition || !r.condition.code || !r.condition.severity) {
    errors.push("Missing or invalid condition in AnalysisResult");
  }

  if (!r.diagnosis || !Array.isArray(r.diagnosis.evidence)) {
    errors.push("Missing or invalid diagnosis evidence in AnalysisResult");
  }

  if (!Array.isArray(r.recommendation)) {
    errors.push("AnalysisResult.recommendation must be an array");
  }

  if (!r.confidence) {
    errors.push("Missing confidence in AnalysisResult");
  }

  if (!r.knowledgeBaseVersion) {
    errors.push("Missing knowledgeBaseVersion in AnalysisResult");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
