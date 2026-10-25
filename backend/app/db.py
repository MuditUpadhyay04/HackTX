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
    sorted_at TEXT,
    asset_id TEXT,                         -- the device photo he was looking at, if any
    encourage_person TEXT                  -- who got "Tell them how you feel" for this rant
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
CREATE TABLE IF NOT EXISTS photo_links (     -- learned from his own words, never from faces
    asset_id TEXT NOT NULL,
    person_id TEXT NOT NULL,
    times INTEGER NOT NULL DEFAULT 0,        -- recordings on this photo that were about them
    letters INTEGER NOT NULL DEFAULT 0,      -- letters to them that carried this photo
    first_at TEXT NOT NULL,
    last_at TEXT NOT NULL,
    PRIMARY KEY (asset_id, person_id)
);
CREATE TABLE IF NOT EXISTS attention (       -- every time Un-Said asked for his attention
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,                      -- knock | push | encourage | permission_ask
    detail TEXT,                             -- reply | linked | first | ready | drift | ...
    person_id TEXT,
    asset_id TEXT,
    session_id TEXT,
    created_at TEXT NOT NULL,
    outcome TEXT NOT NULL DEFAULT 'shown',   -- shown | opened | dismissed | ignored
    outcome_at TEXT
);
CREATE TABLE IF NOT EXISTS push_tokens (
    token TEXT PRIMARY KEY,
    platform TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    disabled_at TEXT,                        -- set for good after DeviceNotRegistered
    disabled_reason TEXT
);
CREATE TABLE IF NOT EXISTS pushes (          -- queued so they can wait for his morning
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,                      -- reply | ready | drift
    ref_id TEXT,                             -- the reply or card it's about
    person_id TEXT,
    body TEXT NOT NULL,
    due_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending | sent | dropped | no_device | failed
    attention_id TEXT,
    created_at TEXT NOT NULL,
    sent_at TEXT,
    error TEXT
);
"""

# Columns added after the first deploy. Existing databases get them on start.
MIGRATIONS = {
    "rants": {"asset_id": "TEXT", "encourage_person": "TEXT"},
}

INDEXES = """
CREATE INDEX IF NOT EXISTS idx_rants_asset ON rants (asset_id);
CREATE INDEX IF NOT EXISTS idx_pieces_person ON pieces (person_id, created_at);
CREATE INDEX IF NOT EXISTS idx_attention_kind ON attention (kind, created_at);
CREATE INDEX IF NOT EXISTS idx_pushes_due ON pushes (status, due_at);
"""


def init_db() -> None:
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.media_dir.mkdir(parents=True, exist_ok=True)
    with tx() as c:
        migrate(c)


def migrate(c: sqlite3.Connection) -> None:
    """Creates what's missing and adds newer columns to an older database. Safe to run twice."""
    c.executescript(SCHEMA)
    for table, columns in MIGRATIONS.items():
        have = {row[1] for row in c.execute(f"PRAGMA table_info({table})")}
        for column, decl in columns.items():
            if column not in have:
                c.execute(f"ALTER TABLE {table} ADD COLUMN {column} {decl}")
    c.executescript(INDEXES)


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
