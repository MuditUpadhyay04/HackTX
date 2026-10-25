"""The attention budget: when Un-Said may ask for his attention, and how rarely.

Everything that asks for him (a knock on a photo, a push, the "tell them" line,
the notification-permission prompt) goes in one ledger, and these rules decide
whether it may happen at all. The policy is pure: decide_knock() takes the
ledger and an injected `now`, so tests can travel in time.

Gentle mode, the default:
  - a photo nobody is linked to never knocks, except one first-ever knock after 6 s
  - a linked photo knocks after 4 s, or right away on zoom or on a second visit
  - at most 1 knock per app session, 2 per day, 3 h apart (a reply knock may skip the gap)
  - 72 h of quiet for a person after he dismisses a knock about them
  - 2 dismisses in a row pause knocks for 7 days; opening one resets that
  - nothing within 24 h of a safety concern
Demo mode: 3 s on any photo, no caps (rehearsing on stage). Off: never.

What it says, in order: her unheard reply; the drift knock (someone on this photo he has
kept words for, who keeps texting, with no letter from him in 7 days; Demo: no wait);
then body B or A.
"""

import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta

from . import db, store, timeutil, voice

KNOCK_MODES = ("gentle", "off", "demo")
OUTCOMES = ("opened", "dismissed", "ignored")

LINKED_DWELL_MS = 4000
FIRST_DWELL_MS = 6000
DEMO_DWELL_MS = 3000
KNOCKS_PER_DAY = 2
KNOCK_GAP = timedelta(hours=3)
PERSON_COOLDOWN = timedelta(hours=72)
PAUSE_AFTER_DISMISSES = 2
PAUSE = timedelta(days=7)
SAFETY_QUIET = timedelta(hours=24)
ENCOURAGE_COOLDOWN = timedelta(hours=72)
REACHED_OUT_WINDOW = timedelta(days=7)
DRIFT_WAIT = timedelta(days=7)        # no letter to them in this long (Demo mode: 0)
STEP_COOLDOWN = timedelta(hours=72)   # "Take that step." once per person per 72 h

DEFAULT_SETTINGS = {"knock_mode": "gentle", "quiet_start": "22:30", "quiet_end": "08:00", "push_enabled": True}
_HHMM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


# ---------------------------------------------------------------- the ledger


@dataclass(frozen=True)
class Event:
    id: str
    kind: str
    detail: str | None
    person_id: str | None
    asset_id: str | None
    session_id: str | None
    created_at: datetime
    outcome: str
    outcome_at: datetime | None


def _event(row) -> Event:
    return Event(
        row["id"], row["kind"], row["detail"], row["person_id"], row["asset_id"], row["session_id"],
        db.parse_iso(row["created_at"]), row["outcome"], db.parse_iso(row["outcome_at"]),
    )


def record(kind: str, now: datetime, *, detail: str | None = None, person_id: str | None = None,
           asset_id: str | None = None, session_id: str | None = None, outcome: str = "shown") -> str:
    event_id = db.new_id("att")
    with db.tx() as c:
        c.execute(
            "INSERT INTO attention (id, kind, detail, person_id, asset_id, session_id, created_at, outcome) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (event_id, kind, detail, person_id, asset_id, session_id, db.iso(now), outcome),
        )
    return event_id


def set_outcome(event_id: str, outcome: str, now: datetime) -> Event | None:
    if outcome not in OUTCOMES:
        raise ValueError(f"outcome must be one of {OUTCOMES}")
    with db.tx() as c:
        c.execute("UPDATE attention SET outcome = ?, outcome_at = ? WHERE id = ?", (outcome, db.iso(now), event_id))
        row = c.execute("SELECT * FROM attention WHERE id = ?", (event_id,)).fetchone()
    return _event(row) if row else None


def events(kind: str, since: datetime | None = None) -> list[Event]:
    """Oldest first."""
    with db.tx() as c:
        if since is None:
            rows = c.execute("SELECT * FROM attention WHERE kind = ? ORDER BY created_at, rowid", (kind,)).fetchall()
        else:
            rows = c.execute(
                "SELECT * FROM attention WHERE kind = ? AND created_at >= ? ORDER BY created_at, rowid", (kind, db.iso(since))
            ).fetchall()
    return [_event(r) for r in rows]


def shown_recently(kind: str, person_id: str, within: timedelta, now: datetime) -> bool:
    return any(e.person_id == person_id for e in events(kind, since=now - within))


def reset() -> None:
    with db.tx() as c:
        c.execute("DELETE FROM attention")


# ---------------------------------------------------------------- settings


