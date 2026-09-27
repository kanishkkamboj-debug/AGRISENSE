# AgriSense AI — Failure Mode & Evidence Degradation Matrix

## 1. Overview
This matrix details the system's exact response across all 15 operational failure modes in `REAL_IOT` mode.

---

## 2. Comprehensive Failure Matrix

| # | Failure Mode | Trigger Condition | System Behavior & UI Output | Provenance / Quality State |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Device Offline** | `freshnessState === "OFFLINE"` | Banner: `CRITICAL: IoT Device OFFLINE`. Analytics marked historical. Advisories suppressed. | `freshnessState: OFFLINE` |
| 2 | **Sensor Disconnected** | Measurement `value === null` | Display `UNAVAILABLE`. Never output 0. | `state: UNAVAILABLE`, `quality: MISSING` |
| 3 | **Out-of-Bounds Measurement** | Value outside valid range (e.g. pH > 14) | Store `quality: INVALID`. Exclude parameter from rule evaluation without zeroing siblings. | `quality: INVALID` |
| 4 | **Replayed Telemetry** | Duplicate `(deviceId, timestamp)` | Reject ingestion payload with HTTP `409 Conflict`. Log replay warning. | `DUPLICATE_REJECTED` |
| 5 | **Weather API Key Missing** | `OPENWEATHER_API_KEY` unconfigured | Fall back to DHT22/RS485 sensors. Tag source: `"RS485-Sensors (Weather API Unavailable)"`. | `provenance: UNAVAILABLE` |
| 6 | **Weather API Network Failure** | OpenWeather API timeout | Serve cached weather if fresh ($\le 15\text{m}$); else fall back to local sensors. | `isAvailable: false` |
| 7 | **Missing NPK Sensors** | N, P, or K is null | Fertilizer engine suppresses dosage recommendation. Display: `Soil test or sensor required`. | `INSUFFICIENT_EVIDENCE` |
| 8 | **Missing Field Area** | `areaHectares === 0` | Dosage calculator outputs: `FIELD AREA MISSING: Per-hectare rate unavailable`. | `LIMITATION_LOGGED` |
| 9 | **Database Disconnection** | MongoDB connection lost | Express endpoints return `503 Service Unavailable`. SSE emits reconnection retry stream. | `SYSTEM_ERROR` |
| 10| **Gemini AI Failure** | Gemini API quota / rate limit | Return deterministic agronomic rule output directly. Tag AI model: `"Rule Engine Direct (AI Offline)"`. | `DETERMINISTIC_FALLBACK` |
