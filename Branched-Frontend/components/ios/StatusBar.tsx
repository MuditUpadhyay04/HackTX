"use client";

import type { CSSProperties } from "react";
import { useMockClock } from "@/lib/mock/clock";
import { HOME_LAYOUT, PUNCH, STATUS } from "@/components/home/layout";
import { emphasizedWeight } from "@/lib/tokens";

export type StatusTone = "light" | "dark";

const toneColor = (tone: StatusTone) => (tone === "light" ? "var(--label-on-dark)" : "var(--ios-label)");

/** Four cellular bars (iOS 26), drawn on an 18 x 12 grid. */
export function CellularGlyph() {
  const c = STATUS.cellular;
  return (
    <svg width={c.width} height={c.height} viewBox="0 0 18 12" aria-hidden="true">
      <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.9" fill="currentColor" />
      <rect x="4.9" y="5" width="3.2" height="7" rx="0.9" fill="currentColor" />
      <rect x="9.8" y="2.5" width="3.2" height="9.5" rx="0.9" fill="currentColor" />
      <rect x="14.7" y="0" width="3.2" height="12" rx="0.9" fill="currentColor" />
    </svg>
  );
}

/** Three Wi-Fi arcs, drawn on a 16 x 12 grid. */
export function WifiGlyph() {
  const w = STATUS.wifi;
  return (
    <svg width={w.width} height={w.height} viewBox="0 0 16 12" aria-hidden="true">
      <path
        d="M8 2.3c2.3 0 4.4.9 6 2.4.2.2.5.2.7 0l1-1c.2-.2.2-.5 0-.7C13.7 1.1 11 0 8 0S2.3 1.1.3 3c-.2.2-.2.5 0 .7l1 1c.2.2.5.2.7 0 1.6-1.5 3.7-2.4 6-2.4Z"
        fill="currentColor"
      />
      <path
        d="M8 6c1.3 0 2.5.5 3.4 1.3.2.2.5.2.7 0l1-1c.2-.2.2-.5 0-.7C11.8 4.5 10 3.8 8 3.8s-3.8.7-5.1 1.8c-.2.2-.2.5 0 .7l1 1c.2.2.5.2.7 0C5.5 6.5 6.7 6 8 6Z"
        fill="currentColor"
      />
      <path
        d="M10.4 9.1c.2-.2.2-.5 0-.7C9.8 7.9 8.9 7.6 8 7.6s-1.8.3-2.4.8c-.2.2-.2.5 0 .7l2 2c.2.2.6.2.8 0l2-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** The battery: a 40% outline, the level fill and the terminal nub. */
export function BatteryGlyph() {
  const b = STATUS.battery;
  const w = b.width + b.nub + 1;
  return (
    <svg width={w} height={b.height} viewBox={`0 0 ${w} ${b.height}`} aria-hidden="true">
      <rect
        x="0.5"
        y="0.5"
        width={b.width - 1}
        height={b.height - 1}
        rx={b.radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
      />
      <rect
        x={b.inset}
        y={b.inset}
        width={(b.width - 2 * b.inset) * b.level}
        height={b.height - 2 * b.inset}
        rx={b.radius - 1.5}
        fill="currentColor"
      />
      <path d={`M${b.width + 0.5} ${b.height / 2 - 2}v4c.8-.3 1.5-1.1 1.5-2s-.7-1.7-1.5-2Z`} fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

const timeStyle = (size: number): CSSProperties => ({
  fontSize: size,
  fontWeight: emphasizedWeight,
  letterSpacing: "-0.02em",
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1,
  whiteSpace: "nowrap",
});

/**
 * The iOS 26 status bar.
 * - display "cover" (the folded display, 402 pt): "9:41" at the leading edge and cellular, Wi-Fi and
 *   battery on the right, all on the punch-hole's center line; the right cluster stops short of the
 *   punch-hole (top-right).
 * - display "inner" (the unfolded display, D8): the time with Wi-Fi under it, stacked at the top of the
 *   right rail above the dock (no camera cutout, D11).
 */
export function StatusBar({ display, tone = "light" }: { display: "cover" | "inner"; tone?: StatusTone }) {
  const { label } = useMockClock();
  const color = toneColor(tone);

  if (display === "inner") {
    const L = HOME_LAYOUT.inner;
    return (
      <div
        data-status-bar="inner"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: L.railX,
          top: STATUS.railTimeTop,
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: STATUS.railWifiGap,
          color,
          pointerEvents: "none",
        }}
      >
        <span style={timeStyle(STATUS.railTimeSize)}>{label}</span>
        <WifiGlyph />
      </div>
    );
  }

  const clusterRight = PUNCH.fromRight + PUNCH.diameter / 2 + STATUS.holeGap;
  return (
    <div
      data-status-bar="cover"
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        height: STATUS.height,
        color,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: STATUS.coverTimeLeft,
          top: STATUS.coverCenter,
          transform: "translateY(-50%)",
          ...timeStyle(STATUS.timeSize),
        }}
      >
        {label}
      </span>
      <div
        style={{
          position: "absolute",
          right: clusterRight,
          top: STATUS.coverCenter,
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: STATUS.clusterGap,
        }}
      >
        <CellularGlyph />
        <WifiGlyph />
        <BatteryGlyph />
      </div>
    </div>
  );
}

export default StatusBar;