def get_settings() -> dict:
    out = dict(DEFAULT_SETTINGS)
    for key in DEFAULT_SETTINGS:
        value = db.kv_get(f"settings.{key}")
        if value is not None:
            out[key] = value == "true" if isinstance(DEFAULT_SETTINGS[key], bool) else value
    out["permission_asked"] = bool(events("permission_ask"))
    return out


def patch_settings(changes: dict) -> dict:
    if "knock_mode" in changes and changes["knock_mode"] not in KNOCK_MODES:
        raise ValueError(f"knock_mode must be one of {KNOCK_MODES}")
    for key in ("quiet_start", "quiet_end"):
        if key in changes and not _HHMM.match(str(changes[key])):
            raise ValueError(f"{key} must be HH:MM")
    for key, value in changes.items():
        if key in DEFAULT_SETTINGS and value is not None:
            db.kv_set(f"settings.{key}", ("true" if value else "false") if isinstance(DEFAULT_SETTINGS[key], bool) else str(value))
    return get_settings()


def his_quiet(now: datetime) -> datetime | None:
    """When his quiet hours end, if `now` is inside them; None if he's awake."""
    s = get_settings()
    me = {"timezone": store.me()["timezone"], "quiet_start": s["quiet_start"], "quiet_end": s["quiet_end"], "morning": s["quiet_end"]}
    return timeutil.next_release_utc(me, now)


# ---------------------------------------------------------------- the knock policy


@dataclass(frozen=True)
class KnockRequest:
    asset_id: str
    dwell_ms: int = 0
    zoomed: bool = False
    revisit: bool = False
    session_id: str = ""


@dataclass(frozen=True)
class KnockContext:
    mode: str
    linked: list[str]                         # person ids linked to this photo, most recent first
    unheard_replies: list[tuple[str, str]]    # (person_id, title), newest first
    reached_out: list[str]                    # names of people who reached out in the last 7 days
    last_concern_at: datetime | None
    knocks: list[Event]                       # every knock so far, oldest first
    drift: dict[str, str] = field(default_factory=dict)  # person_id -> drift knock body, for linked people who qualify


@dataclass(frozen=True)
class KnockDecision:
    knock: bool
    reason: str
    detail: str | None = None                 # reply | drift | linked | first
    body: str | None = None
    person_id: str | None = None


def _no(reason: str) -> KnockDecision:
    return KnockDecision(False, reason)


def _paused(knocks: list[Event], now: datetime) -> bool:
    """Two dismisses in a row (ignoring knocks he never answered) pause knocks for a week."""
    run, last = 0, None
    for e in reversed(knocks):
        if e.outcome == "opened":
            break
        if e.outcome == "dismissed":
            run += 1
            last = last or e.outcome_at or e.created_at
    return run >= PAUSE_AFTER_DISMISSES and last is not None and now - last < PAUSE


def decide_knock(req: KnockRequest, ctx: KnockContext, now: datetime) -> KnockDecision:
    if ctx.mode == "off":
        return _no("off")
    if ctx.last_concern_at and now - ctx.last_concern_at < SAFETY_QUIET:
        return _no("safety_quiet")
    demo = ctx.mode == "demo"

    if ctx.linked or demo:
        lingering = req.dwell_ms >= (DEMO_DWELL_MS if demo else LINKED_DWELL_MS) or req.zoomed or req.revisit
    elif ctx.knocks:
        return _no("unlinked")
    else:
        lingering = req.dwell_ms >= FIRST_DWELL_MS  # the one first-ever knock
    if not lingering:
        return _no("too_soon")

    candidates = list(ctx.linked)
    if not demo:
        cooling = {
            e.person_id for e in ctx.knocks
            if e.outcome == "dismissed" and e.person_id and now - (e.outcome_at or e.created_at) < PERSON_COOLDOWN
        }
        candidates = [p for p in candidates if p not in cooling]
        if ctx.linked and not candidates:
            return _no("person_cooldown")

    reply = next(((pid, title) for pid, title in ctx.unheard_replies if pid in candidates), None)
    drift = next(((pid, ctx.drift[pid]) for pid in candidates if pid in ctx.drift), None)
    if reply:
        detail, person_id, body = "reply", reply[0], reply[1]
    elif drift:
        detail, person_id, body = "drift", drift[0], drift[1]
    else:
        detail = "linked" if ctx.linked else "first"
        person_id = candidates[0] if candidates else None
        body = voice.knock_b(ctx.reached_out) if len(ctx.reached_out) >= 2 else voice.KNOCK_A

    if not demo:
        if req.session_id and any(e.session_id == req.session_id for e in ctx.knocks):
            return _no("session_cap")
        if sum(1 for e in ctx.knocks if now - e.created_at < timedelta(days=1)) >= KNOCKS_PER_DAY:
            return _no("daily_cap")
        if detail != "reply" and ctx.knocks and now - ctx.knocks[-1].created_at < KNOCK_GAP:
            return _no("too_close")
        if _paused(ctx.knocks, now):
            return _no("paused")
    return KnockDecision(True, "ok", detail, body, person_id)


