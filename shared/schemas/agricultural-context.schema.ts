import { AgriculturalContext } from "../types/agriculture";

export function validateAgriculturalContext(ctx: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!ctx || typeof ctx !== "object") {
    return { valid: false, errors: ["Context must be a non-null object"] };
  }

  const c = ctx as Partial<AgriculturalContext>;

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
