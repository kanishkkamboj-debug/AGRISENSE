# AGRISENSE AI — PHASE 5: RESEARCH DATA DICTIONARY

## 1. Overview
This data dictionary documents the exact data fields, types, valid ranges, and provenance metadata across all research entities in AgriSense AI.

## 2. Sensor Calibration Dataset (`datasets/calibration/sensor_calibration_dataset.json`)

| Field Name | Type | Description | Valid Range / Format | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | Unique benchmark record identifier | `CAL-001` .. `CAL-999` | `"CAL-001"` |
| `timestamp` | `String` | ISO 8601 UTC timestamp | Standard ISO string | `"2026-09-25T08:00:00.000Z"` |
| `sensor` | `String` | Monitored physical parameter key | `soilMoisture`, `soilTemp`, `soilPh`, `nitrogen`, `phosphorus`, `potassium` | `"soilMoisture"` |
| `sensorValue` | `Number` | Uncalibrated / raw sensor reading | Parameter dependent | `32.8` |
| `referenceValue` | `Number` | Laboratory reference standard | Parameter dependent | `32.5` |
| `unit` | `String` | Measurement unit | `%`, `°C`, `pH`, `mg/kg` | `"%" |
| `referenceMethod`| `String` | Standardized laboratory protocol | Text description | `"Gravimetric Oven-Dry (ISO 11465)"` |
| `provenance` | `String` | Data provenance mode | `MEASURED`, `CALIBRATED` | `"CALIBRATED"` |
| `quality` | `String` | Sensor signal quality classification | `VALID`, `CALIBRATED`, `INVALID` | `"CALIBRATED"` |

## 3. Ground Truth Event Observations (`GroundTruthModel`)

| Field Name | Type | Description | Valid Range / Format | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `eventId` | `String` | Unique ground truth event identifier | `GT-001` .. `GT-999` | `"GT-001"` |
| `fieldId` | `String` | Associated field entity ID | Valid ObjectId / string | `"field-alpha-01"` |
| `observedCondition`| `String` | Confirmed physical condition | `MOISTURE_STRESS`, `NITROGEN_DEFICIENT`, `NORMAL` | `"MOISTURE_STRESS"` |
| `severity` | `String` | Inspected severity level | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | `"HIGH"` |
| `inspector` | `String` | Agronomist name / credentials | Text | `"Dr. R. Sharma (Agronomist)"` |
| `timestamp` | `Date` | Inspection timestamp | BSON Date | `2026-09-25T08:30:00.000Z` |

## 4. Human Decision Governance Records (`HumanReviewModel`)

| Field Name | Type | Description | Valid Range / Format | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| `reviewId` | `String` | Unique review tracking ID | `REV-001` .. `REV-999` | `"REV-001"` |
| `actionId` | `String` | Triggered agronomic action ID | `ACT-001` .. `ACT-999` | `"ACT-101"` |
| `reviewer` | `String` | Farm manager name | Text | `"Farm Manager Baseline"` |
| `decision` | `String` | Governance decision enum | `ACCEPTED`, `MODIFIED`, `REJECTED`, `DEFERRED` | `"ACCEPTED"` |
| `overrideNotes` | `String` | Reason for modification/rejection | Text or optional | `"Approved for immediate execution"` |
| `timestamp` | `Date` | Review submission timestamp | BSON Date | `2026-09-25T08:35:00.000Z` |

## 5. Decision Lineage Integrity State
- **`SUFFICIENT`**: Telemetry dataset complete and valid for agronomic engine decision.
- **`PARTIAL`**: Non-critical inputs missing (e.g. ambient pressure); default agronomic rules active.
- **`INSUFFICIENT`**: Critical sensor inputs missing or `INVALID`; decision generation gated.
