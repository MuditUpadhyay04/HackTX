"""Muse Voice Transcribe: a realtime relay for the live rant, and file transcription
for replies and fallbacks.

The browser never sees the API key. It streams 24 kHz PCM to our server, which
relays it to wss://api.meta.ai/v1/asr/realtime and forwards partials back.
"""

import asyncio
import json
import logging
import uuid
from typing import Awaitable, Callable

import httpx
import websockets

from ..config import settings

log = logging.getLogger("unsaid.asr")

Emit = Callable[[dict], Awaitable[None]]


class TranscribeError(RuntimeError):
    pass


def _handshake(language_bias: list[str], keywords: list[str]) -> dict:
    hs = {
        "authorization": {"accessToken": f"Bearer {settings.model_api_key}"},
        "audioEncoding": "PCM_24KHZ",
        "model": settings.asr_model,
        "mode": "ENDPOINTING",
        "partialMode": "CUMULATIVE",
        "emitAudioProgress": False,
    }
    if language_bias:
        hs["languageBias"] = language_bias
    if keywords:
        hs["keywords"] = keywords
    return hs


class RealtimeSession:
    """One live rant. Feed PCM with send_audio(), call finish(), read .turns.

    Events forwarded to the client through emit():
      {"type": "partial", "text": ...}   the live hypothesis for the turn in progress
      {"type": "turn", "turnId", "text"} a completed turn
    """

    def __init__(self, emit: Emit, language_bias: list[str], keywords: list[str]):
        self.emit = emit
        self.language_bias = language_bias
        self.keywords = keywords
        self.turns: dict[int, dict] = {}
        self._ws = None
        self._reader: asyncio.Task | None = None
        self._current: int | None = None
        self.session_id = f"unsaid-{uuid.uuid4().hex[:12]}"

    async def open(self) -> None:
        url = f"{settings.asr_realtime_url}?sessionId={self.session_id}"
        self._ws = await websockets.connect(url, open_timeout=15, max_size=None)
        await self._ws.send(json.dumps(_handshake(self.language_bias, self.keywords)))
        ack = json.loads(await asyncio.wait_for(self._ws.recv(), timeout=15))
        if "sessionId" not in ack:
            raise TranscribeError(f"handshake failed: {ack}")
        self._reader = asyncio.create_task(self._read())

    async def send_audio(self, pcm: bytes) -> None:
        if self._reader and self._reader.done():
            self._reader.result()  # surfaces a server error early
        await self._ws.send(pcm)

    async def finish(self, timeout: float = 20) -> list[dict]:
        """Ends input and waits for the server to flush and close (code 1000)."""
        try:
            await self._ws.send(json.dumps({"type": "endStream"}))
        except websockets.ConnectionClosed:
            pass
        try:
            await asyncio.wait_for(self._reader, timeout=timeout)
        finally:
            await self._ws.close()
        return self.ordered_turns()

    async def abort(self) -> None:
        if self._reader:
            self._reader.cancel()
        if self._ws:
            await self._ws.close()

    def ordered_turns(self) -> list[dict]:
        out = []
        for turn_id in sorted(self.turns):
            t = self.turns[turn_id]
            text = (t.get("text") or t.get("partial") or "").strip()
            if text:
                out.append({"turnId": turn_id, "startMs": t.get("startMs"), "endMs": t.get("endMs"), "text": text})
        return out

    async def _read(self) -> None:
        async for raw in self._ws:
            if isinstance(raw, bytes):
                continue
            event = json.loads(raw)
            kind = event.get("type")
            if kind == "speechStart":
                self._current = event["turnId"]
                self.turns[self._current] = {"startMs": event.get("audioProcessedMs")}
            elif kind == "transcript":
                if self._current is not None:
                    self.turns.setdefault(self._current, {})["partial"] = event.get("transcript", "")
                await self.emit({"type": "partial", "text": event.get("transcript", "")})
            elif kind == "speechEnd":
                self.turns.setdefault(event["turnId"], {})["endMs"] = event.get("audioProcessedMs")
            elif kind == "speechComplete":
                turn = self.turns.setdefault(event["turnId"], {})
                turn["text"] = event.get("transcript", "")
                turn.setdefault("endMs", event.get("audioProcessedMs"))
                await self.emit({"type": "turn", "turnId": event["turnId"], "text": turn["text"]})
            elif kind == "error":
                raise TranscribeError(event.get("message", "transcription error"))
            # unknown event types are ignored, as the docs ask


async def transcribe_wav(wav: bytes, language_bias: list[str]) -> list[dict]:
    """File transcription with turn detection. Returns turns like the realtime session."""
    request = {"mode": "ENDPOINTING", "model": settings.asr_model, "audioEncoding": "WAV"}
    if language_bias:
        request["languageBias"] = language_bias
    files = {
        "request": (None, json.dumps(request), "application/json"),
        "audio": ("audio.wav", wav, "audio/wav"),
    }
    url = f"{settings.model_api_base}/asr/transcribe?sessionId=unsaid-{uuid.uuid4().hex[:12]}"
    headers = {"Authorization": f"Bearer {settings.model_api_key}"}
    async with httpx.AsyncClient(timeout=httpx.Timeout(90, connect=10)) as client:
        resp = await client.post(url, files=files, headers=headers)
    if resp.status_code != 200:
        raise TranscribeError(f"transcribe {resp.status_code}: {resp.text[:300]}")
    body = resp.json()
    turns = [
        {"turnId": t.get("turnId", i + 1), "startMs": t.get("startMs"), "endMs": t.get("endMs"), "text": t.get("transcript", "")}
        for i, t in enumerate(body.get("turns") or [])
    ]
    if not turns and body.get("transcript"):
        turns = [{"turnId": 1, "startMs": 0, "endMs": body.get("audioDurationMs"), "text": body["transcript"]}]
    return turns


# ---------------------------------------------------------------------------
# Mock transcription: Riley's rant from design/DESIGN_SPEC.md 3.7, one turn per person,
# so the whole loop runs without a key. Every mock result is labeled provider "mock"
# all the way to the UI.

MOCK_RANT = [
    "i don't know. mom keeps calling and i keep letting it ring and then i send her one letter back. "
    "she made dal on sunday and i didn't even say thank you. i miss her. "
    "i just don't know how to call when it's been this long.",
    "and sarah. she said please just say something and i said i don't feel like talking. that's not true. "
    "i miss the way we used to talk. i'm sorry i bailed on barton springs. "
    "i'm not mad at her, i'm just tired all the time.",
    "and michael keeps sending me reels and i haven't sent one back in like two weeks. "
    "i still think about the sunrise on 290. i want to do that again.",
]

MOCK_REPLY = "Beta, koi emergency nahi hai. Bas teri awaaz sunni thi."


def mock_turns(duration_ms: int, texts: list[str] = MOCK_RANT) -> list[dict]:
    span = max(duration_ms, 3000) // len(texts)
    return [
        {"turnId": i + 1, "startMs": i * span + 100, "endMs": (i + 1) * span - 100, "text": text}
        for i, text in enumerate(texts)
    ]
