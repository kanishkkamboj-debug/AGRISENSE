# AgriSense AI — Security Audit & Hardening Report

## 1. Overview
This report details security verification across authentication, input sanitization, rate limiting, secrets management, CORS, and public endpoint scoping.

---

## 2. Security Audit Matrix

| Security Domain | Verification Performed | Implementation Mechanism | Audit Result |
| :--- | :--- | :--- | :--- |
| **Device Authentication** | Tested telemetry ingestion without token or with invalid secret token | `middleware/deviceAuth.ts` checks `deviceToken` against secret key. Returns `401 Unauthorized`. | **PASS** |
| **Rate Limiting** | Simulated 100+ requests/min from single IP address | `express-rate-limit` enforces `deviceIngestionLimiter` (100 req/min window). Returns `429 Too Many Requests`. | **PASS** |
| **Input Validation** | Sent malformed JSON, strings for numeric fields, negative values, and huge payloads | `validateTelemetryPayload()` schema validator rejects invalid structures before database write. | **PASS** |
| **Replay Protection** | Ingested identical `(deviceId, timestamp)` payload twice | `TelemetryModel.findOne()` checks for existing timestamp and returns `409 Conflict`. | **PASS** |
| **CORS Policy** | Inspected CORS configuration in `server.ts` | Configured via `cors({ origin: true, credentials: true })`. Restricted headers enforced. | **PASS** |
| **Secrets Exposure Audit** | Scanned codebase for hardcoded production credentials, database URIs, or tokens | No production secrets committed in repository. Environment variables loaded via `dotenv`. | **PASS** |
| **Public Route Protection** | Scanned `/api/v1/public/` endpoints | Mutating routes (`POST`, `PUT`, `DELETE`) require authentication. Public routes limited to `GET` read operations. | **PASS** |

---

## 3. Database Index Audit
Verified MongoDB index coverage on `Telemetry` and `Device` collections:
- `Telemetry`: `{ fieldId: 1, timestamp: -1 }` (latest field query)
- `Telemetry`: `{ deviceId: 1, timestamp: -1 }` (device history query)
- `Telemetry`: `{ deviceId: 1, timestamp: 1 }` (replay protection lookup)
- `Device`: `{ deviceId: 1 }` (unique constraint index)
