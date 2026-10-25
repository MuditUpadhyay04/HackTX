"""Smoke-tests the API keys before a demo. Prints PASS / FAIL / SKIP and a fix for each.

    uv run python scripts/check_keys.py            # everything
    uv run python scripts/check_keys.py --skip realtime,whatsapp

Reads the same settings as the app (backend/.env, then the environment). Each check makes
one small real request: Muse Spark (structured output), Muse Voice Transcribe (a 1 s tone),
the realtime transcription handshake, and the WhatsApp Cloud API. Secrets are never printed.
Exit code 1 if anything FAILs.
"""

import argparse
import asyncio
import json
import math
import os
import struct
import sys
import time
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx  # noqa: E402
import websockets  # noqa: E402

from app.audio import RATE, pcm_to_wav  # noqa: E402
from app.config import settings  # noqa: E402

# Windows consoles default to cp1252; print the separators as written.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CHECKS = ("spark", "transcribe", "realtime", "whatsapp", "gemini")
SECRETS = [s for s in (settings.model_api_key, settings.whatsapp_token, settings.gemini_api_key) if s]
results: list[tuple[str, str]] = []


def scrub(text: str) -> str:
    for secret in SECRETS:
        text = text.replace(secret, "***")
    return text


def report(name: str, status: str, detail: str, fix: str = "") -> None:
    results.append((name, status))
    print(f"{status:<4}  {name:<24} {scrub(detail)}")
    if fix:
        print(f"      {'':<24} fix: {scrub(fix)}")


def api_error(resp: httpx.Response) -> str:
    try:
        body = resp.json()
        err = body.get("error", body)
        message = err.get("message") if isinstance(err, dict) else str(err)
    except ValueError:
        message = resp.text
    return f"HTTP {resp.status_code}: {str(message)[:160]}"


def model_api_fix(status: int) -> str:
    if status in (401, 403):
        return "MODEL_API_KEY was rejected. Create a key in the Model API dashboard and put it in backend/.env."
    if status == 404:
        return "Model not found. Check SPARK_MODEL / ASR_MODEL against https://dev.meta.ai/docs/models."
    if status == 429:
        return "Rate limited. Wait a minute and run again."
    return "See the error above; https://dev.meta.ai/docs has the request shapes."


# ------------------------------------------------------------------ Muse Spark


async def check_spark() -> None:
    name = "Muse Spark"
    if not settings.model_api_key:
        report(name, "FAIL", "MODEL_API_KEY is not set (the app runs on mock AI).", "Add MODEL_API_KEY to backend/.env.")
        return
    body = {
        "model": settings.spark_model,
        "messages": [
            {"role": "system", "content": "Reply with ok=true."},
            {"role": "user", "content": "Are you there?"},
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "Check",
                "schema": {
                    "type": "object",
                    "properties": {"ok": {"type": "boolean"}},
                    "required": ["ok"],
                    "additionalProperties": False,
                },
            },
        },
        "reasoning_effort": "low",
        "max_tokens": 1000,
    }
    headers = {"Authorization": f"Bearer {settings.model_api_key}"}
    started = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(60, connect=10)) as client:
            resp = await client.post(f"{settings.model_api_base}/chat/completions", json=body, headers=headers)
    except httpx.HTTPError as exc:
        report(name, "FAIL", f"can't reach {settings.model_api_base}: {exc.__class__.__name__}", "Check the network or MODEL_API_BASE.")
        return
    elapsed = time.monotonic() - started
    if resp.status_code != 200:
        report(name, "FAIL", api_error(resp), model_api_fix(resp.status_code))
        return
    try:
        content = json.loads(resp.json()["choices"][0]["message"]["content"])
    except (KeyError, IndexError, TypeError, ValueError):
        report(name, "FAIL", "200, but the reply wasn't the requested JSON.", "Structured output may be unavailable for this model; try SPARK_MODEL=muse-spark-1.3.")
        return
    report(name, "PASS", f"{settings.spark_model} answered {content} in {elapsed:.1f}s")


# ------------------------------------------------------------------ Muse Voice Transcribe


def tone_wav(seconds: float = 1.0, hz: float = 440.0) -> bytes:
    samples = int(RATE * seconds)
    pcm = b"".join(struct.pack("<h", int(3000 * math.sin(2 * math.pi * hz * i / RATE))) for i in range(samples))
    return pcm_to_wav(pcm)


