import { MeasurementState, DataQuality, FreshnessState, SensorParameter } from "../constants";
export interface MeasurementValue {
    value: number | null;
    unit: string;
    state: MeasurementState;
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
