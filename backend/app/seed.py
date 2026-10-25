"""The demo cast and history: Gurneal's cast (design/COPY_AND_NAMES.md) in the
one-evening story (docs/demo/Demo_Script_v2.md).

People come from SEED_* env vars on first boot and can be edited later with
PATCH /api/people/{id}. The ids predate the cast names (jordan is Sarah, priya
is Michael) and stay as they are. ensure_cast() runs on every start and only
adds people who are missing, so a database edited through the API keeps its
edits. Fixtures (Sarah's older lines, Dad's draft, the Tuesday card Mom replies
to, Michael's reminder) are insert-if-missing too, and POST /api/demo/reset
reseeds them.
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from . import db, store

CDT = ZoneInfo("America/Chicago")
TUESDAY_CARD_ID = "card_tuesday"


def _env(*names: str, default: str = "") -> str:
    """The first non-empty env var among names (new name first, then the older one)."""
    for name in names:
        value = os.environ.get(name, "").strip()
        if value:
            return value
    return default


def seed_if_empty() -> None:
    with db.tx() as c:
        fresh = c.execute("SELECT COUNT(*) FROM people").fetchone()[0] == 0
    ensure_cast()
    if fresh:
        seed_photos()
    ensure_people_photos()
    seed_fixtures()


def _cast() -> list[tuple]:
    home_language = _env("SEED_HOME_LANGUAGE", default="Hindi")
    my_tz = _env("SEED_ME_TZ", default="America/Chicago")
    home_tz = _env("SEED_MOM_TZ", default="Asia/Kolkata")
    return [
        # id, name, relation, pronoun, aliases, channel, handle, timezone, language, sort
        ("me", _env("SEED_ME_NAME", default="Riley"), "self", "them", [], "self",
         _env("SEED_ME_PHONE"), my_tz, home_language, 0),
        ("mom", "Mom", "mother", "her", ["Mom", "Mumma", "Mummy", "Mum", "Ma", "Maa", "Mother", "Amma"], "whatsapp",
         _env("SEED_MOM_PHONE"), home_tz, home_language, 1),
        ("dad", "Dad", "father", "him", ["Dad", "Papa", "Pa"], "whatsapp",
         _env("SEED_DAD_PHONE"), _env("SEED_DAD_TZ", default=home_tz), home_language, 2),
        ("jordan", "Sarah", "girlfriend", "her", ["Sarah"], "imessage",
         _env("SEED_SARAH_PHONE", "SEED_JORDAN_PHONE"), my_tz, "English", 3),
        ("priya", "Michael", "best friend", "him", ["Michael", "Mike"], "instagram",
         _env("SEED_MICHAEL_INSTAGRAM", "SEED_PRIYA_INSTAGRAM"), my_tz, "English", 4),
    ]


def ensure_cast() -> list[str]:
    """Adds any cast member who isn't in the database yet. Never overwrites an edited person."""
    added = []
    with db.tx() as c:
        for pid, name, relation, pronoun, aliases, channel, handle, tz, language, sort in _cast():
            inserted = c.execute(
                "INSERT OR IGNORE INTO people (id, name, relation, pronoun, aliases, channel, handle, timezone, language, sort) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (pid, name, relation, pronoun, json.dumps(aliases), channel, handle, tz, language, sort),
            ).rowcount
            if inserted:
                added.append(pid)
    return added


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
        ("photo_lake", "jordan", "barton springs, june", "#F6D3AE", "#FBF5EC", "2026-06-14T17:00:00-05:00"),
        ("photo_sunrise", "priya", "sunrise on 290", "#E8A15A", "#F6D3AE", "2026-03-21T07:10:00-05:00"),
    ]
    with db.tx() as c:
        for pid, person, caption, a, b, taken in photos:
            path = store.save_media("photos", f"{pid}.svg", _PLACEHOLDER.format(a=a, b=b, caption=caption).encode())
            c.execute(
                "INSERT OR IGNORE INTO photos (id, person_id, path, caption, taken_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (pid, person, path, caption, taken, db.iso(datetime.now(CDT))),
            )


SEED_MEDIA = Path(__file__).parent / "seed_media"

