"""Cards: build them from his pieces, hold them for her morning, release them.

Release paths:
  whatsapp recipient + Cloud API configured -> template sent from Unsaid's number
  anything else                              -> status "ready": the app asks him
                                                "it's 8 AM for Mom. send it now?"
"""

import asyncio
import json
import logging
import re
from datetime import timedelta

from . import audio, db, push, store, timeutil
from .ai import spark
from .config import settings
from .sorting import merge_windows
from .whatsapp import WhatsAppError, send_card

log = logging.getLogger("unsaid.delivery")


class CardError(ValueError):
    pass


# One translation per (language, text): the preview's echo starts it, Send reuses it (even mid-flight),
# so Send doesn't wait twice and "she'll read" checks the exact Hindi that goes out.
_translations: dict[tuple[str, str], asyncio.Task] = {}


async def translated(text: str, language: str) -> str:
    key = (language.lower(), text)
    task = _translations.get(key)
    loop = asyncio.get_running_loop()
    stale = task is None or task.get_loop() is not loop or (task.done() and (task.cancelled() or task.exception()))
    if stale:
        if len(_translations) > 200:
            _translations.clear()
        task = _translations[key] = loop.create_task(spark.translate(text, language))
    return await asyncio.shield(task)


async def create_card(recipient_id: str, piece_ids: list[str], photo_id: str | None, when: str) -> dict:
    recipient = store.get_person(recipient_id)
    if not recipient or recipient["channel"] == "self":
        raise CardError("unknown recipient")
    if not piece_ids:
        raise CardError("pick at least one thing to send")
    with db.tx() as c:
        marks = ",".join("?" * len(piece_ids))
        rows = c.execute(f"SELECT * FROM pieces WHERE id IN ({marks})", piece_ids).fetchall()
    pieces = sorted(rows, key=lambda r: (r["created_at"], r["id"]))
    if len(pieces) != len(set(piece_ids)):
        raise CardError("some of those pieces don't exist")
    for p in pieces:
        if p["person_id"] != recipient_id:
            raise CardError("a piece belongs to someone else")
        if p["status"] != "kept":
            raise CardError("a piece was already sent or discarded")

    lines = [{"text": p["text"], "created_at": p["created_at"]} for p in letter_lines(pieces)]
    translation = None
    if recipient["language"].lower() != "english":
        text = "\n".join(line["text"] for line in lines)
        if settings.muse_enabled:
            try:
                translation = await translated(text, recipient["language"])
            except spark.SparkError as exc:
                log.warning("translation failed: %s", exc)
        else:
            translation = f"[{recipient['language']} translation appears here with MODEL_API_KEY set]"

    card_id, token = db.new_id("card"), db.new_token()
    audio_path = _card_audio(card_id, pieces)

    now = timeutil.now_utc()
    release_at = timeutil.next_release_utc(recipient, now) if when == "her_morning" else None
    status = "held" if release_at else "releasing"
    with db.tx() as c:
        c.execute(
            "INSERT INTO cards (id, token, recipient_id, lines, translation, photo_id, audio_path, status, "
            "release_at, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                card_id, token, recipient_id, json.dumps(lines, ensure_ascii=False), translation, photo_id,
                audio_path, status, db.iso(release_at) if release_at else None, db.iso(now),
                db.iso(now + timedelta(days=30)),
            ),
        )
        c.execute(
            f"UPDATE pieces SET status = 'in_card', card_id = ? WHERE id IN ({','.join('?' * len(piece_ids))})",
            [card_id, *piece_ids],
        )
    if status == "releasing":
        await _deliver(card_id)
    return get_card(card_id)


def _norm(text: str) -> str:
    return " ".join(re.sub(r"[^\w]+", " ", text.lower()).split())


def letter_lines(pieces: list) -> list:
    """The pieces that make the letter's lines, in order. A piece that only repeats another one (the
    same words, or contained in a longer piece) is dropped, so a seeded line and a later rant saying
    the same thing don't read twice. mobile/src/lib/api.ts letterLines() shows the same rule."""
    keys = [_norm(p["text"]) for p in pieces]
    kept = []
    for i, p in enumerate(pieces):
        k = keys[i]
        if not k:
            continue
        if any(j != i and k in other and (len(other) > len(k) or j < i) for j, other in enumerate(keys)):
            continue
        kept.append(p)
    return kept


