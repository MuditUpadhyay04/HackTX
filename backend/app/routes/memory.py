"""Photo memory: what he said while looking at a photo, and his own voice back."""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response

from .. import memory, timeutil
from ..auth import require_key

router = APIRouter(prefix="/api", dependencies=[Depends(require_key)])


@router.get("/memory/photo")
def photo_memory(asset_id: str = Query(..., min_length=1, max_length=memory.ASSET_ID_MAX)) -> dict:
    """Who this photo is about (from his own words), and what he said here before, newest first."""
    return memory.photo_memory(asset_id, timeutil.now_utc())


@router.get("/pieces/{piece_id}/audio")
def piece_audio(piece_id: str) -> Response:
    wav = memory.piece_audio(piece_id)
    if wav is None:
        raise HTTPException(404, "no audio for that line")
    return Response(content=wav, media_type="audio/wav", headers={"Cache-Control": "private, max-age=3600"})
