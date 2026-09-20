import os
import psutil
import datetime
from typing import Dict, Any

class DeviceHealthCollector:
    def __init__(self, device_id: str):
        self.device_id = device_id
        self.start_time = datetime.datetime.now(datetime.timezone.utc)

    def get_cpu_temp(self) -> float:
        try:
            # Try reading Pi CPU temperature from sysfs
            if os.path.exists("/sys/class/thermal/thermal_zone0/temp"):
                with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
                    return round(float(f.read().strip()) / 1000.0, 1)
        except Exception:
            pass
        return 42.5  # Fallback default temperature

    def collect_health(self, buffered_count: int = 0) -> Dict[str, Any]:
        uptime_sec = int((datetime.datetime.now(datetime.timezone.utc) - self.start_time).total_seconds())
        return {
            "cpuUsagePercent": psutil.cpu_percent(interval=None),
            "ramUsagePercent": psutil.virtual_memory().percent,
            "cpuTemperatureCelsius": self.get_cpu_temp(),
            "uptimeSeconds": uptime_sec,
            "networkStatus": "ONLINE",
            "ipAddress": "192.168.1.105",
            "lastHeartbeat": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "bufferedTelemetryCount": buffered_count,
            "sensorErrors": []
        }
