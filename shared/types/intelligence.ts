import { DataQuality, MeasurementState } from "../constants";

export interface DerivedTelemetrySignal {
  parameter: string;
  value: number | null;
  unit: string;
  state: MeasurementState;
  quality: DataQuality;
  trend: "RISING" | "FALLING" | "STABLE" | "UNAVAILABLE";
  changeRatePerHour: number | null;
  min24h: number | null;
  max24h: number | null;
  avg24h: number | null;
  stabilityIndex: "STABLE" | "MODERATE" | "VOLATILE" | "UNAVAILABLE";
}

export interface SoilIntelligence {
  moistureTrend: "RISING" | "FALLING" | "STABLE" | "UNAVAILABLE";
  dryingRatePerHour: number | null;
  wettingRatePerHour: number | null;
  timeSinceLastWetMinutes: number | null;
  timeSinceLastIrrigationMinutes: number | null;
  moistureDeficitPercent: number | null;
  moistureRecoveryScore: "EFFECTIVE" | "POOR" | "INSUFFICIENT_DATA" | "UNAVAILABLE";
  volatilityScore: "LOW" | "MODERATE" | "HIGH" | "UNAVAILABLE";
  conditionClassification: "OPTIMAL" | "DRY" | "WET" | "WATERLOGGED" | "UNAVAILABLE";
  currentVs24hAvgPercent: number | null;
}

export interface RainIntelligence {
  isRaining: boolean;
  rainDurationMinutes: number;
  timeSinceLastRainHours: number | null;
  rainToSoilResponse: "CONFIRMED_RECOVERY" | "NO_SOIL_RESPONSE" | "UNAVAILABLE";
  rainToTempResponse: "COOLING_EFFECT" | "NO_CHANGE" | "UNAVAILABLE";
  rainfallEffectiveness: "EFFECTIVE" | "INSUFFICIENT" | "EXCESSIVE" | "UNAVAILABLE";
}

export interface MultiSensorCorrelation {
  dryingStressPattern: boolean;
  confirmedRainPattern: boolean;
  unexpectedSoilResponsePattern: boolean;
  gasWeatherCorrelation: "CORRELATED" | "INDEPENDENT" | "UNAVAILABLE";
  summaryText: string;
  detectedCombinations: string[];
}

export interface SensorAnomaly {
  id: string;
  parameter: string;
  anomalyType: "FROZEN_SENSOR" | "IMPOSSIBLE_JUMP" | "SENSOR_DISAGREEMENT" | "MISSING_PARAMETER";
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  detectedAt: string;
}

export interface AgriculturalEvent {
  id: string;
  eventType:
    | "RAIN_STARTED"
    | "RAIN_STOPPED"
    | "SOIL_DRYING"
    | "SOIL_WETTING"
    | "RAPID_DRYING"
    | "RAPID_WETTING"
    | "HEAT_EVENT"
    | "HUMIDITY_EVENT"
    | "WATERLOGGING_RISK"
    | "DROUGHT_STRESS"
    | "GAS_ANOMALY"
    | "SENSOR_FAILURE"
    | "DEVICE_OFFLINE"
    | "DEVICE_RECONNECTED"
    | "IRRIGATION_RESPONSE"
    | "UNEXPECTED_SENSOR_RESPONSE";
  startedAt: string;
  endedAt?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  evidence: { parameter: string; value: any; unit?: string }[];
  confidence: number;
  status: "ACTIVE" | "RESOLVED";
}

export interface EnvironmentalStressIndex {
  stressLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | "UNAVAILABLE";
  heatStress: boolean;
  humidityStress: boolean;
  moistureStress: boolean;
  primaryEvidence: string[];
  missingEvidence: string[];
}

export interface PredictiveDepletion {
  moistureEstimate6h: number | null;
  moistureEstimate12h: number | null;
  moistureEstimate24h: number | null;
  isPredictionReliable: boolean;
  predictionReason: string;
}

export interface HistoricalComparisonPeriod {
  period: "6h" | "24h";
  tempChange: number | null;
  humidityChange: number | null;
  moistureChange: number | null;
  significantChanges: string[];
}

export interface DigitalTwinNode {
  category: "Device" | "Environment" | "Soil" | "Weather" | "Crop" | "Intelligence";
  name: string;
  status: "NORMAL" | "WARNING" | "CRITICAL" | "UNAVAILABLE";
  value: string;
  details?: string;
}

export interface DigitalTwinState {
  deviceId: string;
  fieldId: string;
  timestamp: string;
  nodes: DigitalTwinNode[];
  overallRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
}

export interface IoTIntelligenceReport {
  deviceId: string;
  fieldId: string;
  timestamp: string;
  sensorAvailability: Record<string, { available: boolean; state: MeasurementState; quality: DataQuality; value: number | null; unit: string }>;
  derivedSignals: Record<string, DerivedTelemetrySignal>;
  soilIntelligence: SoilIntelligence;
  rainIntelligence: RainIntelligence;
  multiSensorCorrelation: MultiSensorCorrelation;
  anomalies: SensorAnomaly[];
  activeEvents: AgriculturalEvent[];
  environmentalStress: EnvironmentalStressIndex;
  predictions: PredictiveDepletion;
  historicalComparison: HistoricalComparisonPeriod;
  digitalTwin: DigitalTwinState;
  generatedAt: string;
}

export interface WhyAnalysisResult {
  title: string;
  summary: string;
  primaryDriver: string;
  evidenceChain: { step: number; parameter: string; observation: string; impact: string }[];
  missingDataNotes: string[];
  recommendedMonitoring: string[];
}

export interface WhatChangedResult {
  period: string;
  comparedAt: string;
  changes: { parameter: string; previousValue: string; currentValue: string; changeText: string; direction: "INCREASED" | "DECREASED" | "STABLE" }[];
  summary: string;
  impactAssessment: string;
}

export interface WhatIfSimulationResult {
  scenarioName: string;
  simulatedInputs: Record<string, any>;
  predictedOutcome: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  isSimulation: true;
  evidence: string[];
  warnings: string[];
}

export interface FieldReplayPoint {
  timestamp: string;
  temp: number | null;
  humidity: number | null;
  moisture: number | null;
  rain: boolean;
  mqRaw: number | null;
  eventSummary?: string;
}
