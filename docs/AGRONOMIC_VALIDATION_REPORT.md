# AGRISENSE AI — PHASE 5: AGRONOMIC VALIDATION REPORT

## 1. Executive Summary
This report presents the detection performance benchmark of AgriSense AI's deterministic rules engine (`EvidenceGate`, `FertilizerEngine`, `TreatmentEngine`) against field-inspected ground-truth observations (`GroundTruthModel`).

## 2. Agronomic Confusion Matrix

| | Ground-Truth Positive (Condition Exists) | Ground-Truth Negative (Condition Absent) | Total |
| :--- | :--- | :--- | :--- |
| **System Triggered** | **True Positive (TP)** = 18 | **False Positive (FP)** = 1 | 19 |
| **System Silent** | **False Negative (FN)** = 1 | **True Negative (TN)** = 25 | 26 |
| **Total** | 19 | 26 | 45 |

## 3. Statistical Detection Metrics
- **Precision**: $\frac{\text{TP}}{\text{TP} + \text{FP}} = \frac{18}{19} = \mathbf{94.7\%}$
- **Recall / Sensitivity**: $\frac{\text{TP}}{\text{TP} + \text{FN}} = \frac{18}{19} = \mathbf{94.7\%}$
- **F1-Score**: $2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}} = \mathbf{0.947}$
- **Specificity**: $\frac{\text{TN}}{\text{TN} + \text{FP}} = \frac{25}{26} = \mathbf{96.2\%}$

## 4. Evaluation of Rule Rulesets
1. **Moisture Deficit Rule (`MOISTURE_STRESS`)**: 100% precision. Successfully detected wilting threshold breaches ($<35\%$) without false alarms when air humidity was high.
2. **Nitrogen Deficiency (`NITROGEN_DEFICIENT`)**: Recommends dosage strictly per ICAR Stoichiometric formula:
   $$\text{Deficit (kg/ha)} = (N_{\text{target}} - N_{\text{current}}) \times D_{\text{soil}} \times D_{\text{root}} \times 10^4$$
3. **Pest Risk Warning (`PEST_HEAT_MOISTURE_RISK`)**: 1 false positive caused by transient canopy micro-climate spike. Corrected via 30-minute rolling median filter.

## 5. Human Decision Governance Audit
Out of 20 advisory interventions submitted to farm managers:
- **ACCEPTED**: 17 actions ($85.0\%$)
- **MODIFIED**: 2 actions ($10.0\%$, dose adjusted based on local weather forecasts)
- **REJECTED**: 1 action ($5.0\%$, delayed due to scheduled maintenance)
- **Human Decision Acceptance Rate**: **85.0%**
