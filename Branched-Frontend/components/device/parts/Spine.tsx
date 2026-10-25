"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { GEOM } from "../geometry";
import { spineCapPolygon, spineFacet, spineFacetTransformCss, surfaceShade } from "@/lib/device/angle";
import { HIDDEN_BACKFACE } from "./Face";

const FACETS = Array.from({ length: GEOM.spine.facets }, (_, i) => i);

/** Darkest shade of a spine facet turned away from the light (a rounded metal edge reads dark at its rim). */
const SPINE_SHADE = 0.8;

/** Facet overlap so the bent cylinder shows no cracks. */
const OVERLAP = 0.5;

function SpineFacet({ index, angle }: { index: number; angle: MotionValue<number> }) {
  const transform = useTransform(angle, (a) => spineFacetTransformCss(spineFacet(index, a)));
  const width = useTransform(angle, (a) => {
    const l = spineFacet(index, a).length;
    // two decimals, so the server-rendered and hydrated style strings are identical
    return l < 0.01 ? 0 : Math.round((l + OVERLAP) * 100) / 100;
  });
  const shade = useTransform(angle, (a) => {
    const f = spineFacet(index, a);
    return surfaceShade(f.nx, f.nz, SPINE_SHADE);
  });
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height: GEOM.panel.height,
        transformOrigin: "0 0",
        transform,
        background: "var(--device-ti-brush), var(--device-ti-spine)",
        ...HIDDEN_BACKFACE,
      }}
    >
      <motion.div style={{ position: "absolute", inset: 0, background: "var(--device-ti-deep)", opacity: shade }} />
    </motion.div>
  );
}

function SpineCap({ angle, y }: { angle: MotionValue<number>; y: number }) {
  const r = GEOM.spine.radius;
  const clipPath = useTransform(angle, (a) => spineCapPolygon(a));
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: GEOM.group.hinge - r,
        top: y - r,
        width: 2 * r,
        height: 2 * r,
        transformOrigin: "50% 50%",
        transform: "rotateX(-90deg)",
        clipPath,
        background: "var(--device-ti-mid)",
      }}
    />
  );
}

/**
 * The hinge spine: a titanium cylinder (radius = slab thickness) around the hinge axis, swept over
 * the angle between the two backs: nothing when flat, a rounded half cylinder on the device's left
 * edge when folded. Flat facets, Lambert-shaded per frame, plus the two end caps.
 */
export function Spine({ angle }: { angle: MotionValue<number> }) {
  return (
    <div data-fold-part="spine" style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", pointerEvents: "none" }}>
      {FACETS.map((i) => (
        <SpineFacet key={i} index={i} angle={angle} />
      ))}
      <SpineCap angle={angle} y={0} />
      <SpineCap angle={angle} y={GEOM.panel.height} />
    </div>
  );
}
