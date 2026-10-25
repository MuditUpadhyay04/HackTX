"use client";

import { motion } from "framer-motion";
import { useFoldStore } from "@/lib/device/store";
import { durations, easeSoft, hingeRippleStartScale, ms } from "@/lib/motion";

/**
 * The hinge "click" (spec Phase 1, FOLD CONTROL): a one-shot 24 pt ring, rgba(255,255,255,0.25) -> 0
 * over 220 ms, where a haptic would fire. It plays each time lib/device/fold.ts bumps `ripple`
 * (openAngle crossing 178 unfolding / 2 folding). Never under reduced motion (the hinge jumps there).
 *
 * Mount it as IPhoneDuo's `hingeAccessory`: it centers itself on its containing box.
 */

export function HingeRipple() {
  const ripple = useFoldStore((s) => s.ripple);
  if (ripple === 0) return null;
  return (
    <motion.span
      key={ripple}
      aria-hidden="true"
      data-hinge-ripple={ripple}
      initial={{ opacity: 1, scale: hingeRippleStartScale }}
      animate={{ opacity: 0, scale: 1 }}
      transition={{ duration: ms(durations.hingeRipple), ease: easeSoft }}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "var(--space-24)",
        height: "var(--space-24)",
        marginLeft: "calc(var(--space-24) / -2)",
        marginTop: "calc(var(--space-24) / -2)",
        borderRadius: "var(--radius-pill)",
        border: "var(--space-2) solid var(--device-hinge-ripple)",
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    />
  );
}

export default HingeRipple;
