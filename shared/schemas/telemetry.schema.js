"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTelemetryPayload = validateTelemetryPayload;
function validateTelemetryPayload(payload) {
    const errors = [];
    if (!payload || typeof payload !== "object") {
        return { valid: false, errors: ["Payload must be a non-null object"] };
    }
    const req = payload;
    if (!req.deviceId || typeof req.deviceId !== "string") {
        errors.push("Missing or invalid deviceId");
    }
    if (!req.deviceToken || typeof req.deviceToken !== "string") {
        errors.push("Missing or invalid deviceToken");
    }
    if (!req.timestamp || typeof req.timestamp !== "string" || isNaN(Date.parse(req.timestamp))) {
        errors.push("Missing or invalid ISO timestamp");
    }
    if (!req.measurements || typeof req.measurements !== "object") {
        errors.push("Missing or invalid measurements object");
    }
    else {
        for (const [key, val] of Object.entries(req.measurements)) {
            if (typeof val !== "object" || val === null) {
                errors.push(`Measurement entry for '${key}' must be an object`);
            }
            else {
                if (val.value !== null && typeof val.value !== "number") {
                    errors.push(`Measurement '${key}.value' must be a number or null`);
                }
                if (!val.unit || typeof val.unit !== "string") {
                    errors.push(`Measurement '${key}.unit' must be a string`);
                }
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
