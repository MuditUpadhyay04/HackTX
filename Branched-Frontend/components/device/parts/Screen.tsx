"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { foldMotion } from "@/lib/tokens";
import { GEOM, clampAngle, punchCenter } from "../geometry";
import { punchRing } from "../materials";

// ---------------------------------------------------------------------------
// D12 smooth unfold: the moving half's content as a pure function of openAngle
// ---------------------------------------------------------------------------

/** Motion blur radius (display px) at `openAngle`: 0 at 0 and 180, peak mid-fold, dropped below the floor. */
export function foldBlurRadius(openAngle: number): number {
  const a = clampAngle(openAngle);
  const r = foldMotion.blurPeak * Math.pow(Math.sin((Math.PI * a) / 180), foldMotion.blurCurve);
  return r < foldMotion.blurFloor ? 0 : Math.round(r * 100) / 100;
}

/** The cover home fades toward the dark glass as it swings away (1 folded -> coverDimTo edge-on). */
export function coverContentOpacity(openAngle: number): number {
  const k = Math.min(1, clampAngle(openAngle) / 90);
  const eased = k * k * (3 - 2 * k);
  return 1 - (1 - foldMotion.coverDimTo) * eased;
}

/** The inner display's moving half brightens as it turns to face the viewer (innerDimFrom at 90 -> 1 flat). */
export function innerHalfOpacity(openAngle: number): number {
  const k = Math.max(0, (clampAngle(openAngle) - 90) / 90);
  const eased = k * k * (3 - 2 * k);
  return foldMotion.innerDimFrom + (1 - foldMotion.innerDimFrom) * eased;
}

const blurCss = (r: number) => (r > 0 ? `blur(${r}px)` : "none");

/**
 * A display's content layer on a moving half: one flattened layer that is blurred (a single filter,
 * capped radius, never per icon) and dimmed as a pure function of openAngle. `soften` false keeps it
 * sharp (the half that does not swing). The `inert` copies (inner slices) never take focus or taps.
 */
export function FoldContent({
  angle,
  soften,
  opacity,
  width,
  height,
  inert,
  children,
}: {
  angle: MotionValue<number>;
  soften: boolean;
  opacity?: (a: number) => number;
  width: number;
  height: number;
  inert?: boolean;
  children: ReactNode;
}) {
  const filter = useTransform(angle, (a) => (soften ? blurCss(foldBlurRadius(a)) : "none"));
  const alpha = useTransform(angle, (a) => (opacity ? opacity(a) : 1));
  return (
    <motion.div
      data-fold-content=""
      inert={inert}
      aria-hidden={inert ? true : undefined}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        overflow: "hidden",
        filter,
        opacity: alpha,
        willChange: soften ? "filter, opacity" : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A display's glass: lit (the iOS-style wallpaper) or off (black glass with a faint reflection).
 * `width` x `height` is the whole surface; `offsetX` shifts it so one surface can span both halves
 * of the inner display (each half shows its own slice, so the wallpaper is continuous).
 */
export function ScreenSurface({
  on,
  width,
  height,
  offsetX = 0,
}: {
  on: boolean;
  width: number;
  height: number;
  offsetX?: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: offsetX,
        top: 0,
        width,
        height,
        background: on ? "var(--device-screen-wallpaper)" : "var(--device-screen-off)",
        pointerEvents: "none",
      }}
    />
  );
}

/** The cover glass reflection: a soft diagonal sheen over everything on the display. */
export function GlassSheen({ width, height, offsetX = 0 }: { width: number; height: number; offsetX?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: offsetX,
        top: 0,
        width,
        height,
        background: "var(--device-glass-sheen)",
        pointerEvents: "none",
      }}
    />
  );
}

/** The front camera punch-hole, top-right of the cover display (D11: the inner display has none). */
export function PunchHole({ display, width }: { display: "cover"; width: number }) {
  const c = punchCenter(width);
  const d = GEOM.punch[display].diameter;
  return (
    <div
      aria-hidden="true"
      data-duo-part={`punch-${display}`}
      style={{
        position: "absolute",
        left: c.x - d / 2,
        top: c.y - d / 2,
        width: d,
        height: d,
        borderRadius: "50%",
        background: "var(--device-front-camera)",
        boxShadow: punchRing,
        pointerEvents: "none",
      }}
    />
  );
}
