"""Push notifications that don't nag, through the Expo Push API.

What can push, all of it rare:
  reply  her voice reply arrived. Always worth it (it's a person, not Un-Said).
  ready  a held letter's moment came and it needs his tap (no WhatsApp API).
  drift  at most weekly, only after words have waited 5+ days, he's been away
         3+ days, in his early evening, and his last nudges weren't ignored.

Every push waits out HIS quiet hours: a push due at night goes at his morning,
the same courtesy his letters give her. Pushes are queued, re-checked when due
(a reply he already heard, or a letter he already sent, is dropped), and sent
once. A token Expo reports as DeviceNotRegistered is never used again.

Expo Go (SDK 53+) can't receive remote pushes; the app falls back to local
notifications for held letters (mobile/src/lib/push.ts). This module serves
development and store builds, where getExpoPushTokenAsync works.
"""

import json
import logging
import os
import re
from datetime import datetime, timedelta

import httpx

from . import attention, db, store, timeutil, voice

log = logging.getLogger("unsaid.push")

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
TOKEN_RE = re.compile(r"^Expo(nent)?PushToken\[[^\]]+\]$")
ANDROID_CHANNEL = "default"  # created by the app (mobile/src/lib/push.ts) before it ever registers a token

DRIFT_WAITED = timedelta(days=5)
DRIFT_AWAY = timedelta(days=3)
DRIFT_EVERY = timedelta(days=7)
DRIFT_MAX_EVERY = timedelta(days=28)
DRIFT_WINDOW = (18, 21)            # his local hours: early evening only
DRIFT_AFTER_CONCERN = timedelta(days=7)


# ---------------------------------------------------------------- tokens


def register(token: str, platform: str, now: datetime) -> dict:
    if not TOKEN_RE.match(token):
        raise ValueError("not an Expo push token")
    with db.tx() as c:
        c.execute(
            "INSERT INTO push_tokens (token, platform, created_at, last_seen_at) VALUES (?, ?, ?, ?) "
            "ON CONFLICT (token) DO UPDATE SET platform = excluded.platform, last_seen_at = excluded.last_seen_at",
            (token, platform[:20], db.iso(now), db.iso(now)),
        )
        row = c.execute("SELECT * FROM push_tokens WHERE token = ?", (token,)).fetchone()
    # A token Expo said is unregistered stays off, even if it shows up again.
    return {"ok": True, "active": row["disabled_at"] is None}


def active_tokens() -> list[str]:
    with db.tx() as c:
        return [r["token"] for r in c.execute("SELECT token FROM push_tokens WHERE disabled_at IS NULL")]


def _disable(token: str, reason: str, now: datetime) -> None:
    with db.tx() as c:
        c.execute(
            "UPDATE push_tokens SET disabled_at = ?, disabled_reason = ? WHERE token = ? AND disabled_at IS NULL",
            (db.iso(now), reason, token),
        )


# ---------------------------------------------------------------- the queue


def enqueue(kind: str, body: str, now: datetime, *, ref_id: str | None = None, person_id: str | None = None) -> str | None:
    """Queues one push. Never twice for the same thing; held for his morning if he's asleep."""
    if not attention.get_settings()["push_enabled"]:
        return None
    with db.tx() as c:
        if ref_id:
            dup = c.execute("SELECT id FROM pushes WHERE kind = ? AND ref_id = ?", (kind, ref_id)).fetchone()
            if dup:
                return dup["id"]
        push_id = db.new_id("push")
        due = attention.his_quiet(now) or now
        c.execute(
            "INSERT INTO pushes (id, kind, ref_id, person_id, body, due_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (push_id, kind, ref_id, person_id, body, db.iso(due), db.iso(now)),
        )
    return push_id


def _fresh_body(push, now: datetime) -> str | None:
    """Re-reads the world when the push is due. None means: don't send it anymore."""
    with db.tx() as c:
        if push["kind"] == "reply":
            reply = c.execute("SELECT * FROM replies WHERE id = ?", (push["ref_id"],)).fetchone()
            if not reply or reply["heard_at"]:
                return None  # he already heard it in the app
            return store.reply_title(store.reply_out(reply, now))
        if push["kind"] == "ready":
            card = c.execute("SELECT * FROM cards WHERE id = ?", (push["ref_id"],)).fetchone()
            if not card or card["status"] != "ready":
                return None  # already sent, or cancelled
            return store.ready_line(store.get_person(card["recipient_id"]), now)
    return push["body"]


