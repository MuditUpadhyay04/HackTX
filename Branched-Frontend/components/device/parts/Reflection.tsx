import type { ReactNode } from "react";
import { GEOM } from "../geometry";

/**
 * The floor reflection (spec SHADOWS AND REFLECTION; off by default, on for hero states): a
 * mirrored copy (scaleY(-1)) 14 px below the device, opacity 0.10, blur 1.5 px, faded out by the
 * reflection mask. `children` is the device core rendered again (no screen content).
 */
export function Reflection({ children }: { children: ReactNode }) {
  const { width, height } = GEOM.group;
  return (
    <div
      aria-hidden="true"
      data-fold-part="reflection"
      style={{
        position: "absolute",
        left: 0,
        top: height + GEOM.reflection.gap,
        width,
        height,
        opacity: GEOM.reflection.opacity,
        filter: "var(--device-reflection-filter)",
        WebkitMaskImage: "var(--device-reflection-mask)",
        maskImage: "var(--device-reflection-mask)",
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "absolute", inset: 0, transform: "scaleY(-1)" }}>{children}</div>
    </div>
  );
}
