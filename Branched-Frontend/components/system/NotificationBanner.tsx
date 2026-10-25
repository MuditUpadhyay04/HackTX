"use client";

import { useState, type CSSProperties } from "react";
import { BANNER } from "@/components/lookalike/metrics";
import { BANNER_TIME } from "@/lib/mock/threads";
import type { BannerApp } from "@/lib/store/banners";
import { BannerAppIcon } from "@/components/lookalike/shared/BannerAppIcon";

export type NotificationBannerProps = {
  app: BannerApp;
  title: string;
  body: string;
  time?: string;
  state?: "in" | "pressed" | "off";
  onTap?: () => void;
  style?: CSSProperties;
};

/**
 * The iOS notification banner look-alike (Phase 2 CHROME SPECS): radius 24 continuous corners, the
 * light notification material (blur 30 + saturate 180%), 14 pt padding, a 38 pt app icon, title
 * 15 semibold (one line), body 15 regular (two lines max), "now" 13 secondary top right, a hairline
 * edge and the soft banner shadow. Pressed: 0.97 scale and 8% darker.
 */
export function NotificationBanner({ app, title, body, time = BANNER_TIME, state = "in", onTap, style }: NotificationBannerProps) {
  const [down, setDown] = useState(false);
  if (state === "off") return null;
  const pressed = state === "pressed" || down;
  return (
    <div
      role="button"
      tabIndex={-1}
      data-banner={app}
      data-action="open-banner"
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      onClick={onTap}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: BANNER.iconGap,
        padding: BANNER.pad,
        borderRadius: BANNER.radius,
        cornerShape: "squircle",
        background: "var(--material-light)",
        backdropFilter: "var(--material-light-filter)",
        WebkitBackdropFilter: "var(--material-light-filter)",
        boxShadow: "var(--shadow-banner), inset 0 0 0 var(--hairline) var(--banner-stroke)",
        scale: pressed ? "0.97" : "1",
        filter: pressed ? "brightness(0.92)" : undefined,
        transition: "scale var(--motion-press) var(--ease-std), filter var(--motion-press) var(--ease-std)",
        cursor: "pointer",
        color: "var(--ui-label)",
        ...style,
      } as CSSProperties}
    >
      <BannerAppIcon app={app} size={BANNER.icon} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: BANNER.iconGap }}>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: BANNER.titleSize,
              lineHeight: `${BANNER.line}px`,
              fontWeight: 600,
              letterSpacing: "var(--type-subheadline-tracking)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: BANNER.timeSize,
              lineHeight: `${BANNER.line}px`,
              color: "var(--ui-label-secondary)",
              flexShrink: 0,
            }}
          >
            {time}
          </span>
        </div>
        <div
          style={{
            fontSize: BANNER.bodySize,
            lineHeight: `${BANNER.line}px`,
            letterSpacing: "var(--type-subheadline-tracking)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}
