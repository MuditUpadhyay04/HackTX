"use client";

import { useEffect, useState } from "react";
import { foldDevice } from "@/lib/device/fold";
import { STAGE_WIDTH } from "@/components/stage/Stage";

/**
 * A 0-180 hinge slider that snaps to every whole degree, for checking the fold frame by frame.
 * Dragging sets the angle directly (no animation); the readout follows the live angle, so it also
 * tracks the Fold button and F key. Render inside <Stage> (artboard units), below the fold pill.
 */
export function AngleSlider({ y = 1052 }: { y?: number }) {
  // starts at 0 on server and client alike (no hydration mismatch), then follows the live angle
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    setAngle(Math.round(foldDevice.getAngle()));
    return foldDevice.value.on("change", (a) => setAngle(Math.round(a)));
  }, []);
  const width = 640;
  return (
    <div
      style={{
        position: "absolute",
        left: STAGE_WIDTH / 2 - width / 2,
        top: y - 14,
        width,
        height: 28,
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: "var(--font-system)",
        fontSize: 15,
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        color: "var(--ios-label)",
      }}
    >
      <input
        type="range"
        min={0}
        max={180}
        step={1}
        value={angle}
        aria-label="Hinge angle"
        onChange={(e) => foldDevice.setAngle(Number(e.target.value))}
        style={{ flex: 1, accentColor: "#007AFF" }}
      />
      <span style={{ width: 44, textAlign: "right" }}>{angle}°</span>
    </div>
  );
}
