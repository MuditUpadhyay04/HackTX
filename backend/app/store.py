"""Reads, writes, and the JSON shapes the client sees."""

import json
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

from . import db, timeutil, voice
from .config import settings
from .whatsapp import digits

# ---------------------------------------------------------------- people


def _person(row) -> dict:
    p = dict(row)
    p["aliases"] = json.loads(p["aliases"] or "[]")
    return p


def list_people(include_self: bool = False) -> list[dict]:
    with db.tx() as c:
        rows = c.execute("SELECT * FROM people ORDER BY sort, name").fetchall()
    people = [_person(r) for r in rows]
    return people if include_self else [p for p in people if p["channel"] != "self"]


def get_person(person_id: str) -> dict | None:
    with db.tx() as c:
        row = c.execute("SELECT * FROM people WHERE id = ?", (person_id,)).fetchone()
    return _person(row) if row else None


def me() -> dict:
    with db.tx() as c:
        row = c.execute("SELECT * FROM people WHERE channel = 'self' LIMIT 1").fetchone()
    return _person(row)


def person_out(p: dict, now: datetime) -> dict:
    clock = timeutil.describe(p, now)
    label = f"{clock['local_time']} for {p['name']}" + (" · asleep" if clock["is_asleep"] else "")
    return {
        "id": p["id"],
        "name": p["name"],
        "relation": p["relation"],
        "pronoun": p["pronoun"],
        "channel": p["channel"],
        "has_handle": bool(p["handle"]),
        "timezone": p["timezone"],
        "language": p["language"],
        "morning": p["morning"],
        **clock,
        "time_label": label,
    }


# ---------------------------------------------------------------- media


def save_media(subdir: str, name: str, data: bytes) -> str:
    shared = settings.main_media_dir / subdir / name
    if settings.guest and shared.exists() and shared.stat().st_size == len(data) and shared.read_bytes() == data:
        return f"{subdir}/{name}"  # a seed file the main app already has: guests share it (/media/...)
    folder = _checked(settings.media_dir, subdir)
    _checked(folder, name)
    folder.mkdir(parents=True, exist_ok=True)
    (folder / name).write_bytes(data)
    return f"{subdir}/{name}"


def _checked(base: Path, rel: str) -> Path:
    path = base / rel
    if settings.guest:  # try-it guests: never outside their own folder (or the shared one, for reading)
        try:
            path.resolve().relative_to(base.resolve())
        except ValueError:
            raise ValueError("media path outside its folder")
    return path


def media_path(rel: str) -> Path:
    """Where a file is. A guest's own files first; the shared seed photos (main media) otherwise, read-only."""
    own = _checked(settings.media_dir, rel)
    if settings.guest and not own.exists():
        shared = _checked(settings.main_media_dir, rel)
        if shared.exists():
            return shared
    return own


def delete_media(rel: str) -> None:
    """Deletes only the caller's own copy: a guest can never remove a shared seed file."""
    _checked(settings.media_dir, rel).unlink(missing_ok=True)


def media_url(rel: str | None) -> str | None:
    if not rel:
        return None
    guest = settings.guest
    if guest and (settings.media_dir / rel).exists():
        return f"/guest-media/{guest}/{rel}"
    return f"/media/{rel}"


# ---------------------------------------------------------------- base url


def public_base() -> str:
    return settings.public_base_url or db.kv_get("public_base_url", "") or "http://localhost:8000"


# ---------------------------------------------------------------- shapes


def photo_out(row) -> dict:
    return {
        "id": row["id"],
        "person_id": row["person_id"],
        "url": media_url(row["path"]),
        "caption": row["caption"],
        "taken_at": row["taken_at"],
        "source": row["source"] if "source" in row.keys() else "app",
    }


def piece_out(row) -> dict:
    has_audio = row["audio_start_ms"] is not None
    return {
        "id": row["id"],
        "rant_id": row["rant_id"],
        "person_id": row["person_id"],
        "text": row["text"],
        "tone": row["tone"],
        "has_audio": has_audio,
        # His own voice for this line. Needs the app key, like the rest of /api.
        "audio_url": f"/api/pieces/{row['id']}/audio" if has_audio else None,
        "status": row["status"],
        "created_at": row["created_at"],
    }


