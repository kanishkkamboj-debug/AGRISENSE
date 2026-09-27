import { TelemetryIngestionRequest } from "../types/api";

export const PARAM_RANGES: Record<string, { min: number; max: number }> = {
  soil_moisture: { min: 0, max: 100 },
  soil_humidity: { min: 0, max: 100 },
  ambient_humidity: { min: 0, max: 100 },
  soil_ph: { min: 0, max: 14 },
  soil_temperature: { min: -20, max: 80 },
  ambient_temperature: { min: -20, max: 80 },
  nitrogen: { min: 0, max: 2000 },
  phosphorus: { min: 0, max: 2000 },
  potassium: { min: 0, max: 2000 },
  rainfall: { min: 0, max: 500 },
  light_intensity: { min: 0, max: 200000 },
};

export function isMeasurementValidRange(paramKey: string, val: number): boolean {
  const range = PARAM_RANGES[paramKey];
  if (!range) return true;
  return val >= range.min && val <= range.max;
}

export function validateTelemetryPayload(payload: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: ["Payload must be a non-null object"] };
  }

  const req = payload as Partial<TelemetryIngestionRequest>;

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
  } else {
    for (const [key, val] of Object.entries(req.measurements)) {
      if (typeof val !== "object" || val === null) {
        errors.push(`Measurement entry for '${key}' must be an object`);
      } else {
        const mObj = val as any;
        if (mObj.value !== null && typeof mObj.value !== "number") {
          errors.push(`Measurement '${key}.value' must be a number or null`);
        }
        if (!mObj.unit || typeof mObj.unit !== "string") {
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
