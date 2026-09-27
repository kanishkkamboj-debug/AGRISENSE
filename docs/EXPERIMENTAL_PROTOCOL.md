# AGRISENSE AI — PHASE 5: EXPERIMENTAL VALIDATION PROTOCOL

## 1. Objective
This document outlines the multi-trial controlled experimental protocol designed to evaluate the physical accuracy, agronomic event detection performance, and resource efficiency of the **AgriSense AI** decision-support system.

## 2. Experimental Design
The validation protocol employs paired reference testing across five distinct agricultural environmental micro-zones (A1 through A5).

### 2.1 Environmental Micro-Zones
- **Zone A1**: Loam soil, drip irrigation, high NPK supplementation.
- **Zone A2**: Clay-loam soil, sprinkler irrigation, balanced NPK.
- **Zone A3**: Sandy-loam soil, deficit irrigation, low nitrogen.
- **Zone A4**: Silt-loam soil, sub-surface drip, controlled salinity.
- **Zone A5**: Saline-clay soil, rainfed baseline.

### 2.2 Ground-Truth Calibration Benchmarks
Reference laboratory instruments utilized for ground-truth paired measurement:
- **Soil Moisture**: Gravimetric oven-drying method ($105^\circ\text{C}$ for 24h, ISO 11465).
- **Soil Temperature**: NIST-traceable calibrated precision RTD probe ($\pm 0.05^\circ\text{C}$).
- **Soil pH**: Laboratory glass electrode benchtop pH meter (pH 4.01/7.00/10.01 3-point calibration).
- **Nitrogen / Phosphorus / Potassium**: Standard Kjeldahl digestion (N), Olsen extraction (P), and Flame Photometry (K).

## 3. Data Collection Procedure
1. **Physical Sampling Frequency**: Physical sensors log telemetry every 15 minutes.
2. **Paired Reference Samples**: Manual reference measurements are conducted at matching timestamps ($T_0 \pm 2\text{ min}$) twice daily (08:00 and 16:00 UTC).
3. **Data Logging Integrity**: Telemetry payloads are tagged with `provenance: "MEASURED"` and quality status `VALID` or `CALIBRATED`. Synthetic telemetry is strictly rejected.

## 4. Evaluation Metrics
- **Statistical Sensor Error**: MAE, RMSE, Bias ($\bar{e}$), Pearson correlation ($r$).
- **Agronomic Stress Detection**: Confusion Matrix (TP, TN, FP, FN), Precision, Recall, F1-Score, Specificity.
- **Closed-Loop Action Verification**: Ratio of executed actions reaching target restoration (`TARGET_RANGE_RESTORED`).
- **Resource Productivity**: Water Productivity ($\text{kg harvest / m}^3$ water applied) and Fertilizer Use Efficiency ($\text{kg harvest / kg NPK}$).