# ---------------------------------------------------------------- reading the world for a knock


def last_concern_at() -> datetime | None:
    with db.tx() as c:
        row = c.execute(
            "SELECT MAX(sorted_at) AS at FROM rants WHERE safety IS NOT NULL AND safety != 'ok'"
        ).fetchone()
    return db.parse_iso(row["at"]) if row and row["at"] else None


def unheard_replies(now: datetime) -> list[tuple[str, str]]:
    with db.tx() as c:
        rows = c.execute("SELECT * FROM replies WHERE heard_at IS NULL ORDER BY created_at DESC").fetchall()
    return [(r["from_person_id"], store.reply_title(store.reply_out(r, now))) for r in rows]


def reached_out(now: datetime) -> list[str]:
    """Names (in cast order) of people who sent something or are waiting on him this week."""
    since = db.iso(now - REACHED_OUT_WINDOW)
    with db.tx() as c:
        ids = {r[0] for r in c.execute("SELECT from_person_id FROM replies WHERE created_at >= ?", (since,))}
        ids |= {r[0] for r in c.execute("SELECT person_id FROM reminders WHERE created_at >= ?", (since,))}
    return [p["name"] for p in store.list_people() if p["id"] in ids]


def linked_people(asset_id: str) -> list[str]:
    with db.tx() as c:
        rows = c.execute(
            "SELECT person_id FROM photo_links WHERE asset_id = ? ORDER BY last_at DESC, times DESC", (asset_id,)
        ).fetchall()
        # A server photo of someone (demo data: the cast's photos) is about them from the start.
        owner = None
        if asset_id.startswith("/media/"):
            owner = c.execute("SELECT person_id FROM photos WHERE path = ?", (asset_id[len("/media/"):],)).fetchone()
    known = {p["id"] for p in store.list_people()}
    ids = [r["person_id"] for r in rows]
    if owner and owner["person_id"] and owner["person_id"] not in ids:
        ids.append(owner["person_id"])
    return [pid for pid in ids if pid in known]


def last_letter_at(person_id: str) -> datetime | None:
    """When he last wrote them a letter (any letter he didn't take back)."""
    with db.tx() as c:
        row = c.execute(
            "SELECT MAX(created_at) FROM cards WHERE recipient_id = ? AND status != 'revoked'", (person_id,)
        ).fetchone()
    return db.parse_iso(row[0]) if row and row[0] else None


def inbound_since(person_id: str, since: datetime | None, kinds: tuple[str, ...] = ("text",)) -> int:
    """How many times they wrote (or called) him in their app since `since` (seeded for the demo)."""
    marks = ",".join("?" * len(kinds))
    with db.tx() as c:
        return c.execute(
            f"SELECT COUNT(*) FROM inbound WHERE person_id = ? AND kind IN ({marks}) AND created_at > ?",
            (person_id, *kinds, db.iso(since) if since else ""),
        ).fetchone()[0]


def drifting(person_ids: list[str], now: datetime, demo: bool) -> dict[str, str]:
    """The drift knock, for each of these people who qualify: he has kept words for them, they kept
    texting after his last letter, and neither a letter nor new words for them in DRIFT_WAIT
    (a letter or kept words that old, or no letter at all). Demo mode: no wait."""
    wait = timedelta(0) if demo else DRIFT_WAIT
    out: dict[str, str] = {}
    for pid in person_ids:
        person = store.get_person(pid)
        if not person:
            continue
        with db.tx() as c:
            row = c.execute(
                "SELECT COUNT(*) AS n, MAX(created_at) AS newest FROM pieces WHERE person_id = ? AND status = 'kept'", (pid,)
            ).fetchone()
        if not row["n"]:
            continue
        last = last_letter_at(pid)
        quiet_since = max(t for t in (last, db.parse_iso(row["newest"])) if t)
        if not inbound_since(pid, last) or now - quiet_since < wait:
            continue
        out[pid] = voice.drift_knock(person["name"], person["pronoun"])
    return out


def knock_context(asset_id: str, now: datetime) -> KnockContext:
    mode = get_settings()["knock_mode"]
    linked = linked_people(asset_id)
    return KnockContext(
        mode=mode,
        linked=linked,
        unheard_replies=unheard_replies(now),
        reached_out=reached_out(now),
        last_concern_at=last_concern_at(),
        knocks=events("knock"),
        drift=drifting(linked, now, mode == "demo"),
    )
