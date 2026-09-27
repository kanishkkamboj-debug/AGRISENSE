import { MagicMakerService } from "../../backend/src/services/MagicMakerService";
import { WeatherService } from "../../backend/src/services/WeatherService";
import { CROP_PROFILES } from "../../knowledge-base/crops";
import { AGRONOMIC_RULES } from "../../knowledge-base/guidelines/agronomic-rules";

// Mock MongoDB models to avoid buffering timeouts in unit tests
jest.mock("../../backend/src/models/Field", () => ({
  FieldModel: {
    findOne: jest.fn().mockImplementation(() => ({
      lean: jest.fn().mockResolvedValue({
        fieldId: "FIELD-PUNJAB-01",
        name: "Punjab Main Plot",
        centroid: [30.901, 75.857],
        currentCropId: "wheat",
        currentCropStage: "tillering",
      }),
    })),
  },
}));

jest.mock("../../backend/src/models/Device", () => ({
  DeviceModel: {
    findOne: jest.fn().mockImplementation(() => ({
      lean: jest.fn().mockResolvedValue({
        deviceId: "AGRISENSE-ESP8266-001",
        fieldId: "FIELD-PUNJAB-01",
        status: "ONLINE",
        lastSeen: new Date().toISOString(),
      }),
    })),
  },
}));

jest.mock("../../backend/src/models/ContextSnapshot", () => ({
  ContextSnapshotModel: {
    create: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock("../../backend/src/models/Telemetry", () => ({
  TelemetryModel: {
    findOne: jest.fn().mockImplementation(() => ({
      sort: jest.fn().mockImplementation(() => ({
        lean: jest.fn().mockResolvedValue({
          _id: "650000000000000000000001",
          deviceId: "AGRISENSE-ESP8266-001",
          fieldId: "FIELD-PUNJAB-01",
          timestamp: new Date().toISOString(),
          measurements: {
            soil_moisture: { value: 18.5, unit: "%", quality: "VALID" },
            soil_temperature: { value: 24.0, unit: "°C", quality: "VALID" },
            ambient_temperature: { value: 28.0, unit: "°C", quality: "VALID" },
            ambient_humidity: { value: 55.0, unit: "%", quality: "VALID" },
            nitrogen: { value: 45.0, unit: "ppm", quality: "VALID" },
          },
          freshnessState: "LIVE",
          dataMode: "REAL",
        }),
      })),
    })),
    find: jest.fn().mockImplementation(() => ({
      sort: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          lean: jest.fn().mockResolvedValue([
            {
              _id: "650000000000000000000001",
              deviceId: "AGRISENSE-ESP8266-001",
              fieldId: "FIELD-PUNJAB-01",
              timestamp: new Date().toISOString(),
              measurements: { soil_moisture: { value: 18.5, unit: "%" } },
            },
            {
              _id: "650000000000000000000002",
              deviceId: "AGRISENSE-ESP8266-001",
              fieldId: "FIELD-PUNJAB-01",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              measurements: { soil_moisture: { value: 22.0, unit: "%" } },
            },
          ]),
        })),
        lean: jest.fn().mockResolvedValue([]),
      })),
    })),
  },
}));

describe("Dynamic AgriSense Pipeline Acceptance Tests (Requirements 1 - 15)", () => {
  test("1. Magic Maker generates crop-specific dynamic pipeline output for Rice", async () => {
    const output = await MagicMakerService.generate("FIELD-PUNJAB-01", "rice", "nursery");
    expect(output.selectedCrop.id).toBe("rice");
    expect(output.selectedCrop.name).toBe("Rice / Paddy");
    expect(output.currentTelemetry.moisture).toBe(18.5);
    // Rice target moisture is 60-95%, so 18.5% must be flagged as BELOW requirement
    expect(output.explanationAction.narrative).toContain("BELOW Rice / Paddy minimum requirement");
    expect(output.riskDetection.diseaseRisks).toContain("Bacterial Leaf Blight");
  });

  test("2. Magic Maker generates crop-specific dynamic pipeline output for Sugarcane", async () => {
    const output = await MagicMakerService.generate("FIELD-PUNJAB-01", "sugarcane", "formative");
    expect(output.selectedCrop.id).toBe("sugarcane");
    expect(output.selectedCrop.name).toBe("Sugarcane");
    // Sugarcane target moisture is 45-80%, so 18.5% must be flagged as BELOW requirement
    expect(output.explanationAction.narrative).toContain("BELOW Sugarcane minimum requirement");
    expect(output.riskDetection.diseaseRisks).toContain("Red Rot");
  });

  test("3. Magic Maker handles Cotton requirements and risks without Wheat fallback", async () => {
    const output = await MagicMakerService.generate("FIELD-PUNJAB-01", "cotton", "vegetative");
    expect(output.selectedCrop.id).toBe("cotton");
    expect(output.selectedCrop.name).toBe("Cotton");
    expect(output.riskDetection.pestRisks).toContain("Pink Bollworm");
  });

  test("4. WeatherService returns structured weather and handles missing API key without fake values", async () => {
    const result = await WeatherService.getWeatherForLocation(30.901, 75.857);
    expect(result.status).toBeDefined();
    if (!process.env.OPENWEATHER_API_KEY) {
      expect(result.isAvailable).toBe(false);
      expect(result.weatherConditionText).toBe("Weather data unavailable");
    }
  });

  test("5. Knowledge Base contains complete Agronomic Rules with valid ICAR / PAU source governance", () => {
    expect(AGRONOMIC_RULES.length).toBeGreaterThan(0);
    const pauRule = AGRONOMIC_RULES.find((r) => r.source.organization.includes("Punjab Agricultural University"));
    expect(pauRule).toBeDefined();
    expect(pauRule?.source.reference).toBe("PAU-AGRO-2024-CH04");
  });

  test("6. 20-Crop Knowledge Base contains valid thresholds for all target crops", () => {
    const cropKeys = Object.keys(CROP_PROFILES);
    expect(cropKeys.length).toBeGreaterThanOrEqual(15);
    ["wheat", "rice", "sugarcane", "cotton", "maize"].forEach((key) => {
      expect(CROP_PROFILES[key]).toBeDefined();
      expect(CROP_PROFILES[key].soil.moisture.min).toBeGreaterThan(0);
    });
  });
});
