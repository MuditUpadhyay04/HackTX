"""Push notifications that don't nag (P3). The Expo Push API is mocked; nothing leaves the machine."""

import asyncio
from datetime import timedelta
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app import attention, audio, db, push, store, timeutil
from app.main import app

TOKEN_A = "ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]"
TOKEN_B = "ExponentPushToken[bbbbbbbbbbbbbbbbbbbbbb]"
SILENCE = audio.pcm_to_wav(b"\x00\x00" * audio.RATE)


@pytest.fixture()
def sent(monkeypatch):
    """Replaces the Expo Push API. Collects messages; TOKEN_B can be made 'unregistered'."""
    box = {"messages": [], "unregistered": set()}

    async def fake_send(messages):
        box["messages"].extend(messages)
        return [
            {"status": "error", "message": "gone", "details": {"error": "DeviceNotRegistered"}}
            if m["to"] in box["unregistered"] else {"status": "ok", "id": "t"}
            for m in messages
        ]

    monkeypatch.setattr(push, "send_batch", fake_send)
    return box


@pytest.fixture()
def client(sent):
    c = TestClient(app)  # no lifespan: the scheduler stays off, so flushes happen only when a test asks
    c.post("/api/demo/reset")
    with db.tx() as conn:
        conn.execute("DELETE FROM push_tokens")
    c.patch("/api/settings", json={"push_enabled": True, "knock_mode": "gentle"})
    return c


def flush():
    return asyncio.run(push.flush(timeutil.now_utc()))


def at(client, local):
    client.post("/api/demo/clock", json={"set_local": local})


def mom_replies(client):
    token = client.get("/api/demo/state").json()["mom_voice_note_link"].rsplit("/", 1)[1]
    assert client.post(f"/api/public/cards/{token}/reply", files={"file": ("r.wav", SILENCE, "audio/wav")}).status_code == 200


def test_register_takes_only_expo_tokens(client):
    assert client.post("/api/push/register", json={"token": "not-a-token-at-all"}).status_code == 400
    assert client.post("/api/push/register", json={"token": TOKEN_A, "platform": "ios"}).json() == {"ok": True, "active": True}


def test_her_voice_reply_pushes_right_away_in_his_evening(client, sent):
    client.post("/api/push/register", json={"token": TOKEN_A, "platform": "ios"})
    at(client, "2026-10-24T21:30")
    mom_replies(client)
    assert len(flush()) == 1
    [message] = sent["messages"]
    assert message["title"] == "Un-Said" and message["body"] == "Mom left you a voice note today."
    assert message["data"]["kind"] == "reply" and message["data"]["attention_id"]
    # Never twice for the same reply.
    assert flush() == []
    push.enqueue("reply", "again", timeutil.now_utc(), ref_id=message["data"]["ref_id"])
    assert flush() == [] and len(sent["messages"]) == 1


def test_at_night_it_waits_for_his_morning_and_drops_what_he_already_heard(client, sent):
    client.post("/api/push/register", json={"token": TOKEN_A, "platform": "ios"})
    at(client, "2026-10-25T00:30")  # 12:30 AM in Austin: his quiet hours
    mom_replies(client)
    assert flush() == []
    with db.tx() as c:
        due = c.execute("SELECT due_at FROM pushes WHERE kind = 'reply'").fetchone()["due_at"]
    assert due == "2026-10-25T13:00:00+00:00"  # 8:00 AM CDT
    at(client, "2026-10-25T08:01")
    assert len(flush()) == 1 and sent["messages"][0]["body"] == "Mom left you a voice note today."

    # Another night: she replies, and he hears it in the app before morning. No push at all.
    sent["messages"].clear()
    at(client, "2026-10-26T01:00")
    mom_replies(client)
    reply_id = client.get("/api/home").json()["replies"][0]["id"]
    client.post(f"/api/replies/{reply_id}/heard")
    at(client, "2026-10-26T08:05")
    assert flush() == [] and sent["messages"] == []
    with db.tx() as c:
        assert c.execute("SELECT status FROM pushes WHERE ref_id = ?", (reply_id,)).fetchone()["status"] == "dropped"


def test_a_token_expo_says_is_gone_is_never_used_again(client, sent):
    client.post("/api/push/register", json={"token": TOKEN_A})
    client.post("/api/push/register", json={"token": TOKEN_B})
    sent["unregistered"].add(TOKEN_B)
    at(client, "2026-10-24T21:30")
    mom_replies(client)
    flush()
    assert {m["to"] for m in sent["messages"]} == {TOKEN_A, TOKEN_B}
    assert push.active_tokens() == [TOKEN_A]
    assert client.post("/api/push/register", json={"token": TOKEN_B}).json()["active"] is False


