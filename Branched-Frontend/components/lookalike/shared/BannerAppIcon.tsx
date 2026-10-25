"use client";

import { UnsaidLogo } from "@/components/unsaid/UnsaidLogo";
import type { BannerApp } from "@/lib/store/banners";

/**
 * The app icon in a notification's header (Android: a small round badge in the app's color).
 * - Un-Said: Gurneal's icon (UnsaidLogo).
 * - Messages: the drawn look-alike's blue with a white bubble.
 * - Instagram / WhatsApp: the app's color (never a traced Meta logo).
 */
export function BannerAppIcon({ app, size }: { app: BannerApp; size: number }) {
  if (app === "unsaid") return <UnsaidLogo size={size} label="" />;
  const fill =
    app === "messages" ? "var(--icon-messages-bubble)" : app === "instagram" ? "var(--ig-gradient)" : "var(--wa-green)";
  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "block",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        background: fill,
      }}
    >
      {app === "messages" ? (
        <svg viewBox="0 0 60 60" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
          <path d="M17 18c0-1.7 1.3-3 3-3h20c1.7 0 3 1.3 3 3v16c0 1.7-1.3 3-3 3H27l-7 6v-6c-1.7 0-3-1.3-3-3V18Z" fill="var(--stage-white)" />
        </svg>
      ) : null}
    </span>
  );
}
