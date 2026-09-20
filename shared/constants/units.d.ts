export declare const PARAMETER_UNITS: {
    readonly soil_moisture: "%";
    readonly soil_temperature: "°C";
    readonly soil_humidity: "%";
    readonly soil_ph: "pH";
    readonly nitrogen: "mg/kg";
    readonly phosphorus: "mg/kg";
    readonly potassium: "mg/kg";
    readonly ambient_temperature: "°C";
    readonly ambient_humidity: "%";
    readonly light_intensity: "lux";
    readonly rainfall: "mm";
};
export type SensorParameter = keyof typeof PARAMETER_UNITS;