async def check_transcribe() -> None:
    name = "Voice Transcribe (file)"
    if not settings.model_api_key:
        report(name, "FAIL", "MODEL_API_KEY is not set.", "Add MODEL_API_KEY to backend/.env.")
        return
    request = {"mode": "ENDPOINTING", "model": settings.asr_model, "audioEncoding": "WAV"}
    files = {
        "request": (None, json.dumps(request), "application/json"),
        "audio": ("check.wav", tone_wav(), "audio/wav"),
    }
    url = f"{settings.model_api_base}/asr/transcribe?sessionId=unsaid-check-{uuid.uuid4().hex[:8]}"
    headers = {"Authorization": f"Bearer {settings.model_api_key}"}
    started = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(60, connect=10)) as client:
            resp = await client.post(url, files=files, headers=headers)
    except httpx.HTTPError as exc:
        report(name, "FAIL", f"can't reach the transcription endpoint: {exc.__class__.__name__}", "Check the network.")
        return
    elapsed = time.monotonic() - started
    if resp.status_code != 200:
        report(name, "FAIL", api_error(resp), model_api_fix(resp.status_code))
        return
    transcript = (resp.json().get("transcript") or "").strip()
    heard = f'heard "{transcript[:40]}"' if transcript else "a tone, so an empty transcript is expected"
    report(name, "PASS", f"{settings.asr_model} answered in {elapsed:.1f}s ({heard})")


async def check_realtime() -> None:
    name = "Voice Transcribe (live)"
    if not settings.model_api_key:
        report(name, "FAIL", "MODEL_API_KEY is not set.", "Add MODEL_API_KEY to backend/.env.")
        return
    url = f"{settings.asr_realtime_url}?sessionId=unsaid-check-{uuid.uuid4().hex[:8]}"
    handshake = {
        "authorization": {"accessToken": f"Bearer {settings.model_api_key}"},
        "audioEncoding": "PCM_24KHZ",
        "model": settings.asr_model,
        "mode": "ENDPOINTING",
        "partialMode": "CUMULATIVE",
        "emitAudioProgress": False,
    }
    try:
        async with websockets.connect(url, open_timeout=10, max_size=None) as ws:
            await ws.send(json.dumps(handshake))
            ack = json.loads(await asyncio.wait_for(ws.recv(), timeout=10))
            # A real ack is {"sessionId": ...} with no "type". A refused key comes back as
            # {"type": "error", "errorCode": "invalid_api_key", "sessionId": ...}, then close 1008.
            if not isinstance(ack, dict) or ack.get("type") == "error" or "sessionId" not in ack:
                message = ack.get("message", ack) if isinstance(ack, dict) else ack
                code = ack.get("errorCode", "") if isinstance(ack, dict) else ""
                status = 401 if code == "invalid_api_key" or "nauthorized" in str(message) else 0
                report(name, "FAIL", f"handshake refused: {str(message)[:160]}", model_api_fix(status))
                return
            await ws.send(json.dumps({"type": "endStream"}))
        report(name, "PASS", "handshake accepted (the live transcript in Talk will work)")
    except websockets.InvalidStatus as exc:
        status = exc.response.status_code
        report(name, "FAIL", f"WebSocket upgrade refused: HTTP {status}", model_api_fix(status))
    except websockets.ConnectionClosed as exc:
        reason = exc.rcvd.reason if exc.rcvd else ""
        code = exc.rcvd.code if exc.rcvd else "?"
        report(name, "FAIL", f"closed during the handshake (code {code}) {reason[:120]}", model_api_fix(401))
    except (TimeoutError, OSError) as exc:
        report(name, "FAIL", f"no handshake reply: {exc.__class__.__name__}", "Check the network; the app falls back to file transcription.")


# ------------------------------------------------------------------ WhatsApp Cloud API


