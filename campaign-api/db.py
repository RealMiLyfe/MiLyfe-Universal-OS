"""SQLite persistence for the campaign API.

Self-contained: one file, zero external services required. If the box
dies, the file is the backup. If the file is copied back, the campaign
is back where it left off.
"""
from __future__ import annotations

import os
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timezone

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.environ.get("CAMPAIGN_DB_PATH", os.path.join(DATA_DIR, "campaign.db"))

_lock = threading.Lock()

SCHEMA = """
CREATE TABLE IF NOT EXISTS petitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    neighborhood TEXT,
    collector TEXT,
    source TEXT DEFAULT 'web',
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_petitions_created ON petitions(created_at);
CREATE INDEX IF NOT EXISTS idx_petitions_hood ON petitions(neighborhood);
CREATE INDEX IF NOT EXISTS idx_petitions_collector ON petitions(collector);

CREATE TABLE IF NOT EXISTS volunteers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    neighborhood TEXT,
    skills TEXT,           -- comma separated
    availability TEXT,
    assigned_to TEXT,
    hours REAL DEFAULT 0,
    signatures INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS external_intake (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    form TEXT NOT NULL,    -- 'contact' | 'external' | 'platform'
    name TEXT,
    email TEXT,
    phone TEXT,
    topic TEXT,
    message TEXT,
    payload TEXT,          -- raw JSON for platform webhooks
    created_at TEXT NOT NULL
);
"""


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


@contextmanager
def get_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    with _lock:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        try:
            conn.executescript(SCHEMA)
            yield conn
            conn.commit()
        finally:
            conn.close()


def row_to_dict(row: sqlite3.Row) -> dict:
    return dict(row)


def utc_today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")
