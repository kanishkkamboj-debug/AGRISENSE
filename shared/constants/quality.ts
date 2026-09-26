export type MeasurementState =
  | "MEASURED"
  | "CALCULATED"
  | "ESTIMATED"
  | "UNAVAILABLE";

export type DataQuality =
  | "VALID"
  | "MISSING"
  | "STALE"
  | "OUT_OF_RANGE"
  | "SENSOR_ERROR"
  | "CALIBRATION_REQUIRED"
  | "DUPLICATE"
  | "ESTIMATED";

export type FreshnessState =
  | "LIVE"
  | "RECENT"
  | "STALE"
  | "OFFLINE"
  | "NO_DATA";

export type ConfidenceLevel =
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INSUFFICIENT_DATA";

export const MEASUREMENT_STATES: Record<MeasurementState, MeasurementState> = {
  MEASURED: "MEASURED",
  CALCULATED: "CALCULATED",
  ESTIMATED: "ESTIMATED",
  UNAVAILABLE: "UNAVAILABLE",
};

export const DATA_QUALITIES: Record<DataQuality, DataQuality> = {
  VALID: "VALID",
  MISSING: "MISSING",
  STALE: "STALE",
  OUT_OF_RANGE: "OUT_OF_RANGE",
  SENSOR_ERROR: "SENSOR_ERROR",
  CALIBRATION_REQUIRED: "CALIBRATION_REQUIRED",
  DUPLICATE: "DUPLICATE",
  ESTIMATED: "ESTIMATED",
};

export const FRESHNESS_STATES: Record<FreshnessState, FreshnessState> = {
  LIVE: "LIVE",
  RECENT: "RECENT",
  STALE: "STALE",
  OFFLINE: "OFFLINE",
  NO_DATA: "NO_DATA",
};

export type DataProvenance =
  | "MEASURED"
  | "DERIVED"
  | "ESTIMATED"
  | "EXTERNAL"
  | "KNOWLEDGE_BASE"
  | "HISTORICAL"
  | "UNAVAILABLE";

export const DATA_PROVENANCES: Record<DataProvenance, DataProvenance> = {
  MEASURED: "MEASURED",
  DERIVED: "DERIVED",
  ESTIMATED: "ESTIMATED",
  EXTERNAL: "EXTERNAL",
  KNOWLEDGE_BASE: "KNOWLEDGE_BASE",
  HISTORICAL: "HISTORICAL",
  UNAVAILABLE: "UNAVAILABLE",
};

export const CONFIDENCE_LEVELS: Record<ConfidenceLevel, ConfidenceLevel> = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  INSUFFICIENT_DATA: "INSUFFICIENT_DATA",
};

