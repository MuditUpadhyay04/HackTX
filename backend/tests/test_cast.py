"""Gurneal's cast (design/COPY_AND_NAMES.md) and the never-overwrite rule for existing databases."""

import app.main  # noqa: F401  (initializes and seeds the test database)
from app import db, seed, store


def names():
    return {p["id"]: p["name"] for p in store.list_people(include_self=True)}


def test_the_cast_is_gurneals():
    assert names() == {"me": "Riley", "mom": "Mom", "dad": "Dad", "jordan": "Sarah", "priya": "Michael"}
    dad = store.get_person("dad")
    assert (dad["channel"], dad["timezone"], dad["language"], dad["pronoun"]) == ("whatsapp", "Asia/Kolkata", "Hindi", "him")
    assert store.get_person("priya")["aliases"] == ["Michael", "Mike"]


def test_seeded_drafts_match_the_home_screen():
    with db.tx() as c:
        dad = [r["text"] for r in c.execute("SELECT text FROM pieces WHERE person_id = 'dad'")]
        sarah = [r["text"] for r in c.execute("SELECT text FROM pieces WHERE person_id = 'jordan'")]
        reminder = c.execute("SELECT text FROM reminders WHERE id = 'rem_priya'").fetchone()
    assert dad == ["I never said thank you."]
    assert "I miss the way we used to talk." in sarah
    assert reminder["text"] == "3 reels this week"


def test_ensure_cast_adds_missing_people_but_never_overwrites_edits():
    with db.tx() as c:
        c.execute("UPDATE people SET name = 'Jordan' WHERE id = 'jordan'")  # edited through the API earlier
        c.execute("DELETE FROM people WHERE id = 'dad'")                  # an older database without Dad
    try:
        added = seed.ensure_cast()
        assert added == ["dad"]
        assert names()["jordan"] == "Jordan"  # the edit survives
        assert seed.ensure_cast() == []        # idempotent
    finally:
        with db.tx() as c:
            c.execute("UPDATE people SET name = 'Sarah' WHERE id = 'jordan'")
