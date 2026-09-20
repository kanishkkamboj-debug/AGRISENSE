import { TelemetryRecord } from "./telemetry";
export interface GeoJSONGeometry {
    type: "Polygon" | "Feature" | "FeatureCollection";
    coordinates: number[][][] | number[][][][];
}
export interface FieldContext {
    fieldId: string;
    name: string;
    locationName: string;
    areaHectares: number;
    perimeterMeters: number;
    centroid: [number, number];
    geometry: GeoJSONGeometry;
    currentCropId?: string;
    currentCropStage?: string;
    deviceIds: string[];
}
export interface NutrientRange {
    min: number;
    max: number;
    optimal?: number;
}
export interface CropGrowthStage {
    id: string;
    name: string;
    stageOrder: number;
    durationDays: number;
    waterRequirementMmDay: number;
    nutrientRequirement: {
        n: NutrientRange;
        p: NutrientRange;
        k: NutrientRange;
    };
    stressSensitivities: {
        drought: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        waterlogging: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        heat: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    };
}
export interface CropProfile {
    id: string;
    name: string;
    scientificName: string;
    category: "CEREAL" | "PULSE" | "OILSEED" | "VEGETABLE" | "FRUIT" | "CASH_CROP" | "PLANTATION";
    varieties?: string[];
    soil: {
        preferredPH: {
            min: number;
            max: number;
        };
        preferredTexture: string[];
        moisture: {
            min: number;
            max: number;
        };
    };
    temperature: {
        min: number;
        max: number;
        optimal: number;
    };
    humidity: {
        min: number;
        max: number;
    };
    lightLux?: {
        min?: number;
        max?: number;
    };
    nutrients: {
        n: NutrientRange;
        p: NutrientRange;
        k: NutrientRange;
        micronutrients?: Record<string, NutrientRange>;
    };
    plantingWindow: {
        startMonth: number;
        endMonth: number;
    };
    growthStages: CropGrowthStage[];
    stressConditions: string[];
    diseaseRisks: string[];
    pestRisks: string[];
    weedRisks: string[];
    ipmRules?: string[];
    recommendations: string[];
    harvestIndicators?: string[];
}
export interface EnvironmentalEvent {
    id: string;
    type: "HEAVY_RAINFALL" | "FLOOD" | "DROUGHT" | "HEATWAVE" | "FROST" | "DRAINAGE_FAILURE" | "PEST_OUTBREAK" | "DISEASE_OUTBREAK";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    timestamp: string;
    description: string;
    evidence: string[];
}
export interface GISContext {
    areaHectares: number;
    perimeterMeters: number;
    centroid: [number, number];
    boundingBox: [number, number, number, number];
    elevationMeters?: number;
    slopeDegrees?: number;
}
export interface SatelliteContext {
    lastUpdated: string;
    ndviAverage: number;
    ndviTrend: "IMPROVING" | "STABLE" | "DECLINING";
    moistureIndex: number;
    provider: string;
    imageryUrl?: string;
    available: boolean;
}
export interface WeatherContext {
    currentTempCelsius: number;
    currentHumidityPercent: number;
    recentRainfallMm24h: number;
    forecastRainfallMm72h: number;
    windSpeedKmh: number;
    source: string;
}
export interface HistoricalContext {
    telemetry24h: TelemetryRecord[];
    averageMoisture24h: number;
    minMoisture24h: number;
    maxMoisture24h: number;
    saturationDurationHours: number;
    previousAdvisoriesCount: number;
}
export interface AgriculturalContext {
    field: FieldContext;
    crop: CropProfile;
    currentStage: CropGrowthStage;
    telemetry: TelemetryRecord;
    history: HistoricalContext;
    gis?: GISContext;
    satellite?: SatelliteContext;
    weather?: WeatherContext;
    events?: EnvironmentalEvent[];
}
