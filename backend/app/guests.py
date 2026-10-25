"""Try-it guests: a private sandbox per judge's phone on the shared Vultr backend.

A request opts in with the header X-Guest-Id (or ?guest= on the live WebSocket): 32 lowercase hex
characters. That guest gets its own SQLite database (DATA_DIR/guests/<id>/unsaid.db) and its own files
(DATA_DIR/guest_media/<id>/, served at /guest-media/<id>/...). The shared seed photos stay in the main
media folder and are served from /media/ to everyone. Requests without the header are untouched.

A new guest's database is a copy of a template seeded once per process (like a fresh /api/demo/reset,
knock_mode "try"), so a new guest costs a file copy. A guest folder counts as ready only once its
.seeded marker exists, so a half-made folder is rebuilt.

Guests can look, talk, sort and preview, but nothing leaves: sending, sharing, demo controls and push
registration are refused. Uploads and recordings are capped at a minute, AI routes are rate limited,
and anything unexpected answers a kind 503 instead of a 500. Guests unseen for a day are removed, and
there are never more than MAX_GUESTS; a guest with a request in flight is never removed.
"""

import asyncio
import json
import logging
import re
import shutil
import threading
import time
from collections import defaultdict, deque
from pathlib import Path

import anyio

from .config import GUEST, settings

log = logging.getLogger("unsaid.guests")

GUEST_RE = re.compile(r"[a-f0-9]{32}")  # always fullmatch
MAX_AGE_S = 24 * 3600
MAX_GUESTS = 300
SORTS_PER_HOUR = 20
AI_CALLS_PER_HOUR = 40
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_GUEST_AUDIO_MS = 60_000
MAX_GUEST_PCM_BYTES = 60 * 24_000 * 2  # a minute of 24 kHz 16-bit mono on the live socket

PREVIEW_ONLY = "This is a preview. Nothing is sent from the try-it app."
SLOW_DOWN = "You've tried a lot in a short time. Take a breath and try again in a few minutes."
TOO_LONG = "Keep it under a minute here. Try a shorter one."
MODELS_DOWN = "Un-Said couldn't reach its models just now. Give it a minute and try again."
HICCUP = "Something went wrong on our side. Try that again."

TEMPLATE = "_template"  # an internal GUEST value: never matches GUEST_RE, so prune and requests skip it

# Routes a guest may never use (method, path regex).
_BLOCKED = [
    (None, re.compile(r"/api/demo(/.*)?")),
    ("POST", re.compile(r"/api/cards")),
    ("POST", re.compile(r"/api/cards/[^/]+/(release-now|revoke|shared|video)")),
    ("POST", re.compile(r"/api/push/register")),
]
_UPLOADS = re.compile(r"/api/(rants/audio|self-notes|photos)")
_SORT = re.compile(r"/api/rants/[^/]+/sort")
_AI = re.compile(r"/api/(rants/[^/]+/sort|rants/audio|rants/live|letters/echo)")

_locks: dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)
_template_lock = threading.Lock()
_template_ready = False
_ready: set[str] = set()
_in_flight: dict[str, int] = defaultdict(int)
_calls: dict[str, deque] = defaultdict(deque)
_sorts: dict[str, deque] = defaultdict(deque)
_last_touch: dict[str, float] = {}


def guest_root() -> Path:
    return settings.data_dir / "guests"


def guest_media_root() -> Path:
    return settings.data_dir / "guest_media"


def valid(guest: str | None) -> bool:
    return bool(guest) and GUEST_RE.fullmatch(guest) is not None


def inside(base: Path, path: Path) -> bool:
    """True when path resolves inside base (no .. or link escapes)."""
    try:
        path.resolve().relative_to(base.resolve())
        return True
    except ValueError:
        return False


# ---------------------------------------------------------------- the sandbox


def _build_template() -> None:
    """Seeds the template once per process (fresh code, fresh seed). Runs with GUEST = TEMPLATE."""
    global _template_ready
    with _template_lock:
        if _template_ready:
            return
        from . import attention, db, seed  # noqa: PLC0415  (import cycle: these import config)

        token = GUEST.set(TEMPLATE)
        try:
            shutil.rmtree(guest_root() / TEMPLATE, ignore_errors=True)
            shutil.rmtree(guest_media_root() / TEMPLATE, ignore_errors=True)
            settings.db_path.parent.mkdir(parents=True, exist_ok=True)
            db.init_db()
            seed.seed_if_empty()
            seed.ensure_cast()
            seed.reset_activity()
            attention.patch_settings({"knock_mode": "try"})
            with db.tx() as c:
                c.execute("PRAGMA wal_checkpoint(TRUNCATE)")
            _template_ready = True
        finally:
            GUEST.reset(token)


def _seed(guest: str) -> None:
    """Makes this guest's folder from the template (blocking; runs in a worker thread)."""
    _build_template()
    folder, media = guest_root() / guest, guest_media_root() / guest
    shutil.rmtree(folder, ignore_errors=True)  # a half-made folder from a crash starts over
    shutil.rmtree(media, ignore_errors=True)
    folder.mkdir(parents=True)
    shutil.copyfile(guest_root() / TEMPLATE / "unsaid.db", folder / "unsaid.db")
    tmedia = guest_media_root() / TEMPLATE
    if tmedia.exists():
        shutil.copytree(tmedia, media)  # only small generated files; seed photos are shared
    else:
        media.mkdir(parents=True)
    (folder / ".seen").write_text(str(int(time.time())))
    (folder / ".seeded").write_text("1")  # last: the folder is ready


