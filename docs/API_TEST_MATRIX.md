# AgriSense AI — API Test Matrix (API_TEST_MATRIX.md)

| Endpoint | Method | Input Payload / Query | Expected Response | Database Effect | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/iot/telemetry` | POST | ESP8266 JSON Payload | `{ success: true, ackId: "..." }` | Inserts `telemetry`, updates `devices` | PASS |
| `/api/v1/device/heartbeat` | POST | `{ deviceId, health }` | `{ success: true, wasOffline }` | Updates `devices.lastHeartbeat` | PASS |
| `/api/v1/device/status` | GET | `?deviceId=...` | Status, age, outage duration | Reads `devices` & `telemetry` | PASS |
| `/api/v1/device/config` | POST | `{ deviceId, telemetryIntervalSeconds }` | `{ success: true, config }` | Updates `devices.config` | PASS |
| `/api/v1/public/telemetry/stream` | GET | None | EventSource SSE stream | SSE broadcast | PASS |
| `/api/v1/public/telemetry/latest` | GET | `?fieldId=...` | Latest `TelemetryRecord` | Queries `telemetry` | PASS |
| `/api/v1/public/telemetry/history` | GET | `?fieldId=...&limit=48` | Array of telemetry docs | Queries `telemetry` | PASS |
| `/api/v1/public/gis/fields` | GET | None | Array of Field documents | Queries `fields` | PASS |
| `/api/v1/public/gis/fields` | POST | Field GeoJSON payload | `{ success: true, data }` | Upserts `fields` | PASS |
| `/api/v1/public/crops` | GET | None | Array of 20 Crop profiles | Reads static KB | PASS |
| `/api/v1/public/advisories` | GET | `?fieldId=...` | `AdvisoryResponse` object | Runs `ContextBuilder` & Engine | PASS |
| `/api/v1/public/advisories/ask` | POST | `{ query, fieldId }` | `{ answer, isAiGenerated }` | Evaluates Gemini / Fallback | PASS |
| `/api/v1/public/alerts` | GET | `?status=...&severity=...` | Array of Alert documents | Queries `alerts` | PASS |
| `/api/v1/public/alerts/:id/resolve` | POST | Path ID | `{ success: true }` | Updates `alerts.status` | PASS |
| `/api/v1/public/alerts/:id/create-action` | POST | Path ID | `{ success: true, data }` | Inserts `actions` document | PASS |
| `/api/v1/public/actions` | GET | `?fieldId=...` | Array of Action tasks | Queries `actions` | PASS |
| `/api/v1/public/analytics` | GET | `?fieldId=...&range=24h` | Aggregated min/max/avg | Aggregates `telemetry` | PASS |
| `/api/v1/public/reports/export-csv` | GET | `?fieldId=...` | CSV file download | Streams `telemetry` | PASS |
| `/api/v1/public/settings` | GET/POST | Settings JSON | `{ success: true, data }` | Upserts `settings` | PASS |
| `/api/v1/public/intelligence/live` | GET | `?fieldId=...` | `IoTIntelligenceReport` | Uses `ContextBuilder` | PASS |
| `/api/v1/public/intelligence/why` | GET | `?fieldId=...` | `WhyAnalysisResult` | Uses `ContextBuilder` | PASS |
| `/api/v1/public/intelligence/what-changed` | GET | `?period=6h` | `WhatChangedResult` | Uses `ContextBuilder` | PASS |
| `/api/v1/public/intelligence/what-if` | POST | `{ scenario }` | `WhatIfSimulationResult` | Runs simulation model | PASS |
| `/api/v1/public/intelligence/replay` | GET | `?timeframe=24h` | Array of Replay points | Queries `telemetry` | PASS |
