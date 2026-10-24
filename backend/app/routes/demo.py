"""Controls for recording the demo. Same APP_KEY as the student app.

The time skip in shot 11 is real: advance the app clock three hours and the
scheduler releases Mom's card exactly as it would at her actual 8 AM.
"""

from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from .. import db, delivery, seed, store, timeutil
from ..ai import transcribe
from ..auth import require_key

router = APIRouter(prefix="/api/demo", dependencies=[Depends(require_key)])


def _state() -> dict:
    now = timeutil.now_utc()
    me = store.me()
    return {
        "now_utc": db.iso(now),
        "offset_minutes": round(timeutil.offset_seconds() / 60, 1),
        "people": [store.person_out(p, now) for p in store.list_people(include_self=True)],
        "me_local": timeutil.local(now, me["timezone"]).isoformat(timespec="minutes"),
        "mom_voice_note_link": f"{store.public_base()}/c/{db.kv_get('tuesday_token', '')}",
    }


@router.get("/state")
def state() -> dict:
    return _state()


class ClockBody(BaseModel):
    set_local: str | None = None   # "2026-10-24T18:32", read in his time zone
    advance_minutes: float | None = None
    reset: bool = False


@router.post("/clock")
async def clock(body: ClockBody) -> dict:
    if body.reset:
        timeutil.reset_clock()
    if body.set_local:
        try:
            naive = datetime.fromisoformat(body.set_local)
        except ValueError:
            raise HTTPException(400, "set_local must look like 2026-10-24T18:32")
        target = naive if naive.tzinfo else naive.replace(tzinfo=ZoneInfo(store.me()["timezone"]))
        timeutil.set_now(target)
    if body.advance_minutes:
        timeutil.advance(body.advance_minutes)
    released = await delivery.release_due()
    return {**_state(), "released": released}


@router.post("/release-due")
async def release_due() -> dict:
    return {"released": await delivery.release_due()}


@router.post("/cards/{card_id}/release-now")
async def release_now(card_id: str) -> dict:
    await delivery.release(card_id)
    return delivery.get_card(card_id)


class BackdateBody(BaseModel):
    to_local: str  # "2026-10-20T19:10", in his time zone


@router.post("/replies/{reply_id}/backdate")
def backdate_reply(reply_id: str, body: BackdateBody) -> dict:
    """For the film: Mom records Saturday night; the notification says 'on tuesday'."""
    target = datetime.fromisoformat(body.to_local)
    if not target.tzinfo:
        target = target.replace(tzinfo=ZoneInfo(store.me()["timezone"]))
    with db.tx() as c:
        c.execute("UPDATE replies SET created_at = ? WHERE id = ?", (db.iso(target), reply_id))
        row = c.execute("SELECT * FROM replies WHERE id = ?", (reply_id,)).fetchone()
    if not row:
        raise HTTPException(404, "no such reply")
    return store.reply_out(row, timeutil.now_utc())


@router.post("/mock-reply")
def mock_reply() -> dict:
    """A text-only stand-in for Mom's Tuesday voice note, for building without her."""
    reply_id = db.new_id("reply")
    with db.tx() as c:
        c.execute(
            "INSERT INTO replies (id, card_id, from_person_id, transcript, translation, created_at) VALUES (?, ?, 'mom', ?, ?, ?)",
            (reply_id, seed.TUESDAY_CARD_ID, transcribe.MOCK_REPLY, "no emergency. just wanted to hear your voice.",
             "2026-10-21T00:40:00+00:00"),
        )
        row = c.execute("SELECT * FROM replies WHERE id = ?", (reply_id,)).fetchone()
    return store.reply_out(row, timeutil.now_utc())


@router.post("/reset")
def reset() -> dict:
    """Clears his rants, cards, replies, and notes. Keeps people, photos, and the clock."""
    seed.reset_activity()
    return _state()
