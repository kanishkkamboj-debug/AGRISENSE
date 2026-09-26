# AgriSense AI — Functional UI Audit (FUNCTIONAL_UI_AUDIT.md)

## Screen & Component Functionality Breakdown

### 1. Dashboard View (`frontend/src/views/Dashboard/index.tsx`)
- **Data Source**: Real-time telemetry via `IoTContext` (SSE + REST fallback).
- **Data Provenance**:
  - Measured: Soil Moisture, Soil Temp, pH, N, P, K, Ambient Temp, Humidity, Rain.
  - Derived: SHI Score, Data Age, Sync Latency, Active Nodes count, Optimal Range Deltas.
  - Knowledge Base: 20-crop optimal targets and stage water requirements.
- **Offline Behavior**:
  - Displays persistent `OfflineBanner` component.
  - Latency card displays `DEVICE OFFLINE`.
  - Active Nodes displays `0 LIVE NODES`.
  - SHI Gauge displays `UNAVAILABLE` if core telemetry is missing.
  - Optimal Range Deltas show `UNAVAILABLE` for missing parameters.
  - Static sparkline fallback array `[40, 55, 60, ...]` removed; shows real DB records or `NO HISTORICAL DATA`.

### 2. GIS Farm Map View (`frontend/src/views/GIS/index.tsx`)
- **Data Source**: `FieldModel` from MongoDB (`GET/POST /api/v1/public/gis/fields`).
- **Data Provenance**: External Leaflet tiles, GeoJSON centroids, and boundary polygons.
- **Search & Save**: Real geocoding via Nominatim API. Centroids saved directly to MongoDB.

### 3. Soil & Crop Data View (`frontend/src/views/Crops/index.tsx`)
- **Data Source**: `CROP_PROFILES` static knowledge base + live sensor telemetry.
- **Offline Behavior**: Scan log outputs `UNAVAILABLE` when hardware is disconnected. Hardware downlink configuration endpoint (`POST /api/v1/device/config`) called upon scan initiation.

### 4. Analytics View (`frontend/src/views/Analytics/index.tsx`)
- **Data Source**: MongoDB `telemetry` collection queried via `GET /api/v1/public/analytics`.
- **Empty Database Behavior**: Returns `NO TELEMETRY AVAILABLE` when count is 0. Trajectory outputs `INSUFFICIENT_DATA` when samples < 2.

### 5. Session Reports View (`frontend/src/views/Reports/index.tsx`)
- **Data Source**: Historical telemetry aggregation from MongoDB.
- **CSV Export**: Real CSV download via `GET /api/v1/public/reports/export-csv` containing timestamp, measurements, and provenance metadata.

### 6. IoT Intelligence View (`frontend/src/views/IoTIntelligence/index.tsx`)
- **Data Source**: `ContextBuilder.buildContext(fieldId)` evaluating real backend state.
- **Why Analysis**: Generated from real telemetry evidence chain. Outputs `INSUFFICIENT EVIDENCE` if sensor readings are missing.

### 7. Settings View (`frontend/src/views/Settings/index.tsx`)
- **Data Source**: MongoDB `settings` collection (`GET/POST /api/v1/public/settings`).
- **Persistence**: Updates persist to MongoDB and re-sync upon page reload.
