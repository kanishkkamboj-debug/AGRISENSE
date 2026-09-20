import { VerificationService } from "../../backend/src/services/VerificationService";
import { Recommendation } from "../../shared/types/recommendation";
import { TelemetryRecord } from "../../shared/types/telemetry";

describe("VerificationService Unit Tests", () => {
  const sampleRec: Recommendation = {
    id: "REC-TEST-01",
    condition: "WATERLOGGING_RISK",
    priority: "URGENT",
    status: "PRESENTED",
    action: { title: "Drain Field", steps: ["Open channel"] },
    doNot: [],
    evidence: [],
    confidence: "HIGH",
    limitations: [],
    knowledgeBaseVersion: "1.0.0",
    createdAt: new Date().toISOString(),
    verification: {
      parameters: ["soil_moisture"],
      targetDirection: "DECREASE",
      windowMinutes: 360,
    },
  };

  const initialTelemetry: TelemetryRecord = {
    deviceId: "PI5-FIELD-001",
    fieldId: "FIELD-01",
    timestamp: "2026-09-20T10:00:00Z",
    measurements: { soil_moisture: { value: 89.0, unit: "%", state: "MEASURED", quality: "VALID" } },
    qualitySummary: "VALID",
    freshnessState: "LIVE",
    dataMode: "REAL",
  };

  test("Evaluates IMPROVED when target parameter moves in target direction", () => {
    const afterTelemetry: TelemetryRecord = {
      ...initialTelemetry,
      timestamp: "2026-09-20T14:00:00Z",
      measurements: { soil_moisture: { value: 65.0, unit: "%", state: "MEASURED", quality: "VALID" } },
    };

    const status = VerificationService.verifyOutcome(sampleRec, initialTelemetry, afterTelemetry);
    expect(status).toBe("IMPROVED");
  });

  test("Evaluates NOT_IMPROVED when target parameter fails to decrease", () => {
    const afterTelemetry: TelemetryRecord = {
      ...initialTelemetry,
      timestamp: "2026-09-20T14:00:00Z",
      measurements: { soil_moisture: { value: 91.0, unit: "%", state: "MEASURED", quality: "VALID" } },
    };

    const status = VerificationService.verifyOutcome(sampleRec, initialTelemetry, afterTelemetry);
    expect(status).toBe("NOT_IMPROVED");
  });
});
