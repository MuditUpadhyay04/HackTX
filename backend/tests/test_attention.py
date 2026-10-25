"""The attention budget: every cap, cooldown and backoff rule, with time travel (P2)."""

from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app.attention import Event, KnockContext, KnockRequest, decide_knock
from app.main import app

NOW = datetime(2026, 10, 24, 23, 32, tzinfo=timezone.utc)  # Sat 6:32 PM in Austin
KNOCK_A = "We noticed you've been quieter with the people closest to you lately. Want to say what you haven't?"
KNOCK_B = "Mom, Sarah and Michael all reached out this week. Some things are easier to say here first."


def knock(ago: timedelta, *, person="mom", session="s-old", outcome="shown", answered_after=timedelta(seconds=5)):
    at = NOW - ago
    return Event(f"att_{ago}", "knock", "linked", person, "ph://x", session, at, outcome,
                 at + answered_after if outcome != "shown" else None)


def ctx(**over) -> KnockContext:
    base = dict(mode="gentle", linked=["mom"], unheard_replies=[], reached_out=[], last_concern_at=None, knocks=[])
    base.update(over)
    return KnockContext(**base)


def ask(dwell_ms=4000, zoomed=False, revisit=False, session="s-now"):
    return KnockRequest("ph://x", dwell_ms, zoomed, revisit, session)


# ---------------------------------------------------------------- when a photo may knock at all


def test_off_means_never():
    assert decide_knock(ask(60000), ctx(mode="off"), NOW).reason == "off"


def test_a_linked_photo_waits_four_seconds_unless_he_zooms_or_comes_back():
    assert decide_knock(ask(3999), ctx(), NOW).reason == "too_soon"
    assert decide_knock(ask(4000), ctx(), NOW).knock
    assert decide_knock(ask(0, zoomed=True), ctx(), NOW).knock
    assert decide_knock(ask(0, revisit=True), ctx(), NOW).knock


def test_an_unlinked_photo_only_ever_gets_the_one_first_knock():
    first = decide_knock(ask(5999), ctx(linked=[]), NOW)
    assert first.reason == "too_soon"
    first = decide_knock(ask(6000), ctx(linked=[]), NOW)
    assert first.knock and first.detail == "first" and first.body == KNOCK_A and first.person_id is None
    # Zooming doesn't buy an unlinked photo a knock.
    assert not decide_knock(ask(0, zoomed=True), ctx(linked=[]), NOW).knock
    # After any knock has ever happened, unlinked photos stay quiet for good.
    later = ctx(linked=[], knocks=[knock(timedelta(days=30), outcome="opened")])
    assert decide_knock(ask(600000), later, NOW).reason == "unlinked"


def test_nothing_within_a_day_of_a_safety_concern():
    assert decide_knock(ask(), ctx(last_concern_at=NOW - timedelta(hours=23)), NOW).reason == "safety_quiet"
    assert decide_knock(ask(), ctx(last_concern_at=NOW - timedelta(hours=25)), NOW).knock


# ---------------------------------------------------------------- caps


def test_one_knock_per_session():
    earlier = [knock(timedelta(hours=5), session="s-now", outcome="opened")]
    assert decide_knock(ask(), ctx(knocks=earlier), NOW).reason == "session_cap"
    assert decide_knock(ask(session="s-next"), ctx(knocks=earlier), NOW).knock


def test_two_a_day():
    today = [knock(timedelta(hours=10), outcome="opened"), knock(timedelta(hours=4), outcome="opened")]
    assert decide_knock(ask(), ctx(knocks=today), NOW).reason == "daily_cap"
    tomorrow = NOW + timedelta(hours=14, minutes=1)
    assert decide_knock(ask(), ctx(knocks=today), tomorrow).knock


def test_three_hours_apart_unless_it_is_her_voice_waiting():
    recent = [knock(timedelta(hours=2), outcome="opened")]
    assert decide_knock(ask(), ctx(knocks=recent), NOW).reason == "too_close"
    assert decide_knock(ask(), ctx(knocks=recent), NOW + timedelta(hours=1, minutes=1)).knock
    with_reply = ctx(knocks=recent, unheard_replies=[("mom", "Mom left you a voice note on tuesday.")])
    reply = decide_knock(ask(), with_reply, NOW)
    assert reply.knock and reply.detail == "reply" and reply.body == "Mom left you a voice note on tuesday."
    # ...but a reply still respects the session cap.
    same_session = ctx(knocks=[knock(timedelta(hours=2), session="s-now", outcome="opened")],
                       unheard_replies=[("mom", "Mom left you a voice note on tuesday.")])
    assert decide_knock(ask(), same_session, NOW).reason == "session_cap"


# ---------------------------------------------------------------- backing off


def test_a_dismiss_buys_that_person_three_days_of_quiet():
    dismissed = [knock(timedelta(hours=71), outcome="dismissed", answered_after=timedelta(0))]
    assert decide_knock(ask(), ctx(knocks=dismissed), NOW).reason == "person_cooldown"
    assert decide_knock(ask(), ctx(knocks=dismissed), NOW + timedelta(hours=2)).knock
    # Someone else on the same photo can still be the one it's about.
    other = decide_knock(ask(), ctx(linked=["mom", "priya"], knocks=dismissed), NOW)
    assert other.knock and other.person_id == "priya"


