"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { GEOM, cornerRadiusCss, groupShift, silhouetteLeft, type DuoSide } from "../geometry";

/**
 * Stage-aware selection for shadow="auto": on the black stage a rim light, on the wallpaper /
 * white stages the drop + contact shadow. Stage marks its root with data-stage, so plain CSS picks
 * the variant with no prop threading.
 */
const SHADOW_CSS = [
  '[data-duo-shadow="auto"] [data-duo-rim]{display:none}',
  '[data-stage="black"] [data-duo-shadow="auto"] [data-duo-rim]{display:block}',
  '[data-stage="black"] [data-duo-shadow="auto"] [data-duo-drop]{display:none}',
].join("");

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** openAngle from which the halves' shadows stop spilling past the hinge. */
const SEAM_CLOSE_FROM = 150;

/**
 * The drop shadow (or, on black, the rim light) of one half: a transparent plane in the middle of
 * the slab whose box-shadow spreads past the outline, so it hugs the half's silhouette at every
 * angle. The left half's shadow fades in as it swings out (folded it lies exactly on the right
 * half, which already casts). Both hinge sides close as the device flattens, so the two shadows
 * meet at the hinge with no seam.
 */
export function HalfShadow({ side, angle }: { side: DuoSide; angle: MotionValue<number> }) {
  const { width, height, radius } = GEOM.panel;
  const m = GEOM.shadow.spread;
  const r = GEOM.halfRadii(side, "front", radius);
  // a circular border-radius ~1.2 r draws about the same corner as the continuous r
  const round = { tl: r.tl * 1.2, tr: r.tr * 1.2, br: r.br * 1.2, bl: r.bl * 1.2 };
  const opacity = useTransform(angle, (a) => (side === "left" ? r3(a / 180) : 1));
  const clipPath = useTransform(angle, (a) => {
    // both hinge sides spill while the halves are apart (no hard edge on the floor) and close
    // together as the device flattens, so flat the two shadows meet exactly at the hinge
    const closing = Math.min(1, Math.max(0, (a - SEAM_CLOSE_FROM) / (180 - SEAM_CLOSE_FROM)));
    const hingeSide = r3(-m * (1 - closing));
    return side === "left"
      ? `inset(${-m}px ${hingeSide}px ${-m}px ${-m}px)`
      : `inset(${-m}px ${-m}px ${-m}px ${hingeSide}px)`;
  });
  const plane = {
    position: "absolute",
    left: 0,
    top: 0,
    width,
    height,
    borderRadius: cornerRadiusCss(round),
    pointerEvents: "none",
    transform: `translateZ(${GEOM.z.shadowPlane}px)`,
    clipPath,
    opacity,
  } as const;
  return (
    <>
      <motion.div aria-hidden="true" data-duo-drop="" style={{ ...plane, boxShadow: "var(--shadow-device-drop)" }} />
      <motion.div aria-hidden="true" data-duo-rim="" style={{ ...plane, boxShadow: "var(--shadow-device-rim-light)" }} />
    </>
  );
}

/**
 * The contact shadow (drop mode only): an ellipse 70% of the visible device width x 28 px,
 * blurred 24, centered 18 px below the bottom edge; it widens as the left half swings out. Drawn
 * flat behind the 3D scene. Also carries the stage-selection CSS.
 */
export function ContactShadow({ angle }: { angle: MotionValue<number> }) {
  const base = GEOM.group.width * GEOM.shadow.contactWidthRatio;
  const transform = useTransform(angle, (a) => {
    const left = silhouetteLeft(a);
    const visible = GEOM.group.width - left;
    const center = (left + GEOM.group.width) / 2 + groupShift(a);
    return `translateX(${r3(center - base / 2)}px) scaleX(${r3(visible / GEOM.group.width)})`;
  });
  return (
    <>
      <style href="iphone-fold-shadow" precedence="medium">
        {SHADOW_CSS}
      </style>
      <motion.div
        aria-hidden="true"
        data-duo-drop=""
        data-duo-part="contact-shadow"
        style={{
          position: "absolute",
          left: 0,
          top: GEOM.panel.height + GEOM.shadow.contactBelow - GEOM.shadow.contactHeight / 2,
          width: base,
          height: GEOM.shadow.contactHeight,
          borderRadius: "50%",
          background: "var(--device-contact-shadow)",
          filter: "blur(var(--blur-24))",
          transform,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
