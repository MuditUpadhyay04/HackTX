"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type AnimationPlaybackControls } from "framer-motion";
import { createElement, useContext, useEffect, useRef, useState } from "react";
import { InertCopyContext } from "@/lib/apps/copies";
import { angleValue, useFoldStore } from "@/lib/device/store";
import { GEOM } from "@/components/device/geometry";
import { AppGlyph } from "@/components/icons/AppGlyph";
import { appScreen, type AppTarget } from "@/lib/apps/registry";
import { useAppStore } from "@/lib/apps/store";
import { usePrefersReducedMotion } from "@/lib/motion";
import { HOME_INDICATOR, HOME_LAYOUT, ICON, SEARCH, iconRectPt, type HomeAppId, type HomeDisplay, type Rect } from "./layout";

/**
 * The open app on one display, with the iOS app-launch zoom: the app's frame grows out of its icon
 * (a clip that animates from the icon's rect and corner radius to the full display), the icon itself
 * sits on top and crossfades into the app, and the home screen dims behind. Closing runs it in
 * reverse back into the icon. One spring drives a single progress value (0 = icon, 1 = full screen),
 * so every layer stays in step and a re-open mid-close turns around smoothly.
 *
 * Nothing is ever scaled: the app is laid out full size and only revealed, and the icon is drawn at
 * its own size, so the 3D device never re-rasterizes a layer soft (that flashed a blurry frame).
 *
 * The same app stays open across fold/unfold: the cover and inner hosts both show it, each with its
 * own display. A home bar at the bottom closes it, like swiping up on iOS.
 */

/** Launch: ~0.5 s, no overshoot (damping ratio ~0.95). Close is a touch quicker, like iOS. */
const OPEN = { type: "spring", stiffness: 240, damping: 29.5, mass: 1, restDelta: 0.001 } as const;
const CLOSE = { type: "spring", stiffness: 300, damping: 33, mass: 1, restDelta: 0.001 } as const;