async def check_whatsapp() -> None:
    name = "WhatsApp Cloud API"
    if not (settings.whatsapp_token and settings.whatsapp_phone_number_id):
        report(name, "SKIP", "not configured. Mom's 8 AM uses the \"send it now?\" share-sheet fallback.",
               "Optional: set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID (backend/README.md).")
        return
    graph = f"https://graph.facebook.com/{settings.whatsapp_graph_version}"
    headers = {"Authorization": f"Bearer {settings.whatsapp_token}"}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                f"{graph}/{settings.whatsapp_phone_number_id}",
                params={"fields": "display_phone_number,verified_name"},
                headers=headers,
            )
            if resp.status_code != 200:
                fix = "The token is invalid or expired (temporary tokens last 24 h; use a System User token)."
                if resp.status_code == 400:
                    fix = "Check WHATSAPP_PHONE_NUMBER_ID (it's the Phone number ID, not the phone number)."
                report(name, "FAIL", api_error(resp), fix)
                return
            number = resp.json()
            report(name, "PASS", f"sender {number.get('display_phone_number', '?')} ({number.get('verified_name', 'unverified')})")

            waba = os.environ.get("WHATSAPP_WABA_ID", "").strip()
            tname = "WhatsApp template"
            if not waba:
                report(tname, "SKIP", f"set WHATSAPP_WABA_ID to check that '{settings.whatsapp_template}' is approved.")
                return
            resp = await client.get(
                f"{graph}/{waba}/message_templates",
                params={"name": settings.whatsapp_template, "fields": "name,status,language"},
                headers=headers,
            )
    except httpx.HTTPError as exc:
        report(name, "FAIL", f"can't reach graph.facebook.com: {exc.__class__.__name__}", "Check the network.")
        return
    if resp.status_code != 200:
        report(tname, "FAIL", api_error(resp), "Check WHATSAPP_WABA_ID (the WhatsApp Business Account ID).")
        return
    matches = [t for t in resp.json().get("data", []) if t.get("name") == settings.whatsapp_template]
    lang = [t for t in matches if t.get("language") == settings.whatsapp_template_lang]
    if not matches:
        report(tname, "FAIL", f"no template named '{settings.whatsapp_template}'.", "Create it (backend/README.md has the exact body) and wait for approval.")
    elif not lang:
        report(tname, "FAIL", f"'{settings.whatsapp_template}' exists, but not in language '{settings.whatsapp_template_lang}'.", "Set WHATSAPP_TEMPLATE_LANG to the template's language code.")
    elif lang[0].get("status") != "APPROVED":
        report(tname, "FAIL", f"'{settings.whatsapp_template}' is {lang[0].get('status')}.", "Wait for Meta's review; until then the app uses the share-sheet fallback.")
    else:
        report(tname, "PASS", f"'{settings.whatsapp_template}' ({settings.whatsapp_template_lang}) is APPROVED")


# ------------------------------------------------------------------ Gemini (optional)


async def check_gemini() -> None:
    name = "Gemini echo"
    if not settings.gemini_api_key:
        report(name, "SKIP", "GEMINI_API_KEY is not set. The letter preview stays quiet, and Muse still translates.",
               "Optional: a key from Google AI Studio, for the MLH Gemini track. It only reads Muse's translation back.")
        return
    body = {
        "contents": [{"parts": [{"text": "Return JSON {\"reads_as\": \"ok\"}"}]}],
        "generationConfig": {"temperature": 0, "maxOutputTokens": 20, "responseMimeType": "application/json"},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent"
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(url, headers={"x-goog-api-key": settings.gemini_api_key}, json=body)
    except httpx.HTTPError as exc:
        report(name, "FAIL", f"can't reach Gemini: {exc.__class__.__name__}", "Check the network. The preview still sends without it.")
        return
    if resp.status_code != 200:
        report(name, "FAIL", api_error(resp), "Check GEMINI_API_KEY and GEMINI_MODEL. The preview still sends without it.")
        return
    report(name, "PASS", f"{settings.gemini_model} answered")


# ------------------------------------------------------------------ main


async def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--skip", default="", help=f"comma-separated checks to skip: {','.join(CHECKS)}")
    args = parser.parse_args()
    skip = {s.strip() for s in args.skip.split(",") if s.strip()}

    print(f"Un-Said key check · Model API {settings.model_api_base} · MODEL_API_KEY {'set' if settings.model_api_key else 'missing'}"
          f" · WhatsApp {'set' if settings.whatsapp_token else 'missing'}\n")
    runners = {
        "spark": check_spark,
        "transcribe": check_transcribe,
        "realtime": check_realtime,
        "whatsapp": check_whatsapp,
        "gemini": check_gemini,
    }
    for key in CHECKS:
        if key in skip:
            report(key, "SKIP", "skipped by --skip")
        else:
            await runners[key]()
    failed = [n for n, s in results if s == "FAIL"]
    print(f"\n{'All set.' if not failed else f'{len(failed)} failed: ' + ', '.join(failed)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
