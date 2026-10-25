import os
import tempfile

# Settings are read at import, so isolate before anything imports the app:
# a throwaway data dir, mock AI, no WhatsApp, no app key (even if backend/.env has them).
os.environ["DATA_DIR"] = tempfile.mkdtemp(prefix="unsaid-test-")
for key in ("MODEL_API_KEY", "WHATSAPP_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "APP_KEY", "PUBLIC_BASE_URL", "GEMINI_API_KEY"):
    os.environ[key] = ""
os.environ["SEED_MOM_PHONE"] = "+91 98765 43210"
os.environ["SEED_JORDAN_PHONE"] = "+1 512 555 0142"
os.environ["SEED_PRIYA_INSTAGRAM"] = "priya.k"
os.environ["SEED_ME_PHONE"] = "+1 512 555 0199"
