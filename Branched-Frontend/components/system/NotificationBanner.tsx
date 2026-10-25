"use client";

import { useState, type CSSProperties } from "react";
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

/** App names in the notification header. */
const APP_LABEL: Record<BannerApp, string> = { messages: "Messages", whatsapp: "WhatsApp", instagram: "Instagram", unsaid: "Un-Said" };

/** One UI heads-up notification geometry (dp). */
const HUN = { radius: 26, padX: 16, padY: 14, appIcon: 18, headerGap: 6, titleSize: 15, bodySize: 14, line: 19, metaSize: 12.5 } as const;

/**
 * The One UI heads-up notification: a white rounded card (26 dp corners) dropping in under the status
 * bar. A header row with the small app icon, the app name and "now", then the title (bold, one line)
 * and the message (two lines max). Pressed: slightly darker.
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
        flexDirection: "column",
        gap: 6,
        padding: `${HUN.padY}px ${HUN.padX}px`,
        borderRadius: HUN.radius,
        background: "var(--hun-fill)",
        boxShadow: "var(--shadow-banner)",
        filter: pressed ? "brightness(0.94)" : undefined,
        transition: "filter var(--motion-press) var(--ease-std)",
        cursor: "pointer",
        color: "var(--ui-label)",
        ...style,
      } as CSSProperties}
    >
      <div style={{ display: "flex", alignItems: "center", gap: HUN.headerGap, fontSize: HUN.metaSize, lineHeight: 1, color: "var(--ui-label-secondary)" }}>
        <BannerAppIcon app={app} size={HUN.appIcon} />
        <span style={{ fontWeight: 500, color: "var(--ui-label)" }}>{APP_LABEL[app]}</span>
        <span>·</span>
        <span>{time}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: HUN.titleSize,
            lineHeight: `${HUN.line}px`,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: HUN.bodySize,
            lineHeight: `${HUN.line}px`,
            color: "var(--ui-label-secondary)",
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
