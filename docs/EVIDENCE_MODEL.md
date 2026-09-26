# AgriSense AI — Central Evidence & Provenance Model (EVIDENCE_MODEL.md)

## Overview
Every data point displayed in AgriSense AI must carry explicit data provenance and freshness metadata.

## Provenance Types (`DataProvenance`)
1. `MEASURED`: Received directly from physical hardware sensors (ESP8266 Modbus RS485).
2. `DERIVED`: Mathematically calculated from measured data.
3. `ESTIMATED`: Produced by an agronomic estimation model.
4. `EXTERNAL`: Received from an authenticated external API (e.g. Weather, Geocoding).
5. `KNOWLEDGE_BASE`: Static agronomic reference information (e.g., 20-crop requirements).
6. `HISTORICAL`: Previously measured data, timestamped with age.
7. `UNAVAILABLE`: Required data does not exist or hardware is offline.

## Freshness States (`FreshnessState`)
- `LIVE`: Data age < 30 seconds.
- `RECENT`: Data age 30s to 120s.
- `STALE`: Data age 120s to 300s.
- `OFFLINE`: Data age > 300s or hardware disconnected.
- `NEVER_CONNECTED`: No telemetry packet ever received for the device.

## Evidence State Utility (`getEvidenceState`)
```typescript
export interface EvidenceState {
  displayValue: string;
  provenance: DataProvenance;
  freshness: FreshnessState;
  isAvailable: boolean;
  label: string;
  sourceText: string;
  qualityText: string;
}

export function getEvidenceState(
  value: number | null | undefined,
  unit: string,
  timestamp: string | undefined,
  provenance: DataProvenance,
  deviceStatus: string
): EvidenceState;
```

## Evidence Gate Rules
Before executing any agronomic risk diagnosis or AI advisory:
- **Waterlogging Risk**: Requires `soil_moisture` + `rainfall` or saturation history.
- **Moisture Stress / Drought**: Requires `soil_moisture` reading.
- **Nutrient Deficiency**: Requires `nitrogen`, `phosphorus`, or `potassium` measurements.
- **Fungal Disease Risk**: Requires `soil_temperature` or `ambient_temperature` + `ambient_humidity`.

If evidence is missing, system outputs `INSUFFICIENT_EVIDENCE` and states what data is required.
