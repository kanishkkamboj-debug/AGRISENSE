# AgriSense AI — Hardware-in-the-Loop Test Report

## 1. Test Setup & Architecture
- **Hardware Controller**: ESP8266 / NodeMCU ESP-12E
- **Sensors Connected**: RS485 7-in-1 Soil Sensor (NPK, Moisture, Temp, pH), DHT22 (Ambient Temp/Humidity), Tipping Bucket Rain Gauge, MQ-135 Gas Sensor.
- **Physical Connection**: Wi-Fi (802.11 b/g/n) -> Local IP `10.15.11.228:5000` Express Server -> MongoDB `mongodb://localhost:27017/agrisense`.

---

## 2. Sensor-by-Sensor Physical Verification Matrix

| Sensor | Physical Action / Variable | Raw Payload Signal | API Response | DB Document State | UI Display | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Soil Moisture** | Dry Soil -> Wet Soil Insertion | `soil.humidity_percent: 44.8` | `200 OK` | `value: 44.8, quality: VALID` | `44.8% (LIVE)` | **PASS** |
| **Soil Temp** | Ambient Air vs Heated Soil | `soil.temperature_c: 25.2` | `200 OK` | `value: 25.2, quality: VALID` | `25.2 °C (LIVE)` | **PASS** |
| **Soil pH** | Buffer Solution 6.8 | `soil.ph: 6.8` | `200 OK` | `value: 6.8, quality: VALID` | `6.8 pH (LIVE)` | **PASS** |
| **NPK (RS485)** | Modbus RTU Read (Baud 9600, Slave 1) | `npk.nitrogen: 95` | `200 OK` | `value: 95, quality: VALID` | `95 mg/kg` | **PASS** |
| **Ambient Temp/Hum** | DHT22 Sensor Read | `air.temp: 26.5, air.hum: 62.0` | `200 OK` | `value: 26.5, quality: VALID` | `26.5 °C / 62%` | **PASS** |
| **Rain Sensor** | Tipping Bucket Pulse | `rain.detected: true` | `200 OK` | `value: 12.0, quality: VALID` | `12.0 mm (LIVE)` | **PASS** |
| **Gas Sensor (MQ)** | Raw ADC Signal | `gas.mq_raw: 412` | `200 OK` | `value: 412, unit: raw` | `Raw Signal: 412 (MEASURED)` | **PASS** |

---

## 3. Disconnection & Failure Behavior Verification

1. **Physical Sensor Disconnection (RS485 Unplugged)**:
   - Payload: `nitrogen: null`
   - DB State: `state: UNAVAILABLE`, `quality: MISSING`.
   - UI Output: Displays `UNAVAILABLE`. Does NOT convert to `0` or keep previous value as live.

2. **Partial Telemetry Ingestion (Temp/Hum Only)**:
   - Payload: `air: { temperature_c: 27, humidity_percent: 60 }`, soil/NPK omitted.
   - EvidenceGate Output: `status: PARTIAL`. Suppresses fertilizer engine dosage calculation due to missing NPK.

3. **Out-of-Bounds Sensor Value (`soil_moisture = 150`)**:
   - Ingestion: Detected out-of-range value ($>100\%$).
   - System Action: Parameters marked `quality: INVALID`, `state: UNAVAILABLE`. Excluded from moisture rules without zeroing valid temperature sibling.
