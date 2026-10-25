"""Gemini reads Muse's translation back into English. It never writes the letter.

The preview shows that reading as "she'll read: …" so a bad Hindi caption is
caught before Mom opens it. No key, a timeout, or a chatty answer means no
line. Sending does not wait on this.

It is also Spark's stand-in when Meta's API refuses Spark from this host
(spark.chat_json): the same prompt and the same JSON schema, so it still only
points at sentence ids and never writes his words.
"""

import json
import logging

import httpx

from ..config import settings

log = logging.getLogger("unsaid.gemini")

_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
# Overloaded, rate limited, or retired: worth trying the next model. A bad key (400/403) is not.
_BUSY = {404, 429, 500, 502, 503, 504}

_SYSTEM = """You check a translation. You do not improve it, soften it, or explain it.
The speaker's exact words are under "said". Another model translated them into {language}.
That text is under "translation".
Read only the translation back into English, the way a person would hear it.
Do not add comfort, advice, or anything that is not in the translation.
Return JSON: {{"reads_as": "<english>"}}.
If the translation is empty or is a placeholder in brackets, return {{"reads_as": ""}}."""


class GeminiError(RuntimeError):
    pass


async def _generate(body: dict, timeout: float) -> str | None:
    """The first text part from the first model that answers, or None."""
    async with httpx.AsyncClient(timeout=httpx.Timeout(timeout, connect=3)) as client:
        for model in settings.gemini_models[:3]:
            try:
                resp = await client.post(_URL.format(model=model), headers={"x-goog-api-key": settings.gemini_api_key}, json=body)
            except httpx.TimeoutException:
                log.warning("gemini timed out on %s", model)
                continue
            if resp.status_code == 200:
                try:
                    parts = resp.json()["candidates"][0]["content"]["parts"]
                    return next(p["text"] for p in parts if "text" in p)
                except (KeyError, IndexError, TypeError, ValueError, StopIteration) as exc:
                    log.warning("unreadable gemini answer from %s: %s", model, exc)
                    return None
            log.warning("gemini %s from %s", resp.status_code, model)
            if resp.status_code not in _BUSY:
                return None
    return None


async def chat_json(system: str, user: str, schema: dict, max_tokens: int = 4000) -> dict:
    """Spark's chat_json, answered by Gemini. Raises GeminiError so callers handle it like a SparkError."""
    body = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [{"parts": [{"text": user}]}],
        "generationConfig": {
            "temperature": 0,
            "maxOutputTokens": max_tokens,
            "responseMimeType": "application/json",
            "responseJsonSchema": schema,
        },
    }
    try:
        text = await _generate(body, timeout=30)
    except httpx.HTTPError as exc:
        raise GeminiError(f"gemini unreachable: {exc.__class__.__name__}") from exc
    if text is None:
        raise GeminiError("no gemini model answered")
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise GeminiError(f"unreadable gemini json: {exc}") from exc


def _too_long(said: str, echo: str) -> bool:
    said_words = len(said.split())
    echo_words = len(echo.split())
    return echo_words > said_words * 2 + 8


async def echo(said: str, translation: str, language: str) -> str | None:
    """English reading of `translation`, or None when the check should stay quiet."""
    if not settings.gemini_enabled:
        return None
    if not said.strip() or not translation.strip() or translation.startswith("["):
        return None
    if language.lower() in ("english", "en"):
        return None
    body = {
        "systemInstruction": {"parts": [{"text": _SYSTEM.format(language=language)}]},
        "contents": [{
            "parts": [{
                "text": json.dumps({"said": said, "translation": translation}, ensure_ascii=False),
            }],
        }],
        "generationConfig": {
            "temperature": 0,
            "maxOutputTokens": 300,
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {"reads_as": {"type": "STRING"}},
                "required": ["reads_as"],
            },
        },
    }
    try:
        text = await _generate(body, timeout=6)
        if text is None:
            return None
        reads = str(json.loads(text).get("reads_as", "")).strip()
    except (httpx.HTTPError, TypeError, AttributeError, json.JSONDecodeError) as exc:
        log.warning("gemini echo failed: %s", exc)
        return None
    if not reads or _too_long(said, reads):
        return None
    return reads[:400]
