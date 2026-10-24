"""The demo script, end to end, on mock AI. Each step names its shot in Demo_Script_v2.md."""

import dataclasses

import pytest
from fastapi.testclient import TestClient

from app import audio
from app.main import app

SILENCE_3S = b"\x00\x00" * audio.RATE * 3


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        c.post("/api/demo/reset")
        yield c


def live_rant(client) -> dict:
    """Shot 8: hold the mic, talk, let go."""
    with client.websocket_connect("/api/rants/live") as ws:
        ws.send_json({"type": "start"})
        assert ws.receive_json() == {"type": "ready", "provider": "mock"}
        for i in range(0, len(SILENCE_3S), 3840):  # 80 ms frames
            ws.send_bytes(SILENCE_3S[i : i + 3840])
        ws.send_json({"type": "stop"})
        partials = 0
        while True:
            event = ws.receive_json()
            if event["type"] == "partial":
                partials += 1
            if event["type"] == "done":
                assert partials > 10
                return event["rant"]


def test_the_one_evening(client):
    # Austin, 6:32 PM. Mom is asleep at 5:02 AM.
    state = client.post("/api/demo/clock", json={"set_local": "2026-10-24T18:32"}).json()
    mom = next(p for p in state["people"] if p["id"] == "mom")
    assert mom["time_label"] == "5:02 AM for Mom · asleep"

    # Shots 6-7: Mom's Tuesday voice note is waiting, unheard.
    tuesday_link = state["mom_voice_note_link"]
    token = tuesday_link.rsplit("/", 1)[1]
    assert client.get(f"/api/public/cards/{token}").status_code == 200
    reply = client.post(
        f"/api/public/cards/{token}/reply", files={"file": ("r.wav", audio.pcm_to_wav(SILENCE_3S), "audio/wav")}
    )
    assert reply.status_code == 200
    home = client.get("/api/home").json()
    nudge = next(n for n in home["nudges"] if n["kind"] == "reply")
    assert nudge["title"] == "Mom left you a voice note today."
    client.post(f"/api/demo/replies/{nudge['id']}/backdate", json={"to_local": "2026-10-20T19:10"})
    home = client.get("/api/home").json()
    nudge = next(n for n in home["nudges"] if n["kind"] == "reply")
    assert nudge["title"] == "Mom left you a voice note on tuesday."
    assert nudge["reply"]["translation"]
    client.post(f"/api/replies/{nudge['id']}/heard")
    assert not [n for n in client.get("/api/home").json()["nudges"] if n["kind"] == "reply"]

    # Shots 8-9: the rant, sorted into three people, his words only.
    rant = live_rant(client)
    assert rant["provider"] == "mock" and rant["has_audio"]
    result = client.post(f"/api/rants/{rant['id']}/sort").json()
    assert result["safety"] == "ok"
    groups = {g["person"]["id"]: g for g in result["groups"]}
    assert list(groups) == ["mom", "jordan", "priya"]
    assert groups["mom"]["pieces"][0]["text"].startswith("Mumma called three times today")
    assert groups["mom"]["pieces"][0]["has_audio"] is True
    assert groups["jordan"]["kept_total"] == 3  # tonight's line plus Oct 11 and Sep 30
    assert groups["mom"]["reflection"] == "you still want her to know."
    for g in result["groups"]:
        for p in g["pieces"]:
            assert p["text"] in rant["transcript"]
    # Sorting twice doesn't duplicate anything.
    again = client.post(f"/api/rants/{rant['id']}/sort").json()
    assert [p["id"] for p in again["groups"][0]["pieces"]] == [p["id"] for p in groups["mom"]["pieces"]]

    # Shot 10: hold until her morning.
    card = client.post(
        "/api/cards",
        json={"recipient_id": "mom", "piece_ids": [p["id"] for p in groups["mom"]["pieces"]],
              "photo_id": "photo_kitchen", "when": "her_morning"},
    ).json()
    assert card["status"] == "held"
    assert card["release_at"] == "2026-10-25T02:30:00+00:00"
    assert card["release_label"] == "8:00 AM her time"
    assert card["audio_url"]
    assert card["translation"]
    card_token = card["share"]["url"].rsplit("/", 1)[1]
    assert client.get(f"/api/public/cards/{card_token}").status_code == 404  # sealed until 8 AM

    # Shot 11: three hours later. No WhatsApp keys in tests, so he gets the "send it now?" fallback.
    after = client.post("/api/demo/clock", json={"advance_minutes": 180}).json()
    assert card["id"] in after["released"]
    home = client.get("/api/home").json()
    ready = next(n for n in home["nudges"] if n["kind"] == "ready")
    assert ready["title"] == "it's 8:02 AM for Mom. send it now?"
    assert ready["card"]["share"]["whatsapp"].startswith("https://wa.me/919876543210?text=")
    client.post(f"/api/cards/{card['id']}/shared")

    # Shot 12: Mom's page. No app, no account.
    page = client.get(f"/api/public/cards/{card_token}").json()
    assert page["sender_name"] == "Arjun"
    assert page["lines"][0]["text"].startswith("Mumma called")
    assert page["audio_url"] and page["photo_url"]
    assert page["call_url"] == "https://wa.me/15125550199"
    assert client.get(f"/c/{card_token}").status_code == 200

    # Shot 15: Jordan's stack, unchecked by default; he sends the two older lines.
    stack = client.get("/api/people/jordan/pieces").json()
    assert [p["created_at"][:10] for p in stack][:2] == ["2026-09-30", "2026-10-11"]
    older = [p["id"] for p in stack if p["rant_id"] is None]
    jcard = client.post("/api/cards", json={"recipient_id": "jordan", "piece_ids": older, "when": "now"}).json()
    assert jcard["status"] == "ready"
    assert jcard["share"]["sms_ios"].startswith("sms:+15125550142&body=I%20miss%20how%20we%20used%20to%20talk")
    assert len(client.get("/api/people/jordan/pieces").json()) == 1  # tonight's stays kept

    # Shot 18: Priya's reminder hands off to Instagram.
    reminder = home["reminders"][0]
    assert reminder["handoff"] == "https://ig.me/m/priya.k"


def test_a_hopeless_rant_gets_resources_not_cards(client):
    rant = client.post("/api/rants/text", json={"text": "I can't do this. I want to end it all."}).json()
    result = client.post(f"/api/rants/{rant['id']}/sort").json()
    assert result["safety"] == "self_harm"
    assert result["groups"] == []
    assert any("988" in r["detail"] for r in result["resources"])


def test_cards_only_carry_that_persons_pieces(client):
    rant = client.post("/api/rants/text", json={"text": "Priya keeps sending reels. Mumma called again."}).json()
    groups = {g["person"]["id"]: g for g in client.post(f"/api/rants/{rant['id']}/sort").json()["groups"]}
    resp = client.post("/api/cards", json={"recipient_id": "mom", "piece_ids": [groups["priya"]["pieces"][0]["id"]]})
    assert resp.status_code == 400


def test_app_key_guards_his_side_but_not_moms(client, monkeypatch):
    import app.auth as auth

    monkeypatch.setattr(auth, "settings", dataclasses.replace(auth.settings, app_key="s3cret"))
    assert client.get("/api/home").status_code == 401
    assert client.get("/api/home", headers={"X-App-Key": "s3cret"}).status_code == 200
    assert client.get("/api/home?key=s3cret").status_code == 200
    assert client.get("/api/health").status_code == 200
    with pytest.raises(Exception):
        with client.websocket_connect("/api/rants/live") as ws:
            ws.receive_json()