# A few photos of each person for the People tab: simple drawn JPEGs from app/seed_media
# (no real photos, no faces). Insert-if-missing on every start, like the cast.
PEOPLE_PHOTOS = [
    ("photo_seed_mom_garden", "mom", "seed_mom_garden.jpg", "her garden", "2026-04-12T09:30:00+05:30"),
    ("photo_seed_mom_chai", "mom", "seed_mom_chai.jpg", "chai, sunday", "2026-01-04T08:00:00+05:30"),
    ("photo_seed_dad_porch", "dad", "seed_dad_porch.jpg", "dad on the porch", "2026-05-02T18:00:00+05:30"),
    ("photo_seed_dad_cricket", "dad", "seed_dad_cricket.jpg", "his old bat", "2025-12-30T16:00:00+05:30"),
    ("photo_seed_dad_tea", "dad", "seed_dad_tea.jpg", "two cups", "2025-08-08T07:00:00+05:30"),
    ("photo_seed_sarah_cafe", "jordan", "seed_sarah_cafe.jpg", "our cafe", "2026-09-06T10:00:00-05:00"),
    ("photo_seed_sarah_lights", "jordan", "seed_sarah_lights.jpg", "acl, night two", "2026-10-11T21:00:00-05:00"),
    ("photo_seed_michael_court", "priya", "seed_michael_court.jpg", "the court", "2026-08-15T19:00:00-05:00"),
    ("photo_seed_michael_road", "priya", "seed_michael_road.jpg", "road trip", "2026-07-03T12:00:00-05:00"),
]


def ensure_people_photos() -> list[str]:
    """Adds the People-tab demo photos that are missing (row or file). Never touches his own photos."""
    added = []
    with db.tx() as c:
        for pid, person, filename, caption, taken in PEOPLE_PHOTOS:
            if not c.execute("SELECT 1 FROM people WHERE id = ?", (person,)).fetchone():
                continue
            rel = f"photos/{filename}"
            if not store.media_path(rel).exists():
                store.save_media("photos", filename, (SEED_MEDIA / filename).read_bytes())
            inserted = c.execute(
                "INSERT OR IGNORE INTO photos (id, person_id, path, caption, taken_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (pid, person, rel, caption, taken, db.iso(datetime.now(CDT))),
            ).rowcount
            if inserted:
                added.append(pid)
    return added


def seed_fixtures() -> None:
    """Sarah's older lines, Dad's draft, the Tuesday card Mom can reply to, Michael's reminder.

    Insert-if-missing, so it's safe on every start.
    """

    def at(y, m, d, hh, mm):
        return db.iso(datetime(y, m, d, hh, mm, tzinfo=CDT))

    # Stable across resets, so the link already sent to Mom keeps working.
    tuesday_token = db.kv_get("tuesday_token") or db.new_token()
    db.kv_set("tuesday_token", tuesday_token)

    with db.tx() as c:
        for pid, person, text, tone, when in [
            ("piece_jordan_sep30", "jordan", "I miss the way we used to talk.", "missing", at(2026, 9, 30, 1, 14)),
            ("piece_jordan_oct11", "jordan", "I didn't text back because I didn't want you to hear me like this.",
             "overwhelmed", at(2026, 10, 11, 2, 41)),
            ("piece_dad_oct18", "dad", "I never said thank you.", "grateful", at(2026, 10, 18, 23, 52)),
        ]:
            c.execute(
                "INSERT OR IGNORE INTO pieces (id, rant_id, person_id, text, tone, created_at) VALUES (?, NULL, ?, ?, ?, ?)",
                (pid, person, text, tone, when),
            )

        # The card Mom opens to leave her voice note ("Mom left you a voice note on tuesday").
        # Sent two Sundays ago (the dal), so it doesn't count as "already reached out this week".
        sent = datetime(2026, 10, 11, 20, 15, tzinfo=CDT)
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
        # Michael (Best Friend) · waiting on you. The id predates the cast names.
        c.execute(
            "INSERT OR IGNORE INTO reminders (id, person_id, text, created_at) VALUES ('rem_priya', 'priya', ?, ?)",
            ("3 reels this week", at(2026, 10, 24, 18, 20)),
        )


def reset_activity() -> None:
    """Clears everything he did, keeps people, photos and registered phones, reseeds the fixtures."""
    with db.tx() as c:
        for table in (
            "pieces", "reflections", "cards", "replies", "rants", "self_notes", "reminders",
            "photo_links", "attention", "pushes",
        ):
            c.execute(f"DELETE FROM {table}")
    seed_fixtures()
