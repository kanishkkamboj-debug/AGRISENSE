import { isMeasurementValidRange, validateTelemetryPayload } from "../../shared/schemas/telemetry.schema";
import { FertilizerEngine } from "../../backend/src/services/IntelligenceEngine/FertilizerEngine";
import { TreatmentEngine } from "../../backend/src/services/IntelligenceEngine/TreatmentEngine";
import { EvidenceGate } from "../../backend/src/services/IntelligenceEngine/EvidenceGate";
import { CROP_PROFILES } from "../../knowledge-base/crops";
import { AgriculturalContext } from "../../shared/types/agriculture";

describe("Phase 3 Pipeline & Governance Validation Tests", () => {
  const crop = CROP_PROFILES.wheat;
  const stage = crop.growthStages[0];

  const baseContext: AgriculturalContext = {
    field: {
      fieldId: "FIELD-TEST-P3",
      name: "Phase 3 Test Plot",
      locationName: "Punjab Plot",
      areaHectares: 10, // 10 Hectares for area scaling test
      perimeterMeters: 1400,
      centroid: [30.901, 75.857],
      geometry: { type: "Polygon", coordinates: [] },
      currentCropId: "wheat",
      currentCropStage: "tillering",
      deviceIds: ["ESP8266-P3-001"],
    },
    crop,
    currentStage: stage,
    telemetry: {
      deviceId: "ESP8266-P3-001",
      fieldId: "FIELD-TEST-P3",
      timestamp: new Date().toISOString(),
      measurements: {},
      qualitySummary: "VALID",
      freshnessState: "LIVE",
      dataMode: "REAL",
    },
    history: { telemetry24h: [], averageMoisture24h: 50, minMoisture24h: 40, maxMoisture24h: 60, saturationDurationHours: 0, previousAdvisoriesCount: 0 },
    gis: { areaHectares: 10, perimeterMeters: 1400, centroid: [30.901, 75.857], boundingBox: [75.8, 30.9, 75.9, 31.0] },
    satellite: { lastUpdated: new Date().toISOString(), ndviAverage: 0.75, ndviTrend: "STABLE", moistureIndex: 0.5, provider: "Sentinel-2", available: true },
    weather: { currentTempCelsius: 25, currentHumidityPercent: 60, recentRainfallMm24h: 0, forecastRainfallMm72h: 0, windSpeedKmh: 10, source: "OpenWeather" },
  };

  test("1. Enforces range validation on soil moisture and pH", () => {
    expect(isMeasurementValidRange("soil_moisture", 45)).toBe(true);
    expect(isMeasurementValidRange("soil_moisture", 150)).toBe(false);
    expect(isMeasurementValidRange("soil_ph", 6.8)).toBe(true);
    expect(isMeasurementValidRange("soil_ph", 18.5)).toBe(false);
  });

  test("2. Rejects invalid JSON telemetry payloads missing deviceId or token", () => {
    const res = validateTelemetryPayload({ timestamp: new Date().toISOString(), measurements: {} });
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("Missing or invalid deviceId");
  });

  test("3. Scales Fertilizer Urea requirement strictly with Hectare field area", () => {
    const npkCtx: AgriculturalContext = {
      ...baseContext,
      telemetry: {
        ...baseContext.telemetry,
        measurements: {
          nitrogen: { value: 70, unit: "ppm", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          phosphorus: { value: 30, unit: "ppm", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          potassium: { value: 140, unit: "ppm", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
        },
      },
    };

    const res = FertilizerEngine.analyze(npkCtx);
    expect(res.hasSufficientEvidence).toBe(true);
    // Deficit N = 90 - 70 = 20 ppm. Total Urea = 20 * 10 Ha * 0.45 = 90.0 kg.
    expect(res.recommendation?.expectedOutcome).toContain("~90.0 kg for 10 Hectares");
  });

  test("4. Enforces strict separation of RISK_DETECTED vs CONFIRMED_DISEASE in TreatmentEngine", () => {
    const highHumidCtx: AgriculturalContext = {
      ...baseContext,
      telemetry: {
        ...baseContext.telemetry,
        measurements: {
          soil_temperature: { value: 24, unit: "°C", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          ambient_humidity: { value: 82, unit: "%", state: "MEASURED", quality: "VALID", source: "DHT22", lastUpdated: new Date().toISOString() },
        },
      },
    };

    const res = TreatmentEngine.analyze(highHumidCtx);
    expect(res.status).toBe("RISK_DETECTED");
    expect(res.recommendation?.doNot).toContain("Do not apply synthetic fungicides without physical symptom confirmation during field scouting");
  });

  test("5. EvidenceGate blocks unsupported recommendations when telemetry is completely missing", () => {
    const emptyTelemetryCtx: AgriculturalContext = {
      ...baseContext,
      telemetry: {
        ...baseContext.telemetry,
        measurements: {},
      },
    };

    const res = EvidenceGate.validate(emptyTelemetryCtx);
    expect(res.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(res.unsupportedConditions).toContain("MOISTURE_STRESS (Missing Soil Moisture)");
    expect(res.unsupportedConditions).toContain("NUTRIENT_DEFICIENCY (Missing NPK Sensor Measurements)");
  });
});
