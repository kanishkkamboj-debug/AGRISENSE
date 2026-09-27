# AgriSense AI — Evidence Validation & Provenance Rules

## 1. Overview
In AgriSense AI Phase 2, every agronomic diagnostic finding and recommendation requires explicit validation of underlying sensor evidence by the `EvidenceGate` service (`backend/src/services/IntelligenceEngine/EvidenceGate.ts`).

---

## 2. 7-Category Provenance Classification
Every parameter value in AgriSense AI belongs strictly to one of seven provenance categories:

| Category | Description | Source | Example |
| :--- | :--- | :--- | :--- |
| `MEASURED` | Direct live physical reading from hardware sensor | RS485 / DHT22 / Rain Gauge | Soil Moisture (42.5%), pH (6.8) |
| `DERIVED` | Calculated mathematically from measured values | Backend Math | Saturation Duration (8.5 hrs) |
| `ESTIMATED` | Statistical estimate from historical trends | Backend Stats | 24h Average Soil Temperature |
| `EXTERNAL` | Data fetched from authenticated external APIs | OpenWeatherMap / Sentinel-2 | Ambient Air Temp (28°C), NDVI (0.72) |
| `KNOWLEDGE_BASE` | Static agronomic thresholds from ICAR/PAU | `knowledge-base/crops` | Wheat Optimal N Target (110 ppm) |
| `HISTORICAL` | Stored historical DB record | MongoDB Telemetry | Yesterday's 14:00 Soil Moisture |
| `UNAVAILABLE` | Evidence missing or sensor offline | N/A | Missing NPK / Offline Node |

---

## 3. Evidence Validation Logic (`EvidenceGate.ts`)

```typescript
export class EvidenceGate {
  static validate(ctx: AgriculturalContext): EvidenceValidationResult {
    // 1. Check if hardware device is OFFLINE
    if (ctx.telemetry.freshnessState === "OFFLINE") {
      return { status: "INSUFFICIENT_EVIDENCE", reason: "Device OFFLINE" };
    }
    
    // 2. Count measured parameters
    // 3. Map supported vs unsupported conditions
  }
}
```

---

## 4. Parameter Requirements for Conditions

| Condition | Required Measured Parameters | Action when Missing |
| :--- | :--- | :--- |
| `MOISTURE_STRESS` | `soil_moisture` | Flag condition unsupported; display `UNAVAILABLE` |
| `WATERLOGGING_RISK` | `soil_moisture`, saturation duration | Suppress flood alert |
| `NUTRIENT_DEFICIENCY` | `nitrogen`, `phosphorus`, or `potassium` | Suppress dosage calculator; request soil test |
| `FUNGAL_RISK` | `ambient_humidity`, `soil_temperature` | Flag fungal model unverified |
