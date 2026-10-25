// The knock: Un-Said may tap on a photo, rarely. The backend's attention budget decides
// (backend/app/attention.py); this hook only reports how he's looking at the photo.
import { useCallback, useEffect, useRef, useState } from "react";

import { api, type KnockDecision } from "./api";

/** One session per app launch. Gentle mode allows at most one knock per session. */
export const SESSION_ID = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// When to ask, in ms of dwell: film mode (3 s), a photo of someone he's spoken about (4 s),
// try mode for judges' own phones (5 s), the one first-ever knock (6 s), demo mode at the judging table (8 s). A little slack so the
// server sees the full dwell.
const CHECK_AT_MS = [3050, 4050, 5050, 6050, 8050];
const seenThisSession = new Set<string>();

export type Knock = Extract<KnockDecision, { knock: true }>;

export function useKnock(assetId?: string | null) {
  const [knock, setKnock] = useState<Knock | null>(null);
  const shown = useRef<Knock | null>(null);
  const answered = useRef(false);
  const zoomed = useRef(false);
  const checkNow = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!assetId) return;
    const revisit = seenThisSession.has(assetId);
    seenThisSession.add(assetId);
    const startedAt = Date.now();
    let alive = true;
    let done = false;

    const check = async () => {
      if (!alive || done) return;
      try {
        const decision = await api.knockCheck({
          asset_id: assetId,
          dwell_ms: Date.now() - startedAt,
          zoomed: zoomed.current,
          revisit,
          session_id: SESSION_ID,
        });
        if (alive && !done && decision.knock) {
          done = true;
          shown.current = decision;
          setKnock(decision);
        }
      } catch {
        // No knock is always a fine answer.
      }
    };
    checkNow.current = check;
    const timers = CHECK_AT_MS.map((ms) => setTimeout(check, ms));
    if (revisit) check(); // coming back to a photo is its own signal

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      // He walked past it without answering. Neutral, but recorded.
      if (shown.current && !answered.current) api.attentionOutcome(shown.current.id, "ignored").catch(() => {});
    };
  }, [assetId]);

  /** Call when he pinches in on the photo. */
  const onZoom = useCallback(() => {
    if (zoomed.current) return;
    zoomed.current = true;
    checkNow.current?.();
  }, []);

  const answer = useCallback((outcome: "opened" | "dismissed") => {
    const current = shown.current;
    if (!current || answered.current) return;
    answered.current = true;
    api.attentionOutcome(current.id, outcome).catch(() => {});
    if (outcome === "dismissed") setKnock(null);
  }, []);

  const open = useCallback(() => answer("opened"), [answer]);
  const dismiss = useCallback(() => answer("dismissed"), [answer]);

  return { knock, onZoom, open, dismiss };
}
