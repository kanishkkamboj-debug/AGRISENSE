# AgriSense AI — Failure Mode & Chaos Test Report

## 1. Test Overview
Failure testing deliberately disconnected hardware, external APIs, and MongoDB to verify system degradation and error handling in accordance with Phase 3 non-negotiables.

---

## 2. Tested Failure Scenarios & Results

### Scenario 1: MongoDB Database Service Unavailability
- **Action**: Stopped MongoDB service / simulated connection loss.
- **Observed Behavior**: Express API returns HTTP `503 Service Unavailable` with `database: "DOWN"`. System does **NOT** claim `DATA SAVED` or masquerade in-memory fallbacks as durable storage. UI displays persistence error banner.
- **Result**: **PASS**.

### Scenario 2: OpenWeatherMap External API Timeout / Key Failure
- **Action**: Removed `OPENWEATHER_API_KEY` from `.env`.
- **Observed Behavior**: `WeatherService.getWeatherForLocation()` returns `isAvailable: false`, `provenance: "UNAVAILABLE"`. `ContextBuilder` falls back to RS485/DHT22 ambient sensors tagged `"RS485-Sensors (Weather API Unavailable)"`. UI displays `WEATHER UNAVAILABLE`. Zero synthetic weather numbers generated.
- **Result**: **PASS**.

### Scenario 3: Gemini Generative AI Quota / Network Timeout
- **Action**: Simulated Gemini API timeout.
- **Observed Behavior**: `IntelligenceController` falls back directly to deterministic agronomic rule output from `IntelligenceEngine.evaluate()`. Advisory lists findings with tag `Rule Engine Direct (AI Offline)`.
- **Result**: **PASS**.

### Scenario 4: Hardware Wi-Fi Interruption & Reconnection
- **Action**: Disconnected ESP8266 Wi-Fi connection for 120 seconds.
- **Observed Behavior**:
  - `DeviceConnectivityService` transitioned status: `ONLINE` -> `STALE` (30s) -> `OFFLINE` (60s).
  - Web UI displayed `DEVICE OFFLINE` banner. Historical telemetry displayed with tag `LAST KNOWN (22:31)`.
  - Wi-Fi reconnected: Telemetry resumed, SSE emitted `wasOffline: true`, `outageDurationSeconds: 120`. UI recovered to `LIVE` without stale state lockups.
- **Result**: **PASS**.
