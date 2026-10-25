"""The student's side: home, people, photos, rants, pieces, cards, replies, notes, reminders."""

import re
from typing import Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

from .. import attention, audio, db, delivery, groups, memory, rants, safety, seed, store, timeutil
from ..ai import transcribe
from ..auth import require_key
from ..config import settings

router = APIRouter(prefix="/api", dependencies=[Depends(require_key)])

MAX_AUDIO = 32 * 1024 * 1024
MAX_PHOTO = 15 * 1024 * 1024
MAX_VIDEO = 80 * 1024 * 1024
PHOTO_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}
VIDEO_TYPES = {"video/webm": "webm", "video/mp4": "mp4", "video/quicktime": "mov"}
HHMM = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def providers() -> dict:
    return {
        "spark": "meta" if settings.muse_enabled else "mock",
        "transcribe": "meta" if settings.muse_enabled else "mock",
        "whatsapp": "cloud_api" if settings.whatsapp_enabled else "share_sheet",
    }


async def _read_limited(upload: UploadFile, limit: int) -> bytes:
    data = await upload.read(limit + 1)
    if len(data) > limit:
        raise HTTPException(413, "file too large")
    return data


# ---------------------------------------------------------------- home


@router.get("/safety/resources")
def safety_resources() -> list[dict]:
    """The same help list a flagged rant returns, for the Safety screen opened from You."""
    return safety.RESOURCES


@router.get("/home")
def home(request: Request) -> dict:
    """Everything the home screen needs in one call. Polled every few seconds."""
    if not settings.public_base_url:
        db.kv_set("public_base_url", str(request.base_url).rstrip("/"))
    now = timeutil.now_utc()
    db.kv_set("last_activity_at", db.iso(now))  # he's here; the weekly push waits for real quiet
    with db.tx() as c:
        photos = c.execute("SELECT * FROM photos ORDER BY person_id, taken_at DESC").fetchall()
        cards = c.execute(
            "SELECT * FROM cards WHERE status != 'revoked' AND id != ? ORDER BY created_at DESC LIMIT 20",
            (seed.TUESDAY_CARD_ID,),
        ).fetchall()
        replies = c.execute("SELECT * FROM replies ORDER BY created_at DESC LIMIT 20").fetchall()
        reminders = c.execute("SELECT * FROM reminders WHERE done_at IS NULL ORDER BY created_at DESC").fetchall()
        notes = c.execute("SELECT * FROM self_notes ORDER BY created_at DESC").fetchall()
    card_list = [store.card_out(r, now) for r in cards]
    for card in card_list:
        # A held letter that will need his tap: when the app may remind him (her morning, unless
        # that's his night) and what it says. Expo Go schedules this locally; see mobile/src/lib/push.ts.
        if card["status"] != "held" or not card["release_at"]:
            continue
        person = store.get_person(card["recipient_id"])
        if person and store.needs_his_tap(person):
            release = db.parse_iso(card["release_at"])
            remind = attention.his_quiet(release) or release
            card["remind_at"] = db.iso(remind)
            card["remind_body"] = store.ready_line(person, remind)
    reply_list = [store.reply_out(r, now) for r in replies]
    return {
        "me": store.person_out(store.me(), now),
        "people": [store.person_out(p, now) for p in store.list_people()],
        "photos": [store.photo_out(r) for r in photos],
        "nudges": _nudges(reply_list, card_list, now),
        "cards": card_list,
        "replies": reply_list,
        "reminders": [store.reminder_out(r) for r in reminders],
        "self_notes": [store.self_note_out(r) for r in notes],
        "providers": providers(),
        "clock": {"now": db.iso(now), "offset_minutes": round(timeutil.offset_seconds() / 60, 1)},
    }


