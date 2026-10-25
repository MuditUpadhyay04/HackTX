"""The People tab: people grouped by relationship, with the photos he gave each of them."""

from fastapi.testclient import TestClient

import app.main  # noqa: F401  (initializes and seeds the test database)
from app import db, groups, seed, store

client = TestClient(app.main.app)


def test_relations_map_to_groups():
    assert groups.group_of("mother") == "mom"
    assert groups.group_of("Father") == "dad"
    assert groups.group_of("girlfriend") == "partner"
    assert groups.group_of("best friend") == "best_friend"
    assert groups.group_of("sis") == "sister"
    assert groups.group_of("coworker") == "other"


def test_groups_endpoint_groups_the_cast_with_their_photos():
    res = client.get("/api/people/groups")
    assert res.status_code == 200
    body = res.json()
    by_id = {e["person"]["id"]: e for e in body["people"]}
    assert set(by_id) == {"mom", "dad", "jordan", "priya"}  # never "me"
    assert (by_id["mom"]["group"], by_id["dad"]["group"]) == ("mom", "dad")
    assert by_id["jordan"]["group"] == "partner"       # Sarah is his girlfriend in the seed
    assert by_id["priya"]["group"] == "best_friend"    # Michael is his best friend in the seed
    assert by_id["mom"]["family"] and not by_id["priya"]["family"]
    assert body["groups"] == ["mom", "dad", "best_friend", "partner"]
    assert body["has_family"] is True
    for entry in body["people"]:
        jpgs = [p for p in entry["photos"] if p["url"].endswith(".jpg")]
        assert len(jpgs) >= 2, entry["person"]["name"]
        assert all(p["person_id"] == entry["person"]["id"] for p in entry["photos"])
    # the files are real and served
    assert client.get(by_id["dad"]["photos"][0]["url"]).status_code == 200


def test_gallery_links_ride_along_and_seeding_is_idempotent():
    with db.tx() as c:
        c.execute(
            "INSERT OR IGNORE INTO photo_links (asset_id, person_id, times, letters, first_at, last_at) "
            "VALUES ('asset-1', 'mom', 1, 0, ?, ?)", ("2026-10-25T00:00:00+00:00",) * 2,
        )
    try:
        mom = next(e for e in client.get("/api/people/groups").json()["people"] if e["person"]["id"] == "mom")
        assert "asset-1" in mom["asset_ids"]
        assert seed.ensure_people_photos() == []
    finally:
        with db.tx() as c:
            c.execute("DELETE FROM photo_links WHERE asset_id = 'asset-1'")


def test_a_brother_gets_his_own_group_inside_family():
    with db.tx() as c:
        c.execute(
            "INSERT INTO people (id, name, relation, channel, timezone, sort) VALUES ('bro', 'Sam', 'brother', 'imessage', 'America/Chicago', 9)"
        )
    try:
        body = client.get("/api/people/groups").json()
        assert "brother" in body["groups"]
        assert next(e for e in body["people"] if e["person"]["id"] == "bro")["family"] is True
    finally:
        with db.tx() as c:
            c.execute("DELETE FROM people WHERE id = 'bro'")
    assert store.get_person("bro") is None
