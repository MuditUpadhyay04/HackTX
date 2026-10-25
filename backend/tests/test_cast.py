"""Gurneal's cast (design/COPY_AND_NAMES.md) and the never-overwrite rule for existing databases."""

import app.main  # noqa: F401  (initializes and seeds the test database)
from app import db, seed, store


def names():
    return {p["id"]: p["name"] for p in store.list_people(include_self=True)}


def test_the_cast_is_gurneals():
    # Nick, Oct 25 2026: the demo cast is Mom, Sarah and Michael. No Dad.
    assert names() == {"me": "Riley", "mom": "Mom", "jordan": "Sarah", "priya": "Michael"}
    mom = store.get_person("mom")
    assert (mom["channel"], mom["timezone"], mom["language"], mom["pronoun"]) == ("whatsapp", "Asia/Kolkata", "Hindi", "her")
    assert store.get_person("priya")["aliases"] == ["Michael", "Mike"]


def test_seeded_drafts_match_the_home_screen():
    with db.tx() as c:
        dad = c.execute("SELECT COUNT(*) FROM pieces WHERE person_id = 'dad'").fetchone()[0]
        sarah = [r["text"] for r in c.execute("SELECT text FROM pieces WHERE person_id = 'jordan'")]
        reminder = c.execute("SELECT text FROM reminders WHERE id = 'rem_priya'").fetchone()
    assert dad == 0
    assert "I miss the way we used to talk." in sarah
    assert reminder["text"] == "3 reels this week"


def test_ensure_cast_adds_missing_people_but_never_overwrites_edits():
    with db.tx() as c:
        c.execute("UPDATE people SET name = 'Jordan' WHERE id = 'jordan'")  # edited through the API earlier
        c.execute("DELETE FROM people WHERE id = 'priya'")                # an older database without Michael
    try:
        added = seed.ensure_cast()
        assert added == ["priya"]
        assert names()["jordan"] == "Jordan"  # the edit survives
        assert seed.ensure_cast() == []        # idempotent
    finally:
        with db.tx() as c:
            c.execute("UPDATE people SET name = 'Sarah' WHERE id = 'jordan'")


def test_an_existing_database_drops_dad_on_start_and_reset():
    from datetime import datetime, timezone
    from pathlib import Path

    stamp = datetime(2026, 10, 18, tzinfo=timezone.utc).isoformat()
    rel = store.save_media("photos", "seed_dad_porch.jpg", b"\xff\xd8old")
    with db.tx() as c:  # what an older database still has
        c.execute(
            "INSERT INTO people (id, name, relation, pronoun, channel, timezone) "
            "VALUES ('dad', 'Dad', 'father', 'him', 'whatsapp', 'Asia/Kolkata')"
        )
        c.execute("INSERT INTO pieces (id, person_id, text, tone, created_at) VALUES "
                  "('piece_dad_oct18', 'dad', 'I never said thank you.', 'grateful', ?)", (stamp,))
        c.execute("INSERT INTO photos (id, person_id, path, caption, created_at) VALUES "
                  "('photo_seed_dad_porch', 'dad', ?, '', ?)", (rel, stamp))
    assert seed.retire_people() == ["dad"]
    assert "dad" not in names()
    with db.tx() as c:
        assert c.execute("SELECT COUNT(*) FROM pieces WHERE person_id = 'dad'").fetchone()[0] == 0
        assert c.execute("SELECT COUNT(*) FROM photos WHERE person_id = 'dad'").fetchone()[0] == 0
    assert not Path(store.media_path(rel)).exists()
    assert seed.retire_people() == []  # idempotent
    seed.seed_if_empty()               # a restart never brings him back
    assert "dad" not in names()
    assert not list((Path(seed.SEED_MEDIA)).glob("seed_dad_*"))


def test_reset_puts_back_a_cast_pronoun_from_an_older_database():
    """Michael was the best friend "Priya" ("her") in older databases; the cast's pronoun wins."""
    from fastapi.testclient import TestClient

    from app import db
    from app.main import app

    with TestClient(app) as c:
        with db.tx() as conn:
            conn.execute("UPDATE people SET pronoun = 'her' WHERE id = 'priya'")
        c.post("/api/demo/reset")
        michael = next(p for p in c.get("/api/people").json() if p["id"] == "priya")
        assert michael["pronoun"] == "him"
