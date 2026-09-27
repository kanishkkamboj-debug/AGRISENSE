import { TreatmentEngine } from "../../backend/src/services/IntelligenceEngine/TreatmentEngine";
import { AgriculturalContext } from "../../shared/types/agriculture";
import { CROP_PROFILES } from "../../knowledge-base/crops";

describe("TreatmentEngine Unit Tests", () => {
  const crop = CROP_PROFILES.wheat;
  const currentStage = crop.growthStages[0];

  const baseContext: AgriculturalContext = {
    field: {
      fieldId: "TEST-FIELD-01",
      name: "Test Field",
      locationName: "Punjab",
      areaHectares: 4.5,
      perimeterMeters: 850,
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
    gis: { areaHectares: 4.5, perimeterMeters: 850, centroid: [30.9, 75.8], boundingBox: [75.7, 30.8, 75.9, 31.0] },
    satellite: { lastUpdated: new Date().toISOString(), ndviAverage: 0.75, ndviTrend: "STABLE", moistureIndex: 0.5, provider: "Sentinel-2", available: true },
    weather: { currentTempCelsius: 24, currentHumidityPercent: 65, recentRainfallMm24h: 0, forecastRainfallMm72h: 0, windSpeedKmh: 10, source: "OpenWeather" },
  };

  test("Returns NO_RISK when humidity is low (65%)", () => {
    const ctx: AgriculturalContext = {
      ...baseContext,
      telemetry: {
        ...baseContext.telemetry,
        measurements: {
          soil_temperature: { value: 22, unit: "°C", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          ambient_humidity: { value: 65, unit: "%", state: "MEASURED", quality: "VALID", source: "DHT22", lastUpdated: new Date().toISOString() },
        },
      },
    };

    const res = TreatmentEngine.analyze(ctx);
    expect(res.status).toBe("NO_RISK");
    expect(res.riskDetected).toBe(false);
  });

  test("Triggers RISK_DETECTED for Yellow Rust when relative humidity is high (85%) and temp is 22°C", () => {
    const ctx: AgriculturalContext = {
      ...baseContext,
      telemetry: {
        ...baseContext.telemetry,
        measurements: {
          soil_temperature: { value: 22, unit: "°C", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          ambient_humidity: { value: 85, unit: "%", state: "MEASURED", quality: "VALID", source: "DHT22", lastUpdated: new Date().toISOString() },
        },
      },
    };

    const res = TreatmentEngine.analyze(ctx);
    expect(res.status).toBe("RISK_DETECTED");
    expect(res.riskDetected).toBe(true);
    expect(res.diseaseName).toContain("Yellow Rust");
    expect(res.recommendation?.action.type).toBe("DISEASE");
    expect(res.citation.sourceName).toContain("ICAR Integrated Pest");
  });
});
