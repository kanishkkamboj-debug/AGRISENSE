"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAgronomicRule = validateAgronomicRule;
function validateAgronomicRule(rule) {
    const errors = [];
    if (!rule || typeof rule !== "object") {
        return { valid: false, errors: ["AgronomicRule must be a non-null object"] };
    }
    const r = rule;
    if (!r.id)
        errors.push("Missing rule id");
    if (!r.version)
        errors.push("Missing rule version");
    if (!r.condition)
        errors.push("Missing rule condition");
    if (!r.source || !r.source.organization || !r.source.title) {
        errors.push("Missing or incomplete source attribution in AgronomicRule");
    }
    if (!r.status || !["ACTIVE", "DRAFT", "DEPRECATED"].includes(r.status)) {
        errors.push("Invalid status in AgronomicRule");
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
