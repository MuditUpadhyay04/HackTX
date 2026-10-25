"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { appScreen } from "@/lib/apps/registry";
import { useAppStore } from "@/lib/apps/store";
import { springClose, springOpen } from "@/lib/motion";
import type { AppTarget } from "@/lib/apps/registry";
import { HOME_LAYOUT, ICON, SEARCH, iconRectPt, type HomeAppId, type HomeDisplay, type Rect } from "./layout";

/**
 * The open app on one display: grows out of its icon (springOpen), shrinks back into it on close
 * (springClose). A home bar at the bottom closes it, like swiping up on iOS.
 */
export function AppHost({ display }: { display: HomeDisplay }) {
  const state = useAppStore((s) => s.open);
  const close = useAppStore((s) => s.closeApp);
  const L = HOME_LAYOUT[display];
  // an app shows on the display it was opened from
  const open = state && state.display === display ? state.target : null;
  const Screen = open ? appScreen(open, display) : undefined;
  // remember the last target so the close animation shrinks back into ITS button
  const last = useRef(open);
  if (open) last.current = open;
  const icon = last.current ? targetRect(display, last.current) : null;
  // the icon's rect as a scale + offset of the full display
  const from = icon
    ? {
        scaleX: icon.w / L.width,
        scaleY: icon.h / L.height,
        x: icon.x + icon.w / 2 - L.width / 2,
        y: icon.y + icon.h / 2 - L.height / 2,
      }
    : { scaleX: 0.9, scaleY: 0.9, x: 0, y: 0 };
  return (
    <AnimatePresence>
      {open && Screen ? (
        <motion.div
          key={open}
          data-app-open={open}
          initial={{ ...from, opacity: 0, borderRadius: ICON.size * 0.4 }}
          animate={{ scaleX: 1, scaleY: 1, x: 0, y: 0, opacity: 1, borderRadius: 0, transition: springOpen }}
          exit={{ ...from, opacity: 0, borderRadius: ICON.size * 0.4, transition: springClose }}
          style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 20 }}
        >
          <Screen target={open} display={display} close={close} />
          <button
            type="button"
            aria-label="Home"
            onClick={close}
            style={{
              position: "absolute",
              left: "50%",
              bottom: 6,
              width: 140,
              height: 20,
              marginLeft: -70,
              padding: 0,
              border: 0,
              background: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "block", margin: "0 auto", width: 134, height: 5, borderRadius: 3, background: "var(--ios-label)", opacity: 0.85 }} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Where a button sits on a display (pt), for the open/close zoom. */
function targetRect(display: HomeDisplay, target: AppTarget): Rect | null {
  const L = HOME_LAYOUT[display];
  if (target === "search") {
    return { x: L.railX - SEARCH.size / 2, y: L.height - SEARCH.bottom - SEARCH.size, w: SEARCH.size, h: SEARCH.size };
  }
  if (target.startsWith("widget-")) {
    const key = target.slice("widget-".length) as keyof typeof L.widgets;
    return L.widgets[key] ?? null;
  }
  return iconRectPt(display, target as HomeAppId);
}
