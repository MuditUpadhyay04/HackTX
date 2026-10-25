"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WA } from "@/components/lookalike/metrics";
import { Placeholder } from "@/components/Placeholder";
import { Pressable } from "@/components/lookalike/shared/Pressable";
import { Caret } from "@/components/ios/Caret";
import { springSnapback } from "@/lib/motion";
import { CameraGlyph, MicGlyph, PlusGlyph, SendArrow, StickerGlyph } from "./glyphs";

export type ComposerProps = {
  draft: string;
  focused: boolean;
  onFocus: () => void;
  onSend: () => void;
};

/**
 * WhatsApp composer (Phase 2 CHROME SPECS): "+" · a capsule field · sticker and camera glyphs · mic
 * (empty) or a green circle send button with a white arrow (text present).
 */
export function Composer({ draft, focused, onFocus, onSend }: ComposerProps) {
  const has = draft.length > 0;
  const c = WA.composer;
  return (
    <div
      style={{
        height: c.height,
        display: "flex",
        alignItems: "center",
        gap: "var(--space-8)",
        paddingInline: c.padX,
        background: "var(--wa-nav)",
        boxShadow: "inset 0 var(--hairline) 0 var(--ios-separator)",
        color: "var(--ios-blue)",
      }}
    >
      <Placeholder id="whatsapp:attach">
        <button type="button" aria-label="Attach" style={glyphButton}>
          <PlusGlyph size={c.glyph} />
        </button>
      </Placeholder>
      <Pressable
        as="div"
        action="focus-composer"
        onPress={(e) => {
          e.stopPropagation();
          onFocus();
        }}
        style={{
          flex: 1,
          minWidth: 0,
          height: c.field,
          display: "flex",
          alignItems: "center",
          borderRadius: c.fieldRadius,
          background: "var(--wa-bubble-in)",
          boxShadow: "inset 0 0 0 var(--hairline) var(--ios-gray4)",
          paddingLeft: "var(--space-12)",
          paddingRight: "var(--space-6)",
          color: "var(--ios-label)",
          fontSize: WA.bubbleText,
          letterSpacing: "var(--type-body-tracking)",
          cursor: "text",
        }}
      >
        <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <span style={{ flex: 1, minWidth: 0, overflow: "hidden", direction: "rtl", textAlign: "left" }}>
            <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>{draft}</span>
          </span>
          {focused ? <Caret tint="var(--wa-caret)" /> : null}
        </span>
        <Placeholder id="whatsapp:sticker">
          <button type="button" aria-label="Sticker" style={{ ...glyphButton, color: "var(--ios-blue)" }}>
            <StickerGlyph size={c.glyph - 2} />
          </button>
        </Placeholder>
      </Pressable>
      <AnimatePresence initial={false} mode="popLayout">
        {has ? (
          <motion.div
            key="send"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={springSnapback}
            style={{ display: "flex" }}
          >
            <Pressable
              action="send"
              feedback="scale"
              label="Send"
              onPress={(e) => {
                e.stopPropagation();
                onSend();
              }}
              style={{
                width: c.send,
                height: c.send,
                borderRadius: "50%",
                background: "var(--wa-accent)",
                color: "var(--label-on-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SendArrow size={c.send * 0.55} style={{ transform: "rotate(45deg) translate(-6%, 6%)" }} />
            </Pressable>
          </motion.div>
        ) : (
          <motion.div
            key="glyphs"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={springSnapback}
            style={{ display: "flex", alignItems: "center", gap: c.gap }}
          >
            <Placeholder id="whatsapp:camera">
              <button type="button" aria-label="Camera" style={glyphButton}>
                <CameraGlyph size={c.glyph} />
              </button>
            </Placeholder>
            <Placeholder id="whatsapp:voice-note">
              <button type="button" aria-label="Voice message" style={glyphButton}>
                <MicGlyph size={c.glyph} />
              </button>
            </Placeholder>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const glyphButton = {
  appearance: "none",
  border: 0,
  padding: 0,
  margin: 0,
  background: "none",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;
