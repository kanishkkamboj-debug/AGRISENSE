import time
import requests
import json
from typing import Dict, Any

class TransportManager:
    def __init__(self, cloud_api_url: str, device_id: str, device_token: str):
        self.cloud_api_url = cloud_api_url.rstrip("/")
        self.device_id = device_id
        self.device_token = device_token
        self.backoff_delay = 2
        self.max_backoff = 30
        self.is_online = True

    def send_telemetry(self, payload: Dict[str, Any]) -> bool:
        url = f"{self.cloud_api_url}/telemetry"
        headers = {
            "Content-Type": "application/json",
            "X-Device-Id": self.device_id,
            "X-Device-Token": self.device_token,
            "X-Timestamp": payload.get("timestamp", "")
        }

        body = {
            "deviceId": self.device_id,
            "deviceToken": self.device_token,
            "fieldId": payload.get("fieldId", "FIELD-PUNJAB-01"),
            "timestamp": payload.get("timestamp"),
            "measurements": payload.get("measurements", {})
        }

        try:
            response = requests.post(url, json=body, headers=headers, timeout=5)
            if response.status_code == 200 and response.json().get("success"):
                if not self.is_online:
                    print("[Transport] Connection restored! Resetting exponential backoff counter.")
                    self.is_online = True
                self.backoff_delay = 2  # Reset backoff on success
                return True
            else:
                print(f"[Transport] Cloud API error HTTP {response.status_code}: {response.text}")
                self._apply_backoff()
                return False
        except Exception as e:
            print(f"[Transport] Network/Connection failure: {e}")
            self._apply_backoff()
            return False

    def send_heartbeat(self, health_data: Dict[str, Any]) -> bool:
        url = f"{self.cloud_api_url}/heartbeat"
        headers = {
            "Content-Type": "application/json",
            "X-Device-Id": self.device_id,
            "X-Device-Token": self.device_token
        }
        body = {
            "deviceId": self.device_id,
            "deviceToken": self.device_token,
            "health": health_data
        }
        try:
            res = requests.post(url, json=body, headers=headers, timeout=5)
            return res.status_code == 200
        except Exception:
            return False

    def _apply_backoff(self):
        self.is_online = False
        print(f"[Transport] Applying exponential backoff delay: {self.backoff_delay} seconds...")
        time.sleep(self.backoff_delay)
        self.backoff_delay = min(self.backoff_delay * 2, self.max_backoff)
