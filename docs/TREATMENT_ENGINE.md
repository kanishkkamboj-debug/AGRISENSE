# AgriSense AI — Treatment & Pathogen Risk Engine Specification

## 1. Overview
The `TreatmentEngine` (`backend/src/services/IntelligenceEngine/TreatmentEngine.ts`) evaluates environmental telemetry (temperature, relative humidity) to assess spore germination risks for fungal and pest pathogens.

---

## 2. Risk Detection vs. Confirmed Disease
The engine strictly distinguishes between **environmental risk** (`RISK_DETECTED`) and **physically confirmed disease** (`CONFIRMED_DISEASE`).

- **Environmental Risk (`RISK_DETECTED`)**:
  - Rule: Relative humidity $\ge 78\%$ AND temperature between $18^\circ\text{C}$ and $28^\circ\text{C}$.
  - Action: Alert farmer to perform **physical field scouting**.
  - Caution / Do-Not: "Do not apply synthetic fungicides without physical symptom confirmation during field scouting."

---

## 3. Extension Citations & Safety
Every treatment advisory includes authoritative extension citations:
- **Source**: ICAR Integrated Pest & Disease Management Extension Guide 2026.
- **Reference**: `https://icar.org.in/crop-protection-guidelines`
- **Approved Chemical Option**: Tebuconazole 50% + Trifloxystrobin 25% WG (consult label for application rate).