async def send_batch(messages: list[dict]) -> list[dict]:
    """POSTs to the Expo Push API and returns one ticket per message. Tests replace this.

    PUSH_DRY_RUN=1 logs the messages instead of sending them (rehearsals, curl checks).
    """
    if os.environ.get("PUSH_DRY_RUN"):
        for m in messages:
            log.info("push (dry run) to %s: %s", m["to"], m["body"])
        return [{"status": "ok", "id": "dry-run"} for _ in messages]
    headers = {"Accept": "application/json", "Content-Type": "application/json"}
    if os.environ.get("EXPO_ACCESS_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['EXPO_ACCESS_TOKEN']}"
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(EXPO_PUSH_URL, json=messages, headers=headers)
    resp.raise_for_status()
    return resp.json().get("data") or []


async def flush(now: datetime) -> list[str]:
    """Sends every push that's due. Returns the ids actually sent."""
    with db.tx() as c:
        due = c.execute(
            "SELECT * FROM pushes WHERE status = 'pending' AND due_at <= ? ORDER BY due_at", (db.iso(now),)
        ).fetchall()
    sent = []
    for push in due:
        status, error, attention_id = await _send_one(push, now)
        with db.tx() as c:
            c.execute(
                "UPDATE pushes SET status = ?, sent_at = ?, error = ?, attention_id = ? WHERE id = ?",
                (status, db.iso(now), error, attention_id, push["id"]),
            )
        if status == "sent":
            sent.append(push["id"])
    return sent


async def _send_one(push, now: datetime) -> tuple[str, str | None, str | None]:
    if not attention.get_settings()["push_enabled"]:
        return "dropped", "push turned off", None
    body = _fresh_body(push, now)
    if body is None:
        return "dropped", "no longer needed", None
    tokens = active_tokens()
    if not tokens:
        return "no_device", None, None
    attention_id = attention.record("push", now, detail=push["kind"], person_id=push["person_id"])
    data = {"kind": push["kind"], "ref_id": push["ref_id"], "person_id": push["person_id"], "attention_id": attention_id}
    message = {"title": voice.APP_NAME, "body": body, "channelId": ANDROID_CHANNEL, "data": data}
    if push["kind"] != "drift":
        message["sound"] = "default"  # a person's reply, or her morning. Un-Said's own nudge stays silent.
    messages = [{"to": t, **message} for t in tokens]
    try:
        tickets = await send_batch(messages)
    except (httpx.HTTPError, ValueError, json.JSONDecodeError) as exc:
        log.warning("push %s failed: %s", push["id"], exc)
        return "failed", str(exc)[:300], attention_id
    delivered = 0
    for token, ticket in zip(tokens, tickets):
        if ticket.get("status") == "ok":
            delivered += 1
        elif (ticket.get("details") or {}).get("error") == "DeviceNotRegistered":
            _disable(token, "DeviceNotRegistered", now)
    return ("sent", None, attention_id) if delivered else ("failed", json.dumps(tickets)[:300], attention_id)


# ---------------------------------------------------------------- the weekly drift push


def _drift_due(now: datetime) -> str | None:
    """The body for a gentle weekly push, or None. Almost always None."""
    s = attention.get_settings()
    if not s["push_enabled"] or s["knock_mode"] == "off" or not active_tokens():
        return None
    concern = attention.last_concern_at()
    if concern and now - concern < DRIFT_AFTER_CONCERN:
        return None
    last_seen = db.parse_iso(db.kv_get("last_activity_at"))
    if last_seen is None or now - last_seen < DRIFT_AWAY:
        return None
    here = timeutil.local(now, store.me()["timezone"])
    if not DRIFT_WINDOW[0] <= here.hour < DRIFT_WINDOW[1]:
        return None
    with db.tx() as c:
        waiting = c.execute(
            "SELECT COUNT(*) FROM pieces WHERE status = 'kept' AND created_at <= ?", (db.iso(now - DRIFT_WAITED),)
        ).fetchone()[0]
    if not waiting:
        return None
    # Each unopened drift push doubles the wait before the next one (1, 2, 4 weeks).
    drifts = attention.events("push")
    drifts = [e for e in drifts if e.detail == "drift"]
    unopened = 0
    for e in reversed(drifts):
        if e.outcome == "opened":
            break
        unopened += 1
    every = min(DRIFT_EVERY * (2 ** unopened), DRIFT_MAX_EVERY)
    if drifts and now - drifts[-1].created_at < every:
        return None
    names = attention.reached_out(now)
    return voice.knock_b(names) if len(names) >= 2 else voice.KNOCK_A


async def tick(now: datetime) -> list[str]:
    """Called by the scheduler every few seconds."""
    body = _drift_due(now)
    if body:
        enqueue("drift", body, now, ref_id=f"drift-{timeutil.local(now, store.me()['timezone']).date()}")
    return await flush(now)
