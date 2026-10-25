"""The realtime handshake must fail fast on a rejected key, so Talk falls back right away."""

import asyncio
import json

import pytest

from app.ai import transcribe


class FakeSocket:
    def __init__(self, ack: dict):
        self.ack = ack
        self.sent: list = []
        self.closed = False

    async def send(self, message):
        self.sent.append(message)

    async def recv(self):
        return json.dumps(self.ack)

    async def close(self):
        self.closed = True

    def __aiter__(self):
        return self

    async def __anext__(self):
        raise StopAsyncIteration


def open_with(monkeypatch, ack: dict) -> tuple[transcribe.RealtimeSession, FakeSocket]:
    socket = FakeSocket(ack)

    async def fake_connect(*args, **kwargs):
        return socket

    monkeypatch.setattr(transcribe.websockets, "connect", fake_connect)

    async def noop(event):
        pass

    session = transcribe.RealtimeSession(noop, ["English", "Hindi"], [])
    return session, socket


def test_a_rejected_key_fails_the_handshake(monkeypatch):
    session, socket = open_with(monkeypatch, {"type": "error", "errorCode": "invalid_api_key", "sessionId": "abc"})
    with pytest.raises(transcribe.TranscribeError, match="invalid_api_key"):
        asyncio.run(session.open())
    assert socket.closed
    assert json.loads(socket.sent[0])["mode"] == "ENDPOINTING"


def test_an_error_message_is_passed_along(monkeypatch):
    session, _ = open_with(monkeypatch, {"type": "error", "message": "model not enabled for this key", "sessionId": "abc"})
    with pytest.raises(transcribe.TranscribeError, match="model not enabled"):
        asyncio.run(session.open())


def test_a_plain_session_id_is_success(monkeypatch):
    session, socket = open_with(monkeypatch, {"sessionId": "abc"})

    async def run():
        await session.open()
        reading = session._reader is not None
        await session.abort()
        return reading

    assert asyncio.run(run()) is True  # opened without raising, and started reading events
    assert socket.closed               # abort closes it
