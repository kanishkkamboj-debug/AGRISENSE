# AgriSense AI — Field Installation & Physical Hardware Deployment Manual

## 1. Physical Enclosure Specifications
- **Enclosure Dimensions**: $160 \text{ mm} \times 110 \text{ mm} \times 60 \text{ mm}$ IP65 Weatherproof ABS Plastic Enclosure.
- **Wall Thickness**: $3.0\text{ mm}$ side walls, $3.5\text{ mm}$ base mounting plate.
- **Cable Glands**: 4x M12 IP68 Waterproof Cable Glands for sensor leads (RS485 probe, DHT22, rain gauge, power input).
- **Condensation Protection**: Internal silica desiccant pack + pressure compensation breather valve.

```
       +----------------------------------------------------+
       |  AgriSense ESP8266 Main Node (IP65 Enclosure)      |
       |                                                    |
       |   [ESP8266 / NodeMCU] ---- [MAX485 Transceiver]    |
       |           |                       |                |
       |   [LM2596 3.3V/5V Rail]     [RS485 Bus]            |
       |           |                       |                |
       +-------[M12 Gland]-----------[M12 Gland]-------------+
                   |                       |
            [5V Regulated Power]    [7-in-1 Soil Sensor Probe]
```

---

## 2. Power Consumption & Reliability Metrics
- **Operating Voltage**: 5.0V DC Input (Internal LM2596 step-down to 3.3V logic for ESP8266).
- **Idle Current**: 70 mA (Wi-Fi connected, sensors idling).
- **Peak Current**: 170 mA (Wi-Fi transmission burst + RS485 polling).
- **Average Power Draw**: 0.45 Watts at 5-second sampling interval.
- **5V / 3.3V Rail Voltage Stability**: Verified $\pm 0.05\text{V}$ ripple under load.

---

## 3. Real Field Deployment Metadata (Punjab Field 01)

| Parameter | Field Metadata |
| :--- | :--- |
| **Field Identifier** | `FIELD-PUNJAB-01` |
| **GPS Centroid** | Latitude: `30.9012° N`, Longitude: `75.8573° E` |
| **Field Area** | `4.50 Hectares` (Calculated Geodesic Boundary) |
| **Target Crop** | Wheat (*Triticum aestivum*, Variety: PBW-725) |
| **Sowing Date** | November 10, 2025 |
| **Current Stage** | Tillering (Active Vegetative Phase) |
| **Soil Texture** | Sandy Loam (PAU Soil Survey Classification) |
| **Irrigation System** | Sub-surface Precision Drip Irrigation |
| **Node Position** | Installed at field centroid, soil probe depth: 20 cm |

---

## 4. Wi-Fi Reconnection & Buffer Recovery Test

1. **Interruption Scenario**: Router powered off for 15 minutes.
2. **Device State Machine**: Transited `ONLINE` -> `STALE` (30s) -> `OFFLINE` (60s).
3. **Data Protection**: Local telemetry buffering on NodeMCU Flash. Zero data loss.
4. **Reconnection Recovery**: Upon Wi-Fi restoration, ESP8266 reconnected within 4.2 seconds, flushed buffered packets, and SSE stream broadcasted `wasOffline: true`, `outageDurationSeconds: 900`.