def test_two_dismisses_in_a_row_pause_knocks_for_a_week():
    two = [
        knock(timedelta(days=6), person="priya", outcome="dismissed"),
        knock(timedelta(days=5, hours=12), person="priya", outcome="dismissed"),
    ]
    assert decide_knock(ask(), ctx(knocks=two), NOW).reason == "paused"
    assert decide_knock(ask(), ctx(knocks=two), NOW + timedelta(days=2)).knock
    # A knock he never answered doesn't break the run...
    with_silence = [two[0], knock(timedelta(days=5, hours=20), person="priya"), two[1]]
    assert decide_knock(ask(), ctx(knocks=with_silence), NOW).reason == "paused"
    # ...but opening one resets it.
    reset = two + [knock(timedelta(days=5), person="priya", outcome="opened")]
    assert decide_knock(ask(), ctx(knocks=reset), NOW).knock


# ---------------------------------------------------------------- what it says


def test_body_b_when_people_reached_out_this_week():
    assert decide_knock(ask(), ctx(reached_out=["Mom", "Sarah", "Michael"]), NOW).body == KNOCK_B
    two = decide_knock(ask(), ctx(reached_out=["Mom", "Sarah"]), NOW).body
    assert two == "Mom and Sarah both reached out this week. Some things are easier to say here first."
    assert decide_knock(ask(), ctx(reached_out=["Mom"]), NOW).body == KNOCK_A


def test_a_reply_from_someone_not_in_this_photo_does_not_knock_here():
    other = decide_knock(ask(), ctx(linked=["priya"], unheard_replies=[("mom", "Mom left you a voice note.")]), NOW)
    assert other.detail == "linked" and other.person_id == "priya" and other.body == KNOCK_A


def test_demo_mode_knocks_fast_and_ignores_caps_but_not_safety():
    busy = [knock(timedelta(minutes=1), session="s-now", outcome="dismissed"),
            knock(timedelta(minutes=2), session="s-now", outcome="dismissed")]
    demo = ctx(mode="demo", linked=[], knocks=busy)
    assert decide_knock(ask(2999), demo, NOW).reason == "too_soon"
    assert decide_knock(ask(3000), demo, NOW).knock
    assert decide_knock(ask(3000), ctx(mode="demo", last_concern_at=NOW), NOW).reason == "safety_quiet"


# ---------------------------------------------------------------- the API


@pytest.fixture()
def client():
    with TestClient(app) as c:
        c.post("/api/demo/reset")
        c.patch("/api/settings", json={"knock_mode": "gentle"})
        c.post("/api/demo/clock", json={"set_local": "2026-10-24T18:32"})
        yield c


def check(client, asset, dwell=4000, session="s1", **flags):
    return client.post("/api/knock/check", json={"asset_id": asset, "dwell_ms": dwell, "session_id": session, **flags}).json()


def test_the_knock_through_the_api(client):
    # A brand-new photo: one first knock after 6 s, then never again on unlinked photos.
    assert check(client, "ph://new", dwell=4000) == {"knock": False, "reason": "too_soon"}
    first = check(client, "ph://new", dwell=6000)
    assert first["knock"] and first["kind"] == "first" and first["title"] == "Un-Said"
    assert client.post(f"/api/knock/{first['id']}/outcome", json={"outcome": "opened"}).json()["outcome"] == "opened"
    assert check(client, "ph://another", dwell=60000, session="s2")["reason"] == "unlinked"

    # He talks about Mom on the kitchen photo, so that photo is about her now.
    r = client.post("/api/rants/text", json={"text": "Mumma keeps calling.", "asset_id": "ph://kitchen"}).json()
    client.post(f"/api/rants/{r['id']}/sort")
    assert check(client, "ph://kitchen", session="s2")["reason"] == "too_close"  # 3 h after the first knock
    client.post("/api/demo/clock", json={"advance_minutes": 181})
    linked = check(client, "ph://kitchen", session="s2")
    assert linked["knock"] and linked["kind"] == "linked" and linked["person_name"] == "Mom"
    assert check(client, "ph://kitchen", session="s2", zoomed=True)["reason"] == "session_cap"
    client.post(f"/api/knock/{linked['id']}/outcome", json={"outcome": "dismissed"})

    # Two a day: a new session three hours later finds Mom cooling down after the dismiss.
    client.post("/api/demo/clock", json={"advance_minutes": 181})
    assert check(client, "ph://kitchen", session="s3")["reason"] in {"person_cooldown", "daily_cap"}

    # Settings.
    settings = client.get("/api/settings").json()
    assert settings["knock_mode"] == "gentle" and settings["quiet_start"] == "22:30" and settings["permission_asked"] is False
    assert client.patch("/api/settings", json={"knock_mode": "loud"}).status_code == 422
    assert client.patch("/api/settings", json={"quiet_start": "25:00"}).status_code == 400

    # Demo mode for rehearsal: fast and uncapped.
    client.patch("/api/settings", json={"knock_mode": "demo"})
    assert check(client, "ph://kitchen", dwell=3000, session="s3")["knock"]
    assert check(client, "ph://kitchen", dwell=3000, session="s3")["knock"]
    client.post("/api/demo/attention/reset")
    client.patch("/api/settings", json={"knock_mode": "off"})
    assert check(client, "ph://kitchen", dwell=60000, session="s9")["reason"] == "off"
    client.patch("/api/settings", json={"knock_mode": "gentle"})

    assert client.post("/api/knock/att_nope/outcome", json={"outcome": "opened"}).status_code == 404
