# AgriSense AI — Weather Service Integration & Cache Model

## 1. Overview
The `WeatherService` (`backend/src/services/WeatherService/index.ts`) connects AgriSense AI to live meteorologic data from OpenWeatherMap by field centroid coordinates `[lat, lng]`.

---

## 2. API Integration & Cache Architecture

```typescript
const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
```

- **Cache TTL**: 15 Minutes (900 seconds) in-memory TTL per `(lat, lng)` grid key.
- **Cache Eviction**: Prevents redundant HTTP requests and respects rate limits.

---

## 3. Fallback & Missing Key Handling
If `OPENWEATHER_API_KEY` is missing from environment variables, or if HTTP request fails:
- Returns `isAvailable: false`, `provenance: "UNAVAILABLE"`.
- ContextBuilder gracefully falls back to RS485/DHT22 ambient sensor readings for current temperature and humidity with explicit source tag: `"RS485-Sensors (Weather API Unavailable)"`.
