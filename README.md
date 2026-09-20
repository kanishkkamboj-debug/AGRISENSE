# 🌾 AgriSense IoT — Agricultural Intelligence & Closed-Loop Decision Platform

AgriSense IoT is an end-to-end, IoT-first agricultural platform where ground-level sensor telemetry (ingested via Raspberry Pi 5 edge gateways) serves as the primary evidence layer. Enriched by Leaflet GIS spatial geometry, satellite remote sensing, 20 crop intelligence profiles, and historical analytics, the system resolves agricultural conditions and delivers actionable farmer advisories with closed-loop verification.

## 🏗️ Architecture & Data Flow

```text
REAL WORLD SENSORS (Raspberry Pi 5)
   ↓
Sensor Drivers (RS485 / Modbus / BLE / I2C / SPI / ADC)
   ↓
SQLite Buffer (Offline-first storage)
   ↓
Device Ingestion API (Authenticated POST /api/v1/device/*)
   ↓
MongoDB Database
   ↓
ContextBuilder (Single source of synchronized context)
   ↓
Intelligence Engine (Multi-Analyzer Evaluation)
   ↓
AnalysisResult (Structured evidence-first diagnosis)
   ↓
Farmer Advisory Engine (Action Plan: Today, 24h, 3d, 7d)
   ↓
Gemini AI Explanation Layer (Natural Language Explainer)
   ↓
Public React Web UI (Unauthenticated GET /api/v1/public/*)
   ↓
Closed-Loop Verification Engine (Telemetry tracking)
```

## 🔒 Mandatory System Guardrails

* **IoT Telemetry is Ground Truth:** Sensor readings are never fabricated. Missing hardware renders `"No sensor data"`.
* **ContextBuilder:** No analyzer queries MongoDB directly; all analyzers consume `AgriculturalContext`.
* **Traceable Evidence:** Diagnoses expose parameters, values, units, sources, timestamps, and quality flags.
* **Chemical Safety Gate:** Pesticide prescriptions require IPM evaluation, action thresholds, and label validation (`CHEMICAL_RECOMMENDATION_BLOCKED` otherwise).
* **Gemini NLE Role:** Gemini translates structured `AnalysisResult` JSON into farmer prose; it never determines raw diagnoses or numbers.
* **Public Dashboard:** Web UI requires zero login/auth; ingestion API is strictly authenticated per device.

## 📁 Repository Structure

* `shared/` — Common schemas, TypeScript types, and canonical constants.
* `knowledge-base/` — 20-crop profiles and versioned agronomic rules (PAU, ICAR, FAO).
* `backend/` — Node.js + Express + TypeScript API server & multi-analyzer engines.
* `frontend/` — React + TypeScript + Vite web intelligence application.
* `pi-agent/` — Python edge software running on Raspberry Pi 5.
* `tests/` — Unit, integration, and E2E verification suites.
