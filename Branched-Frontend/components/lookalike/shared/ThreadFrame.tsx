"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { KEYBOARD, SAFE_BOTTOM } from "@/components/lookalike/metrics";
import { usePane } from "./pane";
import { durations, easeStd, ms, usePrefersReducedMotion } from "@/lib/motion";

export type ThreadFrameProps = {
  /** nav bar incl. the status-bar area, drawn over the scrolling content */
  nav: ReactNode;
  /** total top inset (status bar + nav) */
  navHeight: number;
  /** fixed layer behind the messages (WhatsApp wallpaper) */
  backdrop?: ReactNode;
  background: string;
  children: ReactNode;
  composer: ReactNode;
  composerHeight: number;
  composerBackground: string;
  keyboardOpen: boolean;
  keyboard: ReactNode;
  /** the first scroll position on mount */
  initialScroll?: "bottom" | "top";
  /** changes whenever the list should stick to the bottom again (message count, typing) */
  stickKey?: string | number;
  onDismissKeyboard?: () => void;
};

/**
 * Shared thread layout for the three messaging look-alikes. The nav sits over the content (iOS
 * translucent bars). When the keyboard rises (ease-std, 300 ms) the messages and the composer move
 * up together by transform only, keeping the last message in view, exactly like iOS; the messages
 * that slide under the nav stay reachable because the scroll content gains the same inset on top.
 */
export function ThreadFrame({
  nav,
  navHeight,
  backdrop,
  background,
  children,
  composer,
  composerHeight,
  composerBackground,
  keyboardOpen,
  keyboard,
  initialScroll = "bottom",
  stickKey,
  onDismissKeyboard,
}: ThreadFrameProps) {
  const reduced = usePrefersReducedMotion();
  const { width } = usePane();
  const scroller = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const lift = KEYBOARD.height - SAFE_BOTTOM;
  const transition = reduced ? { duration: 0 } : { duration: ms(durations.keyboardRise), ease: easeStd };

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (!mounted.current) {
      mounted.current = true;
      el.scrollTop = initialScroll === "top" ? 0 : el.scrollHeight;
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [initialScroll, stickKey, keyboardOpen]);

  return (
    <div style={{ position: "absolute", inset: 0, background, overflow: "hidden" }}>
      {backdrop}
      <motion.div
        initial={false}
        animate={{ y: keyboardOpen ? -lift : 0 }}
        transition={transition}
        style={{ position: "absolute", inset: 0 }}
      >
        <div
          ref={scroller}
          data-thread-scroll=""
          data-action="dismiss-keyboard"
          onClick={() => {
            if (keyboardOpen) onDismissKeyboard?.();
          }}
          style={{
            position: "absolute",
            inset: 0,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "none",
            paddingTop: navHeight + (keyboardOpen ? lift : 0),
            paddingBottom: composerHeight + SAFE_BOTTOM,
          }}
        >
          {children}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width,
            height: composerHeight + SAFE_BOTTOM,
            background: composerBackground,
            zIndex: 2,
          }}
        >
          <div style={{ height: composerHeight }}>{composer}</div>
        </div>
      </motion.div>
      <div style={{ position: "absolute", left: 0, top: 0, width, zIndex: 30 }}>{nav}</div>
      <AnimatePresence initial={false}>
        {keyboardOpen ? (
          <motion.div
            key="kb"
            initial={{ y: KEYBOARD.height }}
            animate={{ y: 0 }}
            exit={{ y: KEYBOARD.height }}
            transition={transition}
            style={{ position: "absolute", left: 0, bottom: 0, zIndex: 20 }}
          >
            {keyboard}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
