"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createElement, useState } from "react";
import { appScreen } from "@/lib/apps/registry";
import { useAppStore } from "@/lib/apps/store";
import { springClose, springOpen } from "@/lib/motion";
import type { AppTarget } from "@/lib/apps/registry";
import { HOME_INDICATOR, HOME_LAYOUT, ICON, SEARCH, iconRectPt, type HomeAppId, type HomeDisplay, type Rect } from "./layout";

/**
 * The open app on one display: grows out of its button (springOpen), shrinks back into it on close
 * (springClose). A home bar at the bottom closes it, like swiping up on iOS. The same app stays open
 * across fold/unfold: the cover and inner hosts both show it, each with its own display.
 */
export function AppHost({ display }: { display: HomeDisplay }) {
  const state = useAppStore((s) => s.open);
  const close = useAppStore((s) => s.closeApp);
  const tone = useAppStore((s) => s.tone[display]);
  const L = HOME_LAYOUT[display];
  // the open app shows on both displays (only the one facing the viewer is seen), so it carries over
  // when the phone folds or unfolds with it open
  const open = state ? state.target : null;
  const Screen = open ? appScreen(open, display) : undefined;
  // remember the last target so the close animation shrinks back into ITS button
  const [last, setLast] = useState(open);
  if (open && open !== last) setLast(open);
  const target = open ?? last;
  const icon = target ? targetRect(display, target) : null;
  // Reveal the full-size app through a clip that grows out of its button. Nothing is scaled, so the
  // app is never re-rasterized soft (scaling inside the 3D device flashed a blurry frame on open).
  const r = ICON.size * 0.225;
  const from = icon
    ? insetClip(icon.y, L.width - icon.x - icon.w, L.height - icon.y - icon.h, icon.x, r)
    : insetClip(L.height / 2 - 40, L.width / 2 - 40, L.height / 2 - 40, L.width / 2 - 40, r);
  // same px units as `from`, so framer-motion can tween between them
  const to = insetClip(0, 0, 0, 0, 0);
  return (
    <AnimatePresence>
      {open && Screen ? (
        <motion.div
          key={open}
          data-app-open={open}
          initial={{ clipPath: from, opacity: 0.4 }}
          animate={{ clipPath: to, opacity: 1, transition: springOpen }}
          exit={{ clipPath: from, opacity: 0, transition: springClose }}
          style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 20 }}
        >
          {/* registry lookup, not a component defined in render */}
          {createElement(Screen, { target: open, display, close })}
          <button
            type="button"
            aria-label="Home"
            onClick={close}
            style={{
              position: "absolute",
              left: "50%",
              bottom: HOME_INDICATOR.bottom - HOME_BAR_PAD,
              width: HOME_INDICATOR.width + 2 * HOME_BAR_PAD,
              height: HOME_INDICATOR.height + 2 * HOME_BAR_PAD,
              marginLeft: -(HOME_INDICATOR.width / 2 + HOME_BAR_PAD),
              padding: 0,
              border: 0,
              background: "none",
              cursor: "pointer",
              // above the app's own layers (the keyboard, sheets), like the iOS home indicator
              zIndex: 100,
            }}
          >
            <span
              style={{
                display: "block",
                margin: "0 auto",
                width: HOME_INDICATOR.width,
                height: HOME_INDICATOR.height,
                borderRadius: HOME_INDICATOR.radius,
                // light over an app drawn light-on-dark (Reels, the WhatsApp call screen)
                background: tone === "light" ? "var(--label-on-dark)" : "var(--ios-label)",
                opacity: 0.85,
              }}
            />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** clip-path inset() in px (top, right, bottom, left, corner radius). */
function insetClip(top: number, right: number, bottom: number, left: number, radius: number): string {
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
}

/** Extra hit area around the home indicator (pt), so the 5 pt bar is easy to click. */
const HOME_BAR_PAD = HOME_INDICATOR.height + 2;

/** Where a button sits on a display (pt), for the open/close zoom. */
function targetRect(display: HomeDisplay, target: AppTarget): Rect | null {
  const L = HOME_LAYOUT[display];
  if (target === "search") {
    return { x: L.railX - SEARCH.size / 2, y: L.height - SEARCH.bottom - SEARCH.size, w: SEARCH.size, h: SEARCH.size };
  }
  if (target.startsWith("hw-")) return null; // hardware buttons: the app grows from the middle
  if (target.startsWith("widget-")) {
    const key = target.slice("widget-".length) as keyof typeof L.widgets;
    return L.widgets[key] ?? null;
  }
  return iconRectPt(display, target as HomeAppId);
}
