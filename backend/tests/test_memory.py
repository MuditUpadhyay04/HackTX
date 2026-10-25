"""Photo memory and "Tell them how you feel. Communication helps." (P1)."""

import sqlite3

import pytest
from fastapi.testclient import TestClient

from app import audio, db
from app.main import app

ENCOURAGE = "Tell them how you feel. Communication helps."
KITCHEN = "ph://kitchen-photo/L0/001"
SILENCE_3S = b"\x00\x00" * audio.RATE * 3


@pytest.fixture()
def client():
    with TestClient(app) as c:
        c.post("/api/demo/reset")
        c.post("/api/demo/clock", json={"set_local": "2026-10-24T18:32"})
        yield c


def rant(client, text, asset_id=KITCHEN):
    r = client.post("/api/rants/text", json={"text": text, "asset_id": asset_id}).json()
    return r, client.post(f"/api/rants/{r['id']}/sort").json()


def group(result, person_id):
    return next(g for g in result["groups"] if g["person"]["id"] == person_id)


def test_a_photo_remembers_what_he_said_there(client):
    first, result = rant(client, "Mumma keeps calling and I keep letting it ring.")
    assert first["asset_id"] == KITCHEN
    mom = group(result, "mom")
    assert mom["history"] == {"earlier_count": 0, "first_at": None, "last_spoken_at": None}
    assert mom["encourage"] is None  # first time he says anything to her: no nudge

    memory = client.get("/api/memory/photo", params={"asset_id": KITCHEN}).json()
    assert [(p["person"]["id"], p["times"]) for p in memory["people"]] == [("mom", 1)]
    assert memory["people"][0]["kept"] == 1
    assert [p["text"] for p in memory["previous"]] == ["Mumma keeps calling and I keep letting it ring."]
    assert memory["previous"][0]["person_name"] == "Mom" and memory["previous"][0]["day"] == "today"

    # An unknown photo has no memory and no links.
    empty = client.get("/api/memory/photo", params={"asset_id": "ph://never-seen"}).json()
    assert empty["people"] == [] and empty["previous"] == []


def test_the_second_time_on_the_same_photo_says_tell_them(client):
    rant(client, "Mumma keeps calling and I keep letting it ring.")
    _, second = rant(client, "I miss you Mumma. I just don't know how to call.")
    mom = group(second, "mom")
    assert mom["history"]["earlier_count"] == 1
    assert mom["encourage"] == ENCOURAGE
    # Sorting again says the same thing (decided once, stored).
    again = client.post(f"/api/rants/{second['rant']['id']}/sort").json()
    assert group(again, "mom")["encourage"] == ENCOURAGE

    # Not again for her within 72 hours...
    _, third = rant(client, "Ma I keep thinking about your dal.")
    assert group(third, "mom")["encourage"] is None
    assert group(third, "mom")["history"]["earlier_count"] == 2

    # ...but after three days, yes.
    client.post("/api/demo/clock", json={"advance_minutes": 73 * 60})
    _, later = rant(client, "Mumma, I'm sorry I haven't called.")
    assert group(later, "mom")["encourage"] == ENCOURAGE


def test_only_one_person_hears_it_and_most_words_held_wins(client):
    # Sarah has two lines held from earlier weeks (seeded); Mom has one from tonight.
    rant(client, "Mumma keeps calling.", asset_id=None)
    _, both = rant(client, "Mumma keeps calling. And Sarah said please just say something.", asset_id=None)
    lines = {g["person"]["id"]: g["encourage"] for g in both["groups"]}
    assert lines == {"mom": None, "jordan": ENCOURAGE}


def test_no_nudge_while_a_letter_is_waiting_or_just_went_out(client):
    _, first = rant(client, "Mumma keeps calling and I keep letting it ring.")
    piece_ids = [p["id"] for p in group(first, "mom")["pieces"]]
    held = client.post("/api/cards", json={"recipient_id": "mom", "piece_ids": piece_ids, "when": "her_morning"}).json()
    assert held["status"] == "held"
    _, second = rant(client, "I miss you Mumma.")
    assert group(second, "mom")["encourage"] is None

    # Delivered this week still counts as "already reached out".
    client.post("/api/demo/clock", json={"advance_minutes": 180})
    client.post(f"/api/cards/{held['id']}/shared")
    _, third = rant(client, "Ma I keep thinking about your dal.")
    assert group(third, "mom")["encourage"] is None


def test_a_concern_never_gets_the_line(client):
    rant(client, "Mumma keeps calling and I keep letting it ring.")
    _, concern = rant(client, "Mumma I can't do this anymore. I want to end it all.")
    assert concern["safety"] == "self_harm" and concern["groups"] == []
    memory = client.get("/api/memory/photo", params={"asset_id": KITCHEN}).json()
    assert len(memory["previous"]) == 1  # nothing from the concern is shown back


def test_he_can_hear_himself(client):
    with client.websocket_connect("/api/rants/live") as ws:
        ws.send_json({"type": "start", "asset_id": KITCHEN})
        assert ws.receive_json()["type"] == "ready"
        for i in range(0, len(SILENCE_3S), 3840):
            ws.send_bytes(SILENCE_3S[i : i + 3840])
        ws.send_json({"type": "stop"})
        while (event := ws.receive_json())["type"] != "done":
            pass
    spoken = event["rant"]
    assert spoken["asset_id"] == KITCHEN
    result = client.post(f"/api/rants/{spoken['id']}/sort").json()
    piece = group(result, "mom")["pieces"][0]
    assert piece["has_audio"] and piece["audio_url"] == f"/api/pieces/{piece['id']}/audio"
    wav = client.get(piece["audio_url"])
    assert wav.status_code == 200 and wav.headers["content-type"] == "audio/wav"
    pcm, rate = audio.wav_to_pcm(wav.content)
    assert rate == audio.RATE and len(pcm) > 0

    memory = client.get("/api/memory/photo", params={"asset_id": KITCHEN}).json()
    assert memory["previous"][0]["audio_url"]

    # A typed line has no voice to play.
    _, typed = rant(client, "Mumma keeps calling.")
    no_voice = group(typed, "mom")["pieces"][0]
    assert no_voice["audio_url"] is None
    assert client.get(f"/api/pieces/{no_voice['id']}/audio").status_code == 404


def test_a_letter_that_carried_the_photo_links_it(client):
    jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 64
    client.post(
        "/api/photos",
        files={"file": ("p.jpg", jpeg, "image/jpeg")},
        data={"person_id": "priya", "asset_id": "ph://michael-photo"},
    )
    memory = client.get("/api/memory/photo", params={"asset_id": "ph://michael-photo"}).json()
    assert [(p["person"]["id"], p["times"], p["letters"]) for p in memory["people"]] == [("priya", 0, 1)]


def test_an_older_database_gets_the_new_columns():
    old = sqlite3.connect(":memory:")
    old.execute(
        "CREATE TABLE rants (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, provider TEXT NOT NULL, transcript TEXT NOT NULL, "
        "turns TEXT NOT NULL, audio_path TEXT, safety TEXT, sorted_by TEXT, sorted_at TEXT)"
    )
    db.migrate(old)
    db.migrate(old)  # twice is fine
    columns = {row[1] for row in old.execute("PRAGMA table_info(rants)")}
    assert {"asset_id", "encourage_person"} <= columns
    tables = {row[0] for row in old.execute("SELECT name FROM sqlite_master WHERE type = 'table'")}
    assert {"photo_links", "attention", "push_tokens", "pushes"} <= tables
