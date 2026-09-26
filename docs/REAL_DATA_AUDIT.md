# AgriSense AI — Real Data Codebase Audit (REAL_DATA_AUDIT.md)

## Classification Categories
Every numerical value and data attribute in AgriSense AI is classified strictly into one of seven categories:
1. **MEASURED**: Directly received from physical sensors via ESP8266 Modbus RS485.
2. **DERIVED**: Mathematically calculated from measured sensor data.
3. **ESTIMATED**: Produced by a documented agronomic estimation model.
4. **EXTERNAL**: Received from authenticated external APIs (e.g. Weather, Geocoding).
5. **KNOWLEDGE_BASE**: Static agronomic reference information (e.g. 20-crop profiles).
6. **HISTORICAL**: Previously measured data, clearly timestamped with data age.
7. **UNAVAILABLE**: Required sensor data does not exist or device is disconnected.

---

## Detailed Data Audit Table

| Component | File Path | Value / Function | Current Source | Provenance Category | Allowed in REAL_IOT? | Required Modification | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Telemetry Cards** | `DashboardView.tsx` | Sync Latency | `dataAgeSeconds` | DERIVED | YES | Display `DEVICE OFFLINE` when stale/offline | READY |
| **Telemetry Cards** | `DashboardView.tsx` | Total Packets | `packetCount` | DERIVED | YES | Count actual packets received | READY |
| **Telemetry Cards** | `DashboardView.tsx` | Active Nodes | `deviceStatus` | DERIVED | YES | Output `1 LIVE NODE` or `0 LIVE NODES` | READY |
| **Telemetry Cards** | `DashboardView.tsx` | Biophysical Sync (SHI) | `analyzeTelemetryAgainstCrop` | DERIVED | YES | Return `UNAVAILABLE` when sensor data is missing | TO FIX |
| **SHI Gauge** | `DashboardView.tsx` | Circular SHI score | `analyzeTelemetryAgainstCrop` | DERIVED | YES | Output `UNAVAILABLE` if missing core readings | TO FIX |
| **SHI Gauge** | `DashboardView.tsx` | Description text | `shiDescription` | DERIVED | YES | Show offline message when disconnected | READY |
| **Optimal Deltas** | `DashboardView.tsx` | Current Moisture, N, P, K, Temp | `telemetry.measurements` | MEASURED | YES | Display `UNAVAILABLE` when null | TO FIX |
| **Optimal Deltas** | `DashboardView.tsx` | Target Min/Optimal/Max | `CROP_PROFILES` | KNOWLEDGE_BASE | YES | Distinguish target from measured value | READY |
| **SHI History** | `DashboardView.tsx` | Sparkline Bar Heights | Hardcoded array fallback `[40,55,...]` | STATIC | **NO** | Replace with actual DB records or `NO HISTORICAL DATA` | TO FIX |
| **Scan Log** | `CropsView.tsx` | Moisture, pH, N, Temp | `telemetry.measurements` | MEASURED | YES | Output `UNAVAILABLE` when device offline | READY |
| **Crop Profiles** | `CropsView.tsx` | Temperature/Moisture targets | `CROP_PROFILES` | KNOWLEDGE_BASE | YES | Label as Crop Target Baseline | READY |
| **Analytics Stats** | `AnalyticsView.tsx` | Min/Max/Avg Moisture | MongoDB `TelemetryModel.find()` | HISTORICAL | YES | Return `NO TELEMETRY AVAILABLE` if count=0 | TO FIX |
| **Analytics Trend**| `AnalyticsView.tsx` | Trajectory (UP/DOWN) | Calculated velocity | DERIVED | YES | Return `INSUFFICIENT_DATA` if count < 2 | TO FIX |
| **Reports Summary** | `ReportsView.tsx` | Average SHI & Peak Temp | `telemetry.measurements` | MEASURED / HISTORICAL | YES | Output `UNAVAILABLE` if missing | READY |
| **Reports Graph** | `ReportsView.tsx` | SVG Sparkline Path | Array calculation `[shiScore-4, ...]` | STATIC | **NO** | Render actual timestamped DB points | TO FIX |
| **Settings Form** | `SettingsView.tsx` | Farm Profile & Units | `SettingModel` (MongoDB) | EXTERNAL / KB | YES | Persists to MongoDB | READY |
| **Intelligence Live**| `intelligenceController.ts` | Report Context | `MockDataService.getMockContext()` | STATIC | **NO** | Replace with `ContextBuilder.buildContext()` | TO FIX |
| **Why Analysis** | `intelligenceController.ts` | Evidence Chain | `MockDataService.getMockContext()` | STATIC | **NO** | Replace with `ContextBuilder.buildContext()` | TO FIX |
| **What Changed** | `intelligenceController.ts` | Delta Summary | `MockDataService.getMockContext()` | STATIC | **NO** | Replace with `ContextBuilder.buildContext()` | TO FIX |
| **Bottom Telemetry**| `BottomTelemetryBar.tsx` | Parameter pills | `telemetry.measurements` | MEASURED | YES | Display `UNAVAILABLE` & provenance badge | TO FIX |
| **Ask AgriSense** | `AskAgriSense.tsx` | Chat Response | `AIService.askAgriSense` | DERIVED | YES | Enforce non-hallucination prompt | READY |

---

## Prohibited Mock Patterns in Production Code
1. `MockDataService.getMockContext()` in `/api/v1/public/intelligence/*` routes.
2. Hardcoded height arrays `[40, 55, 60, 48, 70, 52, 65, 58, 75, 62, 80, 72, 85]` for chart previews.
3. Fallback numerical expressions `value || 45` or `temp ?? 26.8` when in `REAL_IOT` mode.
4. Arbitrary state toggling without backend validation.
