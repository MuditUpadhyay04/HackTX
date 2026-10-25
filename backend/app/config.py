"""Settings, read once from the environment (and backend/.env when present)."""

import os
from dataclasses import dataclass
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = BACKEND_DIR / "web"


def _load_dotenv(path: Path) -> None:
    # Tiny .env reader so local runs need no extra dependency. Real env vars win.
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv(BACKEND_DIR / ".env")


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


@dataclass(frozen=True)
class Settings:
    model_api_key: str
    model_api_base: str
    spark_model: str
    asr_model: str
    asr_realtime_url: str
    whatsapp_token: str
    whatsapp_phone_number_id: str
    whatsapp_template: str
    whatsapp_template_lang: str
    whatsapp_graph_version: str
    app_key: str
    public_base_url: str
    data_dir: Path
    cors_origins: list[str]
    gemini_api_key: str
    gemini_models: list[str]  # tried in order; a busy model (429/5xx) falls through to the next

    @property
    def muse_enabled(self) -> bool:
        return bool(self.model_api_key)

    @property
    def gemini_enabled(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def whatsapp_enabled(self) -> bool:
        return bool(self.whatsapp_token and self.whatsapp_phone_number_id and self.whatsapp_template)

    @property
    def db_path(self) -> Path:
        return self.data_dir / "unsaid.db"

    @property
    def media_dir(self) -> Path:
        return self.data_dir / "media"


GEMINI_FALLBACKS = ("gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.5-flash")


def load_settings() -> Settings:
    data_dir = Path(_env("DATA_DIR", str(BACKEND_DIR / "data")))
    if not data_dir.is_absolute():
        data_dir = (BACKEND_DIR / data_dir).resolve()
    origins = [o.strip() for o in _env("CORS_ORIGINS", "*").split(",") if o.strip()]
    # GEMINI_MODEL may name one model or a comma list; the defaults always follow as fallbacks.
    gemini_models = [m.strip() for m in _env("GEMINI_MODEL").split(",") if m.strip()]
    gemini_models += [m for m in GEMINI_FALLBACKS if m not in gemini_models]
    return Settings(
        model_api_key=_env("MODEL_API_KEY"),
        model_api_base=_env("MODEL_API_BASE", "https://api.meta.ai/v1").rstrip("/"),
        spark_model=_env("SPARK_MODEL", "muse-spark-1.3"),
        asr_model=_env("ASR_MODEL", "muse-voice-transcribe-1.0"),
        asr_realtime_url=_env("ASR_REALTIME_URL", "wss://api.meta.ai/v1/asr/realtime"),
        whatsapp_token=_env("WHATSAPP_TOKEN"),
        whatsapp_phone_number_id=_env("WHATSAPP_PHONE_NUMBER_ID"),
        whatsapp_template=_env("WHATSAPP_TEMPLATE", "unsaid_left_you_something"),
        whatsapp_template_lang=_env("WHATSAPP_TEMPLATE_LANG", "en"),
        whatsapp_graph_version=_env("WHATSAPP_GRAPH_VERSION", "v23.0"),
        app_key=_env("APP_KEY"),
        public_base_url=_env("PUBLIC_BASE_URL").rstrip("/"),
        data_dir=data_dir,
        cors_origins=origins or ["*"],
        gemini_api_key=_env("GEMINI_API_KEY"),
        gemini_models=gemini_models,
    )


settings = load_settings()
