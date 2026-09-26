import { MeasurementState, DataQuality, FreshnessState, SensorParameter, DataProvenance } from "../constants";

export interface MeasurementValue {
  value: number | null;
  unit: string;
  state: MeasurementState;
  provenance?: DataProvenance;
  quality: DataQuality;
  lastUpdated?: string;
  source?: string;
}

export type MeasurementsMap = Partial<Record<SensorParameter, MeasurementValue>>;

export interface TelemetryRecord {
  id?: string;
  deviceId: string;
  fieldId: string;
  timestamp: string;
  measurements: MeasurementsMap;
  qualitySummary: DataQuality;
  freshnessState: FreshnessState;
  dataMode: "REAL" | "MOCK";
  syncStatus?: "PENDING" | "SYNCHRONIZED";
}

export interface SensorCapability {
  parameter: SensorParameter;
  available: boolean;
  measurementType: MeasurementState;
  unit: string;
  quality: DataQuality;
  lastUpdated?: string;
}