export function AppHost({ display }: { display: HomeDisplay }) {
  const state = useAppStore((s) => s.open);
  const close = useAppStore((s) => s.closeApp);
  const tone = useAppStore((s) => s.tone[display]);
  const reduced = usePrefersReducedMotion();
  const L = HOME_LAYOUT[display];
  // the open app shows on both displays (only the one facing the viewer is seen), so it carries over
  // when the phone folds or unfolds with it open
  const open = state ? state.target : null;

  // `shown` stays set while the close animation runs, so the app shrinks back instead of vanishing
  const [shown, setShown] = useState<AppTarget | null>(open);
  if (open && open !== shown) setShown(open);
  // reduced motion: no close animation, the app is gone at once
  const target = open ?? (reduced ? null : shown);

  const p = useMotionValue(open ? 1 : 0);
  const run = useRef<AnimationPlaybackControls | null>(null);
  useEffect(() => {
    run.current?.stop();
    if (open) {
      if (reduced) p.set(1);
      else run.current = animate(p, 1, OPEN);
    } else if (reduced) {
      p.set(0);
    } else {
      const c = animate(p, 0, CLOSE);
      run.current = c;
      c.then(() => {
        if (run.current === c) setShown(null);
      });
    }
    return () => run.current?.stop();
  }, [open, p, reduced]);

  const icon = (target ? targetRect(display, target) : null) ?? centerRect(L.width, L.height);
  const iconRadius = icon.w * ICON_CORNER;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const clipPath = useTransform(p, (t) => {
    const k = Math.max(0, t);
    return insetClip(
      lerp(icon.y, 0, k),
      lerp(L.width - icon.x - icon.w, 0, k),
      lerp(L.height - icon.y - icon.h, 0, k),
      lerp(icon.x, 0, k),
      lerp(iconRadius, DISPLAY_RADIUS, Math.min(1, k)),
    );
  });
  // the app's own pixels come up quickly under the icon; the icon fades out over the first third
  const appOpacity = useTransform(p, [0, 0.22], [0, 1]);
  const iconOpacity = useTransform(p, [0.08, 0.38], [1, 0]);
  // the icon rides the centre of the growing frame at its own size (never scaled, stays sharp)
  const iconLeft = useTransform(p, (t) => lerp(icon.x + icon.w / 2, L.width / 2, t) - icon.w / 2);
  const iconTop = useTransform(p, (t) => lerp(icon.y + icon.h / 2, L.height / 2, t) - icon.h / 2);
  // the home screen behind dims as the app takes over
  const dim = useTransform(p, [0, 1], [0, 0.28]);

  // The home screen is drawn up to 7 times (the cover and inner live layers plus the inert slices on
  // the halves). Running the app in every copy halved the frame rate of the launch, so only the copy
  // the viewer can see runs it: the live layer of the display that faces out, and the inert slices
  // whenever the hinge is part-way open (moving or resting there: that is when they show).
  const inert = useContext(InertCopyContext);
  const folded = useFoldStore((s) => s.folded);
  const [midFold, setMidFold] = useState(() => isMidFold(angleValue.get()));
  useMotionValueEvent(angleValue, "change", (a) => setMidFold(isMidFold(a)));
  const facing = display === "cover" ? folded : !folded;
  const visible = midFold || (!inert && facing);
  // apps that load over the network (Un-Said's web app) stay mounted, hidden, in every copy while
  // they are open, so a fold shows them already loaded and on the same screen instead of each half
  // starting its own copy mid-fold
  const keep = target ? KEEP_MOUNTED.has(target) : false;

  const Screen = target ? appScreen(target, display) : undefined;
  if (!target || !Screen || (!visible && !keep)) return null;
  const isIcon = !target.startsWith("widget-") && target !== "search" && !target.startsWith("hw-");

  return (
    <>
      <motion.div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 19, background: "#000000", opacity: dim, pointerEvents: "none", visibility: visible ? undefined : "hidden" }} />
      <motion.div
        data-app-open={target}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: 20,
          clipPath,
          pointerEvents: open && visible ? "auto" : "none",
          visibility: visible ? undefined : "hidden",
        }}
      >
        <motion.div style={{ position: "absolute", inset: 0, opacity: appOpacity }}>
          {/* registry lookup, not a component defined in render */}
          {createElement(Screen, { target, display, close })}
        </motion.div>
        {isIcon ? (
          <motion.div aria-hidden="true" style={{ position: "absolute", left: iconLeft, top: iconTop, width: icon.w, height: icon.h, opacity: iconOpacity, pointerEvents: "none" }}>
            <AppGlyph app={target as HomeAppId} size={icon.w} />
          </motion.div>
        ) : null}
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
              background: tone === "light" ? "var(--label-on-dark)" : "var(--ui-label)",
              opacity: 0.85,
            }}
          />
        </button>
      </motion.div>
    </>
  );
}

/** Part-way open: the slices on the halves are what the viewer sees. */
function isMidFold(a: number): boolean {
  return a > 0.5 && a < 179.5;
}

/** Apps kept mounted (hidden) in every screen copy while open: see `keep` above. */
const KEEP_MOUNTED = new Set<AppTarget>(["unsaid"]);

/** The iOS icon squircle's corner, as a share of the icon's side (lib/squircle.ts). */
const ICON_CORNER = 0.34;

/** The display's own corner radius in pt, so the growing frame lands exactly on the glass edge. */
const DISPLAY_RADIUS = GEOM.display.inner.radius / GEOM.viewport.scale;

/** clip-path inset() in px (top, right, bottom, left, corner radius). */
function insetClip(top: number, right: number, bottom: number, left: number, radius: number): string {
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
}

/** Hardware buttons have no on-screen origin: the app grows from an icon-sized square in the middle. */
function centerRect(width: number, height: number): Rect {
  const s = ICON.size;
  return { x: (width - s) / 2, y: (height - s) / 2, w: s, h: s };
}

/** Extra hit area around the home indicator (pt), so the 5 pt bar is easy to click. */
const HOME_BAR_PAD = HOME_INDICATOR.height + 2;

/** Where a button sits on a display (pt), for the open/close zoom. */
function targetRect(display: HomeDisplay, target: AppTarget): Rect | null {
  const L = HOME_LAYOUT[display];
  if (target === "search") {
    return { x: L.railX - SEARCH.size / 2, y: L.height - SEARCH.bottom - SEARCH.size, w: SEARCH.size, h: SEARCH.size };
  }
  if (target.startsWith("hw-")) return null;
  if (target.startsWith("widget-")) {
    const key = target.slice("widget-".length) as keyof typeof L.widgets;
    return L.widgets[key] ?? null;
  }
  return iconRectPt(display, target as HomeAppId);
}
