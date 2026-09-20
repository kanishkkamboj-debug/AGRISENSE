"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAnalysisResult = validateAnalysisResult;
function validateAnalysisResult(result) {
    const errors = [];
    if (!result || typeof result !== "object") {
        return { valid: false, errors: ["AnalysisResult must be a non-null object"] };
    }
    const r = result;
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
