"use client";

import { useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMessaging, type SeedState, type ThreadId } from "@/lib/store/messaging";

const SEED_STATES: SeedState[] = ["read", "history", "compose", "sent", "read-receipt", "typing"];

/**
 * Seeds a thread to the exact `?state=` frame (ROUTES AND STATES) before the first paint, then the
 * screen stays interactive from there. With no `?state=` the store is left as it is (in-app
 * navigation keeps drafts and sent messages).
 */
export function useSceneSeed(threadId: ThreadId, allowed: SeedState[] = SEED_STATES): string | null {
  const params = useSearchParams();
  const state = params.get("state");
  const typed = Number(params.get("typed") ?? 0);
  useLayoutEffect(() => {
    if (state && (allowed as string[]).includes(state)) {
      useMessaging.getState().seed(threadId, state as SeedState, { typed: Number.isFinite(typed) ? typed : 0 });
    }
    useMessaging.getState().markRead(threadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, state, typed]);
  return state;
}
