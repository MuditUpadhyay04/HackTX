"use client";

import { HOME_INDICATOR } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import { StatusBar } from "@/components/system/StatusBar";

/** The One UI status bar over an app, across the pane it is drawn in. */
export function CoverStatusBar({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const pane = usePane();
  return <StatusBar width={pane.width} tone={tone} zIndex={40} />;
}

/** The One UI gesture handle: a thin pill centered near the bottom edge. */
export function CoverHomeIndicator({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const pane = usePane();
  return (
    <div
      aria-hidden="true"
      data-home-indicator=""
      style={{
        position: "absolute",
        left: (pane.width - HOME_INDICATOR.width) / 2,
        bottom: HOME_INDICATOR.bottom,
        width: HOME_INDICATOR.width,
        height: HOME_INDICATOR.height,
        borderRadius: HOME_INDICATOR.radius,
        background: tone === "dark" ? "var(--ui-label)" : "var(--label-on-dark)",
        opacity: 0.85,
        pointerEvents: "none",
        zIndex: 60,
      }}
    />
  );
}
