# AgriSense AI — Deterministic Agronomic Rules Engine Specification

## 1. Overview
The AgriSense AI Agronomic Engine operates deterministically prior to LLM explanation. Rules are derived from **ICAR (Indian Council of Agricultural Research)** and **PAU (Punjab Agricultural University)** extension guidelines.

---

## 2. Core Rule Modules

### Module 1: DisasterEngine (`DisasterEngine.ts`)
- **Waterlogging Risk**:
  - Rule: `soil_moisture > 80%` for $\ge 12\text{ hours}$ continuous or `saturationDurationHours >= 12`.
  - Priority: `HIGH`.
  - Verification: Soil moisture decrease within 360 minutes after drainage action.
- **Flood Risk**:
  - Rule: `recentRainfallMm24h > 100mm` or forecast rainfall $> 150\text{mm}$.
  - Priority: `URGENT` / `CRITICAL`.

### Module 2: SoilAnalyzer (`SoilAnalyzer.ts`)
- **Soil Moisture Stress**:
  - Rule: `soil_moisture < stressThreshold` (e.g. $< 35\%$ for Wheat).
  - Priority: `HIGH`.
  - Prescribed Action: Initiate precision drip/sprinkler cycle.
- **pH Anomaly**:
  - Rule: `soil_ph < phRange.min` (Acidic) or `soil_ph > phRange.max` (Alkaline).
  - Priority: `MEDIUM`.
  - Prescribed Action: Apply agricultural lime (acidic) or gypsum (alkaline).

### Module 3: FertilizerEngine (`FertilizerEngine.ts`)
- **Stoichiometry Calculation**:
  $$\text{Deficit (ppm)} = \max(0, \text{Target (ppm)} - \text{Measured (ppm)})$$
- **Urea Application Rate**:
  $$\text{Urea (kg)} = \text{N Deficit} \times \text{Field Area (Ha)} \times 0.45$$
- **Rule**: Suppressed completely if NPK sensor measurements are missing.

### Module 4: TreatmentEngine (`TreatmentEngine.ts`)
- **Pathogen Germination Risk**:
  - Rule: `ambient_humidity >= 78%` AND `temp` between $18^\circ\text{C}$ and $28^\circ\text{C}$.
  - Status: `RISK_DETECTED`.
  - Prescribed Action: Perform physical scouting for Yellow Rust / Blight. Chemical treatment strictly requires physical confirmation.
