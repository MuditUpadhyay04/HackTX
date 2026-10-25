"use client";

import { useMockClock } from "@/lib/mock/clock";
import { STATUS } from "@/components/lookalike/metrics";

export type StatusTone = "light" | "dark";

const toneColor = (tone: StatusTone) => (tone === "light" ? "var(--label-on-dark)" : "var(--ui-label)");

/** Android Wi-Fi: a filled fan (full signal), the lower part solid, a faint outer arc. */
function WifiGlyph() {
  const s = STATUS.wifi;
  return (
    <svg width={s.width} height={s.height} viewBox="0 0 18 14" aria-hidden="true">
      <path d="M9 13.4 0.6 4.2C2.9 2.1 5.8 0.9 9 0.9s6.1 1.2 8.4 3.3L9 13.4Z" fill="currentColor" />
    </svg>
  );
}

/** Android cellular: a right triangle filled to 3 of 4 bars (the rest faint). */
function SignalGlyph() {
  const s = STATUS.cellular;
  return (
    <svg width={s.width} height={s.height} viewBox="0 0 14 14" aria-hidden="true">
      <path d="M13.4 0.6v12.8H0.6L13.4 0.6Z" fill="currentColor" fillOpacity="0.3" />
      <path d="M10.2 3.8v9.6H0.6l9.6-9.6Z" fill="currentColor" />
    </svg>
  );
}

/** One UI battery: the percentage, then a rounded horizontal cell filled to the level. */
function Battery() {
  const b = STATUS.battery;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: b.textGap }}>
      <span style={{ fontSize: b.textSize, fontWeight: 500, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
        {Math.round(b.level * 100)}%
      </span>
      <svg width={b.width + b.nub} height={b.height} viewBox={`0 0 ${b.width + b.nub} ${b.height}`} aria-hidden="true">
        <rect x="0.6" y="0.6" width={b.width - 1.2} height={b.height - 1.2} rx={b.radius} fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.55" />
        <rect x={b.inset} y={b.inset} width={(b.width - 2 * b.inset) * b.level} height={b.height - 2 * b.inset} rx={b.radius - 1} fill="currentColor" />
        <rect x={b.width} y={b.height / 2 - 2} width={b.nub} height={4} rx={0.8} fill="currentColor" fillOpacity="0.55" />
      </svg>
    </span>
  );
}

/** Small notification icons after the clock: WhatsApp and Messages have unread messages. */
function NotificationIcons() {
  const n = STATUS.notif;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: n.gap, opacity: 0.9 }}>
      <svg width={n.size} height={n.size} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 1.6a6.4 6.4 0 0 0-5.5 9.7L1.6 14.4l3.2-.9A6.4 6.4 0 1 0 8 1.6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M5.9 5.2c.3-.3.7-.3.9 0l.6 1.2c.1.3 0 .5-.2.7l-.3.3c.4.9 1.1 1.6 2 2l.3-.3c.2-.2.5-.3.7-.2l1.2.6c.3.2.3.6 0 .9-.6.6-1.6.8-2.6.3a6 6 0 0 1-2.9-2.9c-.5-1-.3-2 .3-2.6Z" fill="currentColor" />
      </svg>
      <svg width={n.size} height={n.size} viewBox="0 0 16 16" aria-hidden="true">
        <path d="M2.4 3.6c0-.9.7-1.6 1.6-1.6h8c.9 0 1.6.7 1.6 1.6v6c0 .9-.7 1.6-1.6 1.6H6.4L3.2 14v-2.8H4c-.9 0-1.6-.7-1.6-1.6v-6Z" fill="currentColor" />
      </svg>
    </span>
  );
}

/**
 * The One UI status bar across the top of either display (Galaxy Z Fold 8): the clock and the
 * notification icons at the leading edge, Wi-Fi, signal and the battery at the trailing edge, all on
 * the punch-hole's center line. The cover's punch-hole is centered and the inner display's sits over
 * its right half, so neither cluster ever reaches a camera.
 */
export function StatusBar({ width, tone = "light", zIndex }: { width: number; tone?: StatusTone; zIndex?: number }) {
  const { label } = useMockClock();
  return (
    <div
      data-status-bar=""
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height: STATUS.height,
        color: toneColor(tone),
        pointerEvents: "none",
        zIndex,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: STATUS.side,
          top: STATUS.center,
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: STATUS.clusterGap + 2,
        }}
      >
        <span style={{ fontSize: STATUS.timeSize, fontWeight: 500, fontVariantNumeric: "tabular-nums", lineHeight: 1, letterSpacing: "0.01em" }}>{label}</span>
        <NotificationIcons />
      </span>
      <span
        style={{
          position: "absolute",
          right: STATUS.side,
          top: STATUS.center,
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: STATUS.clusterGap,
        }}
      >
        <WifiGlyph />
        <SignalGlyph />
        <Battery />
      </span>
    </div>
  );
}

export default StatusBar;
