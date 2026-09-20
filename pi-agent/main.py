import os
import sys
import time
import json
import datetime
from src.drivers.modbus_rs485 import ModbusRS485Driver
from src.storage.sqlite_buffer import SQLiteBuffer
from src.sync.transport_manager import TransportManager
from src.health.device_health import DeviceHealthCollector

def load_config():
    config_path = os.path.join(os.path.dirname(__file__), "config", "config.json")
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return json.load(f)
    return {
        "deviceId": "PI5-FIELD-001",
        "fieldId": "FIELD-PUNJAB-01",
        "deviceToken": "agrisense_device_secret_token_key_2026",
        "cloudApiUrl": "http://localhost:5000/api/v1/device",
        "pollIntervalSeconds": 2,
        "syncIntervalSeconds": 5,
        "heartbeatIntervalSeconds": 15,
        "sqliteDbPath": "pi_telemetry_buffer.db"
    }

def main():
    print("🌾 Starting AgriSense IoT — Raspberry Pi 5 Gateway Agent")
    config = load_config()

    device_id = config["deviceId"]
    field_id = config["fieldId"]
    device_token = config["deviceToken"]
    cloud_url = config["cloudApiUrl"]

    buffer_db = SQLiteBuffer(config.get("sqliteDbPath", "pi_telemetry_buffer.db"))
    transport = TransportManager(cloud_url, device_id, device_token)
    health_collector = DeviceHealthCollector(device_id)

    # Instantiate configured sensor drivers
    drivers = [
        ModbusRS485Driver({"id": "MODBUS-SOIL-01", "parameter": "soil_moisture", "unit": "%", "slaveId": 1, "scaleFactor": 0.1}),
        ModbusRS485Driver({"id": "MODBUS-TEMP-01", "parameter": "soil_temperature", "unit": "°C", "slaveId": 1, "scaleFactor": 0.1}),
        ModbusRS485Driver({"id": "MODBUS-PH-01", "parameter": "soil_ph", "unit": "pH", "slaveId": 1, "scaleFactor": 0.01}),
    ]

    last_sync = 0
    last_heartbeat = 0

    while True:
        try:
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

            # 1. Read hardware telemetry
            measurements = {}
            for d in drivers:
                val = d.read_value()
                measurements[d.parameter] = {
                    "value": val,
                    "unit": d.unit,
                    "state": "MEASURED" if val is not None else "UNAVAILABLE",
                    "quality": "VALID" if val is not None else "MISSING"
                }

            # 2. Strict Zero-Fabrication Rule: Unconnected NPK sensors marked explicitly UNAVAILABLE
            for nutrient in ["nitrogen", "phosphorus", "potassium"]:
                if nutrient not in measurements:
                    measurements[nutrient] = {
                        "value": None,
                        "unit": "mg/kg",
                        "state": "UNAVAILABLE",
                        "quality": "MISSING"
                    }

            # 3. Buffer to SQLite
            rec_id = buffer_db.save_telemetry(device_id, field_id, now_iso, measurements)
            print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Saved telemetry locally (Buffer ID: {rec_id[:8]})")

            # 4. Sync pending records to Cloud API
            current_time = time.time()
            if current_time - last_sync >= config.get("syncIntervalSeconds", 5):
                pending = buffer_db.get_pending_records(limit=20)
                synced_ids = []
                for p in pending:
                    success = transport.send_telemetry(p["payload"])
                    if success:
                        synced_ids.append(p["buffer_id"])
                    else:
                        break  # Stop batch sync on connection error
                if synced_ids:
                    buffer_db.mark_synchronized(synced_ids)
                    print(f"[Sync] Synchronized {len(synced_ids)} telemetry records with Cloud API.")
                last_sync = current_time

            # 5. Emit Device Heartbeat
            if current_time - last_heartbeat >= config.get("heartbeatIntervalSeconds", 15):
                pending_cnt = buffer_db.get_pending_count()
                health_data = health_collector.collect_health(buffered_count=pending_cnt)
                transport.send_heartbeat(health_data)
                last_heartbeat = current_time

            time.sleep(config.get("pollIntervalSeconds", 2))

        except KeyboardInterrupt:
            print("\nShutting down Raspberry Pi Agent.")
            sys.exit(0)
        except Exception as e:
            print(f"[PiAgent Error] {e}")
            time.sleep(2)

if __name__ == "__main__":
    main()