def _nudges(replies: list[dict], cards: list[dict], now) -> list[dict]:
    out = []
    for r in replies:
        if r["heard_at"]:
            continue
        out.append({
            "kind": "reply",
            "id": r["id"],
            "person_id": r["from_person_id"],
            "title": store.reply_title(r),
            "body": "you haven't heard it yet." if r["audio_url"] else "you haven't read it yet.",
            "reply": r,
        })
    for card in cards:
        if card["status"] != "ready":
            continue
        person = store.get_person(card["recipient_id"])
        clock = timeutil.describe(person, now)
        out.append({
            "kind": "ready",
            "id": card["id"],
            "person_id": card["recipient_id"],
            "title": f"it's {clock['local_time']} for {person['name']}. send it now?",
            "body": "it'll come from you.",
            "card": card,
        })
    return out


# ---------------------------------------------------------------- people


class PersonPatch(BaseModel):
    name: str | None = Field(None, max_length=40)
    handle: str | None = Field(None, max_length=60)
    timezone: str | None = None
    language: str | None = Field(None, max_length=30)
    morning: str | None = None
    quiet_start: str | None = None
    quiet_end: str | None = None


@router.get("/people")
def people() -> list[dict]:
    now = timeutil.now_utc()
    return [store.person_out(p, now) for p in store.list_people(include_self=True)]


@router.get("/people/groups")
def people_groups() -> dict:
    """The People tab: everyone, grouped by who they are to him (mom, dad, brother, sister,
    best friend, partner, other), with the photos he has given each of them. No face recognition."""
    return groups.people_groups(timeutil.now_utc())


@router.patch("/people/{person_id}")
def patch_person(person_id: str, body: PersonPatch) -> dict:
    if not store.get_person(person_id):
        raise HTTPException(404, "no such person")
    changes = body.model_dump(exclude_none=True)
    if "timezone" in changes:
        try:
            ZoneInfo(changes["timezone"])
        except (ZoneInfoNotFoundError, ValueError):
            raise HTTPException(400, "unknown time zone; use an IANA name like Asia/Kolkata")
    for field in ("morning", "quiet_start", "quiet_end"):
        if field in changes and not HHMM.match(changes[field]):
            raise HTTPException(400, f"{field} must be HH:MM")
    if changes:
        sets = ", ".join(f"{k} = ?" for k in changes)
        with db.tx() as c:
            c.execute(f"UPDATE people SET {sets} WHERE id = ?", [*changes.values(), person_id])
    return store.person_out(store.get_person(person_id), timeutil.now_utc())


@router.get("/people/{person_id}/pieces")
def person_pieces(person_id: str) -> list[dict]:
    """Everything he kept for this person, oldest first: 'N things you never told her'."""
    with db.tx() as c:
        rows = c.execute(
            "SELECT * FROM pieces WHERE person_id = ? AND status = 'kept' ORDER BY created_at, rowid", (person_id,)
        ).fetchall()
    return [store.piece_out(r) for r in rows]


@router.post("/pieces/{piece_id}/discard")
def discard_piece(piece_id: str) -> dict:
    with db.tx() as c:
        c.execute("UPDATE pieces SET status = 'discarded' WHERE id = ? AND status = 'kept'", (piece_id,))
        row = c.execute("SELECT * FROM pieces WHERE id = ?", (piece_id,)).fetchone()
    if not row:
        raise HTTPException(404, "no such piece")
    return store.piece_out(row)


# ---------------------------------------------------------------- photos


@router.get("/photos")
def photos(person_id: str | None = None) -> list[dict]:
    with db.tx() as c:
        if person_id:
            rows = c.execute("SELECT * FROM photos WHERE person_id = ? ORDER BY taken_at DESC", (person_id,)).fetchall()
        else:
            rows = c.execute("SELECT * FROM photos ORDER BY taken_at DESC").fetchall()
    return [store.photo_out(r) for r in rows]


