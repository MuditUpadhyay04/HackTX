import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { api, type Home } from "./api";
import { syncHeldLetterReminders } from "./push";

/** Home data from the backend, refreshed on focus and every few seconds while focused. */
export function useHome(pollMs = 5000) {
  const [home, setHome] = useState<Home | null>(null);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await api.home();
      void syncHeldLetterReminders(next); // local reminders for held letters when there's no push (lib/push.ts)
      if (alive.current) {
        setHome(next);
        setError(null);
      }
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    }
  }, []);

  useEffect(() => () => void (alive.current = false), []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      const timer = setInterval(refresh, pollMs);
      return () => clearInterval(timer);
    }, [refresh, pollMs]),
  );

  return { home, error, refresh };
}
