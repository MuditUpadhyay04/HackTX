"use client";

import { PhoneScene } from "@/components/scene/PhoneScene";
import { useSceneSeed } from "@/components/scene/useSceneSeed";
import { MessagesThread } from "@/components/apps/messages/MessagesApp";

/** STATE 2 · SARAH · Messages (Phase 2 THE SCRIPTS), on the folded phone's cover display. */
export function SarahScene() {
  const state = useSceneSeed("sarah");
  return (
    <PhoneScene off={state === "off"}>
      <MessagesThread id="sarah" />
    </PhoneScene>
  );
}
