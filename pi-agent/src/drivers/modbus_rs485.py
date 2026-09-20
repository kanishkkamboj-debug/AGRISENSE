import random
from typing import Optional, Dict, Any
from .sensor_driver import BaseSensorDriver

class ModbusRS485Driver(BaseSensorDriver):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.slave_id = config.get("slaveId", 1)
        self.register = config.get("register", 0)
        self.scale_factor = config.get("scaleFactor", 0.1)

    def read_value(self) -> Optional[float]:
        try:
            # Simulate real RS485 Modbus read or return deterministic physical value
            # In hardware deployment, minimalmodbus.Instrument reads actual holding registers
            if self.parameter == "soil_moisture":
                raw = 427  # 42.7%
            elif self.parameter == "soil_temperature":
                raw = 248  # 24.8 C
            elif self.parameter == "soil_ph":
                raw = 650  # 6.50 pH
            else:
                raw = 100

            # Add slight physical jitter (±0.2)
            jitter = random.uniform(-0.1, 0.1)
            value = round((raw * self.scale_factor) + jitter, 1)
            return value
        except Exception as e:
            print(f"[ModbusRS485] Error reading sensor {self.id}: {e}")
            return None
