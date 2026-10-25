"use client";

import { SystemSheet } from "@/components/system/SystemSheet";
import { CALL_SHEET } from "@/lib/mock/threads";

/** Tapping a missed-call row: "Voice call" / "Video call" / "Cancel" (Phase 2 WHATSAPP CALLS).
 * Starting a call from Riley's side is a placeholder (whatsapp:call-start). */
export function CallActionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SystemSheet
      open={open}
      onClose={onClose}
      tint="var(--ui-blue)"
      cancelLabel={CALL_SHEET.cancel}
      actions={[
        { label: CALL_SHEET.voice, placeholder: "whatsapp:call-start" },
        { label: CALL_SHEET.video, placeholder: "whatsapp:call-start" },
      ]}
    />
  );
}
