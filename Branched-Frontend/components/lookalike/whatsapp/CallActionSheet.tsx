"use client";

import { SystemSheet } from "@/components/system/SystemSheet";
import { CALL_SHEET } from "@/lib/mock/threads";
import { PhoneGlyph, VideoGlyph } from "./glyphs";

/** Tapping a missed-call row: an Android dialog with "Voice call" / "Video call" and "Cancel"
 * (Phase 2 WHATSAPP CALLS). Starting a call from Riley's side is a placeholder (whatsapp:call-start). */
export function CallActionSheet({ open, onClose, name }: { open: boolean; onClose: () => void; name?: string }) {
  return (
    <SystemSheet
      open={open}
      onClose={onClose}
      title={name ? `Call ${name}?` : undefined}
      cancelLabel={CALL_SHEET.cancel}
      actions={[
        { label: CALL_SHEET.voice, icon: <PhoneGlyph size={24} />, placeholder: "whatsapp:call-start" },
        { label: CALL_SHEET.video, icon: <VideoGlyph size={24} />, placeholder: "whatsapp:call-start" },
      ]}
    />
  );
}
