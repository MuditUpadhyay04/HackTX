"""SQLite storage. One file, opened per call; the queries are tiny."""

import json
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Iterator

from .config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS people (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    relation TEXT NOT NULL,
    pronoun TEXT NOT NULL DEFAULT 'them',
    aliases TEXT NOT NULL DEFAULT '[]',
    channel TEXT NOT NULL,                 -- self | whatsapp | imessage | instagram
    handle TEXT NOT NULL DEFAULT '',       -- phone digits, or an Instagram username
    timezone TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'English',
    quiet_start TEXT NOT NULL DEFAULT '22:00',
    quiet_end TEXT NOT NULL DEFAULT '07:30',
    morning TEXT NOT NULL DEFAULT '08:00',
    sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    person_id TEXT,
    path TEXT NOT NULL,
    caption TEXT NOT NULL DEFAULT '',
    taken_at TEXT,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rants (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    provider TEXT NOT NULL,                -- meta | mock | typed
    transcript TEXT NOT NULL,
    turns TEXT NOT NULL,                   -- JSON [{turnId, startMs, endMs, text}]
    audio_path TEXT,
    safety TEXT,                           -- null until sorted
    sorted_by TEXT,                        -- meta | mock
    sorted_at TEXT
);
CREATE TABLE IF NOT EXISTS pieces (
    id TEXT PRIMARY KEY,
    rant_id TEXT,
    person_id TEXT NOT NULL,
    text TEXT NOT NULL,                    -- always a verbatim slice of his transcript
    tone TEXT NOT NULL,
    audio_start_ms INTEGER,                -- window into the rant's audio; null when the turn
    audio_end_ms INTEGER,                  -- also holds words for someone else
    status TEXT NOT NULL DEFAULT 'kept',   -- kept | in_card | discarded
    card_id TEXT,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reflections (
    rant_id TEXT NOT NULL,
    person_id TEXT NOT NULL,
    line TEXT NOT NULL,
    PRIMARY KEY (rant_id, person_id)
);
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    recipient_id TEXT NOT NULL,
    lines TEXT NOT NULL,                   -- JSON [{text, created_at}]
    translation TEXT,
    photo_id TEXT,
    audio_path TEXT,
    status TEXT NOT NULL,                  -- held | releasing | ready | released | revoked
    release_at TEXT,
    released_at TEXT,
    delivered_via TEXT,                    -- whatsapp_api | share
    delivery_error TEXT,
    opened_at TEXT,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS replies (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL,
    from_person_id TEXT NOT NULL,
    audio_path TEXT,
    transcript TEXT NOT NULL DEFAULT '',
    translation TEXT,
    created_at TEXT NOT NULL,
    heard_at TEXT
);
CREATE TABLE IF NOT EXISTS self_notes (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    mime TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    person_id TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    done_at TEXT
);
"""


def init_db() -> None:
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.media_dir.mkdir(parents=True, exist_ok=True)
    with tx() as c:
        c.executescript(SCHEMA)


@contextmanager
def tx() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(settings.db_path, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def new_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_hex(6)}"


def new_token() -> str:
    return secrets.token_urlsafe(18)


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds")


def parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value)


def kv_get(key: str, default: str | None = None) -> str | None:
    with tx() as c:
        row = c.execute("SELECT value FROM kv WHERE key = ?", (key,)).fetchone()
    return row["value"] if row else default


def kv_set(key: str, value: str) -> None:
    with tx() as c:
        c.execute(
            "INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (key, value),
        )


def loads(value: str | None, default):
    return json.loads(value) if value else default
