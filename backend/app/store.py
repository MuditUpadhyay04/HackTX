"""Reads, writes, and the JSON shapes the client sees."""

import json
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

from . import db, timeutil
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
    folder = settings.media_dir / subdir
    folder.mkdir(parents=True, exist_ok=True)
    (folder / name).write_bytes(data)
    return f"{subdir}/{name}"


def media_path(rel: str) -> Path:
    return settings.media_dir / rel


def media_url(rel: str | None) -> str | None:
    return f"/media/{rel}" if rel else None


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
    }


def piece_out(row) -> dict:
    return {
        "id": row["id"],
        "rant_id": row["rant_id"],
        "person_id": row["person_id"],
        "text": row["text"],
        "tone": row["tone"],
        "has_audio": row["audio_start_ms"] is not None,
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
        "status": card["status"],
        "release_at": card["release_at"],
        "release_label": (
            f"{timeutil.clock_label(timeutil.local(release_at, recipient['timezone']))} her time"
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
    }


def self_note_out(row) -> dict:
    return {"id": row["id"], "url": media_url(row["path"]), "mime": row["mime"], "label": row["label"], "created_at": row["created_at"]}


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
