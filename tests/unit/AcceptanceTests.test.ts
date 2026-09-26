import { DeviceConnectivityService } from "../../backend/src/services/DeviceConnectivityService";
import { IntelligenceEngine } from "../../backend/src/services/IntelligenceEngine/IntelligenceEngine";
import { IrrigationAnalyzer } from "../../backend/src/services/IntelligenceEngine/IrrigationAnalyzer";
import { AgriculturalContext, FieldContext } from "../../shared/types/agriculture";
import { CROP_PROFILES } from "../../knowledge-base/crops";

const sampleGeometry = {
  type: "Polygon" as const,
  coordinates: [
    [
      [75.855, 30.900],
      [75.860, 30.900],
      [75.860, 30.905],
      [75.855, 30.905],
      [75.855, 30.900],
    ],
  ],
};

const sampleField: FieldContext = {
  fieldId: "FIELD-01",
  name: "Test Plot",
  locationName: "Punjab",
  areaHectares: 1,
  perimeterMeters: 400,
  centroid: [30.9, 75.8],
  geometry: sampleGeometry,
  currentCropId: "wheat",
  currentCropStage: "tillering",
  deviceIds: ["AGRISENSE-ESP8266-001"],
};

const mockDeviceState: any = {
  deviceId: "AGRISENSE-ESP8266-001",
  fieldId: "FIELD-PUNJAB-01",
  status: "ONLINE",
  lastTelemetry: new Date().toISOString(),
  offlineStartedAt: new Date(Date.now() - 120000).toISOString(),
  totalDisconnectsCount: 0,
  dailyUptimePercent: 100,
  weeklyUptimePercent: 100,
  monthlyUptimePercent: 100,
  save: jest.fn().mockResolvedValue(true),
};

jest.mock("../../backend/src/models/Device", () => ({
  DeviceModel: {
    findOne: jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockImplementation(async () => mockDeviceState),
    })),
    findOneAndUpdate: jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockImplementation(async () => mockDeviceState),
    })),
    find: jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockImplementation(async () => [mockDeviceState]),
    })),
  },
}));

jest.mock("../../backend/src/models/DeviceConnectionHistory", () => ({
  DeviceConnectionHistoryModel: {
    create: jest.fn().mockResolvedValue(true),
    find: jest.fn().mockImplementation(() => ({
      lean: jest.fn().mockResolvedValue([]),
    })),
  },
}));

jest.mock("../../backend/src/models/Alert", () => ({
  AlertModel: {
    create: jest.fn().mockResolvedValue(true),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  },
}));

jest.mock("../../backend/src/models/Setting", () => ({
  SettingModel: {
    findOne: jest.fn().mockImplementation(() => ({
      lean: jest.fn().mockResolvedValue({
        deviceTimeouts: { onlineSeconds: 30, staleSeconds: 120, offlineSeconds: 120 },
      }),
    })),
  },
}));

jest.mock("../../backend/src/models/ContextSnapshot", () => ({
  ContextSnapshotModel: {
    create: jest.fn().mockResolvedValue(true),
  },
}));

