"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { UnsaidLogo } from "@/components/unsaid/UnsaidLogo";
import type { HomeAppId } from "@/components/home/layout";
import { MessagesGlyph } from "./apps/Messages";
import { PhoneGlyph } from "./apps/Phone";
import { GalleryGlyph } from "./apps/Gallery";

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
 * current official store artwork (stored at 512 px in public/brand/meta/appstore/), full bleed,
 * unmodified, masked only by the One UI icon shape.
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

/** Drawn Android / One UI look-alikes (Phone, Messages, Gallery; never an original file). */
const SYSTEM: Partial<Record<HomeAppId, { tile: string; glyph: ReactNode }>> = {
  messages: { tile: "var(--icon-messages-fill)", glyph: <MessagesGlyph /> },
  phone: { tile: "var(--icon-phone-fill)", glyph: <PhoneGlyph /> },
  photos: { tile: "var(--icon-gallery-fill)", glyph: <GalleryGlyph /> },
};

/** One UI's icon shape: a soft squircle, about a third of the side as corner radius. */
export const ICON_CORNER = 0.34;

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
        borderRadius: size * ICON_CORNER,
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
 * An app's icon artwork at `size` dp, in One UI's icon shape (ICON_CORNER).
 * Un-Said: Gurneal's icon (UnsaidLogo). Meta apps: the official artwork (META_ICON_SRC). Phone, Messages, Gallery: drawn look-alikes.
 */
export function AppGlyph({ app, size }: { app: HomeAppId; size: number }) {
  if (app === "unsaid") return <UnsaidLogo size={size} label="" />;

  if (isMetaApp(app)) return <FullBleed src={META_ICON_SRC[app]} size={size} />;

  const system = SYSTEM[app];
  return <Tile size={size} background={system?.tile ?? "var(--icon-meta-pending)"}>{system?.glyph}</Tile>;
}

export default AppGlyph;
