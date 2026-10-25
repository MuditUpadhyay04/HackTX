"""The film's new lines (PLAN.md §5): each appears under its rule, and not otherwise."""

import re
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app import voice
from app.attention import Event, KnockContext, KnockRequest, decide_knock
from app.main import app

NOW = datetime(2026, 10, 25, 3, 40, tzinfo=timezone.utc)
DRIFT = ("You haven't talked to Sarah in a while, and she keeps texting. You have un-said things for her. "
         "Let her know you're thinking of her. Sometimes, talking is all you need.")
STEP = "Take that step. However it goes, they'll know how you feel. And there are people who love you, no matter what."
SARAH_PHOTO = "https://example.test/media/photos/seed_sarah_coffee.jpg"


def ctx(**over) -> KnockContext:
    base = dict(mode="gentle", linked=["jordan"], unheard_replies=[], reached_out=[], last_concern_at=None,
                knocks=[], drift={"jordan": DRIFT})
    base.update(over)
    return KnockContext(**base)


def ask(session="s-now"):
    return KnockRequest("ph://x", 4000, False, False, session)


def test_the_strings_are_exact_and_clean():
    assert voice.drift_knock("Sarah", "her") == DRIFT
    assert voice.drift_knock("Michael", "him").startswith("You haven't talked to Michael in a while, and he keeps texting.")
    assert "they keep texting" in voice.drift_knock("Sam", "them")
    assert voice.waiting("Mom") == "Mom is waiting to hear this from you."
    assert voice.call_action("whatsapp") == "Call on WhatsApp"
    assert voice.TAKE_THAT_STEP == STEP
    assert voice.reply_elsewhere("Michael", "instagram") == "Reply to Michael on Instagram"
    for line in (DRIFT, voice.WAITING, voice.CALL_ACTION, STEP, voice.REPLY_ELSEWHERE):
        assert not re.search(r"we detected|\brisk|depressed|\bsad\b|unsend", line, re.I)


def test_drift_knock_goes_through_the_budget():
    d = decide_knock(ask(), ctx(), NOW)
    assert d.knock and d.detail == "drift" and d.body == DRIFT and d.person_id == "jordan"
    # Not linked to her, not hers.
    assert decide_knock(ask(), ctx(drift={}), NOW).detail == "linked"
    # The budget still caps it: one per session, two a day.
    seen = Event("att_1", "knock", "drift", "jordan", "ph://x", "s-now", NOW - timedelta(hours=4), "opened", NOW)
    assert decide_knock(ask(), ctx(knocks=[seen]), NOW).reason == "session_cap"
    two = [Event(f"att_{i}", "knock", "drift", "jordan", "ph://x", f"s{i}", NOW - timedelta(hours=h), "opened", NOW)
           for i, h in ((1, 10), (2, 5))]
    assert decide_knock(ask(), ctx(knocks=two), NOW).reason == "daily_cap"
    # The safety quiet rule still wins, in Demo mode too.
    assert decide_knock(ask(), ctx(mode="demo", last_concern_at=NOW - timedelta(hours=1)), NOW).reason == "safety_quiet"
    # Her unheard voice note still comes first.
    reply = decide_knock(ask(), ctx(unheard_replies=[("jordan", "Sarah left you a voice note.")]), NOW)
    assert reply.detail == "reply"


@pytest.fixture()
def client():
    with TestClient(app) as c:
        c.post("/api/demo/reset")
        c.post("/api/demo/attention/reset")
        c.patch("/api/settings", json={"knock_mode": "gentle"})
        c.post("/api/demo/clock", json={"set_local": "2026-10-25T22:40"})
        yield c
        c.patch("/api/settings", json={"knock_mode": "gentle"})


def knock(client, asset, session):
    return client.post("/api/knock/check", json={"asset_id": asset, "dwell_ms": 4000, "session_id": session}).json()


def test_drift_knock_on_sarahs_photo(client):
    k = knock(client, SARAH_PHOTO, "s1")
    assert k["knock"] and k["kind"] == "drift" and k["body"] == DRIFT and k["person_name"] == "Sarah"
    # A photo of Michael: he has no kept words for Michael, so no drift.
    m = knock(client, "https://other.host/media/photos/seed_michael_court.jpg", "s2")
    assert m.get("kind") != "drift"


