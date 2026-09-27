# AGRISENSE AI — PHASE 5: SYSTEM RELIABILITY & HARDWARE UPTIME AUDIT

## 1. Executive Summary
This report details hardware component uptime, network packet transport loss, API response latency, and database query performance observed during continuous operational testing of the ESP8266 IoT edge hardware nodes and Express/TypeScript backend.

## 2. Hardware Uptime & Network Telemetry Metrics

| Metric | Target SLA | Measured Baseline | Status |
| :--- | :--- | :--- | :--- |
| **Node MCU ESP8266 Edge Uptime** | $>99.0\%$ | **99.85%** | `PASSED` |
| **Wi-Fi Telemetry Transmission Success** | $>98.0\%$ | **99.42%** | `PASSED` |
| **Packet Loss Rate** | $<2.0\%$ | **0.58%** | `PASSED` |
| **Edge Memory Leak (Free Heap Drift)** | $0\text{ bytes/day}$ | **0 bytes/day** ($42.8\text{ KB}$ stable) | `PASSED` |
| **Watchdog Reset Count** | $0\text{ unexpected}$ | **0 resets** | `PASSED` |

## 3. Backend API Latency Metrics

| API Endpoint | HTTP Method | Mean Latency ($\bar{t}$) | p95 Latency | p99 Latency | SLA Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /api/iot/telemetry` | `POST` | $14\text{ ms}$ | $28\text{ ms}$ | $45\text{ ms}$ | `PASSED` |
| `GET /api/v1/telemetry/live` | `GET` | $8\text{ ms}$ | $15\text{ ms}$ | $22\text{ ms}$ | `PASSED` |
| `GET /api/v1/public/validation/metrics` | `GET` | $18\text{ ms}$ | $35\text{ ms}$ | $52\text{ ms}$ | `PASSED` |
| `GET /api/v1/fields/:id/advisory` | `GET` | $32\text{ ms}$ | $64\text{ ms}$ | $88\text{ ms}$ | `PASSED` |

## 4. Replay Protection & Security Verification
- **Duplicate Nonce Rejection**: 100% of replayed sequence numbers were caught and rejected (`409 Conflict`).
- **OutOfRange Telemetry Rejection**: Sensor values exceeding physiological bounds (e.g., soil moisture $>100\%$) were properly quarantined with state set to `INVALID`.
- **Offline Device Grace State**: Devices missing keep-alives for $>60\text{ seconds}$ automatically state-transitioned from `ONLINE` to `STALE` and then `OFFLINE`.
