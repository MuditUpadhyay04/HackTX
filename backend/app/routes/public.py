"""The page Mom (or Sarah) opens from the link. No app, no account: the token is the key.

Only cards that have actually been handed over (ready or released) open. Held
cards stay sealed until her morning; revoked or expired ones are gone.
"""

import json
import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from .. import audio, db, store, timeutil
from ..ai import spark, transcribe
from ..config import WEB_DIR, settings
from ..whatsapp import digits

router = APIRouter()
log = logging.getLogger("unsaid.public")

MAX_REPLY = 16 * 1024 * 1024


def _open_card(token: str):
    with db.tx() as c:
        card = c.execute("SELECT * FROM cards WHERE token = ?", (token,)).fetchone()
    if not card or card["status"] not in ("ready", "released"):
        raise HTTPException(404, "this link isn't open")
    if db.parse_iso(card["expires_at"]) < timeutil.now_utc():
        raise HTTPException(410, "this link has expired")
    return card


@router.get("/c/{token}", include_in_schema=False)
def card_page(token: str) -> FileResponse:
    return FileResponse(WEB_DIR / "card.html", headers={"Cache-Control": "no-store"})


@router.get("/api/public/cards/{token}")
def public_card(token: str) -> dict:
    card = _open_card(token)
    if not card["opened_at"]:
        with db.tx() as c:
            c.execute("UPDATE cards SET opened_at = ? WHERE id = ?", (db.iso(timeutil.now_utc()), card["id"]))
    sender = store.me()
    recipient = store.get_person(card["recipient_id"])
    photo = None
    if card["photo_id"]:
        with db.tx() as c:
            row = c.execute("SELECT * FROM photos WHERE id = ?", (card["photo_id"],)).fetchone()
        photo = store.media_url(row["path"]) if row else None
    with db.tx() as c:
        replied = c.execute("SELECT COUNT(*) FROM replies WHERE card_id = ?", (card["id"],)).fetchone()[0]
    phone = digits(sender["handle"])
    call = None
    if phone:
        call = f"https://wa.me/{phone}" if recipient["channel"] == "whatsapp" else f"tel:+{phone}"
    return {
        "sender_name": sender["name"],
        "recipient_name": recipient["name"],
        "recipient_language": recipient["language"],
        "lines": json.loads(card["lines"]),
        "translation": card["translation"],
        "photo_url": photo,
        "audio_url": store.media_url(card["audio_path"]),
        "call_url": call,
        "replied": replied > 0,
    }


@router.post("/api/public/cards/{token}/reply")
async def public_reply(token: str, file: UploadFile | None = File(None), text: str = Form("")) -> dict:
    """Her voice back to him. Transcribed in her language, captioned in English for him."""
    card = _open_card(token)
    recipient = store.get_person(card["recipient_id"])
    reply_id = db.new_id("reply")
    audio_path, transcript = None, text.strip()[:2000]

    if file is not None:
        wav = await file.read(MAX_REPLY + 1)
        if len(wav) > MAX_REPLY:
            raise HTTPException(413, "that recording is too long")
        try:
            pcm, _ = audio.wav_to_pcm(wav)
        except Exception:
            raise HTTPException(400, "send mono 16-bit WAV")
        audio_path = store.save_media("replies", f"{reply_id}.wav", wav)
        bias = ["English"] if recipient["language"].lower() == "english" else [recipient["language"], "English"]
        if settings.muse_enabled:
            try:
                turns = await transcribe.transcribe_wav(wav, bias)
                transcript = " ".join(t["text"] for t in turns).strip()
            except transcribe.TranscribeError as exc:
                log.warning("reply transcription failed: %s", exc)
        else:
            transcript = transcribe.MOCK_REPLY if audio.duration_ms(pcm) > 300 else ""
    if not audio_path and not transcript:
        raise HTTPException(400, "nothing to send")

    translation = None
    listener_language = "English"
    if transcript and recipient["language"].lower() != listener_language.lower():
        if settings.muse_enabled:
            try:
                translation = await spark.translate(transcript, listener_language)
            except spark.SparkError as exc:
                log.warning("reply translation failed: %s", exc)
        else:
            translation = "no emergency. just wanted to hear your voice. [mock caption]"

    with db.tx() as c:
        c.execute(
            "INSERT INTO replies (id, card_id, from_person_id, audio_path, transcript, translation, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (reply_id, card["id"], recipient["id"], audio_path, transcript, translation, db.iso(timeutil.now_utc())),
        )
    return {"ok": True}
