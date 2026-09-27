import { FertilizerEngine } from "../../backend/src/services/IntelligenceEngine/FertilizerEngine";
import { AgriculturalContext } from "../../shared/types/agriculture";
import { CROP_PROFILES } from "../../knowledge-base/crops";

describe("FertilizerEngine Unit Tests", () => {
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

  test("Suppresses fertilizer recommendation when NPK telemetry is missing", () => {
    const res = FertilizerEngine.analyze(baseContext);
    expect(res.hasSufficientEvidence).toBe(false);
    expect(res.recommendation).toBeNull();
    expect(res.reason).toContain("INSUFFICIENT EVIDENCE");
  });

  test("Calculates nutrient deficit and Urea application rate when NPK is measured", () => {
    const npkCtx: AgriculturalContext = {
      ...baseContext,
      telemetry: {
        ...baseContext.telemetry,
        measurements: {
          nitrogen: { value: 70, unit: "ppm", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          phosphorus: { value: 20, unit: "ppm", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
          potassium: { value: 110, unit: "ppm", state: "MEASURED", quality: "VALID", source: "RS485", lastUpdated: new Date().toISOString() },
        },
      },
    };

    const res = FertilizerEngine.analyze(npkCtx);
    expect(res.hasSufficientEvidence).toBe(true);
    expect(res.nutrientGap.nDeficitPpm).toBe(20); // 90 optimal for tillering - 70 measured
    expect(res.recommendation).not.toBeNull();
    expect(res.recommendation?.action.type).toBe("NUTRIENT");
    expect(res.recommendation?.expectedOutcome).toContain("Prescribed Urea Application");
  });
});
