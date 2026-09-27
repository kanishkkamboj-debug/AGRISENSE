import { logger } from "../../utils/logger";

export interface WeatherDataResult {
  isAvailable: boolean;
  isStale?: boolean;
  status: "LOADING" | "AVAILABLE" | "STALE" | "ERROR" | "UNAVAILABLE";
  provenance: "EXTERNAL" | "UNAVAILABLE";
  provider: string;
  currentTempCelsius: number | null;
  feelsLikeCelsius: number | null;
  currentHumidityPercent: number | null;
  pressureHpa: number | null;
  recentRainfallMm24h: number | null;
  forecastRainfallMm72h: number | null;
  windSpeedKmh: number | null;
  weatherConditionText: string;
  lastUpdated: string | null;
  errorReason?: string;
}

export class WeatherService {
  private static cache: Map<string, { data: WeatherDataResult; fetchedAt: number }> = new Map();
  private static CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

  static async getWeatherForLocation(lat: number, lng: number): Promise<WeatherDataResult> {
    const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    const now = Date.now();

    const cached = this.cache.get(key);
    // Fresh cache < 15 min: use cache
    if (cached && now - cached.fetchedAt < this.CACHE_TTL_MS) {
      return {
        ...cached.data,
        status: "AVAILABLE",
        isStale: false,
      };
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      // If we have stale cache, return stale
      if (cached) {
        return {
          ...cached.data,
          status: "STALE",
          isStale: true,
          errorReason: "OPENWEATHER_API_KEY missing from environment configuration. Displaying stale cache.",
        };
      }
      return {
        isAvailable: false,
        isStale: false,
        status: "UNAVAILABLE",
        provenance: "UNAVAILABLE",
        provider: "OpenWeatherMap API (Unconfigured)",
        currentTempCelsius: null,
        feelsLikeCelsius: null,
        currentHumidityPercent: null,
        pressureHpa: null,
        recentRainfallMm24h: null,
        forecastRainfallMm72h: null,
        windSpeedKmh: null,
        weatherConditionText: "Weather data unavailable",
        lastUpdated: null,
        errorReason: "OpenWeatherMap API key (OPENWEATHER_API_KEY) is missing from environment configuration.",
      };
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`OpenWeather API HTTP Error ${res.status}`);
      }
      const data = (await res.json()) as any;

      const weatherResult: WeatherDataResult = {
        isAvailable: true,
        isStale: false,
        status: "AVAILABLE",
        provenance: "EXTERNAL",
        provider: "OpenWeatherMap API",
        currentTempCelsius: typeof data.main?.temp === "number" ? data.main.temp : null,
        feelsLikeCelsius: typeof data.main?.feels_like === "number" ? data.main.feels_like : null,
        currentHumidityPercent: typeof data.main?.humidity === "number" ? data.main.humidity : null,
        pressureHpa: typeof data.main?.pressure === "number" ? data.main.pressure : null,
        recentRainfallMm24h: typeof data.rain?.["1h"] === "number" ? data.rain["1h"] * 24 : 0,
        forecastRainfallMm72h: 0,
        windSpeedKmh: typeof data.wind?.speed === "number" ? parseFloat((data.wind.speed * 3.6).toFixed(1)) : null,
        weatherConditionText: data.weather?.[0]?.description || "Clear",
        lastUpdated: new Date().toISOString(),
      };

      this.cache.set(key, { data: weatherResult, fetchedAt: now });
      logger.info(`WEATHER_SERVICE_FETCH_SUCCESS lat=${lat} lng=${lng} temp=${weatherResult.currentTempCelsius}°C`);
      return weatherResult;
    } catch (err: any) {
      logger.warn(`WEATHER_SERVICE_FETCH_FAILED lat=${lat} lng=${lng}: ${err.message}`);
      
      // If cached data exists on API failure, return cached data with status STALE
      if (cached) {
        return {
          ...cached.data,
          status: "STALE",
          isStale: true,
          weatherConditionText: `${cached.data.weatherConditionText} (Stale weather data)`,
          errorReason: `Fresh weather fetch failed (${err.message}). Displaying stale weather data.`,
        };
      }

      return {
        isAvailable: false,
        isStale: false,
        status: "UNAVAILABLE",
        provenance: "UNAVAILABLE",
        provider: "OpenWeatherMap API",
        currentTempCelsius: null,
        feelsLikeCelsius: null,
        currentHumidityPercent: null,
        pressureHpa: null,
        recentRainfallMm24h: null,
        forecastRainfallMm72h: null,
        windSpeedKmh: null,
        weatherConditionText: "Weather data unavailable",
        lastUpdated: null,
        errorReason: `Weather API fetch failed: ${err.message}`,
      };
    }
  }
}
