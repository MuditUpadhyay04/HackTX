"""Compose drafts, writing his own lines, "Keep this moment", and Connect photos (demo import + face groups)."""

import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from .. import connect, db, store, timeutil
from ..auth import require_key

router = APIRouter(prefix="/api", dependencies=[Depends(require_key)])

MAX_DRAFT = 4000


# ---------------------------------------------------------------- drafts (Compose, "ONLY A DRAFT")


class DraftBody(BaseModel):
    text: str = Field(..., max_length=MAX_DRAFT)


def _draft_out(row) -> dict:
    return {"person_id": row["person_id"], "text": row["text"], "updated_at": row["updated_at"]}


@router.get("/drafts")
def drafts() -> list[dict]:
    with db.tx() as c:
        rows = c.execute("SELECT * FROM drafts ORDER BY updated_at DESC").fetchall()
    return [_draft_out(r) for r in rows]


@router.put("/drafts/{person_id}")
def save_draft(person_id: str, body: DraftBody) -> dict:
    """Save (draft-save). Private; never sent. An empty draft is deleted."""
    if not store.get_person(person_id):
        raise HTTPException(404, "no such person")
    now = db.iso(timeutil.now_utc())
    with db.tx() as c:
        if not body.text.strip():
            c.execute("DELETE FROM drafts WHERE person_id = ?", (person_id,))
            return {"person_id": person_id, "text": "", "updated_at": now}
        c.execute(
            "INSERT INTO drafts (person_id, text, updated_at) VALUES (?, ?, ?) "
            "ON CONFLICT (person_id) DO UPDATE SET text = excluded.text, updated_at = excluded.updated_at",
            (person_id, body.text, now),
        )
        return _draft_out(c.execute("SELECT * FROM drafts WHERE person_id = ?", (person_id,)).fetchone())


@router.delete("/drafts/{person_id}")
def delete_draft(person_id: str) -> dict:
    with db.tx() as c:
        c.execute("DELETE FROM drafts WHERE person_id = ?", (person_id,))
    return {"ok": True}


class WrittenLines(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_DRAFT)
    replaces: list[str] = Field(default_factory=list)  # pile lines this edit replaces ("Edit as a draft")


@router.post("/people/{person_id}/pieces")
def write_pieces(person_id: str, body: WrittenLines) -> list[dict]:
    """Compose -> Preview letter. What he typed becomes his lines for this person, one per paragraph,
    exactly as typed (nothing is rewritten). Lines it replaces leave the pile; the saved draft is cleared."""
    if not store.get_person(person_id):
        raise HTTPException(404, "no such person")
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", body.text) if p.strip()]
    if not paragraphs:
        raise HTTPException(400, "nothing to send")
    now = timeutil.now_utc()
    ids = []
    with db.tx() as c:
        for i, text in enumerate(paragraphs):
            pid = db.new_id("piece")
            ids.append(pid)
            c.execute(
                "INSERT INTO pieces (id, rant_id, person_id, text, tone, created_at) VALUES (?, NULL, ?, ?, 'written', ?)",
                (pid, person_id, text, db.iso(now)),
            )
        for old in body.replaces:
            c.execute(
                "UPDATE pieces SET status = 'discarded' WHERE id = ? AND person_id = ? AND status = 'kept'", (old, person_id)
            )
        c.execute("DELETE FROM drafts WHERE person_id = ?", (person_id,))
        rows = [c.execute("SELECT * FROM pieces WHERE id = ?", (pid,)).fetchone() for pid in ids]
    return [store.piece_out(r) for r in rows]


# ---------------------------------------------------------------- Keep this moment (vault-save)


@router.post("/replies/{reply_id}/keep")
def keep_reply(reply_id: str) -> dict:
    now = timeutil.now_utc()
    with db.tx() as c:
        c.execute("UPDATE replies SET kept_at = COALESCE(kept_at, ?) WHERE id = ?", (db.iso(now), reply_id))
        row = c.execute("SELECT * FROM replies WHERE id = ?", (reply_id,)).fetchone()
    if not row:
        raise HTTPException(404, "no such letter")
    return store.reply_out(row, now)


# ---------------------------------------------------------------- Connect photos + face groups (demo)


def _source(source: str) -> str:
    if source not in connect.SOURCES:
        raise HTTPException(404, "unknown photo source")
    return source


@router.get("/connect")
def connect_state() -> dict:
    return {"connected": connect.connected()}


@router.post("/connect/{source}")
def connect_source(source: str) -> dict:
    """Connect on Photos / Instagram photos / Facebook photos. Demo: imports drawn photos, already grouped."""
    now = timeutil.now_utc()
    added = connect.connect(_source(source), now)
    return {"connected": connect.connected(), "added": added, "pending": connect.pending(now)}


@router.get("/faces")
def faces() -> dict:
    now = timeutil.now_utc()
    return {
        "clusters": connect.clusters(now),
        "pending": [c["id"] for c in connect.pending(now)],
        "dismissed": db.kv_get("faces_dismissed") == "1",
    }


class LinkBody(BaseModel):
    person_id: str


@router.post("/faces/{cluster}/link")
def faces_link(cluster: str, body: LinkBody) -> dict:
    """"Mom?" / "add to Mom's memories" / naming an unknown group: these photos are of this person."""
    if cluster not in connect.CLUSTERS:
        raise HTTPException(404, "no such group")
    person = store.get_person(body.person_id)
    if not person or person["channel"] == "self":
        raise HTTPException(404, "no such person")
    return {"linked": connect.link(cluster, body.person_id)}


@router.post("/faces/photos/{photo_id}/not-them")
def faces_not_them(photo_id: str) -> dict:
    if not connect.not_them(photo_id):
        raise HTTPException(404, "no such photo in a group")
    return {"ok": True}


@router.post("/faces/dismiss")
def faces_dismiss() -> dict:
    db.kv_set("faces_dismissed", "1")
    return {"ok": True}
