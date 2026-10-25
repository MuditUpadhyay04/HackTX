"use client";

import { UnsaidLogo } from "@/components/unsaid/UnsaidLogo";
import { iconSquircleClipPath } from "@/lib/squircle";
import type { BannerApp } from "@/lib/store/banners";

/**
 * The app icon inside a notification banner (38 pt, 22.37% squircle).
 * - Un-Said: Gurneal's icon (UnsaidLogo).
 * - Messages: our drawn look-alike (green tile, white speech bubble), never an Apple file.
 * - Instagram / WhatsApp: D9 says the official Meta artwork from assets/brand/meta/, which is not in
 *   the build yet; until components/ios/AppIcon.tsx serves it, the tile shows the look-alike gradient
 *   with no logo drawn on it (never a traced Meta logo).
 */
export function BannerAppIcon({ app, size }: { app: BannerApp; size: number }) {
  if (app === "unsaid") return <UnsaidLogo size={size} label="" />;
  const fill =
    app === "messages" ? "var(--icon-messages-fill)" : app === "instagram" ? "var(--ig-gradient)" : "var(--wa-green)";
  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "block",
        flexShrink: 0,
        width: size,
        height: size,
        clipPath: iconSquircleClipPath(size),
        background: fill,
      }}
    >
      {app === "messages" ? (
        <svg viewBox="0 0 60 60" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
          <path
            d="M30 13.5c-12.4 0-22.5 8-22.5 17.9 0 5.6 3.2 10.6 8.3 13.9-.4 2.6-1.7 5-3.6 6.9-.3.3-.1.8.3.8 3.6-.1 7-1.4 9.6-3.6 2.5.8 5.2 1.2 7.9 1.2 12.4 0 22.5-8 22.5-17.9S42.4 13.5 30 13.5Z"
            fill="var(--stage-white)"
          />
        </svg>
      ) : null}
    </span>
  );
}
