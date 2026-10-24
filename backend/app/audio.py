"""16-bit mono PCM and WAV. The browser captures 24 kHz PCM, the format Muse Voice
Transcribe prefers, so no ffmpeg is needed anywhere."""

import io
import wave

RATE = 24_000
BYTES_PER_MS = RATE * 2 // 1000  # 48 bytes per millisecond at 24 kHz, 16-bit mono


def pcm_to_wav(pcm: bytes, rate: int = RATE) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(pcm)
    return buf.getvalue()


def wav_to_pcm(data: bytes) -> tuple[bytes, int]:
    """Returns (pcm, sample_rate). Rejects anything that isn't mono 16-bit at 16 or 24 kHz."""
    with wave.open(io.BytesIO(data), "rb") as w:
        if w.getnchannels() != 1 or w.getsampwidth() != 2 or w.getframerate() not in (16_000, 24_000):
            raise ValueError("audio must be mono 16-bit WAV at 16 or 24 kHz")
        return w.readframes(w.getnframes()), w.getframerate()


def duration_ms(pcm: bytes, rate: int = RATE) -> int:
    return len(pcm) * 1000 // (rate * 2)


def slice_ms(pcm: bytes, start_ms: int, end_ms: int, rate: int = RATE) -> bytes:
    per_ms = rate * 2 // 1000
    start = max(0, start_ms) * per_ms
    end = min(len(pcm), max(start_ms, end_ms) * per_ms)
    return pcm[start:end]


def join(clips: list[bytes], gap_ms: int = 400, rate: int = RATE) -> bytes:
    silence = b"\x00\x00" * (rate * gap_ms // 1000)
    return silence.join(c for c in clips if c)
