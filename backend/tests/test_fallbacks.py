"""When Muse Voice Transcribe fails, Gemini transcribes instead, for files and for the live socket."""

import asyncio

import pytest
from fastapi.testclient import TestClient

from app import audio
from app.ai import gemini, transcribe
from app.config import settings
from app.main import app

GEMINI_TURNS = [{"turnId": 1, "startMs": None, "endMs": None, "text": "Mumma, I miss you."}]


@pytest.fixture
def keys():
    object.__setattr__(settings, "model_api_key", "test-meta-key")
    object.__setattr__(settings, "gemini_api_key", "test-gemini-key")
    yield
    object.__setattr__(settings, "model_api_key", "")
    object.__setattr__(settings, "gemini_api_key", "")


async def _gemini_ok(wav, bias):
    return GEMINI_TURNS


def _wav(seconds: float) -> bytes:
    return audio.pcm_to_wav(b"\x00\x01" * int(audio.RATE * seconds))


def test_file_transcription_falls_back_to_gemini(monkeypatch, keys):
    async def muse_down(wav, bias):
        raise transcribe.TranscribeError("transcribe 503: busy")

    monkeypatch.setattr(transcribe, "transcribe_wav", muse_down)
    monkeypatch.setattr(gemini, "transcribe", _gemini_ok)
    turns, provider = asyncio.run(transcribe.transcribe_any(_wav(2), ["English", "Hindi"]))
    assert provider == "gemini" and turns == GEMINI_TURNS


def test_muse_hearing_nothing_in_a_real_recording_asks_gemini(monkeypatch, keys):
    async def muse_silent(wav, bias):
        return []

    monkeypatch.setattr(transcribe, "transcribe_wav", muse_silent)
    monkeypatch.setattr(gemini, "transcribe", _gemini_ok)
    assert asyncio.run(transcribe.transcribe_any(_wav(3), ["English"]))[1] == "gemini"
    assert asyncio.run(transcribe.transcribe_any(_wav(0.5), ["English"])) == ([], "meta")  # a tap, not a rant


def test_both_down_raises(monkeypatch, keys):
    async def muse_down(wav, bias):
        raise transcribe.TranscribeError("down")

    async def gemini_down(wav, bias):
        raise gemini.GeminiError("down too")

    monkeypatch.setattr(transcribe, "transcribe_wav", muse_down)
    monkeypatch.setattr(gemini, "transcribe", gemini_down)
    with pytest.raises(transcribe.TranscribeError):
        asyncio.run(transcribe.transcribe_any(_wav(2), ["English"]))


def test_live_rant_survives_muse_realtime_being_down(monkeypatch, keys):
    async def refuse(self):
        raise transcribe.TranscribeError("handshake failed: unavailable")

    monkeypatch.setattr(transcribe.RealtimeSession, "open", refuse)
    monkeypatch.setattr(transcribe, "transcribe_wav", lambda wav, bias: (_ for _ in ()).throw(transcribe.TranscribeError("down")))
    monkeypatch.setattr(gemini, "transcribe", _gemini_ok)
    with TestClient(app) as client:
        with client.websocket_connect(f"/api/rants/live?key={settings.app_key}") as ws:
            ws.send_json({"type": "start"})
            assert ws.receive_json() == {"type": "ready", "provider": "gemini"}
            ws.send_bytes(b"\x00\x01" * audio.RATE * 2)
            ws.send_json({"type": "stop"})
            events = []
            while True:
                event = ws.receive_json()
                events.append(event)
                if event["type"] in ("done", "error"):
                    break
    done = events[-1]
    assert done["type"] == "done", events
    assert done["rant"]["provider"] == "gemini"
    assert "Mumma, I miss you." in done["rant"]["transcript"]
