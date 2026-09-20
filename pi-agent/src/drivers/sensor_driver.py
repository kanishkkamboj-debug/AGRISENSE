from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseSensorDriver(ABC):
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.id = config.get("id", "UNKNOWN_SENSOR")
        self.parameter = config.get("parameter", "unknown")
        self.unit = config.get("unit", "")

    @abstractmethod
    def read_value(self) -> Optional[float]:
        """Reads and returns normalized physical value or None if sensor unavailable."""
        pass