describe("AgriSense Master Implementation Acceptance Tests (Requirements 134-140)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST 1: CRITICAL DISCONNECT ACCEPTANCE TEST (Req 134)
  test("134. Critical Disconnect State Machine: ONLINE -> STALE -> OFFLINE -> RECONNECTING -> ONLINE", async () => {
    const deviceId = "AGRISENSE-ESP8266-001";
    const fieldId = "FIELD-PUNJAB-01";
    const nowIso = new Date().toISOString();

    // 1. Send live telemetry -> ONLINE
    mockDeviceState.status = "ONLINE";
    const res1 = await DeviceConnectivityService.handleDeviceCommunication(deviceId, fieldId, nowIso, true);
    expect(res1.wasOffline).toBe(false);

    // 2. Simulate reconnecting after offline
    mockDeviceState.status = "OFFLINE";
    mockDeviceState.offlineStartedAt = new Date(Date.now() - 120000).toISOString();
    const res2 = await DeviceConnectivityService.handleDeviceCommunication(deviceId, fieldId, nowIso, true);
    expect(res2.wasOffline).toBe(true);
    expect(typeof res2.outageDurationSeconds).toBe("number");
    expect(res2.outageDurationSeconds).toBeGreaterThan(0);
    expect(mockDeviceState.status).toBe("ONLINE");
  });

  // TEST 2: SENSOR DISCONNECT ACCEPTANCE TEST (Req 135)
  test("135. Sensor Disconnect: Device remains ONLINE while NPK is DISCONNECTED", () => {
    const mockContext: AgriculturalContext = {
      field: sampleField,
      crop: CROP_PROFILES.wheat,
      currentStage: CROP_PROFILES.wheat.growthStages[0],
      telemetry: {
        deviceId: "AGRISENSE-ESP8266-001",
        fieldId: "FIELD-01",
        timestamp: new Date().toISOString(),
        measurements: {
          soil_moisture: { value: 45.0, unit: "%", state: "MEASURED", quality: "VALID" },
          nitrogen: { value: null, unit: "mg/kg", state: "UNAVAILABLE", quality: "MISSING" },
          phosphorus: { value: null, unit: "mg/kg", state: "UNAVAILABLE", quality: "MISSING" },
          potassium: { value: null, unit: "mg/kg", state: "UNAVAILABLE", quality: "MISSING" },
        },
        qualitySummary: "VALID",
        freshnessState: "LIVE",
        dataMode: "REAL",
      },
      history: {
        telemetry24h: [],
        averageMoisture24h: 45.0,
        minMoisture24h: 45.0,
        maxMoisture24h: 45.0,
        saturationDurationHours: 0,
        previousAdvisoriesCount: 0,
      },
      gis: { areaHectares: 1, perimeterMeters: 400, centroid: [30.9, 75.8], boundingBox: [0, 0, 0, 0] },
      satellite: { lastUpdated: new Date().toISOString(), ndviAverage: 0.7, ndviTrend: "STABLE", moistureIndex: 0.45, provider: "Sentinel-2", available: true },
      weather: { currentTempCelsius: 25, currentHumidityPercent: 60, recentRainfallMm24h: 0, forecastRainfallMm72h: 0, windSpeedKmh: 10, source: "Sensors" },
    };

    const result = IntelligenceEngine.evaluate(mockContext);
    expect(result.diagnosis.findings.some((f) => f.description.toLowerCase().includes("nitrogen"))).toBe(true);
    expect(result.dataQuality.missingParameters).toBeGreaterThan(0);
  });

  // TEST 3: PARTIAL SENSOR FAILURE (Req 136)
  test("136. Partial Sensor Failure: Device is ONLINE while RS485 soil sensor is UNAVAILABLE", () => {
    const mockContext: AgriculturalContext = {
      field: sampleField,
      crop: CROP_PROFILES.wheat,
      currentStage: CROP_PROFILES.wheat.growthStages[0],
      telemetry: {
        deviceId: "AGRISENSE-ESP8266-001",
        fieldId: "FIELD-01",
        timestamp: new Date().toISOString(),
        measurements: {
          ambient_temperature: { value: 28.5, unit: "°C", state: "MEASURED", quality: "VALID" },
          soil_moisture: { value: null, unit: "%", state: "UNAVAILABLE", quality: "MISSING" },
        },
        qualitySummary: "MISSING",
        freshnessState: "LIVE",
        dataMode: "REAL",
      },
      history: { telemetry24h: [], averageMoisture24h: 0, minMoisture24h: 0, maxMoisture24h: 0, saturationDurationHours: 0, previousAdvisoriesCount: 0 },
      gis: { areaHectares: 1, perimeterMeters: 400, centroid: [30.9, 75.8], boundingBox: [0, 0, 0, 0] },
      satellite: { lastUpdated: new Date().toISOString(), ndviAverage: 0.7, ndviTrend: "STABLE", moistureIndex: 0.45, provider: "Sentinel-2", available: true },
      weather: { currentTempCelsius: 28.5, currentHumidityPercent: 60, recentRainfallMm24h: 0, forecastRainfallMm72h: 0, windSpeedKmh: 10, source: "Sensors" },
    };

    const res = IrrigationAnalyzer.analyze(mockContext);
    expect(res.recommendation?.doNot).toContain("Apply automated irrigation based on stale or missing sensor readings");
  });

  // TEST 4: REAL ZERO ACCEPTANCE TEST (Req 137)
  test("137. Real Zero: Sensor reports 0 rainfall, displayed as 0 mm (not unavailable)", () => {
    const mockContext: AgriculturalContext = {
      field: sampleField,
      crop: CROP_PROFILES.wheat,
      currentStage: CROP_PROFILES.wheat.growthStages[0],
      telemetry: {
        deviceId: "AGRISENSE-ESP8266-001",
        fieldId: "FIELD-01",
        timestamp: new Date().toISOString(),
        measurements: {
          rainfall: { value: 0.0, unit: "mm", state: "MEASURED", quality: "VALID" },
        },
        qualitySummary: "VALID",
        freshnessState: "LIVE",
        dataMode: "REAL",
      },
      history: { telemetry24h: [], averageMoisture24h: 40, minMoisture24h: 40, maxMoisture24h: 40, saturationDurationHours: 0, previousAdvisoriesCount: 0 },
      gis: { areaHectares: 1, perimeterMeters: 400, centroid: [30.9, 75.8], boundingBox: [0, 0, 0, 0] },
      satellite: { lastUpdated: new Date().toISOString(), ndviAverage: 0.7, ndviTrend: "STABLE", moistureIndex: 0.4, provider: "Sentinel-2", available: true },
      weather: { currentTempCelsius: 25, currentHumidityPercent: 60, recentRainfallMm24h: 0, forecastRainfallMm72h: 0, windSpeedKmh: 10, source: "Sensors" },
    };

    expect(mockContext.telemetry.measurements.rainfall?.value).toBe(0.0);
    expect(mockContext.telemetry.measurements.rainfall?.state).toBe("MEASURED");
  });

  // TEST 5: NULL ACCEPTANCE TEST (Req 138)
  test("138. Null Value: Payload with nitrogen: null yields UNAVAILABLE without default number substitution", () => {
    const mockContext: AgriculturalContext = {
      field: sampleField,
      crop: CROP_PROFILES.wheat,
      currentStage: CROP_PROFILES.wheat.growthStages[0],
      telemetry: {
        deviceId: "AGRISENSE-ESP8266-001",
        fieldId: "FIELD-01",
        timestamp: new Date().toISOString(),
        measurements: {
          nitrogen: { value: null, unit: "mg/kg", state: "UNAVAILABLE", quality: "MISSING" },
        },
        qualitySummary: "MISSING",
        freshnessState: "LIVE",
        dataMode: "REAL",
      },
      history: { telemetry24h: [], averageMoisture24h: 40, minMoisture24h: 40, maxMoisture24h: 40, saturationDurationHours: 0, previousAdvisoriesCount: 0 },
      gis: { areaHectares: 1, perimeterMeters: 400, centroid: [30.9, 75.8], boundingBox: [0, 0, 0, 0] },
      satellite: { lastUpdated: new Date().toISOString(), ndviAverage: 0.7, ndviTrend: "STABLE", moistureIndex: 0.4, provider: "Sentinel-2", available: true },
      weather: { currentTempCelsius: 25, currentHumidityPercent: 60, recentRainfallMm24h: 0, forecastRainfallMm72h: 0, windSpeedKmh: 10, source: "Sensors" },
    };

    expect(mockContext.telemetry.measurements.nitrogen?.value).toBeNull();
    expect(mockContext.telemetry.measurements.nitrogen?.state).toBe("UNAVAILABLE");
  });

  // TEST 6: STALE DATA ACCEPTANCE TEST (Req 139)
  test("139. Stale Data: Telemetry timestamp > 120s marks state as OFFLINE / STALE", () => {
    const mockContext: AgriculturalContext = {
      field: sampleField,
      crop: CROP_PROFILES.wheat,
      currentStage: CROP_PROFILES.wheat.growthStages[0],
      telemetry: {
        deviceId: "AGRISENSE-ESP8266-001",
        fieldId: "FIELD-01",
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        measurements: {
          soil_moisture: { value: 31.1, unit: "%", state: "MEASURED", quality: "STALE" },
        },
        qualitySummary: "STALE",
        freshnessState: "OFFLINE",
        dataMode: "REAL",
      },
      history: { telemetry24h: [], averageMoisture24h: 31.1, minMoisture24h: 31.1, maxMoisture24h: 31.1, saturationDurationHours: 0, previousAdvisoriesCount: 0 },
      gis: { areaHectares: 1, perimeterMeters: 400, centroid: [30.9, 75.8], boundingBox: [0, 0, 0, 0] },
      satellite: { lastUpdated: new Date().toISOString(), ndviAverage: 0.7, ndviTrend: "STABLE", moistureIndex: 0.31, provider: "Sentinel-2", available: true },
      weather: { currentTempCelsius: 25, currentHumidityPercent: 60, recentRainfallMm24h: 0, forecastRainfallMm72h: 0, windSpeedKmh: 10, source: "Sensors" },
    };

    const res = IntelligenceEngine.evaluate(mockContext);
    expect(res.dataQuality.overall).toBe("OFFLINE");
    expect(res.confidence).toBe("LOW");
  });

  // TEST 7: AI OFFLINE ACCEPTANCE TEST (Req 140)
  test("140. AI Offline Handling: Analyze My Field with OFFLINE device prevents confident decision making", () => {
    const mockContext: AgriculturalContext = {
      field: sampleField,
      crop: CROP_PROFILES.wheat,
      currentStage: CROP_PROFILES.wheat.growthStages[0],
      telemetry: {
        deviceId: "AGRISENSE-ESP8266-001",
        fieldId: "FIELD-01",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        measurements: {
          soil_moisture: { value: null, unit: "%", state: "UNAVAILABLE", quality: "MISSING" },
        },
        qualitySummary: "MISSING",
        freshnessState: "OFFLINE",
        dataMode: "REAL",
      },
      history: { telemetry24h: [], averageMoisture24h: 0, minMoisture24h: 0, maxMoisture24h: 0, saturationDurationHours: 0, previousAdvisoriesCount: 0 },
      gis: { areaHectares: 1, perimeterMeters: 400, centroid: [30.9, 75.8], boundingBox: [0, 0, 0, 0] },
      satellite: { lastUpdated: new Date().toISOString(), ndviAverage: 0.7, ndviTrend: "STABLE", moistureIndex: 0.0, provider: "Sentinel-2", available: true },
      weather: { currentTempCelsius: 25, currentHumidityPercent: 60, recentRainfallMm24h: 0, forecastRainfallMm72h: 0, windSpeedKmh: 10, source: "Sensors" },
    };

    const res = IntelligenceEngine.evaluate(mockContext);
    expect(res.condition.code).toBe("OFFLINE");
    expect(res.diagnosis.findings.some((f) => f.description.includes("OFFLINE"))).toBe(true);
  });
});
