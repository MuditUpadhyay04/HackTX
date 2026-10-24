from datetime import datetime, timezone

from app.safety import combine, keyword_flag
from app.timeutil import day_phrase, describe, is_quiet, next_release_utc

MOM = {"timezone": "Asia/Kolkata", "quiet_start": "22:00", "quiet_end": "07:30", "morning": "08:00"}


def utc(*args):
    return datetime(*args, tzinfo=timezone.utc)


def test_6_32_pm_in_austin_is_5_02_am_for_mom_and_she_is_asleep():
    now = utc(2026, 10, 24, 23, 32)  # 6:32 PM CDT
    clock = describe(MOM, now)
    assert clock["local_time"] == "5:02 AM"
    assert clock["is_asleep"] is True
    # Held until 8:00 AM IST, which is 9:30 PM in Austin.
    assert next_release_utc(MOM, now) == utc(2026, 10, 25, 2, 30)


def test_awake_means_send_now():
    assert next_release_utc(MOM, utc(2026, 10, 25, 5, 0)) is None  # 10:30 AM IST


def test_late_evening_waits_for_tomorrow_morning():
    assert next_release_utc(MOM, utc(2026, 10, 25, 18, 0)) == utc(2026, 10, 26, 2, 30)  # 11:30 PM IST


def test_quiet_hours_wrap_midnight():
    assert is_quiet(datetime(2026, 1, 1, 23, 0), "22:00", "07:30")
    assert is_quiet(datetime(2026, 1, 1, 7, 29), "22:00", "07:30")
    assert not is_quiet(datetime(2026, 1, 1, 7, 30), "22:00", "07:30")


def test_day_phrase_in_his_calendar():
    now = utc(2026, 10, 25, 2, 30)  # Sat 9:30 PM in Austin
    tz = "America/Chicago"
    assert day_phrase(utc(2026, 10, 25, 1, 0), now, tz) == "today"
    assert day_phrase(utc(2026, 10, 24, 1, 0), now, tz) == "yesterday"   # Fri evening CDT
    assert day_phrase(utc(2026, 10, 21, 0, 40), now, tz) == "on tuesday"  # Tue 7:40 PM CDT
    assert day_phrase(utc(2026, 10, 1, 12, 0), now, tz) == "on oct 1"


def test_the_demo_rant_is_ordinary():
    rant = (
        "I don't know, man. Jordan said I don't get her, and maybe she's right. Mumma called three times "
        "today and I said I'm busy. I'm not busy. Mujhe bas ghar ki yaad aa rahi hai. And Priya keeps "
        "sending reels and I can't even laugh right now."
    )
    assert keyword_flag(rant) is None
    assert combine("ok", rant) == "ok"


def test_ordinary_phrases_do_not_trip_the_gate():
    for text in ["it hit me that I miss home", "I hurt her feelings and I'm sorry", "my mom's gonna kill me lol"]:
        assert keyword_flag(text) is None, text


def test_concerning_phrases_route_to_resources():
    assert keyword_flag("honestly I want to end it all") == "self_harm"
    assert keyword_flag("main jeena nahi chahta ab") == "self_harm"
    assert keyword_flag("he checks my phone and won’t let me see my friends") == "abuse_or_control"
    assert keyword_flag("I'm going to make her pay") == "harm_to_others"


def test_the_stricter_layer_wins():
    assert combine("self_harm", "I'm fine") == "self_harm"
    assert combine("ok", "I want to die") == "self_harm"
    assert combine("something_new", "hello") == "self_harm"  # unknown model output counts as a concern
    assert combine(None, "hello") == "ok"
