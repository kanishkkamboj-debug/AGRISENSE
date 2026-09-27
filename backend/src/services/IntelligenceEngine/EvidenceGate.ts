import { AgriculturalContext } from "../../../../shared/types/agriculture";

export interface EvidenceValidationResult {
  status: "SUFFICIENT" | "PARTIAL" | "INSUFFICIENT_EVIDENCE";
  availableParameters: string[];
  missingParameters: string[];
  supportedConditions: string[];
  unsupportedConditions: string[];
  reason: string;
}

export class EvidenceGate {
  static validate(ctx: AgriculturalContext, targetCondition?: string): EvidenceValidationResult {
    const m = ctx.telemetry.measurements || {};
    const isOffline = ctx.telemetry.freshnessState === "OFFLINE";

    const available: string[] = [];
    const missing: string[] = [];

    const checkParam = (paramKey: string, name: string) => {
      const val = (m as any)[paramKey]?.value;
      if (!isOffline && val !== null && val !== undefined) {
        available.push(name);
      } else {
        missing.push(name);
      }
    };

    checkParam("soil_moisture", "Soil Moisture");
    checkParam("soil_temperature", "Soil Temperature");
    checkParam("soil_ph", "Soil pH");
    checkParam("nitrogen", "Nitrogen (N)");
    checkParam("phosphorus", "Phosphorus (P)");
    checkParam("potassium", "Potassium (K)");
    checkParam("ambient_temperature", "Ambient Temperature");
    checkParam("ambient_humidity", "Ambient Humidity");
    checkParam("rainfall", "Rainfall");

    const supportedConditions: string[] = [];
    const unsupportedConditions: string[] = [];

    // Waterlogging / Flood requires soil_moisture
    if (available.includes("Soil Moisture")) {
      supportedConditions.push("MOISTURE_STRESS");
      if (available.includes("Rainfall") || (ctx.history?.saturationDurationHours && ctx.history.saturationDurationHours > 0)) {
        supportedConditions.push("WATERLOGGING_RISK");
        supportedConditions.push("FLOOD_RISK");
      } else {
        unsupportedConditions.push("WATERLOGGING_RISK (Missing Rainfall/Saturation Evidence)");
      }
    } else {
      unsupportedConditions.push("MOISTURE_STRESS (Missing Soil Moisture)");
      unsupportedConditions.push("WATERLOGGING_RISK (Missing Soil Moisture)");
    }

    // Nutrient Deficiency requires N/P/K
    if (available.includes("Nitrogen (N)") || available.includes("Phosphorus (P)") || available.includes("Potassium (K)")) {
      supportedConditions.push("NUTRIENT_DEFICIENCY");
    } else {
      unsupportedConditions.push("NUTRIENT_DEFICIENCY (Missing NPK Sensor Measurements)");
    }

    // Disease / Fungal Risk requires Temp + Humidity
    if ((available.includes("Soil Temperature") || available.includes("Ambient Temperature")) && available.includes("Ambient Humidity")) {
      supportedConditions.push("FUNGAL_RISK");
      supportedConditions.push("PEST_RISK");
    } else {
      unsupportedConditions.push("FUNGAL_RISK (Missing Temp/Humidity Measurements)");
    }

    let status: "SUFFICIENT" | "PARTIAL" | "INSUFFICIENT_EVIDENCE" = "SUFFICIENT";
    if (isOffline || available.length === 0) {
      status = "INSUFFICIENT_EVIDENCE";
    } else if (missing.length > 2) {
      status = "PARTIAL";
    }

    const reason = isOffline
      ? "IoT Hardware device is OFFLINE. Live telemetry evidence is unavailable."
      : status === "INSUFFICIENT_EVIDENCE"
      ? "No valid live telemetry measurements available."
      : status === "PARTIAL"
      ? `Partial telemetry evidence available (${available.length} parameters measured, ${missing.length} missing).`
      : "Full telemetry evidence available for biophysical analysis.";

    return {
      status,
      availableParameters: available,
      missingParameters: missing,
      supportedConditions,
      unsupportedConditions,
      reason,
    };
  }
}
