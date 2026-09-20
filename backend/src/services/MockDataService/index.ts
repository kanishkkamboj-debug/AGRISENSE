import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { AgriculturalContext, FieldContext } from "../../../../shared/types/agriculture";
import { CROP_PROFILES } from "../../../../knowledge-base/crops";

export class MockDataService {
  static getMockTelemetry(scenario: "normal" | "waterlogging" | "drought" | "flood" | "no_npk" = "normal"): TelemetryRecord {
    const now = new Date().toISOString();

    const baseMeasurements = {
      soil_moisture: { value: 42.7, unit: "%", state: "MEASURED" as const, quality: "VALID" as const, lastUpdated: now, source: "PI5-FIELD-001" },
      soil_temperature: { value: 24.8, unit: "°C", state: "MEASURED" as const, quality: "VALID" as const, lastUpdated: now, source: "PI5-FIELD-001" },
      soil_humidity: { value: 61.2, unit: "%", state: "MEASURED" as const, quality: "VALID" as const, lastUpdated: now, source: "PI5-FIELD-001" },
      soil_ph: { value: 6.5, unit: "pH", state: "MEASURED" as const, quality: "VALID" as const, lastUpdated: now, source: "PI5-FIELD-001" },
      nitrogen: { value: null, unit: "mg/kg", state: "UNAVAILABLE" as const, quality: "MISSING" as const, lastUpdated: now, source: "PI5-FIELD-001" },
      phosphorus: { value: null, unit: "mg/kg", state: "UNAVAILABLE" as const, quality: "MISSING" as const, lastUpdated: now, source: "PI5-FIELD-001" },
      potassium: { value: null, unit: "mg/kg", state: "UNAVAILABLE" as const, quality: "MISSING" as const, lastUpdated: now, source: "PI5-FIELD-001" },
      ambient_temperature: { value: 26.5, unit: "°C", state: "MEASURED" as const, quality: "VALID" as const, lastUpdated: now, source: "WEATHER-SENSOR" },
      ambient_humidity: { value: 58.0, unit: "%", state: "MEASURED" as const, quality: "VALID" as const, lastUpdated: now, source: "WEATHER-SENSOR" },
      rainfall: { value: 0.0, unit: "mm", state: "MEASURED" as const, quality: "VALID" as const, lastUpdated: now, source: "WEATHER-STATION" },
    };

    if (scenario === "waterlogging") {
      baseMeasurements.soil_moisture.value = 89.4;
      baseMeasurements.rainfall.value = 72.0;
    } else if (scenario === "drought") {
      baseMeasurements.soil_moisture.value = 18.2;
      baseMeasurements.ambient_temperature.value = 38.5;
    } else if (scenario === "flood") {
      baseMeasurements.soil_moisture.value = 96.0;
      baseMeasurements.rainfall.value = 140.0;
    }

    return {
      id: `MOCK-${scenario.toUpperCase()}-001`,
      deviceId: "PI5-FIELD-001",
      fieldId: "FIELD-PUNJAB-01",
      timestamp: now,
      measurements: baseMeasurements,
      qualitySummary: "VALID",
      freshnessState: "LIVE",
      dataMode: "MOCK",
      syncStatus: "SYNCHRONIZED",
    };
  }

  static getMockContext(scenario: "normal" | "waterlogging" | "drought" | "flood" = "normal"): AgriculturalContext {
    const telemetry = this.getMockTelemetry(scenario);
    const crop = CROP_PROFILES.wheat;

    const field: FieldContext = {
      fieldId: "FIELD-PUNJAB-01",
      name: "Field 01 - Main Demonstration Plot",
      locationName: "Ludhiyana, Punjab",
      areaHectares: 4.5,
      perimeterMeters: 850,
      centroid: [30.901, 75.857],
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.855, 30.900],
            [75.860, 30.900],
            [75.860, 30.905],
            [75.855, 30.905],
            [75.855, 30.900],
          ],
        ],
      },
      currentCropId: "wheat",
      currentCropStage: "tillering",
      deviceIds: ["PI5-FIELD-001"],
    };

    return {
      field,
      crop,
      currentStage: crop.growthStages[1] || crop.growthStages[0],
      telemetry,
      history: {
        telemetry24h: [telemetry],
        averageMoisture24h: scenario === "waterlogging" ? 88.0 : scenario === "drought" ? 19.0 : 43.5,
        minMoisture24h: scenario === "waterlogging" ? 82.0 : 16.0,
        maxMoisture24h: scenario === "waterlogging" ? 91.0 : 48.0,
        saturationDurationHours: scenario === "waterlogging" ? 18 : 0,
        previousAdvisoriesCount: 2,
      },
      gis: {
        areaHectares: 4.5,
        perimeterMeters: 850,
        centroid: [30.901, 75.857],
        boundingBox: [75.855, 30.900, 75.860, 30.905],
      },
      satellite: {
        lastUpdated: new Date().toISOString(),
        ndviAverage: scenario === "waterlogging" ? 0.42 : 0.76,
        ndviTrend: "STABLE",
        moistureIndex: scenario === "waterlogging" ? 0.85 : 0.45,
        provider: "Sentinel-2 L2A",
        available: true,
      },
      weather: {
        currentTempCelsius: telemetry.measurements.ambient_temperature?.value || 25,
        currentHumidityPercent: telemetry.measurements.ambient_humidity?.value || 60,
        recentRainfallMm24h: telemetry.measurements.rainfall?.value || 0,
        forecastRainfallMm72h: scenario === "waterlogging" ? 45.0 : 0.0,
        windSpeedKmh: 12.5,
        source: "OpenWeather-Agri",
      },
    };
  }
}
