"""Clocks and time zones. Where AI isn't: her morning is math, not a model.

The app clock is real time plus a demo offset, so the team can set Austin to
6:32 PM for the recording and jump three hours on cue. Everything that asks
"what time is it" goes through now_utc().
"""

from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from . import db

OFFSET_KEY = "clock_offset_seconds"


def real_now() -> datetime:
    return datetime.now(timezone.utc)


def offset_seconds() -> float:
    return float(db.kv_get(OFFSET_KEY, "0") or 0)


def now_utc() -> datetime:
    return real_now() + timedelta(seconds=offset_seconds())


def set_now(target_utc: datetime) -> None:
    db.kv_set(OFFSET_KEY, str((target_utc - real_now()).total_seconds()))


def advance(minutes: float) -> None:
    db.kv_set(OFFSET_KEY, str(offset_seconds() + minutes * 60))


def reset_clock() -> None:
    db.kv_set(OFFSET_KEY, "0")


def parse_hhmm(value: str) -> time:
    hours, minutes = value.split(":")
    return time(int(hours), int(minutes))


def local(dt_utc: datetime, tz: str) -> datetime:
    return dt_utc.astimezone(ZoneInfo(tz))


def is_quiet(local_dt: datetime, quiet_start: str, quiet_end: str) -> bool:
    t = local_dt.time().replace(tzinfo=None)
    start, end = parse_hhmm(quiet_start), parse_hhmm(quiet_end)
    if start <= end:
        return start <= t < end
    return t >= start or t < end  # wraps past midnight, e.g. 22:00-07:30


def next_release_utc(person: dict, now: datetime) -> datetime | None:
    """None means she's awake: send now. Otherwise the next time it's her morning."""
    here = local(now, person["timezone"])
    if not is_quiet(here, person["quiet_start"], person["quiet_end"]):
        return None
    morning = parse_hhmm(person["morning"])
    candidate = datetime.combine(here.date(), morning, tzinfo=ZoneInfo(person["timezone"]))
    if candidate <= here:
        candidate += timedelta(days=1)
    return candidate.astimezone(timezone.utc)


def clock_label(dt: datetime) -> str:
    hour = dt.hour % 12 or 12
    return f"{hour}:{dt.minute:02d} {'AM' if dt.hour < 12 else 'PM'}"


def describe(person: dict, now: datetime) -> dict:
    here = local(now, person["timezone"])
    asleep = is_quiet(here, person["quiet_start"], person["quiet_end"])
    return {
        "local_time": clock_label(here),
        "local_iso": here.isoformat(timespec="minutes"),
        "is_asleep": asleep,
    }


def day_phrase(then_utc: datetime, now: datetime, tz: str) -> str:
    """'today', 'yesterday', 'on tuesday', 'on oct 12', in the listener's own calendar."""
    then_day: date = local(then_utc, tz).date()
    today: date = local(now, tz).date()
    days = (today - then_day).days
    if days <= 0:
        return "today"
    if days == 1:
        return "yesterday"
    if days < 7:
        return "on " + then_day.strftime("%A").lower()
    return "on " + then_day.strftime("%b ").lower() + str(then_day.day)
