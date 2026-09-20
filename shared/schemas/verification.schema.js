"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVerificationPlan = validateVerificationPlan;
function validateVerificationPlan(plan) {
    const errors = [];
    if (!plan || typeof plan !== "object") {
        return { valid: false, errors: ["VerificationPlan must be a non-null object"] };
    }
    const p = plan;
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
