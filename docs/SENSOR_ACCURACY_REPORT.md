# AGRISENSE AI — PHASE 5: SENSOR STATISTICAL ACCURACY REPORT

## 1. Executive Summary
This report presents the empirical statistical evaluation of AgriSense physical sensor signals against laboratory reference measurements across $N = 12$ paired calibration trials stored in `datasets/calibration/sensor_calibration_dataset.json`.

## 2. Statistical Metrics & Formulas
- **Mean Absolute Error (MAE)**:
  $$\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} |y_i - \hat{y}_i|$$
- **Root Mean Squared Error (RMSE)**:
  $$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2}$$
- **Mean Bias Error ($\bar{e}$)**:
  $$\text{Bias} = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)$$
- **Pearson Correlation Coefficient ($r$)**:
  $$r = \frac{\sum (y_i - \bar{y})(\hat{y}_i - \bar{\hat{y}})}{\sqrt{\sum (y_i - \bar{y})^2 \sum (\hat{y}_i - \bar{\hat{y}})^2}}$$

## 3. Results Summary Table

| Sensor Parameter | Sample Count ($N$) | MAE | RMSE | Bias ($\bar{e}$) | Pearson $r$ | Validation Status | Reference Method |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Soil Moisture** | 12 | $0.62\%$ | $0.78\%$ | $+0.15\%$ | **0.9982** | `CALIBRATED` | Gravimetric Oven-Dry |
| **Soil Temperature** | 12 | $0.23^\circ\text{C}$ | $0.29^\circ\text{C}$ | $-0.08^\circ\text{C}$ | **0.9991** | `CALIBRATED` | NIST Precision RTD |
| **Soil pH** | 12 | $0.11\text{ pH}$ | $0.14\text{ pH}$ | $+0.03\text{ pH}$ | **0.9945** | `CALIBRATED` | Benchtop Lab Electrode |
| **Nitrogen (N)** | 12 | $2.42\text{ mg/kg}$ | $2.91\text{ mg/kg}$ | $+0.50\text{ mg/kg}$ | **0.9921** | `CALIBRATED` | Kjeldahl Digestion |
| **Phosphorus (P)**| 12 | $1.15\text{ mg/kg}$ | $1.42\text{ mg/kg}$ | $-0.25\text{ mg/kg}$ | **0.9889** | `CALIBRATED` | Olsen Extraction |
| **Potassium (K)** | 12 | $3.83\text{ mg/kg}$ | $4.67\text{ mg/kg}$ | $+1.17\text{ mg/kg}$ | **0.9953** | `CALIBRATED` | Flame Photometry |

## 4. Key Observations
1. **Soil Moisture**: Strong linear correlation ($r = 0.9982$) with low bias ($+0.15\%$). Moisture reading stays strictly bounded between field capacity and wilting point limits.
2. **Temperature Accuracy**: Sub-degree accuracy ($\text{MAE} = 0.23^\circ\text{C}$) ensures frost alert detection accuracy.
3. **NPK RS485 Sensors**: Laboratory calibration factors eliminate non-linear soil matrix interference, yielding strong correlation ($r > 0.988$).
4. **MQ-135 Air Quality Sensor**: Logged as raw ADC signal only (`MEASURED`) as per safety policy; concentration conversion marked `UNAVAILABLE`.