@router.post("/photos")
async def upload_photo(
    file: UploadFile = File(...),
    person_id: str = Form(...),
    caption: str = Form(""),
    taken_at: str = Form(""),
    asset_id: str = Form(""),
) -> dict:
    """He brings a photo in. Nothing is read from his gallery without this.

    asset_id (optional): the gallery photo it came from. A letter that carried it links
    that photo to this person, so a later look at it can be about them.
    """
    ext = PHOTO_TYPES.get(file.content_type or "")
    if not ext:
        raise HTTPException(415, "photos must be jpeg, png, webp, or gif")
    if not store.get_person(person_id):
        raise HTTPException(404, "no such person")
    data = await _read_limited(file, MAX_PHOTO)
    photo_id = db.new_id("photo")
    path = store.save_media("photos", f"{photo_id}.{ext}", data)
    with db.tx() as c:
        c.execute(
            "INSERT INTO photos (id, person_id, path, caption, taken_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (photo_id, person_id, path, caption[:120], taken_at or None, db.iso(timeutil.now_utc())),
        )
        row = c.execute("SELECT * FROM photos WHERE id = ?", (photo_id,)).fetchone()
    memory.link(memory.clean_asset_id(asset_id), [person_id], timeutil.now_utc(), letter=True)
    return store.photo_out(row)


@router.delete("/photos/{photo_id}")
def delete_photo(photo_id: str) -> dict:
    with db.tx() as c:
        c.execute("DELETE FROM photos WHERE id = ?", (photo_id,))
    return {"ok": True}


# ---------------------------------------------------------------- rants


