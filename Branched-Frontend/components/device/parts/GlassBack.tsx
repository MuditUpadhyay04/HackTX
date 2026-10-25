"use client";

import { motion, type MotionValue } from "framer-motion";
import { GEOM } from "../geometry";
import { lensGlassShadow, lensRingShadow } from "../materials";
import { ALL_SIDES, Face, HIDDEN_BACKFACE } from "./Face";

/**
 * The right half's BACK as seen from behind: an aluminum frame around the glass back with a moving
 * specular band (gloss), and the two floating rear lenses at the top, on the outer side.
 * Back-local x 0 is the right half's outer edge.
 */
export function GlassBack({ gloss }: { gloss: MotionValue<string> | string }) {
  const { width, height, radius } = GEOM.panel;
  return (
    <>
      <Face
        part="back-right"
        width={width}
        height={height}
        radii={GEOM.halfRadii("right", "back", radius)}
        sides={ALL_SIDES}
        variant="glass"
      >
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "var(--device-back-glass-ti-gloss)",
            backgroundSize: "250% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPositionX: gloss,
          }}
        />
      </Face>
      <CameraPlateau />
    </>
  );
}

function CameraPlateau() {
  const p = GEOM.plateau;
  return (
    <div
      aria-hidden="true"
      data-fold-part="camera-plateau"
      style={{
        position: "absolute",
        left: p.x,
        top: p.y,
        width: p.width,
        height: p.height,
        borderRadius: p.radius,
        transform: `translateZ(${GEOM.z.plateau}px)`,
        ...HIDDEN_BACKFACE,
      }}
    >
      {p.lens.centers.map(([cx, cy]) => (
        <Lens key={`${cx}-${cy}`} cx={cx} cy={cy} />
      ))}
      <Dot center={p.flash.center} diameter={p.flash.diameter} background="var(--device-flash)" />
      <Dot center={p.mic.center} diameter={p.mic.diameter} background="var(--device-mic)" />
    </div>
  );
}

function Dot({ center, diameter, background }: { center: readonly [number, number]; diameter: number; background: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: center[0] - diameter / 2,
        top: center[1] - diameter / 2,
        width: diameter,
        height: diameter,
        borderRadius: "50%",
        background,
      }}
    />
  );
}

/** A titanium ring around a dark lens with a violet coating reflection and a specular dot. */
function Lens({ cx, cy }: { cx: number; cy: number }) {
  const { ring, glass } = GEOM.plateau.lens;
  const refl = GEOM.plateau.lensReflection;
  const dot = GEOM.plateau.lensSpecular;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - ring / 2,
        top: cy - ring / 2,
        width: ring,
        height: ring,
        borderRadius: "50%",
        background: "var(--device-lens-ring-ti)",
        boxShadow: lensRingShadow,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: (ring - glass) / 2,
          top: (ring - glass) / 2,
          width: glass,
          height: glass,
          borderRadius: "50%",
          background: "var(--device-lens)",
          boxShadow: lensGlassShadow,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: glass * 0.22,
            top: glass * 0.2,
            width: refl.width,
            height: refl.height,
            borderRadius: "50%",
            background: "var(--device-lens-reflection)",
            transform: "rotate(-30deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: glass * 0.32,
            top: glass * 0.28,
            width: dot,
            height: dot,
            borderRadius: "50%",
            background: "var(--device-ti-highlight)",
          }}
        />
      </div>
    </div>
  );
}
