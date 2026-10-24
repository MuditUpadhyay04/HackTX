"""One shared key for the student app and demo controls. Card pages are public by token."""

import secrets

from fastapi import HTTPException, Request

from .config import settings


def key_ok(supplied: str | None) -> bool:
    if not settings.app_key:
        return True
    return bool(supplied) and secrets.compare_digest(supplied, settings.app_key)


def require_key(request: Request) -> None:
    if not key_ok(request.headers.get("x-app-key") or request.query_params.get("key")):
        raise HTTPException(status_code=401, detail="app key required: open the app once with ?key=<APP_KEY>")
