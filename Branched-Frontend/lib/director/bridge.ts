/**
 * lib/director/bridge.ts: Un-Said -> phone hand-offs (A2's contract). The real Un-Said app, running
 * same-origin in the display, posts to its parent window:
 *   { type: "unsaid:call", person: "mom", name, channel: "whatsapp" }   -> the WhatsApp call screen
 *   { type: "unsaid:open", app: "instagram", person: "priya", name }    -> that person's Instagram DM
 *   { type: "unsaid:handoff", app: "whatsapp" | "messages" | "instagram" | "facebook", text, person? }
 *                                                                        -> his letter, sent from that app
 * `person` is Un-Said's person id (seeded cast: jordan = Sarah, mom = Mom, priya = Michael); `name`
 * is the display name.
 * Un-Said never places a call itself: the look-alike app does what the button says.
 */

/** Same-origin by default; NEXT_PUBLIC_UNSAID_URL may point Un-Said somewhere else. */
function unsaidOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_UNSAID_URL;
  if (!url || !/^https?:\/\//.test(url)) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export type UnsaidMessage =
  | { type: "unsaid:call"; person: string; name?: string; channel?: string }
  | { type: "unsaid:open"; app: string; person: string; name?: string }
  | { type: "unsaid:handoff"; app: string; text: string; person?: string; name?: string };

function parse(data: unknown): UnsaidMessage | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  if (d.type === "unsaid:call" && typeof d.person === "string") {
    return { type: "unsaid:call", person: d.person, name: str(d.name), channel: str(d.channel) };
  }
  if (d.type === "unsaid:open" && typeof d.person === "string" && typeof d.app === "string") {
    return { type: "unsaid:open", app: d.app, person: d.person, name: str(d.name) };
  }
  if (d.type === "unsaid:handoff" && typeof d.app === "string" && typeof d.text === "string") {
    return { type: "unsaid:handoff", app: d.app, text: d.text, person: str(d.person), name: str(d.name) };
  }
  return null;
}

let installed = false;

/** Adds the one window "message" listener (idempotent: every Un-Said copy may call it). */
export function installUnsaidBridge(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const allowed = new Set([window.location.origin, unsaidOrigin()].filter(Boolean) as string[]);
  window.addEventListener("message", (event: MessageEvent) => {
    if (!allowed.has(event.origin)) return;
    const msg = parse(event.data);
    if (!msg) return;
    void import("./director").then((m) => m.onUnsaidMessage(msg));
  });
}
