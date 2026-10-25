"""A letter can be held for anyone who's asleep (not only WhatsApp), and the letter doesn't repeat itself."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client():
    with TestClient(app) as c:
        c.post("/api/demo/reset")
        yield c
        c.post("/api/demo/clock", json={"reset": True})


def _person(client, pid):
    return next(p for p in client.get("/api/home").json()["people"] if p["id"] == pid)


def test_imessage_letter_is_held_while_she_sleeps(client):
    client.post("/api/demo/clock", json={"set_local": "2026-10-25T00:30"})  # Sarah is in his time zone
    assert _person(client, "jordan")["is_asleep"] is True
    piece = client.get("/api/people/jordan/pieces").json()[0]["id"]
    card = client.post("/api/cards", json={"recipient_id": "jordan", "piece_ids": [piece], "when": "her_morning"}).json()
    assert card["status"] == "held"
    assert card["release_at"] == "2026-10-25T13:00:00+00:00"  # 8:00 AM CDT
    assert card["release_label"] == "8:00 AM her time"


def test_awake_means_it_goes_now_even_when_asked_to_hold(client):
    client.post("/api/demo/clock", json={"set_local": "2026-10-24T18:32"})
    assert _person(client, "jordan")["is_asleep"] is False
    piece = client.get("/api/people/jordan/pieces").json()[0]["id"]
    card = client.post("/api/cards", json={"recipient_id": "jordan", "piece_ids": [piece], "when": "her_morning"}).json()
    assert card["status"] != "held"
    assert card["release_at"] is None


def test_a_line_said_twice_is_in_the_letter_once(client):
    client.post("/api/demo/clock", json={"set_local": "2026-10-24T18:32"})
    rant = client.post("/api/rants/text", json={"text": "Sarah, I miss the way we used to talk. I'm sorry I bailed on Barton Springs."}).json()
    groups = {g["person"]["id"]: g for g in client.post(f"/api/rants/{rant['id']}/sort").json()["groups"]}
    tonight = [p["id"] for p in groups["jordan"]["pieces"]]
    ids = ["piece_jordan_sep30", *tonight]  # the seeded "I miss the way we used to talk." + tonight's longer line
    card = client.post("/api/cards", json={"recipient_id": "jordan", "piece_ids": ids, "when": "now"}).json()
    texts = [line["text"] for line in card["lines"]]
    assert not any(t == "I miss the way we used to talk." for t in texts)
    assert sum("miss the way we used to talk" in t.lower() for t in texts) == 1