def test_no_drift_right_after_he_spoke_about_her_unless_filming(client):
    r = client.post("/api/rants/text", json={"text": "Sarah, I miss you.", "asset_id": SARAH_PHOTO}).json()
    client.post(f"/api/rants/{r['id']}/sort")
    client.post("/api/demo/attention/reset")
    assert knock(client, SARAH_PHOTO, "s3").get("kind") != "drift"
    client.patch("/api/settings", json={"knock_mode": "film"})
    filmed = knock(client, SARAH_PHOTO, "s3")
    assert filmed["kind"] == "drift" and filmed["body"] == DRIFT
    # Demo mode (the judging table) says the demo line instead, after 8 s.
    client.patch("/api/settings", json={"knock_mode": "demo"})
    demo = client.post("/api/knock/check", json={"asset_id": SARAH_PHOTO, "dwell_ms": 8000, "session_id": "s3"}).json()
    assert demo["kind"] == "drift" and demo["body"] == voice.KNOCK_DEMO and demo["prompt"] == voice.TALK_DEMO


def group(result, pid):
    return next(g for g in result["groups"] if g["person"]["id"] == pid)


def test_mom_is_waiting_and_take_that_step(client):
    r = client.post("/api/rants/text", json={"text": "Mumma, I'm sorry I keep missing your calls. Sarah, I miss you."}).json()
    first = client.post(f"/api/rants/{r['id']}/sort").json()
    mom = group(first, "mom")
    assert mom["waiting"]["line"] == "Mom is waiting to hear this from you."
    assert mom["waiting"]["action"] == {
        "kind": "call", "channel": "whatsapp", "person_id": "mom", "label": "Call on WhatsApp", "url": "https://wa.me/919876543210",
    }
    assert group(first, "jordan")["waiting"] is None  # Sarah is on Messages
    # Gentle: no step after the first rant of a session.
    assert all(g["step"] is None for g in first["groups"])

    r2 = client.post("/api/rants/text", json={"text": "Sarah, I should have said this sooner.", "asset_id": SARAH_PHOTO}).json()
    second = client.post(f"/api/rants/{r2['id']}/sort").json()
    assert group(second, "jordan")["step"] == STEP  # she has the most kept words
    memory = client.get("/api/memory/photo", params={"asset_id": SARAH_PHOTO}).json()
    assert memory["step"] == {"line": STEP, "person_id": "jordan"}
    # Once per person per 72 h.
    r3 = client.post("/api/rants/text", json={"text": "Sarah, I'm still here."}).json()
    assert group(client.post(f"/api/rants/{r3['id']}/sort").json(), "jordan")["step"] is None


def test_no_waiting_once_he_has_written_to_her(client):
    pieces = client.get("/api/people/mom/pieces").json()
    r = client.post("/api/rants/text", json={"text": "Mumma, I'm okay. I'll call."}).json()
    client.post(f"/api/rants/{r['id']}/sort")
    pieces = client.get("/api/people/mom/pieces").json()
    client.post("/api/cards", json={"recipient_id": "mom", "piece_ids": [p["id"] for p in pieces], "when": "now"})
    r2 = client.post("/api/rants/text", json={"text": "Mumma, one more thing."}).json()
    assert group(client.post(f"/api/rants/{r2['id']}/sort").json(), "mom")["waiting"] is None


def test_reply_to_michael_on_instagram(client):
    nudges = client.get("/api/home").json()["nudges"]
    mine = [n for n in nudges if n["kind"] == "reply_elsewhere"]
    assert len(mine) == 1
    n = mine[0]
    assert n["title"] == "Reply to Michael on Instagram" and n["person_id"] == "priya" and n["channel"] == "instagram"
    # A letter to Michael newer than his "You okay?" clears it.
    r = client.post("/api/rants/text", json={"text": "Michael, I've been a ghost. I'm sorry."}).json()
    client.post(f"/api/rants/{r['id']}/sort")
    pieces = client.get("/api/people/priya/pieces").json()
    client.post("/api/cards", json={"recipient_id": "priya", "piece_ids": [p["id"] for p in pieces], "when": "now"})
    assert not [n for n in client.get("/api/home").json()["nudges"] if n["kind"] == "reply_elsewhere"]
