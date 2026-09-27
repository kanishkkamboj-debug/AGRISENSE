# AgriSense AI — Release Baseline v1.0.0 (Production Freeze)

## 1. Overview & Freeze Declaration
This document defines the official production release baseline `v1.0.0-production-baseline`. All code, database schemas, and agronomic logic documented herein are frozen for field deployment testing.

---

## 2. Release Baseline Specifications

| Component | Version / Identifier | Description |
| :--- | :--- | :--- |
| **System Version** | `v1.0.0` | AgriSense AI Precision Agriculture IoT Platform |
| **Release Tag** | `AgriSense-AI-v1.0.0-Production-Baseline` | Production release frozen baseline tag |
| **ESP8266 Firmware** | `v2.1.0-esp8266` | C++ Arduino ESP8266 HTTP Ingestion Client |
| **Backend Engine** | `v1.0.0` | Node.js / Express / TypeScript Deterministic Agronomic Engine |
| **Frontend UI** | `v1.0.0` | React / TypeScript / Vite / Tailwind / Leaflet GIS Map |
| **Shared Protocol** | `@agrisense/shared@1.0.0` | Common agricultural types, schemas, and evidence models |
| **Database Schema** | MongoDB Schema `v1.0` | Collections: `Telemetry`, `Device`, `Field`, `ContextSnapshot`, `ActionTracker`, `CropCycle` |

---

## 3. Hardware Controller & Physical Sensor Specifications

- **Microcontroller**: ESP8266 / NodeMCU ESP-12E (80 MHz, 4MB Flash)
- **Soil Sensor**: RS485 Modbus RTU 7-in-1 Soil Multi-Parameter Probe (NPK, Soil Moisture, Temp, pH)
- **Ambient Sensor**: DHT22 Digital Temperature & Relative Humidity Sensor
- **Rain Sensor**: Tipping Bucket Pulse Rain Gauge (0.2mm per tip)
- **Gas Sensor**: MQ-135 Gas Sensor (Raw ADC signal input)
- **Power Supply**: 5V/2A Regulated DC Power Supply with LM2596 Buck Converter (3.3V rail for ESP8266)

---

## 4. System Stability Guarantee
- Zero mock telemetry pathways in `REAL_IOT` mode.
- 44/44 Jest unit tests passing across 14 test suites.
- 0 TypeScript typecheck errors across shared, backend, and frontend workspaces.
