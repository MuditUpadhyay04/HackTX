"use client";

import { PhoneScene } from "@/components/scene/PhoneScene";
import { useRouter } from "next/navigation";
import { WhatsAppChats } from "@/components/apps/whatsapp/WhatsAppApp";

/** WhatsApp · Chats (Phase 2 THE SCRIPTS), on the folded phone's cover display. */
export function WhatsAppChatsScene() {
  const router = useRouter();
  return (
    <PhoneScene>
      <WhatsAppChats onOpen={(id) => router.push(`/scene/threads/${id === "mom" ? "mom" : "whatsapp-chats"}`)} />
    </PhoneScene>
  );
}