async def ensure_guest(guest: str) -> None:
    if guest in _ready and (guest_root() / guest / ".seeded").exists():
        _touch(guest)
        return
    async with _locks[guest]:
        if not (guest_root() / guest / ".seeded").exists():
            started = time.perf_counter()
            await anyio.to_thread.run_sync(prune_if_full)
            await anyio.to_thread.run_sync(_seed, guest)
            log.info("guest %s... ready in %.0f ms", guest[:6], (time.perf_counter() - started) * 1000)
        _ready.add(guest)
    _touch(guest, force=True)


def _touch(guest: str, force: bool = False) -> None:
    now = time.time()
    if force or now - _last_touch.get(guest, 0) > 60:
        _last_touch[guest] = now
        try:
            (guest_root() / guest / ".seen").write_text(str(int(now)))
        except OSError:
            pass


def _last_seen(path: Path) -> float:
    try:
        return float((path / ".seen").read_text())
    except (OSError, ValueError):
        return path.stat().st_mtime


def prune(now: float | None = None) -> int:
    """Removes guests unseen for a day, then the oldest beyond MAX_GUESTS. Skips guests with a request in
    flight, and never touches the main data (only names that are valid guest ids, under guests/)."""
    now = now or time.time()
    root = guest_root()
    if not root.exists():
        return 0
    dirs = sorted((d for d in root.iterdir() if d.is_dir() and valid(d.name)), key=_last_seen)
    idle = [d for d in dirs if not _in_flight.get(d.name)]
    doomed = [d for d in idle if now - _last_seen(d) > MAX_AGE_S]
    excess = len(dirs) - len(doomed) - (MAX_GUESTS - 1)
    doomed += [d for d in idle if d not in doomed][: max(0, excess)]
    for d in doomed:
        shutil.rmtree(d, ignore_errors=True)
        shutil.rmtree(guest_media_root() / d.name, ignore_errors=True)
        _ready.discard(d.name)
        _locks.pop(d.name, None)
    if doomed:
        log.info("removed %d guest sandboxes", len(doomed))
    return len(doomed)


def prune_if_full() -> None:
    root = guest_root()
    if root.exists() and sum(1 for d in root.iterdir() if valid(d.name)) >= MAX_GUESTS:
        prune()


def _over_limit(guest: str, path: str) -> bool:
    now = time.monotonic()
    buckets = [(_calls[guest], AI_CALLS_PER_HOUR)]
    if _SORT.fullmatch(path):
        buckets.append((_sorts[guest], SORTS_PER_HOUR))
    for q, cap in buckets:
        while q and now - q[0] > 3600:
            q.popleft()
        if len(q) >= cap:
            return True
    for q, _ in buckets:
        q.append(now)
    return False


# ---------------------------------------------------------------- ASGI middleware


class GuestMiddleware:
    """Pure ASGI, so GUEST holds for the whole request or WebSocket session, and for tasks it starts."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] not in ("http", "websocket"):
            return await self.app(scope, receive, send)
        guest = _guest_from(scope)
        if guest is None or scope.get("path") == "/api/health":
            return await self.app(scope, receive, send)
        if not valid(guest):
            return await _refuse(scope, send, 400, "X-Guest-Id must be 32 lowercase hex characters.")
        path, method = scope.get("path", ""), scope.get("method")
        for m, rx in _BLOCKED:
            if (m is None or m == method) and rx.fullmatch(path):
                return await _refuse(scope, send, 403, PREVIEW_ONLY)
        if method == "POST" and _UPLOADS.fullmatch(path):
            length = _header(scope, b"content-length")
            if not length or not length.isdigit():
                return await _refuse(scope, send, 411, "Uploads need a Content-Length.")
            if int(length) > MAX_UPLOAD_BYTES:
                return await _refuse(scope, send, 413, TOO_LONG)

        token = GUEST.set(guest)
        _in_flight[guest] += 1
        started = False

        async def tracked_send(message):
            nonlocal started
            if message["type"] in ("http.response.start", "websocket.accept", "websocket.close"):
                started = True
            await send(message)

        try:
            await ensure_guest(guest)
            if _AI.fullmatch(path) and _over_limit(guest, path):
                return await _refuse(scope, send, 429, SLOW_DOWN)
            await self.app(scope, receive, tracked_send)
        except Exception:
            log.exception("guest %s... request failed: %s %s", guest[:6], method or "WS", path)
            if not started:
                await _refuse(scope, send, 503, HICCUP)
        finally:
            _in_flight[guest] -= 1
            if not _in_flight[guest]:
                _in_flight.pop(guest, None)
            GUEST.reset(token)


def _header(scope, name: bytes) -> str | None:
    for key, value in scope.get("headers", []):
        if key == name:
            return value.decode("latin-1").strip()
    return None


def _guest_from(scope) -> str | None:
    found = _header(scope, b"x-guest-id")
    if found is not None:
        return found
    if scope["type"] == "websocket":
        from urllib.parse import parse_qs  # noqa: PLC0415

        q = parse_qs(scope.get("query_string", b"").decode()).get("guest")
        if q:
            return q[0].strip()
    return None


async def _refuse(scope, send, status: int, detail: str) -> None:
    if scope["type"] == "websocket":
        await send({"type": "websocket.close", "code": 4000 + status, "reason": detail[:120]})
        return
    body = json.dumps({"detail": detail}).encode()
    await send({"type": "http.response.start", "status": status,
                "headers": [(b"content-type", b"application/json"), (b"content-length", str(len(body)).encode())]})
    await send({"type": "http.response.body", "body": body})
