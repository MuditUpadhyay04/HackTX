"""The demo cast and history: Gurneal's cast (design/COPY_AND_NAMES.md) in the
one-evening story (docs/demo/Demo_Script_v2.md).

People come from SEED_* env vars on first boot and can be edited later with
PATCH /api/people/{id}. The ids predate the cast names (jordan is Sarah, priya
is Michael) and stay as they are. ensure_cast() runs on every start and only
adds people who are missing, so a database edited through the API keeps its
edits. Fixtures (Sarah's older lines, the Tuesday card Mom replies
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
    retire_people()
    ensure_cast()
    if fresh:
        seed_photos()
    ensure_people_photos()
    from . import connect

    connect.refresh_imports()
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
        ("jordan", "Sarah", "girlfriend", "her", ["Sarah"], "imessage",
         _env("SEED_SARAH_PHONE", "SEED_JORDAN_PHONE"), my_tz, "English", 3),
        ("priya", "Michael", "best friend", "him", ["Michael", "Mike"], "instagram",
         _env("SEED_MICHAEL_INSTAGRAM", "SEED_PRIYA_INSTAGRAM"), my_tz, "English", 4),
    ]


# Nick, Oct 25 2026: the demo cast is Mom, Sarah and Michael. Dad is gone, from fresh and existing databases.
RETIRED = ["dad"]


def retire_people() -> list[str]:
    """Drops retired cast members and everything that hangs off them. Runs on every start and on reset."""
    removed = []
    with db.tx() as c:
        for pid in RETIRED:
            if not c.execute("SELECT 1 FROM people WHERE id = ?", (pid,)).fetchone():
                continue
            cards = [r[0] for r in c.execute("SELECT id FROM cards WHERE recipient_id = ?", (pid,))]
            for card_id in cards:
                c.execute("DELETE FROM replies WHERE card_id = ?", (card_id,))
            c.execute("DELETE FROM cards WHERE recipient_id = ?", (pid,))
            c.execute("DELETE FROM replies WHERE from_person_id = ?", (pid,))
            paths = [r[0] for r in c.execute("SELECT path FROM photos WHERE person_id = ?", (pid,))]
            c.execute("DELETE FROM photos WHERE person_id = ?", (pid,))
            for table, col in (("pieces", "person_id"), ("reminders", "person_id"), ("photo_links", "person_id"),
                               ("attention", "person_id"), ("pushes", "person_id"), ("drafts", "person_id"),
                               ("inbound", "person_id")):
                cols = {r[1] for r in c.execute(f"PRAGMA table_info({table})")}
                if col in cols:
                    c.execute(f"DELETE FROM {table} WHERE {col} = ?", (pid,))
            c.execute("DELETE FROM people WHERE id = ?", (pid,))
            for rel in paths:
                store.delete_media(rel)
            removed.append(pid)
    return removed


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
            else:
                # Pronouns can't be edited in the app, so the cast's is the truth. An older database
                # still has the best friend's from before he became Michael ("her"), which reads
                # wrong in every templated line about him.
                c.execute("UPDATE people SET pronoun = ? WHERE id = ? AND pronoun != ?", (pronoun, pid, pronoun))
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

# Photos of each person for the People tab and Home's lane: fictional, generated demo photos
# (Nick, Oct 25 2026; /workspace/demo-photos, resized to 1280 px, JPEG q80) in app/seed_media.
# Insert-if-missing on every start, like the cast; older drawn placeholders are swapped out.
# Captions are demo copy for Gurneal to review.
PEOPLE_PHOTOS = [
    ("photo_seed_mom_12", "mom", "seed_mom_12.jpg", "the old porch", "2018-06-10T18:30:00-05:00"),
    ("photo_seed_mom_14", "mom", "seed_mom_14.jpg", "after the game", "2020-02-22T20:00:00-06:00"),
    ("photo_seed_mom_16", "mom", "seed_mom_16.jpg", "the keys", "2022-04-03T16:00:00-05:00"),
    ("photo_seed_mom_17_kitchen", "mom", "seed_mom_17_kitchen.jpg", "chapati lessons", "2023-01-15T12:00:00-06:00"),
    ("photo_seed_mom_18", "mom", "seed_mom_18.jpg", "graduation day", "2024-05-25T11:00:00-05:00"),
    ("photo_seed_mom_19_diwali", "mom", "seed_mom_19_diwali.jpg", "diwali, home", "2025-10-20T20:00:00-05:00"),
    ("photo_seed_mom_20", "mom", "seed_mom_20.jpg", "she brought tiffin", "2026-03-08T13:00:00-05:00"),
    ("photo_seed_mom_20_garden", "mom", "seed_mom_20_garden.jpg", "her tomatoes", "2026-07-12T09:30:00-05:00"),
    ("photo_seed_sarah_coffee", "jordan", "seed_sarah_coffee.jpg", "our cafe", "2025-09-06T10:00:00-05:00"),
    ("photo_seed_sarah_campus", "jordan", "seed_sarah_campus.jpg", "between classes", "2025-10-14T13:00:00-05:00"),
    ("photo_seed_sarah_study", "jordan", "seed_sarah_study.jpg", "finals week", "2025-12-09T22:00:00-06:00"),
    ("photo_seed_sarah_rain", "jordan", "seed_sarah_rain.jpg", "caught in the rain", "2026-04-18T17:00:00-05:00"),
    ("photo_seed_sarah_picnic", "jordan", "seed_sarah_picnic.jpg", "zilker, sunday", "2026-05-31T15:00:00-05:00"),
    ("photo_seed_sarah_sunset", "jordan", "seed_sarah_sunset.jpg", "the lake at sunset", "2026-08-22T19:45:00-05:00"),
    ("photo_seed_michael_court", "priya", "seed_michael_court.jpg", "the court", "2024-08-15T19:00:00-05:00"),
    ("photo_seed_michael_gradhug", "priya", "seed_michael_gradhug.jpg", "we made it", "2024-05-25T13:00:00-05:00"),
    ("photo_seed_michael_gaming", "priya", "seed_michael_gaming.jpg", "one more game", "2025-11-29T23:30:00-06:00"),
    ("photo_seed_michael_latenight", "priya", "seed_michael_latenight.jpg", "2am tacos", "2026-02-14T02:00:00-06:00"),
    ("photo_seed_michael_roadtrip", "priya", "seed_michael_roadtrip.jpg", "road trip", "2026-07-03T12:00:00-05:00"),
    ("photo_seed_michael_lake", "priya", "seed_michael_lake.jpg", "lake day", "2026-08-09T16:00:00-05:00"),
    # batch 2 (same set, demo-photos branch: batch2/ and extras/). None = not in the cast: library only.
    ("photo_seed_mom_son12_grocery", "mom", "seed_mom_son12_grocery.jpg", "h-e-b runs", "2018-07-14T11:00:00-05:00"),
    ("photo_seed_mom_son12_homework", "mom", "seed_mom_son12_homework.jpg", "fractions at the table", "2018-10-02T19:30:00-05:00"),
    ("photo_seed_son13_mom_kitchen", "mom", "seed_son13_mom_kitchen.jpg", "helping in the kitchen", "2019-11-28T15:00:00-06:00"),
    ("photo_seed_mom_son13_bike", "mom", "seed_mom_son13_bike.jpg", "she fixed my chain", "2019-04-07T17:00:00-05:00"),
    ("photo_seed_mom_son13_temple", "mom", "seed_mom_son13_temple.jpg", "temple, sunday morning", "2019-08-25T09:00:00-05:00"),
    ("photo_seed_mom_son14_haircut", "mom", "seed_mom_son14_haircut.jpg", "kitchen haircut", "2020-04-18T14:00:00-05:00"),
    ("photo_seed_son14_mom_aunty_carrom", "mom", "seed_son14_mom_aunty_carrom.jpg", "carrom with aunty", "2020-08-15T20:00:00-05:00"),
    ("photo_seed_mom_son14_tv", "mom", "seed_mom_son14_tv.jpg", "her shows", "2020-11-07T21:00:00-06:00"),
    ("photo_seed_son15_mom_sciencefair", "mom", "seed_son15_mom_sciencefair.jpg", "science fair", "2021-03-05T10:00:00-06:00"),
    ("photo_seed_mom_son15_laundry", "mom", "seed_mom_son15_laundry.jpg", "she taught me laundry", "2021-06-12T11:00:00-05:00"),
    ("photo_seed_mom_son16_sick", "mom", "seed_mom_son16_sick.jpg", "soup and vicks", "2022-01-20T13:00:00-06:00"),
    ("photo_seed_mom_son16_snow", "mom", "seed_mom_son16_snow.jpg", "snow day", "2022-02-03T10:00:00-06:00"),
    ("photo_seed_mom_son17_collegeapps", "mom", "seed_mom_son17_collegeapps.jpg", "college apps, 1am", "2022-11-01T01:00:00-05:00"),
    ("photo_seed_son17_mom_driving", "mom", "seed_son17_mom_driving.jpg", "driving lessons", "2023-05-20T17:00:00-05:00"),
    ("photo_seed_son18_mom_graduation", "mom", "seed_son18_mom_graduation.jpg", "her graduation saree", "2024-05-25T12:00:00-05:00"),
    ("photo_seed_mom_son18_packing", "mom", "seed_mom_son18_packing.jpg", "packing for school", "2024-08-10T16:00:00-05:00"),
    ("photo_seed_mom_son19_airport", "mom", "seed_mom_son19_airport.jpg", "the airport, waving", "2025-01-05T07:00:00-06:00"),
    ("photo_seed_mom_son19_dishes", "mom", "seed_mom_son19_dishes.jpg", "dishes after diwali", "2025-10-21T22:00:00-05:00"),
    ("photo_seed_mom_son20_walk", "mom", "seed_mom_son20_walk.jpg", "evening walk", "2026-06-20T19:30:00-05:00"),
    ("photo_seed_son19_gf_campus_walk", "jordan", "seed_son19_gf_campus_walk.jpg", "the long way to class", "2025-09-20T12:00:00-05:00"),
    ("photo_seed_sarah_bookstore", "jordan", "seed_sarah_bookstore.jpg", "bookpeople", "2025-10-04T15:00:00-05:00"),
    ("photo_seed_sarah_pumpkins", "jordan", "seed_sarah_pumpkins.jpg", "pumpkin patch", "2025-10-25T16:00:00-05:00"),
    ("photo_seed_sarah_boardgames", "jordan", "seed_sarah_boardgames.jpg", "she always wins", "2025-11-08T21:00:00-06:00"),
    ("photo_seed_sarah_diner", "jordan", "seed_sarah_diner.jpg", "kerbey lane, 2am", "2025-12-13T02:00:00-06:00"),
    ("photo_seed_sarah_iceskating", "jordan", "seed_sarah_iceskating.jpg", "she held me up", "2025-12-27T18:00:00-06:00"),
    ("photo_seed_sarah_bowling", "jordan", "seed_sarah_bowling.jpg", "gutter balls", "2026-01-17T20:00:00-06:00"),
    ("photo_seed_sarah_laundromat", "jordan", "seed_sarah_laundromat.jpg", "laundry night", "2026-02-26T21:00:00-06:00"),
    ("photo_seed_sarah_movienight", "jordan", "seed_sarah_movienight.jpg", "movie night", "2026-03-28T22:00:00-05:00"),
    ("photo_seed_sarah_thrift", "jordan", "seed_sarah_thrift.jpg", "thrift finds", "2026-04-04T14:00:00-05:00"),
    ("photo_seed_son20_sarah_mom_dinner", "jordan", "seed_son20_sarah_mom_dinner.jpg", "sarah met mom", "2026-06-07T19:00:00-05:00"),
    ("photo_seed_sarah_ikea", "jordan", "seed_sarah_ikea.jpg", "ikea date", "2026-08-15T13:00:00-05:00"),
    ("photo_seed_son17_michael_coach_timeout", "priya", "seed_son17_michael_coach_timeout.jpg", "coach's timeout", "2023-02-10T20:00:00-06:00"),
    ("photo_seed_michael_carwash", "priya", "seed_michael_carwash.jpg", "senior car wash", "2024-04-13T11:00:00-05:00"),
    ("photo_seed_michael_bus", "priya", "seed_michael_bus.jpg", "the 801, every morning", "2024-09-10T08:00:00-05:00"),
    ("photo_seed_michael_fishing", "priya", "seed_michael_fishing.jpg", "caught one, finally", "2025-06-21T07:00:00-05:00"),
    ("photo_seed_michael_moving", "priya", "seed_michael_moving.jpg", "moving day", "2025-08-17T10:00:00-05:00"),
    ("photo_seed_michael_arcade", "priya", "seed_michael_arcade.jpg", "air hockey rematch", "2025-09-27T21:00:00-05:00"),
    ("photo_seed_michael_library", "priya", "seed_michael_library.jpg", "asleep at pcl", "2025-11-18T23:00:00-06:00"),
    ("photo_seed_michael_airport", "priya", "seed_michael_airport.jpg", "waiting at abia", "2025-12-20T06:30:00-06:00"),
    ("photo_seed_michael_pingpong", "priya", "seed_michael_pingpong.jpg", "basement ping pong", "2026-01-24T16:00:00-06:00"),
    ("photo_seed_michael_soccer", "priya", "seed_michael_soccer.jpg", "sunday league", "2026-03-15T10:00:00-05:00"),
    ("photo_seed_michael_tire", "priya", "seed_michael_tire.jpg", "flat on 71", "2026-05-09T18:00:00-05:00"),
    ("photo_seed_son20_bff_videogames", "priya", "seed_son20_bff_videogames.jpg", "2k till sunrise", "2026-09-05T03:00:00-05:00"),
    ("photo_seed_son19_priya_aunty_function", None, "seed_son19_priya_aunty_function.jpg", "priya's family function", "2025-07-19T19:00:00-05:00"),
    ("photo_seed_son20_jake_dorm", None, "seed_son20_jake_dorm.jpg", "dorm with jake", "2026-01-30T22:00:00-06:00"),
    ("photo_seed_son20_tasha_lab", None, "seed_son20_tasha_lab.jpg", "lab with tasha", "2026-09-17T14:00:00-05:00"),
]


def _drop_stale_seed_photos(c) -> None:
    """Older databases still have the drawn placeholders (photo_seed_* rows that aren't in the list)."""
    keep = {pid for pid, *_ in PEOPLE_PHOTOS}
    for row in c.execute("SELECT id, path FROM photos WHERE id LIKE 'photo_seed_%'").fetchall():
        if row["id"] not in keep:
            c.execute("DELETE FROM photos WHERE id = ?", (row["id"],))
            store.delete_media(row["path"])


def ensure_people_photos() -> list[str]:
    """Adds the People-tab demo photos that are missing (row or file). Never touches his own photos."""
    added = []
    with db.tx() as c:
        _drop_stale_seed_photos(c)
        for pid, person, filename, caption, taken in PEOPLE_PHOTOS:
            if person and not c.execute("SELECT 1 FROM people WHERE id = ?", (person,)).fetchone():
                continue
            rel = f"photos/{filename}"
            src = (SEED_MEDIA / filename).read_bytes()
            dest = store.media_path(rel)
            if not dest.exists() or dest.stat().st_size != len(src):  # missing, or an older drawn version
                store.save_media("photos", filename, src)
            c.execute(
                "UPDATE photos SET path = ?, caption = ?, taken_at = ? WHERE id = ? AND person_id IS ?",
                (rel, caption, taken, pid, person),
            )
            inserted = c.execute(
                "INSERT OR IGNORE INTO photos (id, person_id, path, caption, taken_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (pid, person, rel, caption, taken, db.iso(datetime.now(CDT))),
            ).rowcount
            if inserted:
                added.append(pid)
    return added


def seed_fixtures() -> None:
    """Sarah's older lines, the Tuesday card Mom can reply to, Michael's reminder.

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
        # What they sent him in their own apps, matching the phone mock (Branched-Frontend/lib/mock/threads.ts)
        # and the film (PLAN.md §5). Un-Said never reads his chats; this is demo data only. It backs
        # "Mom is waiting...", the drift knock about Sarah, and "Reply to Michael on Instagram".
        for iid, person, channel, kind, text, when in INBOUND:
            c.execute(
                "INSERT OR IGNORE INTO inbound (id, person_id, channel, kind, text, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (iid, person, channel, kind, text, at(*when)),
            )


# id, person, channel, kind, text, (y, m, d, hh, mm) in his time zone
INBOUND = [
    ("in_mom_1012_call", "mom", "whatsapp", "missed_call", "", (2026, 10, 12, 19, 30)),
    ("in_mom_1012_eat", "mom", "whatsapp", "text", "did you eat?", (2026, 10, 12, 19, 34)),
    ("in_mom_1016_call", "mom", "whatsapp", "missed_call", "", (2026, 10, 16, 20, 9)),
    ("in_mom_1016_voice", "mom", "whatsapp", "text", "just wanted to hear your voice", (2026, 10, 16, 20, 11)),
    ("in_mom_1021_call_me", "mom", "whatsapp", "text", "call me when you can ❤️", (2026, 10, 21, 21, 17)),
    ("in_mom_1023_eat", "mom", "whatsapp", "text", "Beta, did you eat?", (2026, 10, 23, 19, 46)),
    ("in_mom_1024_call", "mom", "whatsapp", "missed_call", "", (2026, 10, 24, 18, 4)),
    ("in_mom_1024_free", "mom", "whatsapp", "text", "Call when free", (2026, 10, 24, 18, 5)),
    ("in_sarah_1015", "jordan", "imessage", "text", "I miss your voice. can we video call tomorrow?", (2026, 10, 15, 23, 20)),
    ("in_sarah_1021", "jordan", "imessage", "text", "we haven't really hung out in almost three weeks", (2026, 10, 21, 20, 15)),
    ("in_sarah_1023", "jordan", "imessage", "text", "I really miss you", (2026, 10, 23, 1, 12)),
    ("in_sarah_1024", "jordan", "imessage", "text", "please just say something", (2026, 10, 24, 21, 41)),
    ("in_michael_1018_reel", "priya", "instagram", "reel", "", (2026, 10, 18, 19, 26)),
    ("in_michael_1024_reel", "priya", "instagram", "reel", "", (2026, 10, 24, 21, 40)),
    ("in_michael_1024_okay", "priya", "instagram", "text", "You okay?", (2026, 10, 24, 21, 41)),
]


def reset_activity() -> None:
    """Clears everything he did, keeps people, photos and registered phones, reseeds the fixtures."""
    retire_people()
    with db.tx() as c:
        for table in (
            "pieces", "reflections", "cards", "replies", "rants", "self_notes", "reminders",
            "photo_links", "attention", "pushes", "drafts", "inbound",
        ):
            c.execute(f"DELETE FROM {table}")
    seed_fixtures()