class TypedRant(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    asset_id: str | None = Field(None, max_length=300)  # the photo he's looking at, if any


@router.post("/rants/text")
def rant_text(body: TypedRant) -> dict:
    """Typed instead of spoken. Same sorting, no audio."""
    turns = [{"turnId": 1, "startMs": None, "endMs": None, "text": body.text}]
    return rants.save_rant(turns, None, "typed", asset_id=body.asset_id)


@router.post("/rants/audio")
async def rant_audio(file: UploadFile = File(...), asset_id: str = Form("")) -> dict:
    """The fallback when the live socket fails: the browser uploads the WAV it kept."""
    wav = await _read_limited(file, MAX_AUDIO)
    try:
        pcm, rate = audio.wav_to_pcm(wav)
    except Exception:
        raise HTTPException(400, "send mono 16-bit WAV at 24 kHz")
    if rate != audio.RATE:
        raise HTTPException(400, "send 24 kHz audio")
    if settings.muse_enabled:
        try:
            turns = await transcribe.transcribe_wav(wav, rants.language_bias())
        except transcribe.TranscribeError as exc:
            raise HTTPException(502, f"transcription failed: {exc}")
        provider = "meta"
    else:
        turns = transcribe.mock_turns(audio.duration_ms(pcm))
        provider = "mock"
    try:
        return rants.save_rant(turns, pcm, provider, asset_id=asset_id)
    except ValueError as exc:
        raise HTTPException(422, str(exc))


@router.get("/rants/{rant_id}")
def get_rant(rant_id: str) -> dict:
    try:
        return rants.get_rant(rant_id)
    except KeyError:
        raise HTTPException(404, "no such rant")


@router.post("/rants/{rant_id}/sort")
async def sort_rant(rant_id: str) -> dict:
    """Safety gate first, then his words sorted by person. Idempotent."""
    try:
        return await rants.sort_rant(rant_id)
    except KeyError:
        raise HTTPException(404, "no such rant")


# ---------------------------------------------------------------- cards


class NewCard(BaseModel):
    recipient_id: str
    piece_ids: list[str] = Field(..., min_length=1, max_length=20)
    photo_id: str | None = None
    when: Literal["her_morning", "now"] = "her_morning"


@router.post("/cards")
async def new_card(body: NewCard) -> dict:
    try:
        return await delivery.create_card(body.recipient_id, body.piece_ids, body.photo_id, body.when)
    except delivery.CardError as exc:
        raise HTTPException(400, str(exc))


@router.get("/cards/{card_id}")
def get_card(card_id: str) -> dict:
    try:
        return delivery.get_card(card_id)
    except delivery.CardError:
        raise HTTPException(404, "no such card")


@router.post("/cards/{card_id}/shared")
def card_shared(card_id: str) -> dict:
    """He tapped through to Messages or WhatsApp. We can't see the send; we record the handoff."""
    return delivery.mark_shared(card_id)


@router.post("/cards/{card_id}/video")
async def card_video(card_id: str, file: UploadFile = File(...)) -> dict:
    """A video he recorded or picked to go with the letter. Played on her card page."""
    mime = (file.content_type or "").split(";")[0]
    ext = VIDEO_TYPES.get(mime)
    if not ext:
        raise HTTPException(415, "video must be webm, mp4, or mov")
    with db.tx() as c:
        card = c.execute("SELECT id, status FROM cards WHERE id = ?", (card_id,)).fetchone()
    if not card:
        raise HTTPException(404, "no such card")
    if card["status"] == "revoked":
        raise HTTPException(409, "this letter was taken back")
    data = await _read_limited(file, MAX_VIDEO)
    path = store.save_media("videos", f"{card_id}.{ext}", data)
    with db.tx() as c:
        c.execute("UPDATE cards SET video_path = ? WHERE id = ?", (path, card_id))
    return delivery.get_card(card_id)


@router.post("/cards/{card_id}/revoke")
def card_revoke(card_id: str) -> dict:
    return delivery.revoke(card_id)


# ---------------------------------------------------------------- replies


@router.post("/replies/{reply_id}/heard")
def reply_heard(reply_id: str) -> dict:
    with db.tx() as c:
        c.execute("UPDATE replies SET heard_at = ? WHERE id = ? AND heard_at IS NULL", (db.iso(timeutil.now_utc()), reply_id))
        row = c.execute("SELECT * FROM replies WHERE id = ?", (reply_id,)).fetchone()
    if not row:
        raise HTTPException(404, "no such reply")
    return store.reply_out(row, timeutil.now_utc())


# ---------------------------------------------------------------- self notes


@router.post("/self-notes")
async def new_self_note(file: UploadFile = File(...), label: str = Form("for the next hard day")) -> dict:
    mime = (file.content_type or "").split(";")[0]
    ext = VIDEO_TYPES.get(mime)
    if not ext:
        raise HTTPException(415, "video must be webm, mp4, or mov")
    data = await _read_limited(file, MAX_VIDEO)
    note_id = db.new_id("note")
    path = store.save_media("notes", f"{note_id}.{ext}", data)
    with db.tx() as c:
        c.execute(
            "INSERT INTO self_notes (id, path, mime, label, created_at) VALUES (?, ?, ?, ?, ?)",
            (note_id, path, mime, label[:80], db.iso(timeutil.now_utc())),
        )
        row = c.execute("SELECT * FROM self_notes WHERE id = ?", (note_id,)).fetchone()
    return store.self_note_out(row)


# ---------------------------------------------------------------- reminders


class NewReminder(BaseModel):
    person_id: str
    text: str = Field(..., min_length=1, max_length=120)


@router.post("/reminders")
def new_reminder(body: NewReminder) -> dict:
    if not store.get_person(body.person_id):
        raise HTTPException(404, "no such person")
    reminder_id = db.new_id("rem")
    with db.tx() as c:
        c.execute(
            "INSERT INTO reminders (id, person_id, text, created_at) VALUES (?, ?, ?, ?)",
            (reminder_id, body.person_id, body.text, db.iso(timeutil.now_utc())),
        )
        row = c.execute("SELECT * FROM reminders WHERE id = ?", (reminder_id,)).fetchone()
    return store.reminder_out(row)


@router.post("/reminders/{reminder_id}/done")
def reminder_done(reminder_id: str) -> dict:
    with db.tx() as c:
        c.execute("UPDATE reminders SET done_at = ? WHERE id = ?", (db.iso(timeutil.now_utc()), reminder_id))
    return {"ok": True}
