"use client";

import type { ReactNode } from "react";
import { SCREEN } from "@/components/lookalike/metrics";
import { CoverHomeIndicator, CoverStatusBar } from "@/components/scene/CoverStatusBar";
import { BannerHost, type StaticBanner } from "./BannerHost";

export type PhoneScreenProps = {
  children?: ReactNode;
  statusTone?: "dark" | "light";
  indicatorTone?: "dark" | "light";
  /** hide the home indicator (full-screen media) */
  indicator?: boolean;
  /** a static banner frame (?banner=&banner-state=) */
  staticBanner?: StaticBanner | null;
};

/**
 * One iOS screen on the cover display: the 402 x 573.1 pt viewport (GEOM.viewport.cover, D10) with
 * the status bar, the banner stack and the home indicator layered over the app.
 */
export function PhoneScreen({
  children,
  statusTone = "dark",
  indicatorTone,
  indicator = true,
  staticBanner = null,
}: PhoneScreenProps) {
  return (
    <div
      data-phone-screen=""
      style={{
        position: "relative",
        width: SCREEN.width,
        height: SCREEN.height,
        overflow: "hidden",
        fontFamily: "var(--font-system)",
        WebkitFontSmoothing: "antialiased",
        userSelect: "none",
      }}
    >
      {children}
      <CoverStatusBar tone={statusTone} />
      <BannerHost staticBanner={staticBanner} />
      {indicator ? <CoverHomeIndicator tone={indicatorTone ?? statusTone} /> : null}
    </div>
  );
}
