import { EvidenceGate } from "../../backend/src/services/IntelligenceEngine/EvidenceGate";
import { AgriculturalContext } from "../../shared/types/agriculture";
import { CROP_PROFILES } from "../../knowledge-base/crops";

describe("EvidenceGate Unit Tests", () => {
  const crop = CROP_PROFILES.wheat;
  const currentStage = crop.growthStages[0];

  const baseContext: AgriculturalContext = {
    field: {
      fieldId: "TEST-FIELD-01",
      name: "Test Field",
      locationName: "Punjab",
      areaHectares: 5,
      perimeterMeters: 900,
      centroid: [30.9, 75.8],
      geometry: { type: "Polygon", coordinates: [] },
      currentCropId: "wheat",
      currentCropStage: "tillering",
      deviceIds: ["DEV-01"],
    },
    crop,
    currentStage,
    telemetry: {
      deviceId: "DEV-01",
      fieldId: "TEST-FIELD-01",
      timestamp: new Date().toISOString(),
      measurements: {},
      qualitySummary: "VALID",
      freshnessState: "LIVE",
      dataMode: "REAL",
    },
    history: { telemetry24h: [], averageMoisture24h: 50, minMoisture24h: 40, maxMoisture24h: 60, saturationDurationHours: 0, previousAdvisoriesCount: 0 },
    gis: { areaHectares: 5, perimeterMeters: 900, centroid: [30.9, 75.8], boundingBox: [75.7, 30.8, 75.9, 31.0] },
    satellite: { lastUpdated: new Date().toISOString(), ndviAverage: 0.75, ndviTrend: "STABLE", moistureIndex: 0.5, provider: "Sentinel-2", available: true },
    weather: { currentTempCelsius: 24, currentHumidityPercent: 65, recentRainfallMm24h: 0, forecastRainfallMm72h: 0, windSpeedKmh: 10, source: "OpenWeather" },
  };

  test("Returns INSUFFICIENT_EVIDENCE when device is OFFLINE", () => {
    const offlineCtx = {
      ...baseContext,
      telemetry: { ...baseContext.telemetry, freshnessState: "OFFLINE" as const },
    };
    const res = EvidenceGate.validate(offlineCtx);
    expect(res.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(res.reason).toContain("OFFLINE");
  });

  test("Returns INSUFFICIENT_EVIDENCE when telemetry has no valid measurements", () => {
    const emptyCtx = {
      ...baseContext,
      telemetry: { ...baseContext.telemetry, measurements: {} },
    };
    const res = EvidenceGate.validate(emptyCtx);
    expect(res.status).toBe("INSUFFICIENT_EVIDENCE");
  });

  test("Returns SUFFICIENT or PARTIAL with supported conditions when telemetry is present", () => {
    const validCtx: AgriculturalContext = {
      ...baseContext,
      telemetry: {
        ...baseContext.telemetry,
        measurements: {
          soil_moisture: { value: 45, unit: "%", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          soil_temperature: { value: 22, unit: "°C", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          soil_ph: { value: 6.5, unit: "pH", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          nitrogen: { value: 90, unit: "ppm", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          phosphorus: { value: 25, unit: "ppm", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          potassium: { value: 120, unit: "ppm", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          ambient_temperature: { value: 24, unit: "°C", state: "MEASURED", quality: "VALID", source: "DHT22", lastUpdated: new Date().toISOString() },
          ambient_humidity: { value: 65, unit: "%", state: "MEASURED", quality: "VALID", source: "DHT22", lastUpdated: new Date().toISOString() },
          rainfall: { value: 0, unit: "mm", state: "MEASURED", quality: "VALID", source: "RAIN_GAUGE", lastUpdated: new Date().toISOString() },
        },
      },
    };

    const res = EvidenceGate.validate(validCtx);
    expect(res.status).toBe("SUFFICIENT");
    expect(res.availableParameters.length).toBeGreaterThan(5);
    expect(res.supportedConditions).toContain("MOISTURE_STRESS");
    expect(res.supportedConditions).toContain("NUTRIENT_DEFICIENCY");
  });
});
