"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Placeholder } from "@/components/Placeholder";
import { Pressable } from "@/components/lookalike/shared/Pressable";
import { Caret } from "@/components/system/Caret";
import { springSnapback } from "@/lib/motion";
import { WAA } from "./android";
import { AttachGlyph, CameraGlyph, EmojiGlyph, MicGlyph, SendArrow } from "./glyphs";

export type ComposerProps = {
  draft: string;
  focused: boolean;
  onFocus: () => void;
  onSend: () => void;
};

/**
 * WhatsApp for Android composer, floating over the wallpaper: a white rounded pill (emoji,
 * "Message", paperclip, camera while empty) and a separate round green button on the right that
 * is the mic when empty and the send arrow once there is text.
 */
export function Composer({ draft, focused, onFocus, onSend }: ComposerProps) {
  const has = draft.length > 0;
  const c = WAA.composer;
  return (
    <div
      style={{
        height: c.height,
        display: "flex",
        alignItems: "center",
        gap: 6,
        paddingInline: c.padX,
        background: "transparent",
      }}
    >
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
          borderRadius: c.radius,
          background: "var(--wa-android-surface)",
          boxShadow: "var(--wa-android-composer-shadow)",
          paddingLeft: 4,
          paddingRight: 4,
          color: "var(--wa-android-on-surface)",
          fontSize: 17,
          cursor: "text",
        }}
      >
        <Placeholder id="whatsapp:sticker">
          <button type="button" aria-label="Emoji" style={glyphButton}>
            <EmojiGlyph size={c.icon} />
          </button>
        </Placeholder>
        <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingLeft: 2 }}>
          {has ? (
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", direction: "rtl", textAlign: "left" }}>
              <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>{draft}</span>
            </span>
          ) : null}
          {focused ? <Caret tint="var(--wa-caret)" /> : null}
          {has ? null : <span style={{ flex: 1, minWidth: 0, color: "var(--wa-android-placeholder)", paddingLeft: focused ? 1 : 0 }}>Message</span>}
        </span>
        <Placeholder id="whatsapp:attach">
          <button type="button" aria-label="Attach" style={glyphButton}>
            <AttachGlyph size={c.icon} />
          </button>
        </Placeholder>
        <AnimatePresence initial={false}>
          {has ? null : (
            <motion.span
              key="camera"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 40, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: "flex", overflow: "hidden" }}
            >
              <Placeholder id="whatsapp:camera">
                <button type="button" aria-label="Camera" style={glyphButton}>
                  <CameraGlyph size={c.icon} />
                </button>
              </Placeholder>
            </motion.span>
          )}
        </AnimatePresence>
      </Pressable>
      <AnimatePresence initial={false} mode="popLayout">
        {has ? (
          <motion.div key="send" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={springSnapback} style={{ display: "flex" }}>
            <Pressable
              action="send"
              feedback="scale"
              label="Send"
              onPress={(e) => {
                e.stopPropagation();
                onSend();
              }}
              style={roundButton}
            >
              <SendArrow size={c.icon} style={{ marginLeft: 2 }} />
            </Pressable>
          </motion.div>
        ) : (
          <motion.div key="mic" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={springSnapback} style={{ display: "flex" }}>
            <Placeholder id="whatsapp:voice-note">
              <button type="button" aria-label="Voice message" style={{ ...roundButton, appearance: "none", border: 0, padding: 0 }}>
                <MicGlyph size={c.icon} />
              </button>
            </Placeholder>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const roundButton = {
  width: WAA.composer.button,
  height: WAA.composer.button,
  borderRadius: "50%",
  background: "var(--wa-android-brand)",
  color: "var(--wa-android-on-brand)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "var(--wa-android-composer-shadow)",
} as const;

const glyphButton = {
  appearance: "none",
  border: 0,
  padding: 0,
  margin: 0,
  width: 40,
  height: 40,
  flexShrink: 0,
  background: "none",
  color: "var(--wa-android-on-surface-variant)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;