def _card_audio(card_id: str, pieces) -> str | None:
    """His voice for this card: only the turns that were about this person, merged."""
    by_rant: dict[str, list[tuple[int, int]]] = {}
    for p in pieces:
        if p["rant_id"] and p["audio_start_ms"] is not None:
            by_rant.setdefault(p["rant_id"], []).append((p["audio_start_ms"], p["audio_end_ms"]))
    clips = []
    for rant_id, windows in by_rant.items():
        with db.tx() as c:
            rant = c.execute("SELECT audio_path FROM rants WHERE id = ?", (rant_id,)).fetchone()
        if not rant or not rant["audio_path"]:
            continue
        path = store.media_path(rant["audio_path"])
        if not path.exists():
            continue
        pcm, _ = audio.wav_to_pcm(path.read_bytes())
        clips += [audio.slice_ms(pcm, s, e) for s, e in merge_windows(windows)]
    if not clips:
        return None
    return store.save_media("cards", f"{card_id}.wav", audio.pcm_to_wav(audio.join(clips)))


def get_card(card_id: str) -> dict:
    with db.tx() as c:
        row = c.execute("SELECT * FROM cards WHERE id = ?", (card_id,)).fetchone()
    if not row:
        raise CardError("no such card")
    return store.card_out(row, timeutil.now_utc())


async def _deliver(card_id: str) -> None:
    """Called once the card is claimed (status 'releasing')."""
    with db.tx() as c:
        card = c.execute("SELECT * FROM cards WHERE id = ?", (card_id,)).fetchone()
    recipient = store.get_person(card["recipient_id"])
    now = db.iso(timeutil.now_utc())
    if not store.needs_his_tap(recipient):  # WhatsApp recipient + Cloud API configured
        url = f"{store.public_base()}/c/{card['token']}"
        try:
            message_id = await send_card(recipient["handle"], store.me()["name"], url)
            with db.tx() as c:
                c.execute(
                    "UPDATE cards SET status = 'released', released_at = ?, delivered_via = 'whatsapp_api', "
                    "delivery_error = NULL WHERE id = ?",
                    (now, card_id),
                )
            log.info("card %s sent on whatsapp (%s)", card_id, message_id)
            return
        except WhatsAppError as exc:
            log.warning("whatsapp send failed for %s: %s", card_id, exc)
            error = str(exc)
    else:
        error = None
    with db.tx() as c:
        c.execute("UPDATE cards SET status = 'ready', delivery_error = ? WHERE id = ?", (error, card_id))


async def release(card_id: str) -> bool:
    """Claims a held card and delivers it. Safe to call twice: only one caller wins."""
    with db.tx() as c:
        claimed = c.execute(
            "UPDATE cards SET status = 'releasing' WHERE id = ? AND status = 'held'", (card_id,)
        ).rowcount
    if claimed:
        await _deliver(card_id)
        try:
            _push_if_it_needs_him(card_id)
        except Exception:  # a push problem must never hold up the next letter
            log.exception("couldn't queue the ready push for %s", card_id)
    return bool(claimed)


def _push_if_it_needs_him(card_id: str) -> None:
    """A held letter's moment came but it needs his tap (no WhatsApp API): one push, his hours."""
    with db.tx() as c:
        card = c.execute("SELECT recipient_id, status FROM cards WHERE id = ?", (card_id,)).fetchone()
    if card and card["status"] == "ready":
        now = timeutil.now_utc()
        person = store.get_person(card["recipient_id"])
        push.enqueue("ready", store.ready_line(person, now), now, ref_id=card_id, person_id=person["id"])


async def release_due() -> list[str]:
    now = db.iso(timeutil.now_utc())
    with db.tx() as c:
        due = [r["id"] for r in c.execute(
            "SELECT id FROM cards WHERE status = 'held' AND release_at <= ? ORDER BY release_at", (now,)
        ).fetchall()]
    released = []
    for card_id in due:
        if await release(card_id):
            released.append(card_id)
    return released


def mark_shared(card_id: str) -> dict:
    with db.tx() as c:
        c.execute(
            "UPDATE cards SET status = 'released', released_at = ?, delivered_via = 'share' "
            "WHERE id = ? AND status IN ('ready', 'held')",
            (db.iso(timeutil.now_utc()), card_id),
        )
    return get_card(card_id)


def revoke(card_id: str) -> dict:
    with db.tx() as c:
        revoked = c.execute(
            "UPDATE cards SET status = 'revoked' WHERE id = ? AND status IN ('held', 'ready')", (card_id,)
        ).rowcount
        if revoked:
            c.execute("UPDATE pieces SET status = 'kept', card_id = NULL WHERE card_id = ?", (card_id,))
    return get_card(card_id)


async def scheduler(interval: float = 5.0) -> None:
    while True:
        try:
            released = await release_due()
            if released:
                log.info("released %s", released)
        except Exception:  # keep the loop alive; one bad card must not stop Mom's 8 AM
            log.exception("scheduler tick failed")
        try:
            pushed = await push.tick(timeutil.now_utc())
            if pushed:
                log.info("pushed %s", pushed)
        except Exception:  # a push problem must never stop letters going out
            log.exception("push tick failed")
        await asyncio.sleep(interval)
