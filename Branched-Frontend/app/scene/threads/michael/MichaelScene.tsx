"use client";

import { PhoneScene } from "@/components/scene/PhoneScene";
import { useSceneSeed } from "@/components/scene/useSceneSeed";
import { InstagramThread } from "@/components/apps/instagram/InstagramApp";

/** STATE 3 · MICHAEL · Instagram DM (Phase 2 THE SCRIPTS), on the folded phone's cover display. */
export function MichaelScene() {
  const state = useSceneSeed("michael");
  return (
    <PhoneScene off={state === "off"}>
      <InstagramThread id="michael" />
    </PhoneScene>
  );
}
