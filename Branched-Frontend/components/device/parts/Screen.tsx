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
  // Smoothstepped like the reference so the blur eases in and out with the swing, not linearly.
  const s = Math.sin((Math.PI * a) / 180);
  const r = foldMotion.blurPeak * Math.pow(s * s * (3 - 2 * s), foldMotion.blurCurve);
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

/**
 * iphone-duo darkening: how far a moving display is into its swing (0 at rest facing the viewer,
 * 1 edge-on), smoothstepped. The cover swings away as the hinge opens; the inner half swings in.
 */
const smooth = (k: number) => {
  const c = Math.min(1, Math.max(0, k));
  return c * c * (3 - 2 * c);
};
export const coverSwing = (openAngle: number) => smooth(clampAngle(openAngle) / 90);
export const innerSwing = (openAngle: number) => smooth((180 - clampAngle(openAngle)) / 90);

/** The blurred copy's mask: clear at the hinge, opaque at the far edge (edge^1.35). */
function hingeMask(hinge: "left" | "right") {
  const to = hinge === "left" ? "right" : "left";
  const m = `linear-gradient(to ${to}, transparent 0%, rgba(0,0,0,0.11) 20%, rgba(0,0,0,0.29) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.74) 80%, #000 100%)`;
  return { maskImage: m, WebkitMaskImage: m };
}

/** How far the blurred layer overhangs its clip (well past 2x the peak blur radius). */
const BLUR_BLEED = 24;

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
  shade,
  children,
}: {
  angle: MotionValue<number>;
  soften: boolean;
  opacity?: (a: number) => number;
  width: number;
  height: number;
  inert?: boolean;
  /**
   * iphone-duo darkening: a black ramp from the hinge (clear) to the far edge, strength =
   * min(1, 2 * swing). `hinge` is the hinge's side in this layer's own coordinates.
   */
  shade?: { swing: (a: number) => number; hinge: "left" | "right" };
  children: ReactNode;
}) {
  const filter = useTransform(angle, (a) => (soften ? blurCss(foldBlurRadius(a)) : "none"));
  const alpha = useTransform(angle, (a) => (opacity ? opacity(a) : 1));
  const shadeOpacity = useTransform(angle, (a) => (shade ? Math.min(1, 2 * shade.swing(a)) : 0));
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
        opacity: alpha,
        // inert copies must not swallow clicks meant for the display facing the viewer
        pointerEvents: inert ? "none" : undefined,
      }}
    >
      {/*
        iphone-duo blur: sharp at the hinge, growing toward the far edge. A sharp copy underneath
        and a blurred copy on top, masked in from the hinge (blurGradient^1.35), so the swinging
        half meets the still half at the crease with no hard edge. The blurred copy overhangs the
        clip by BLUR_BLEED so its fringe falls outside the display.
      */}
      {shade && soften ? <div style={{ position: "absolute", inset: 0 }}>{children}</div> : null}
      <motion.div
        style={{
          position: "absolute",
          inset: -BLUR_BLEED,
          padding: BLUR_BLEED,
          filter,
          willChange: soften ? "filter" : undefined,
          ...(shade && soften ? hingeMask(shade.hinge) : null),
        }}
      >
        <div style={{ position: "relative", width, height }}>{children}</div>
      </motion.div>
      {shade ? (
        <motion.div
          aria-hidden="true"
          data-fold-shade=""
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: shadeOpacity,
            // darkenGradient^1.35 from 20% off the hinge, as in the reference shader
            background: `linear-gradient(to ${shade.hinge === "left" ? "right" : "left"}, rgba(0,0,0,0) 20%, rgba(0,0,0,0.11) 40%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.53) 75%, rgba(0,0,0,0.8) 90%, #000 100%)`,
          }}
        />
      ) : null}
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