def share_links(card: dict, recipient: dict, sender: dict) -> dict:
    url = f"{public_base()}/c/{card['token']}"
    lines = [line["text"] for line in json.loads(card["lines"])]
    phone = digits(recipient["handle"])
    links: dict = {"url": url}
    if recipient["channel"] == "whatsapp":
        text = f"left you something. open it whenever you have a minute:\n{url}"
        links["text"] = text
        links["whatsapp"] = f"https://wa.me/{phone}?text={quote(text)}" if phone else f"https://wa.me/?text={quote(text)}"
    elif recipient["channel"] == "imessage":
        text = "\n".join(lines) + f"\n\n{url}"
        links["text"] = text
        to = f"+{phone}" if phone else ""
        links["sms_ios"] = f"sms:{to}&body={quote(text)}"
        links["sms_android"] = f"sms:{to}?body={quote(text)}"
    elif recipient["channel"] == "instagram":
        links["text"] = "\n".join(lines) + f"\n\n{url}"
        if recipient["handle"]:
            links["instagram"] = f"https://ig.me/m/{recipient['handle']}"
    return links


def card_out(row, now: datetime, with_share: bool = True) -> dict:
    card = dict(row)
    recipient = get_person(card["recipient_id"])
    release_at = db.parse_iso(card["release_at"])
    out = {
        "id": card["id"],
        "recipient_id": card["recipient_id"],
        "recipient_name": recipient["name"] if recipient else "",
        "lines": json.loads(card["lines"]),
        "translation": card["translation"],
        "photo_id": card["photo_id"],
        "audio_url": media_url(card["audio_path"]),
        "video_url": media_url(card.get("video_path")),
        "status": card["status"],
        "release_at": card["release_at"],
        "release_label": (
            f"{timeutil.clock_label(timeutil.local(release_at, recipient['timezone']))} {POSSESSIVE.get(recipient['pronoun'], 'their')} time"
            if release_at and recipient
            else None
        ),
        "released_at": card["released_at"],
        "delivered_via": card["delivered_via"],
        "delivery_error": card["delivery_error"],
        "opened_at": card["opened_at"],
        "created_at": card["created_at"],
    }
    if with_share and recipient:
        out["share"] = share_links(card, recipient, me())
    return out


POSSESSIVE = {"her": "her", "him": "his", "them": "their"}


def reply_out(row, now: datetime) -> dict:
    sender = get_person(row["from_person_id"])
    listener = me()
    created = db.parse_iso(row["created_at"])
    return {
        "id": row["id"],
        "card_id": row["card_id"],
        "from_person_id": row["from_person_id"],
        "from_name": sender["name"] if sender else "",
        "audio_url": media_url(row["audio_path"]),
        "transcript": row["transcript"],
        "translation": row["translation"],
        "created_at": row["created_at"],
        "day": timeutil.day_phrase(created, now, listener["timezone"]),
        "heard_at": row["heard_at"],
        "kept_at": row["kept_at"] if "kept_at" in row.keys() else None,
    }


def reply_title(reply: dict) -> str:
    """'Mom left you a voice note on tuesday.' Used by the Home nudge, the knock and the push."""
    kind = "a voice note" if reply["audio_url"] else "a message"
    return f"{reply['from_name']} left you {kind} {reply['day']}."


def needs_his_tap(person: dict) -> bool:
    """A letter to this person can't go out by itself: only WhatsApp with the Cloud API (and a number) can."""
    return not (person["channel"] == "whatsapp" and settings.whatsapp_enabled and person["handle"])


def ready_line(person: dict, at: datetime) -> str:
    """'It's 8:00 AM for Mom. Send it now?' as of `at`. The ready push and the app's local reminder."""
    return voice.READY_PUSH.format(time=timeutil.clock_label(timeutil.local(at, person["timezone"])), name=person["name"])


def self_note_out(row) -> dict:
    duration = row["duration_ms"] if "duration_ms" in row.keys() else None
    return {"id": row["id"], "url": media_url(row["path"]), "mime": row["mime"], "label": row["label"], "created_at": row["created_at"], "duration_ms": duration}


def reminder_out(row) -> dict:
    person = get_person(row["person_id"])
    handoff = None
    if person and person["channel"] == "instagram" and person["handle"]:
        handoff = f"https://ig.me/m/{person['handle']}"
    elif person and person["channel"] == "whatsapp" and person["handle"]:
        handoff = f"https://wa.me/{digits(person['handle'])}"
    elif person and person["channel"] == "imessage" and person["handle"]:
        handoff = f"sms:+{digits(person['handle'])}"
    return {
        "id": row["id"],
        "person_id": row["person_id"],
        "person_name": person["name"] if person else "",
        "channel": person["channel"] if person else "",
        "text": row["text"],
        "handoff": handoff,
        "created_at": row["created_at"],
    }
