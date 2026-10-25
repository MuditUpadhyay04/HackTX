import { Suspense } from "react";
import { WhatsAppChatsScene } from "./WhatsAppChatsScene";

/** /scene/threads/whatsapp-chats (&banner=, &notify=) */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <WhatsAppChatsScene />
    </Suspense>
  );
}
