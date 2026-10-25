"use client";

import { useMockClock } from "@/lib/mock/clock";
import { HOME_INDICATOR, PUNCH_PT, SCREEN, STATUS } from "@/components/lookalike/metrics";

/**
 * The cover display's iOS status bar (Phase 2 CHROME SPECS: 54 pt; "9:41" semibold 17 pt;
 * 4 cellular bars, 3 Wi-Fi arcs, a 72% battery). D10: the cover display has a punch-hole camera
 * top-right instead of a Dynamic Island, so the time sits at the leading edge and the right cluster
 * ends just short of the hole, all on the hole's center line.
 * Local to the app scenes until components/ios/StatusBar.tsx (home-screen builder) lands.
 */
export function CoverStatusBar({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { label } = useMockClock();
  const color = tone === "dark" ? "var(--ios-label)" : "var(--label-on-dark)";
  const clusterRight = PUNCH_PT.fromRight + PUNCH_PT.diameter / 2 + STATUS.holeGap;
  const b = STATUS.battery;
  return (
    <div
      data-status-bar=""
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: SCREEN.width,
        height: STATUS.height,
        color,
        pointerEvents: "none",
        zIndex: 40,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: STATUS.timeLeft,
          top: STATUS.center,
          transform: "translateY(-50%)",
          fontSize: STATUS.timeSize,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      <div
        style={{
          position: "absolute",
          right: clusterRight,
          top: STATUS.center,
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: STATUS.clusterGap,
        }}
      >
        <svg width={STATUS.cellular.width} height={STATUS.cellular.height} viewBox="0 0 18 12">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.9" fill="currentColor" />
          <rect x="4.9" y="5" width="3.2" height="7" rx="0.9" fill="currentColor" />
          <rect x="9.8" y="2.5" width="3.2" height="9.5" rx="0.9" fill="currentColor" />
          <rect x="14.7" y="0" width="3.2" height="12" rx="0.9" fill="currentColor" />
        </svg>
        <svg width={STATUS.wifi.width} height={STATUS.wifi.height} viewBox="0 0 16 12">
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
        <svg width={b.width + b.nub + 1} height={b.height} viewBox={`0 0 ${b.width + b.nub + 1} ${b.height}`}>
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
          <path
            d={`M${b.width + 0.5} ${b.height / 2 - 2}v4c.8-.3 1.5-1.1 1.5-2s-.7-1.7-1.5-2Z`}
            fill="currentColor"
            fillOpacity="0.45"
          />
        </svg>
      </div>
    </div>
  );
}

/** iOS home indicator: 134 x 5 pt, radius 2.5, 8 pt from the bottom. */
export function CoverHomeIndicator({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div
      aria-hidden="true"
      data-home-indicator=""
      style={{
        position: "absolute",
        left: (SCREEN.width - HOME_INDICATOR.width) / 2,
        bottom: HOME_INDICATOR.bottom,
        width: HOME_INDICATOR.width,
        height: HOME_INDICATOR.height,
        borderRadius: HOME_INDICATOR.radius,
        background: tone === "dark" ? "var(--ios-label)" : "var(--label-on-dark)",
        pointerEvents: "none",
        zIndex: 60,
      }}
    />
  );
}
