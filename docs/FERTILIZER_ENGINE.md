# AgriSense AI — Fertilizer Engine Specification & Stoichiometry Model

## 1. Overview
The `FertilizerEngine` (`backend/src/services/IntelligenceEngine/FertilizerEngine.ts`) computes precise NPK nutrient deficits and calculates total product dosage (kg Urea, SSP, MOP) based on exact field acreage from GIS geometry.

---

## 2. Evidence Requirement
- **Hard Prerequisite**: Requires valid live sensor measurements for `nitrogen`, `phosphorus`, or `potassium`.
- **Missing Sensor Behavior**: If NPK sensor readings are unavailable or null, the engine returns:
  ```json
  {
    "hasSufficientEvidence": false,
    "recommendation": null,
    "reason": "INSUFFICIENT EVIDENCE: NPK sensor measurements are unavailable. Soil test or sensor telemetry required before prescribing fertilizer rates."
  }
  ```

---

## 3. Mathematical Formulae

1. **Nutrient Deficit ($\text{PPM}$)**:
   $$\Delta N = \max(0, N_{\text{optimal}} - N_{\text{measured}})$$

2. **Per-Hectare Urea Application ($\text{kg}$)**:
   $$\text{Urea Weight (kg)} = \Delta N \times \text{Field Area (Ha)} \times 0.45$$

3. **Field Area Guard**:
   If field acreage is missing or zero, the engine outputs explicit notice:
   `FIELD AREA MISSING: Per-hectare rate unavailable. Enter valid field acreage to compute total product weight.`

---

## 4. Output Recommendation Schema
- **Condition**: `NUTRIENT_DEFICIENCY`
- **Priority**: `HIGH` if $\Delta N > 25\text{ ppm}$, otherwise `MEDIUM`.
- **Action Type**: `"NUTRIENT"`
- **Do-Not Rules**: "Do not apply Nitrogen when soil is waterlogged or prior to heavy rain."
