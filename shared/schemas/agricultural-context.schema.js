"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAgriculturalContext = validateAgriculturalContext;
function validateAgriculturalContext(ctx) {
    const errors = [];
    if (!ctx || typeof ctx !== "object") {
        return { valid: false, errors: ["Context must be a non-null object"] };
    }
    const c = ctx;
    if (!c.field || !c.field.fieldId) {
        errors.push("Missing or invalid field in AgriculturalContext");
    }
    if (!c.crop || !c.crop.id || !c.crop.name) {
        errors.push("Missing or invalid crop in AgriculturalContext");
    }
    if (!c.currentStage || !c.currentStage.name) {
        errors.push("Missing or invalid currentStage in AgriculturalContext");
    }
    if (!c.telemetry || !c.telemetry.deviceId || !c.telemetry.measurements) {
        errors.push("Missing or invalid telemetry in AgriculturalContext");
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
