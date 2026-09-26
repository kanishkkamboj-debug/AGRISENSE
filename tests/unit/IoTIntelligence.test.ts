import { TrendEngine } from "../../backend/src/services/IoTIntelligence/TrendEngine";
import { SoilIntelligenceEngine } from "../../backend/src/services/IoTIntelligence/SoilIntelligenceEngine";
import { RainIntelligenceEngine } from "../../backend/src/services/IoTIntelligence/RainIntelligenceEngine";
import { CorrelationEngine } from "../../backend/src/services/IoTIntelligence/CorrelationEngine";
import { AnomalyEngine } from "../../backend/src/services/IoTIntelligence/AnomalyEngine";
import { PredictiveLayer } from "../../backend/src/services/IoTIntelligence/PredictiveLayer";
import { StressEngine } from "../../backend/src/services/IoTIntelligence/StressEngine";
import { IoTIntelligenceEngine } from "../../backend/src/services/IoTIntelligence/IoTIntelligenceEngine";
import { MockDataService } from "../../backend/src/services/MockDataService";
import { TelemetryRecord } from "../../shared/types/telemetry";

describe("AgriSense Intelligence v3 Sub-Engines", () => {
  const mockContext = MockDataService.getMockContext("normal");
  const now = Date.now();

  const mockHistory: TelemetryRecord[] = Array.from({ length: 12 }, (_, i) => ({
    id: `HIST-${i}`,
    deviceId: "AGRISENSE-ESP8266-001",
    fieldId: "FIELD-PUNJAB-01",
    timestamp: new Date(now - (12 - i) * 600000).toISOString(),
    measurements: {
      soil_moisture: { value: 50 - i * 0.8, unit: "%", state: "MEASURED", quality: "VALID" },
      ambient_temperature: { value: 25 + i * 0.5, unit: "°C", state: "MEASURED", quality: "VALID" },
      ambient_humidity: { value: 60 - i * 0.5, unit: "%", state: "MEASURED", quality: "VALID" },
      rainfall: { value: 0, unit: "mm", state: "MEASURED", quality: "VALID" },
      nitrogen: { value: null, unit: "mg/kg", state: "UNAVAILABLE", quality: "MISSING" },
    },
    qualitySummary: "VALID",
    freshnessState: "LIVE",
    dataMode: "REAL",
  }));

  test("TrendEngine calculates min, max, avg and rate of change correctly", () => {
    const trend = TrendEngine.analyzeParameter("ambient_temperature", mockContext.telemetry, mockHistory);
    expect(trend).toBeDefined();
    expect(trend.value).toBe(26.5);
    expect(trend.min24h).toBeLessThanOrEqual(26.5);
    expect(trend.max24h).toBeGreaterThanOrEqual(25);
    expect(typeof trend.changeRatePerHour).toBe("number");
  });

  test("TrendEngine handles UNAVAILABLE parameters cleanly", () => {
    const trend = TrendEngine.analyzeParameter("nitrogen", mockContext.telemetry, mockHistory);
    expect(trend.state).toBe("UNAVAILABLE");
    expect(trend.trend).toBe("UNAVAILABLE");
    expect(trend.value).toBeNull();
  });

  test("SoilIntelligenceEngine evaluates drying rate and moisture deficit", () => {
    const soilRes = SoilIntelligenceEngine.analyze(mockContext, mockHistory);
    expect(soilRes).toBeDefined();
    expect(soilRes.conditionClassification).toBe("OPTIMAL");
    expect(typeof soilRes.moistureDeficitPercent).toBe("number");
  });

  test("RainIntelligenceEngine detects rainfall inactivity and response", () => {
    const rainRes = RainIntelligenceEngine.analyze(mockContext, mockHistory);
    expect(rainRes.isRaining).toBe(false);
    expect(rainRes.rainToSoilResponse).toBe("NO_SOIL_RESPONSE");
  });

  test("CorrelationEngine identifies environmental stress patterns", () => {
    const corrRes = CorrelationEngine.analyze(mockContext, mockHistory);
    expect(corrRes).toBeDefined();
    expect(Array.isArray(corrRes.detectedCombinations)).toBe(true);
  });

  test("AnomalyEngine detects frozen sensor when values remain constant", () => {
    const frozenHistory: TelemetryRecord[] = Array.from({ length: 6 }, (_, i) => ({
      id: `FROZEN-${i}`,
      deviceId: "AGRISENSE-ESP8266-001",
      fieldId: "FIELD-PUNJAB-01",
      timestamp: new Date(now - (6 - i) * 60000).toISOString(),
      measurements: {
        soil_moisture: { value: 42.7, unit: "%", state: "MEASURED", quality: "VALID" },
      },
      qualitySummary: "VALID",
      freshnessState: "LIVE",
      dataMode: "REAL",
    }));

    const anomalies = AnomalyEngine.analyze(mockContext, frozenHistory);
    expect(anomalies.some((a) => a.anomalyType === "FROZEN_SENSOR")).toBe(true);
  });

  test("PredictiveLayer enforces 10+ record minimum before enabling prediction", () => {
    const shortHistory = mockHistory.slice(0, 5);
    const predShort = PredictiveLayer.predictDepletion(mockContext, shortHistory);
    expect(predShort.isPredictionReliable).toBe(false);
    expect(predShort.predictionReason).toContain("Insufficient historical telemetry");

    const predFull = PredictiveLayer.predictDepletion(mockContext, mockHistory);
    expect(predFull.isPredictionReliable).toBe(true);
    expect(typeof predFull.moistureEstimate6h).toBe("number");
  });

  test("StressEngine evaluates environmental stress index", () => {
    const stress = StressEngine.evaluateStress(mockContext);
    expect(stress.stressLevel).toBeDefined();
    expect(Array.isArray(stress.primaryEvidence)).toBe(true);
  });

  test("IoTIntelligenceEngine generates unified report and why analysis", async () => {
    const report = await IoTIntelligenceEngine.generateReport(mockContext, mockHistory);
    expect(report.deviceId).toBe("PI5-FIELD-001");
    expect(report.digitalTwin.nodes.length).toBeGreaterThan(0);

    const why = IoTIntelligenceEngine.getWhyIsMyFieldLikeThis(mockContext, report);
    expect(why.title).toBeDefined();
    expect(why.evidenceChain.length).toBeGreaterThan(0);

    const simulation = IoTIntelligenceEngine.getWhatIfSimulation(mockContext, "IRRIGATE_20MM");
    expect(simulation.isSimulation).toBe(true);
    expect(simulation.predictedOutcome).toContain("20mm irrigation");
  });
});
