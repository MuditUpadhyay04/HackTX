// Photo memory: what he said while looking at a photo, and his own voice played back.
// Screens call these hooks; they never fetch directly.
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { api, authedUrl, type PhotoMemory } from "./api";

/** What this gallery photo is about and what he said here before (null for a new photo). */
export function usePhotoMemory(assetId?: string | null) {
  const [memory, setMemory] = useState<PhotoMemory | null>(null);

  const refresh = useCallback(async () => {
    if (!assetId) return;
    try {
      setMemory(await api.memory(assetId));
    } catch {
      // Memory is a nicety. Never let it get in the way of talking.
    }
  }, [assetId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { memory: assetId ? memory : null, refresh };
}

/** Plays his own lines back, one at a time. */
export function useVoiceBack() {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [current, setCurrent] = useState<string | null>(null);

  const toggle = useCallback(
    (id: string, audioUrl: string | null | undefined) => {
      const source = authedUrl(audioUrl);
      if (!source) return;
      if (current === id && status.playing) {
        player.pause();
        return;
      }
      if (current !== id) {
        player.replace(source);
        setCurrent(id);
      }
      player.play();
    },
    [current, status.playing, player],
  );

  return { playingId: status.playing ? current : null, toggle };
}
