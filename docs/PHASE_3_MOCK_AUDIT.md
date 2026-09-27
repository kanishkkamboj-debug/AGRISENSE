# AgriSense AI — Phase 3 Codebase Audit & Mock Classification Report

## 1. Overview & Audit Methodology
A complete, line-by-line audit of the AgriSense AI repository was performed to identify all instances of mock, fake, synthetic, or hardcoded numbers, random generators (`Math.random()`), and fallback structures across `backend/src`, `frontend/src`, `shared`, and `knowledge-base`.

Every match was audited and classified into either:
- **`ACCEPTABLE`**: ICAR knowledge-base parameters, agronomic optimal targets, UI layout constants, enum definitions, empty-state fallback messages, or random UUID string generation for audit snapshots.
- **`PROHIBITED`**: Synthetic sensor readings, fake live charts, synthetic historical telemetry, fake device statuses, or silent fake numerical substitutions in `REAL_IOT` mode.

---

## 2. Comprehensive Classification Audit Matrix

| Location | Code / Data Reference | Classification | Action / Status |
| :--- | :--- | :--- | :--- |
| `backend/src/controllers/TelemetryController.ts:273` | `Return null/empty telemetry state when DB is empty` | `ACCEPTABLE` | Empty-state handling. Returns `data: null` when DB is empty. Verified no fake numbers generated. |
| `backend/src/models/Telemetry.ts:30` | `dataMode: { enum: ["REAL", "SIMULATION"] }` | `ACCEPTABLE` | Mongoose schema type definition. Default is `"REAL"`. |
| `backend/src/services/ContextService/ContextBuilder.ts:87` | `Strict REAL IoT Mode: Return empty telemetry without fake numbers` | `ACCEPTABLE` | Explicit `UNAVAILABLE` measurement assignment when no sensor payload is stored in DB. Zero fake values inserted. |
| `backend/src/services/IntelligenceEngine/IntelligenceEngine.ts:154` | `Math.random().toString(36)` | `ACCEPTABLE` | Unique suffix generation for snapshot ID string (`ANALYSIS-1727375000-x9a2`). Not used for any agricultural telemetry value. |
| `backend/src/services/MockDataService/index.ts` | `MockDataService.getMockTelemetry()` | `ACCEPTABLE` | Unit test fixture module used strictly in `tests/unit/*.test.ts`. Zero calls in production API endpoints or services. |
| `backend/src/server.ts:49` | `MongoDB connection failed` logger message | `ACCEPTABLE` | Error logging when DB connection fails. System returns HTTP 503 rather than claiming data persistence. |
| `frontend/src/components/Navbar.tsx:64` | `SIMULATION MODE` badge indicator | `ACCEPTABLE` | UI badge indicating when user intentionally switches UI view to What-If simulation mode. |
| `frontend/src/context/IoTContext.tsx:53` | `systemMode: "REAL_IOT" \| "SIMULATION"` | `ACCEPTABLE` | Context state managing mode toggle. Defaults strictly to `"REAL_IOT"`. |
| `frontend/src/utils/agronomy.ts:36` | `ICAR Agronomic Guidelines Data` | `ACCEPTABLE` | Peer-reviewed agricultural knowledge base thresholds (ICAR-PAU 2026). |
| `shared/types/telemetry.ts:23` | `dataMode: "REAL" \| "SIMULATION"` | `ACCEPTABLE` | TypeScript interface type definition for telemetry records. |
| `knowledge-base/crops/index.ts` | `CROP_PROFILES` NPK optimal values | `ACCEPTABLE` | Domain knowledge base constants (e.g. Wheat optimal N = 110 ppm, Moisture wilting point = 15%). |

---

## 3. Findings & Certification
- **Prohibited Runtime Synthetic Data**: **0 MATCHES FOUND**.
- **Unexplained Fallback Slugs**: **0 MATCHES FOUND**.
- **Math.random() Usage on Telemetry**: **0 MATCHES FOUND**.

All runtime telemetry paths in `REAL_IOT` mode derive strictly from physical ESP8266 HTTP ingestion payloads (`/api/v1/device/telemetry` or `/api/iot/telemetry`), authenticated external OpenWeatherMap API responses, or stored MongoDB documents. Disconnected or missing telemetry parameters output `UNAVAILABLE` / `null` without synthetic zeroing or numerical masking.
