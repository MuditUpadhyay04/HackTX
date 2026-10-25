"""The knock and the attention settings. The policy itself lives in app/attention.py."""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from .. import attention, db, memory, push, store, timeutil, voice
from ..auth import require_key

router = APIRouter(prefix="/api", dependencies=[Depends(require_key)])


class KnockIn(BaseModel):
    asset_id: str = Field(..., min_length=1, max_length=memory.ASSET_ID_MAX)
    dwell_ms: int = Field(0, ge=0, le=3_600_000)  # how long he's been on this photo
    zoomed: bool = False                           # he pinched in
    revisit: bool = False                          # second time on this photo this session
    session_id: str = Field("", max_length=64)     # one per app launch


@router.post("/knock/check")
def knock_check(body: KnockIn) -> dict:
    """May Un-Said knock on this photo right now? Almost always: no."""
    now = timeutil.now_utc()
    db.kv_set("last_activity_at", db.iso(now))
    asset_id = memory.clean_asset_id(body.asset_id)
    request = attention.KnockRequest(asset_id, body.dwell_ms, body.zoomed, body.revisit, body.session_id)
    decision = attention.decide_knock(request, attention.knock_context(asset_id, now), now)
    if not decision.knock:
        return {"knock": False, "reason": decision.reason}
    event_id = attention.record(
        "knock", now, detail=decision.detail, person_id=decision.person_id, asset_id=asset_id,
        session_id=body.session_id or None,
    )
    person = store.get_person(decision.person_id) if decision.person_id else None
    return {
        "knock": True,
        "id": event_id,
        "kind": decision.detail,
        "title": voice.APP_NAME,
        "body": decision.body,
        "person_id": decision.person_id,
        "person_name": person["name"] if person else None,
        "reason": decision.reason,
    }


class OutcomeIn(BaseModel):
    outcome: Literal["opened", "dismissed", "ignored"]


@router.post("/knock/{event_id}/outcome")
@router.post("/attention/{event_id}/outcome")
def attention_outcome(event_id: str, body: OutcomeIn) -> dict:
    """He opened it, dismissed it, or walked past it. This is what backs Un-Said off."""
    event = attention.set_outcome(event_id, body.outcome, timeutil.now_utc())
    if event is None:
        raise HTTPException(404, "no such knock")
    return {"ok": True, "id": event.id, "kind": event.kind, "outcome": event.outcome}


class SettingsPatch(BaseModel):
    knock_mode: Literal["gentle", "off", "demo"] | None = None
    quiet_start: str | None = None   # his quiet hours, HH:MM in his time zone
    quiet_end: str | None = None
    push_enabled: bool | None = None


@router.get("/settings")
def get_settings() -> dict:
    return attention.get_settings()


@router.patch("/settings")
def patch_settings(body: SettingsPatch) -> dict:
    try:
        return attention.patch_settings(body.model_dump(exclude_none=True))
    except ValueError as exc:
        raise HTTPException(400, str(exc))


class PushRegisterIn(BaseModel):
    token: str = Field(..., min_length=10, max_length=200)  # ExponentPushToken[...]
    platform: str = Field("", max_length=20)


@router.post("/push/register")
def push_register(body: PushRegisterIn) -> dict:
    try:
        return push.register(body.token, body.platform, timeutil.now_utc())
    except ValueError as exc:
        raise HTTPException(400, str(exc))


class PermissionIn(BaseModel):
    granted: bool


@router.post("/push/permission")
def push_permission(body: PermissionIn) -> dict:
    """He was asked once, at a moment that mattered. Recorded so he's never asked again."""
    attention.record(
        "permission_ask", timeutil.now_utc(), outcome="opened" if body.granted else "dismissed"
    )
    return attention.get_settings()
