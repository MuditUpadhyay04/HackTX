"""The demo cast and history from ideas/mudit/Demo_Script_v2.md.

People come from SEED_* env vars on first boot and can be edited later with
PATCH /api/people/{id}. Fixtures (Jordan's older lines, the Tuesday card Mom
replies to, Priya's reminder) are reseeded by POST /api/demo/reset.
"""

import json
import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from . import db, store

CDT = ZoneInfo("America/Chicago")
TUESDAY_CARD_ID = "card_tuesday"


def _env(name: str, default: str) -> str:
    return os.environ.get(name, default).strip() or default


def seed_if_empty() -> None:
    with db.tx() as c:
        has_people = c.execute("SELECT COUNT(*) FROM people").fetchone()[0]
    if not has_people:
        seed_people()
        seed_photos()
        seed_fixtures()


def seed_people() -> None:
    home_language = _env("SEED_HOME_LANGUAGE", "Hindi")
    people = [
        # id, name, relation, pronoun, aliases, channel, handle, timezone, language, sort
        ("me", _env("SEED_ME_NAME", "Arjun"), "self", "them", [], "self",
         os.environ.get("SEED_ME_PHONE", ""), _env("SEED_ME_TZ", "America/Chicago"), home_language, 0),
        ("mom", "Mom", "mother", "her", ["Mom", "Mumma", "Mummy", "Mum", "Ma", "Maa", "Mother", "Amma"], "whatsapp",
         os.environ.get("SEED_MOM_PHONE", ""), _env("SEED_MOM_TZ", "Asia/Kolkata"), home_language, 1),
        ("jordan", "Jordan", "girlfriend", "her", ["Jordan"], "imessage",
         os.environ.get("SEED_JORDAN_PHONE", ""), _env("SEED_ME_TZ", "America/Chicago"), "English", 2),
        ("priya", "Priya", "best friend", "her", ["Priya"], "instagram",
         os.environ.get("SEED_PRIYA_INSTAGRAM", ""), _env("SEED_ME_TZ", "America/Chicago"), "English", 3),
    ]
    with db.tx() as c:
        for pid, name, relation, pronoun, aliases, channel, handle, tz, language, sort in people:
            c.execute(
                "INSERT INTO people (id, name, relation, pronoun, aliases, channel, handle, timezone, language, sort) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (pid, name, relation, pronoun, json.dumps(aliases), channel, handle, tz, language, sort),
            )


_PLACEHOLDER = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient></defs>
<rect width="900" height="1200" fill="url(#g)"/>
<text x="450" y="600" font-family="Inter, sans-serif" font-size="30" fill="#4A1F35" text-anchor="middle" opacity="0.4">placeholder: add the real photo</text>
</svg>"""


def seed_photos() -> None:
    photos = [
        ("photo_kitchen", "mom", "kitchen, with mom", "#E9B7B4", "#F6C9A4", "2025-12-28T10:00:00+05:30"),
        ("photo_airport", "mom", "the airport, the day I left", "#F6C9A4", "#FBF5EC", "2025-08-09T06:00:00+05:30"),
        ("photo_lake", "jordan", "lake trip, june", "#F6D3AE", "#FBF5EC", "2026-06-14T17:00:00-05:00"),
        ("photo_marfa", "priya", "marfa sunset", "#E8A15A", "#F6D3AE", "2026-03-21T19:30:00-05:00"),
    ]
    with db.tx() as c:
        for pid, person, caption, a, b, taken in photos:
            path = store.save_media("photos", f"{pid}.svg", _PLACEHOLDER.format(a=a, b=b, caption=caption).encode())
            c.execute(
                "INSERT OR IGNORE INTO photos (id, person_id, path, caption, taken_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (pid, person, path, caption, taken, db.iso(datetime.now(CDT))),
            )


def seed_fixtures() -> None:
    """Jordan's older lines, the Tuesday card Mom can reply to, Priya's reminder."""

    def at(y, m, d, hh, mm):
        return db.iso(datetime(y, m, d, hh, mm, tzinfo=CDT))

    # Stable across resets, so the link already sent to Mom keeps working.
    tuesday_token = db.kv_get("tuesday_token") or db.new_token()
    db.kv_set("tuesday_token", tuesday_token)

    with db.tx() as c:
        for pid, text, tone, when in [
            ("piece_jordan_sep30", "I miss how we used to talk too.", "missing", at(2026, 9, 30, 1, 14)),
            ("piece_jordan_oct11", "I didn't text back because I didn't want you to hear me like this.",
             "overwhelmed", at(2026, 10, 11, 2, 41)),
        ]:
            c.execute(
                "INSERT OR IGNORE INTO pieces (id, rant_id, person_id, text, tone, created_at) VALUES (?, NULL, 'jordan', ?, ?, ?)",
                (pid, text, tone, when),
            )

        # The card Mom opens to leave her voice note ("Mom left you a voice note on tuesday").
        sent = datetime(2026, 10, 20, 9, 15, tzinfo=CDT)
        c.execute(
            "INSERT OR IGNORE INTO cards (id, token, recipient_id, lines, translation, photo_id, status, release_at, "
            "released_at, delivered_via, created_at, expires_at) VALUES (?, ?, 'mom', ?, ?, 'photo_kitchen', 'released', "
            "NULL, ?, 'share', ?, ?)",
            (
                TUESDAY_CARD_ID, tuesday_token,
                json.dumps([{"text": "made dal today. it tasted nothing like yours.", "created_at": db.iso(sent)}]),
                "आज दाल बनाई। तुम्हारे जैसी बिल्कुल नहीं बनी।",
                db.iso(sent), db.iso(sent), db.iso(sent + timedelta(days=60)),
            ),
        )
        c.execute(
            "INSERT OR IGNORE INTO reminders (id, person_id, text, created_at) VALUES ('rem_priya', 'priya', ?, ?)",
            ("Priya asked twice.", at(2026, 10, 24, 18, 20)),
        )


def reset_activity() -> None:
    """Clears everything he did, keeps people and photos, reseeds the fixtures."""
    with db.tx() as c:
        for table in ("pieces", "reflections", "cards", "replies", "rants", "self_notes", "reminders"):
            c.execute(f"DELETE FROM {table}")
    seed_fixtures()