def hold_a_letter(client, text):
    rant = client.post("/api/rants/text", json={"text": text}).json()
    group = client.post(f"/api/rants/{rant['id']}/sort").json()["groups"][0]
    return client.post("/api/cards", json={"recipient_id": "mom", "piece_ids": [p["id"] for p in group["pieces"]]}).json()


def test_a_held_letter_that_needs_his_tap_pushes_once_and_not_after_he_sent_it(client, sent):
    client.post("/api/push/register", json={"token": TOKEN_A})
    at(client, "2026-10-24T18:32")
    card = hold_a_letter(client, "Mumma keeps calling.")
    assert card["status"] == "held"
    home_card = next(c for c in client.get("/api/home").json()["cards"] if c["id"] == card["id"])
    assert home_card["remind_at"] == "2026-10-25T02:30:00+00:00"  # her 8 AM is his 9:30 PM: not his night
    assert home_card["remind_body"] == "It's 8:00 AM for Mom. Send it now?"

    client.post("/api/demo/clock", json={"advance_minutes": 180})  # her morning; no WhatsApp keys, so it waits for him
    assert len(flush()) == 1
    assert sent["messages"][0]["body"] == "It's 8:02 AM for Mom. Send it now?"
    assert sent["messages"][0]["sound"] == "default" and sent["messages"][0]["channelId"] == "default"
    assert flush() == []

    # The next night's letter: he sends it from the app before the push goes out. It's dropped.
    sent["messages"].clear()
    at(client, "2026-10-25T18:32")
    second = hold_a_letter(client, "Mumma I miss you.")
    client.post("/api/demo/clock", json={"advance_minutes": 180})
    client.post(f"/api/cards/{second['id']}/shared")
    assert flush() == [] and sent["messages"] == []


def test_only_a_letter_that_cant_go_by_itself_needs_him(monkeypatch):
    mom = {"channel": "whatsapp", "handle": "+919800000000"}
    assert store.needs_his_tap(mom)  # no WhatsApp Cloud API keys
    monkeypatch.setattr(store, "settings", SimpleNamespace(whatsapp_enabled=True))
    assert not store.needs_his_tap(mom)
    assert store.needs_his_tap({**mom, "handle": ""})
    assert store.needs_his_tap({"channel": "imessage", "handle": "+15125550100"})


def test_push_off_means_nothing_is_queued(client, sent):
    client.post("/api/push/register", json={"token": TOKEN_A})
    client.patch("/api/settings", json={"push_enabled": False})
    at(client, "2026-10-24T21:30")
    mom_replies(client)
    assert flush() == [] and sent["messages"] == []
    client.patch("/api/settings", json={"push_enabled": True})


def test_the_weekly_push_is_rare(client, sent):
    client.post("/api/push/register", json={"token": TOKEN_A})
    at(client, "2026-10-24T19:00")  # early evening for him
    now = timeutil.now_utc()

    db.kv_set("last_activity_at", db.iso(now - timedelta(days=1)))
    assert push._drift_due(now) is None  # he was here yesterday

    db.kv_set("last_activity_at", db.iso(now - timedelta(days=4)))
    body = push._drift_due(now)
    assert body == "We noticed you've been quieter with the people closest to you lately. Want to say what you haven't?"
    assert len(asyncio.run(push.tick(now))) == 1
    assert sent["messages"][0]["data"]["kind"] == "drift" and "sound" not in sent["messages"][0]  # silent
    assert asyncio.run(push.tick(now)) == []                     # not twice in a day
    assert push._drift_due(now + timedelta(days=6)) is None       # the week isn't up
    # He didn't open it: the next one waits two weeks, not one.
    assert push._drift_due(now + timedelta(days=8)) is None
    assert push._drift_due(now + timedelta(days=14)) is not None

    late = timeutil.now_utc() + timedelta(hours=3)                # 10 PM: outside his evening window
    assert push._drift_due(late + timedelta(days=14)) is None

    client.patch("/api/settings", json={"knock_mode": "off"})
    assert push._drift_due(now + timedelta(days=14)) is None
    client.patch("/api/settings", json={"knock_mode": "gentle"})


def test_permission_is_asked_once(client):
    assert client.get("/api/settings").json()["permission_asked"] is False
    assert client.post("/api/push/permission", json={"granted": False}).json()["permission_asked"] is True
    assert [e.outcome for e in attention.events("permission_ask")] == ["dismissed"]
