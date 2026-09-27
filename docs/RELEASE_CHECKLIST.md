# AgriSense AI — Production Release Certification Checklist

## Release Gate Verification

### 1. Hardware & Ingestion
- [x] ESP8266 physically connects and sends JSON payload
- [x] Telemetry ingests via `POST /api/v1/device/telemetry` & `/api/iot/telemetry`
- [x] Data persists to MongoDB `TelemetryModel`
- [x] Sensor disconnection outputs `UNAVAILABLE` (Never `0`)
- [x] Range validation marks out-of-bounds parameters `INVALID`
- [x] Replay protection returns HTTP `409 Conflict` on duplicate timestamp
- [x] Device state transitions: `NEVER_CONNECTED` -> `LIVE` -> `STALE` -> `OFFLINE` -> `RECONNECTING`

### 2. Evidence & Provenance
- [x] Every measurement tagged with 7-category provenance (`MEASURED`, `DERIVED`, `ESTIMATED`, `EXTERNAL`, `KNOWLEDGE_BASE`, `HISTORICAL`, `UNAVAILABLE`)
- [x] Freshness state correctly calculated (`LIVE`, `RECENT`, `STALE`, `OFFLINE`)
- [x] Stale data never presented as live
- [x] Zero runtime synthetic telemetry generators in `REAL_IOT` mode

### 3. Agronomic Engine
- [x] `EvidenceGate` validates required parameters before rule evaluation
- [x] `FertilizerEngine` computes NPK deficits and Urea dosage in kg scaled by GIS Hectare area
- [x] `TreatmentEngine` separates `RISK_DETECTED` from `CONFIRMED_DISEASE` with ICAR IPM citations
- [x] Missing NPK suppresses fertilizer dosage calculation (`INSUFFICIENT EVIDENCE`)

### 4. GIS & Geometry
- [x] Leaflet polygon vertex drawing working
- [x] Geodesic Hectare area and perimeter calculation verified
- [x] GeoJSON field geometry persists to MongoDB `FieldModel`

### 5. Failure Modes
- [x] OpenWeatherMap failure falls back to local RS485/DHT22 sensors
- [x] Gemini AI failure falls back to deterministic rule engine
- [x] MongoDB failure returns HTTP 503 without claiming data persistence
- [x] Hardware outage duration tracked and recovered via SSE

### 6. Build & Code Quality
- [x] `@agrisense/shared` build: PASS
- [x] `@agrisense/backend` build: PASS
- [x] `@agrisense/frontend` build: PASS (Vite dist bundle created)
- [x] `npm run typecheck`: PASS (0 errors across workspace)
- [x] `npm test`: PASS (44/44 unit tests passing across 14 test suites)
