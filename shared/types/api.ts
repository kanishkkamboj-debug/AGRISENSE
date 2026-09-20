import { TelemetryRecord } from "./telemetry";
import { AnalysisResult, Recommendation } from "./recommendation";
import { DeviceHealth } from "./device";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
  timestamp: string;
  dataMode?: "REAL" | "MOCK";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TelemetryIngestionRequest {
  deviceId: string;
  deviceToken: string;
  timestamp: string;
  measurements: Record<string, { value: number | null; unit: string; quality?: string }>;
  health?: Partial<DeviceHealth>;
}

export interface TelemetryIngestionResponse {
  success: boolean;
  ackId: string;
  synchronizedCount: number;
  message?: string;
}

export interface FarmerActionPlan {
  urgent: Recommendation[];
  attention: Recommendation[];
  routine: Recommendation[];
  next24h: Recommendation[];
  next3d: Recommendation[];
  next7d: Recommendation[];
}

export interface AdvisoryResponse {
  analysisResult: AnalysisResult;
  naturalLanguageExplanation: string;
  farmerActionPlan: FarmerActionPlan;
  generatedAt: string;
  isAiAvailable: boolean;
}
