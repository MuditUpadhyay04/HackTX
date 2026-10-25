"""WhatsApp Cloud API: Mom's 8 AM, sent as an approved template from an Unsaid
business number. Business-initiated messages must use a template, and the test
number can message up to 5 verified recipients.

Template to submit (body, English):
    hi. {{1}} left you something. open it whenever you have a minute: {{2}} (sent with Un-Said)
{{1}} is his name, {{2}} the card link. WhatsApp rejects templates that start or end
with a variable, hence the words around them.
"""

import re

import httpx

from .config import settings


class WhatsAppError(RuntimeError):
    pass


def digits(phone: str) -> str:
    return re.sub(r"\D", "", phone or "")


async def send_card(to_phone: str, sender_name: str, url: str) -> str:
    """Sends the template. Returns WhatsApp's message id."""
    to = digits(to_phone)
    if not to:
        raise WhatsAppError("recipient has no phone number")
    endpoint = (
        f"https://graph.facebook.com/{settings.whatsapp_graph_version}/"
        f"{settings.whatsapp_phone_number_id}/messages"
    )
    body = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "template",
        "template": {
            "name": settings.whatsapp_template,
            "language": {"code": settings.whatsapp_template_lang},
            "components": [
                {
                    "type": "body",
                    "parameters": [{"type": "text", "text": sender_name}, {"type": "text", "text": url}],
                }
            ],
        },
    }
    headers = {"Authorization": f"Bearer {settings.whatsapp_token}"}
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(endpoint, json=body, headers=headers)
    if resp.status_code != 200:
        raise WhatsAppError(f"whatsapp {resp.status_code}: {resp.text[:300]}")
    messages = resp.json().get("messages") or [{}]
    return messages[0].get("id", "")
