"""The live rant: browser -> us -> Muse Voice Transcribe, partials streaming back.

Client protocol (JSON text frames, audio as binary frames):
  -> {"type": "start", "asset_id"?: "ph://..."}         the photo he's looking at, if any
  <- {"type": "ready", "provider": "meta" | "mock"}     start sending audio after this
  -> binary: 16-bit mono PCM at 24 kHz, about 80 ms per frame, in real time
  <- {"type": "partial", "text"}                       live hypothesis for the current turn
  <- {"type": "turn", "turnId", "text"}                a finished turn
  -> {"type": "stop"}
  <- {"type": "done", "rant": {...}}                   saved; now POST /api/rants/{id}/sort
  <- {"type": "error", "message", "fallback": "upload"} upload the WAV to /api/rants/audio instead
"""

import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from .. import guests, rants
from ..ai import transcribe
from ..auth import key_ok
from ..config import settings

router = APIRouter()
log = logging.getLogger("unsaid.live")

MAX_SECONDS = 180
MAX_BYTES = MAX_SECONDS * 48_000


async def _mock_stream(emit, pcm_len: int) -> list[dict]:
    turns = transcribe.mock_turns(pcm_len * 1000 // 48_000)
    for turn in turns:
        words = turn["text"].split()
        for i in range(1, len(words) + 1):
            await emit({"type": "partial", "text": " ".join(words[:i])})
            await asyncio.sleep(0.04)
        await emit({"type": "turn", "turnId": turn["turnId"], "text": turn["text"]})
    return turns


@router.websocket("/api/rants/live")
async def live_rant(ws: WebSocket) -> None:
    if not key_ok(ws.query_params.get("key")):
        await ws.close(code=4401)
        return
    await ws.accept()
    session = None
    pcm = bytearray()

    async def emit(event: dict) -> None:
        await ws.send_json(event)

    try:
        start = await ws.receive_json()
        if start.get("type") != "start":
            await ws.close(code=4400)
            return
        provider = "meta" if settings.muse_enabled else "mock"
        if provider == "meta":
            session = transcribe.RealtimeSession(emit, rants.language_bias(), rants.keywords())
            await session.open()
        await emit({"type": "ready", "provider": provider})

        while True:
            msg = await ws.receive()
            if msg["type"] == "websocket.disconnect":
                raise WebSocketDisconnect(msg.get("code", 1000))
            if msg.get("bytes") is not None:
                chunk = msg["bytes"]
                pcm += chunk
                if session:
                    await session.send_audio(chunk)
                if len(pcm) >= (guests.MAX_GUEST_PCM_BYTES if settings.guest else MAX_BYTES):  # a minute for try-it guests
                    break
            elif msg.get("text") and json.loads(msg["text"]).get("type") == "stop":
                break

        turns = await session.finish() if session else await _mock_stream(emit, len(pcm))
        rant = rants.save_rant(turns, bytes(pcm), provider, asset_id=start.get("asset_id"))
        await emit({"type": "done", "rant": rant})
        await ws.close()
    except WebSocketDisconnect:
        if session:
            await session.abort()
    except Exception as exc:  # the client keeps its own WAV and uploads it instead
        log.warning("live rant failed: %s", exc)
        if session:
            await session.abort()
        try:
            await emit({"type": "error", "message": str(exc)[:200], "fallback": "upload"})
            await ws.close()
        except Exception:
            pass
