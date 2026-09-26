# AgriSense AI — Hardware Test Procedure & Verification Log (HARDWARE_TEST_PROCEDURE.md)

## End-to-End ESP8266 Hardware Test Chain

```text
ESP8266 Microcontroller
      ↓ (Wi-Fi)
POST http://10.15.11.228:5000/api/iot/telemetry
      ↓
deviceAuth middleware
      ↓
TelemetryController.ingestTelemetry
      ↓
DataFreshnessService (freshnessState: LIVE)
      ↓
MongoDB TelemetryModel.save()
      ↓
DeviceConnectivityService (status: ONLINE)
      ↓
SSE Broadcast (/api/v1/public/telemetry/stream)
      ↓
React IoTContext
      ↓
Dashboard & Intelligence UI Re-render
```

## Step-by-Step Test Procedure

### Test 1: Device Connection & Real Telemetry Ingestion
1. Power on ESP8266 microcontroller connected to Wi-Fi.
2. ESP8266 transmits telemetry packet via `POST /api/iot/telemetry`.
3. Verify backend receives status 200 with acknowledgement `ackId`.
4. Check MongoDB `telemetry` collection for new record.
5. Verify React frontend `IoTContext` receives SSE update.
6. Verify Dashboard displays `1 LIVE NODE`, `LIVE` state badge, and actual sensor numbers.

### Test 2: Hardware Disconnection (Offline Test)
1. Disconnect ESP8266 hardware or disable Wi-Fi interface.
2. Wait 30 seconds for `STALE` status; wait 120 seconds for `OFFLINE` status.
3. Verify backend `DeviceConnectivityService` transitions device status to `OFFLINE`.
4. Verify backend emits `DEVICE_STATUS_CHANGE` event via SSE.
5. Verify frontend displays persistent `OfflineBanner`.
6. Verify sensor cards change output to `UNAVAILABLE` and SHI output shows `UNAVAILABLE`.

### Test 3: Hardware Reconnection Test
1. Re-power ESP8266 hardware.
2. ESP8266 sends new telemetry packet.
3. Verify backend logs `DEVICE_RECONNECTED` event with calculated outage duration in seconds.
4. Verify SSE broadcasts `DEVICE_RECONNECTED` notification.
5. Verify frontend displays success toast notification and restores `LIVE` telemetry cards.

### Test 4: Partial Sensor Failure Test
1. Send telemetry packet containing `soil_moisture` and `soil_temperature`, but omitting `nitrogen`, `phosphorus`, `potassium`, `soil_ph`.
2. Verify frontend displays `LIVE` for moisture and temperature.
3. Verify `nitrogen`, `phosphorus`, `potassium`, `soil_ph` output `UNAVAILABLE`.
4. Verify SHI outputs `UNAVAILABLE` and explicitly lists missing parameters (`pH`, `N`, `P`, `K`).

