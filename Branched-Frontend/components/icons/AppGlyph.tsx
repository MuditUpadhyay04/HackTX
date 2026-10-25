"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { iconSquircleClipPath } from "@/lib/squircle";
import { UnsaidLogo } from "@/components/unsaid/UnsaidLogo";
import type { HomeAppId } from "@/components/home/layout";
import { MessagesGlyph } from "./apps/Messages";
import { PhoneGlyph } from "./apps/Phone";
import { PhotosGlyph } from "./apps/Photos";

/** The Meta apps on the home screen (D8). */
export type MetaAppId = Extract<
  HomeAppId,
  | "facebook"
  | "instagram"
  | "whatsapp"
  | "messenger"
  | "threads"
  | "meta-ai"
  | "edits"
  | "meta-horizon"
  | "whatsapp-business"
  | "meta-business-suite"
  | "meta-ads-manager"
  | "messenger-kids"
>;

/**
 * THE switch point for the Meta icons (D9, amended 2026-10-25 by Nick): each Meta app shows its
 * current official App Store icon (1024 px artwork from the iTunes lookup API, stored at 512 px in
 * public/brand/meta/appstore/), full bleed, unmodified, masked only by the iOS squircle.
 */
export const META_ICON_SRC: Record<MetaAppId, string> = {
  facebook: "/brand/meta/appstore/facebook.png",
  instagram: "/brand/meta/appstore/instagram.png",
  whatsapp: "/brand/meta/appstore/whatsapp.png",
  messenger: "/brand/meta/appstore/messenger.png",
  threads: "/brand/meta/appstore/threads.png",
  "meta-ai": "/brand/meta/appstore/meta-ai.png",
  edits: "/brand/meta/appstore/edits.png",
  "meta-horizon": "/brand/meta/appstore/meta-horizon.png",
  "whatsapp-business": "/brand/meta/appstore/whatsapp-business.png",
  "meta-business-suite": "/brand/meta/appstore/meta-business-suite.png",
  "meta-ads-manager": "/brand/meta/appstore/meta-ads-manager.png",
  "messenger-kids": "/brand/meta/appstore/messenger-kids.png",
};

const META_APPS = new Set<string>(Object.keys(META_ICON_SRC));

export function isMetaApp(app: HomeAppId): app is MetaAppId {
  return META_APPS.has(app);
}

/**
 * Drawn Apple look-alikes in the iOS 26 style (D8: Messages, Photos, Phone; never an Apple file),
 * matched side by side to the iOS 26 icons (iosicongallery.com, 2025-10-20).
 */
const APPLE: Partial<Record<HomeAppId, { tile: string; glyph: ReactNode }>> = {
  messages: { tile: "var(--icon-green-fill)", glyph: <MessagesGlyph /> },
  phone: { tile: "var(--icon-green-fill)", glyph: <PhoneGlyph /> },
  photos: { tile: "var(--icon-photos-fill)", glyph: <PhotosGlyph /> },
};

function FullBleed({ src, size }: { src: string; size: number }) {
  return (
    <Tile size={size} background="var(--icon-meta-pending)">
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized
        draggable={false}
        style={{ position: "absolute", inset: 0, width: size, height: size }}
      />
    </Tile>
  );
}

function Tile({ size, background, children, style }: { size: number; background: string; children?: ReactNode; style?: CSSProperties }) {
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
        background,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * An app's icon artwork at `size` pt, masked to the iOS squircle (22.37%, lib/squircle.ts).
 * Un-Said: Gurneal's icon (UnsaidLogo). Meta apps: the official App Store icon (META_ICON_SRC). Apple apps: drawn iOS 26 look-alikes.
 */
export function AppGlyph({ app, size }: { app: HomeAppId; size: number }) {
  if (app === "unsaid") return <UnsaidLogo size={size} label="" />;

  if (isMetaApp(app)) return <FullBleed src={META_ICON_SRC[app]} size={size} />;

  const apple = APPLE[app];
  return <Tile size={size} background={apple?.tile ?? "var(--icon-meta-pending)"}>{apple?.glyph}</Tile>;
}

export default AppGlyph;
