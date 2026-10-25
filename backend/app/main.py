"""Unsaid backend. Run: uv run uvicorn app.main:app --reload"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from . import db, delivery, guests, seed
from .config import WEB_DIR, settings
from .routes import attention, demo, extras, live, memory, public, student

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")

db.init_db()
seed.seed_if_empty()


@asynccontextmanager
async def lifespan(_: FastAPI):
    task = asyncio.create_task(delivery.scheduler())
    janitor = asyncio.create_task(_guest_janitor())
    yield
    task.cancel()
    janitor.cancel()


async def _guest_janitor() -> None:
    """Removes try-it guest sandboxes unseen for a day: at startup, then hourly."""
    while True:
        try:
            guests.prune()
        except Exception:
            logging.getLogger("unsaid.guests").exception("guest cleanup failed")
        await asyncio.sleep(3600)


app = FastAPI(title="Unsaid", version="0.1.0", lifespan=lifespan)
app.add_middleware(guests.GuestMiddleware)  # inside CORS, so its 400/403/429 carry CORS headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(student.router)
app.include_router(extras.router)
app.include_router(live.router)
app.include_router(public.router)
app.include_router(demo.router)
app.include_router(memory.router)
app.include_router(attention.router)


@app.get("/api/health")
def health() -> dict:
    return {"ok": True, "providers": student.providers()}


@app.get("/", include_in_schema=False)
def root() -> RedirectResponse:
    return RedirectResponse("/app/")


app.mount("/media", StaticFiles(directory=settings.main_media_dir), name="media")
# Try-it guests' own files (rant audio, uploads), by unguessable guest id. Databases live elsewhere.
(settings.data_dir / "guest_media").mkdir(parents=True, exist_ok=True)
app.mount("/guest-media", StaticFiles(directory=settings.data_dir / "guest_media"), name="guest-media")
app.mount("/app", StaticFiles(directory=WEB_DIR, html=True), name="app")
