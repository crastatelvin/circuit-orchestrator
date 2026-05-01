# ============================================
# Project: CIRCUIT - AI Workflow Orchestrator
# License: MIT
# ============================================

import sqlite3
import json
from datetime import datetime, timezone

DB_PATH = "circuit.db"

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS executions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                success INTEGER,
                final_output TEXT,
                nodes_executed INTEGER,
                workflow_json TEXT
            )
        """)
        conn.commit()

def save_execution(result, workflow):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            INSERT INTO executions (timestamp, success, final_output, nodes_executed, workflow_json)
            VALUES (?, ?, ?, ?, ?)
        """, (
            datetime.now(timezone.utc).isoformat(),
            1 if result.get("success") else 0,
            result.get("final_output", ""),
            result.get("nodes_executed", 0),
            json.dumps(workflow)
        ))
        conn.commit()

def get_history(limit=20):
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute("SELECT * FROM executions ORDER BY timestamp DESC LIMIT ?", (limit,))
        return [dict(row) for row in cursor.fetchall()]
