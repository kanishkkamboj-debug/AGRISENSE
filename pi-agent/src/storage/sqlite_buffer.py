import sqlite3
import json
import uuid
import datetime
from typing import List, Dict, Any

class SQLiteBuffer:
    def __init__(self, db_path: str = "pi_telemetry_buffer.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS telemetry_buffer (
                id TEXT PRIMARY KEY,
                device_id TEXT NOT NULL,
                field_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                sync_status TEXT DEFAULT 'PENDING',
                created_at TEXT NOT NULL
            )
        """)
        conn.commit()
        conn.close()

    def save_telemetry(self, device_id: str, field_id: str, timestamp: str, measurements: Dict[str, Any]) -> str:
        record_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        payload = {
          "deviceId": device_id,
          "fieldId": field_id,
          "timestamp": timestamp,
          "measurements": measurements
        }

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO telemetry_buffer (id, device_id, field_id, timestamp, payload_json, sync_status, created_at)
            VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
        """, (record_id, device_id, field_id, timestamp, json.dumps(payload), now))
        conn.commit()
        conn.close()
        return record_id

    def get_pending_records(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, device_id, field_id, timestamp, payload_json
            FROM telemetry_buffer
            WHERE sync_status = 'PENDING'
            ORDER BY created_at ASC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()

        records = []
        for row in rows:
            records.append({
                "buffer_id": row[0],
                "deviceId": row[1],
                "fieldId": row[2],
                "timestamp": row[3],
                "payload": json.loads(row[4])
            })
        return records

    def mark_synchronized(self, buffer_ids: List[str]):
        if not buffer_ids:
            return
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        placeholders = ",".join(["?"] * len(buffer_ids))
        cursor.execute(f"""
            UPDATE telemetry_buffer
            SET sync_status = 'SYNCHRONIZED'
            WHERE id IN ({placeholders})
        """, buffer_ids)
        conn.commit()
        conn.close()

    def get_pending_count(self) -> int:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM telemetry_buffer WHERE sync_status = 'PENDING'")
        count = cursor.fetchone()[0]
        conn.close()
        return count
