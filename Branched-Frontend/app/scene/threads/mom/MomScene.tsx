"use client";

import { useSearchParams } from "next/navigation";
import { PhoneScene } from "@/components/scene/PhoneScene";
import { useSceneSeed } from "@/components/scene/useSceneSeed";
import { WhatsAppThread } from "@/components/lookalike/whatsapp/WhatsAppThread";

/** STATE 1 · MOM · WhatsApp (Phase 2 THE SCRIPTS). */
export function MomScene() {
  const params = useSearchParams();
  const state = useSceneSeed("mom", ["read", "history", "compose"]);
  const seen = params.get("seen") !== "off";
  return (
    <PhoneScene off={state === "off"}>
      <WhatsAppThread threadId="mom" seen={seen} initialScroll={state === "history" ? "top" : "bottom"} />
    </PhoneScene>
  );
}
