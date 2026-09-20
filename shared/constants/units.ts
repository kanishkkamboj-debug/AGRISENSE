export const PARAMETER_UNITS = {
  soil_moisture: "%",
  soil_temperature: "°C",
  soil_humidity: "%",
  soil_ph: "pH",
  nitrogen: "mg/kg",
  phosphorus: "mg/kg",
  potassium: "mg/kg",
  ambient_temperature: "°C",
  ambient_humidity: "%",
  light_intensity: "lux",
  rainfall: "mm",
} as const;

export type SensorParameter = keyof typeof PARAMETER_UNITS;
