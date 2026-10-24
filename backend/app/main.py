"""Unsaid backend. Run: uv run uvicorn app.main:app --reload"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from . import db, delivery, seed
from .config import WEB_DIR, settings
from .routes import demo, live, public, student

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")

db.init_db()
seed.seed_if_empty()


@asynccontextmanager
async def lifespan(_: FastAPI):
    task = asyncio.create_task(delivery.scheduler())
    yield
    task.cancel()


app = FastAPI(title="Unsaid", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(student.router)
app.include_router(live.router)
app.include_router(public.router)
app.include_router(demo.router)


@app.get("/api/health")
def health() -> dict:
    return {"ok": True, "providers": student.providers()}


@app.get("/", include_in_schema=False)
def root() -> RedirectResponse:
    return RedirectResponse("/app/")


app.mount("/media", StaticFiles(directory=settings.media_dir), name="media")
app.mount("/app", StaticFiles(directory=WEB_DIR, html=True), name="app")
