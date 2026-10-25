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

/** One official Meta file on its tile, composed like the real iOS app icon. */
export type MetaIconArt = {
  /** the official file, unmodified (public/brand/meta/, from assets/brand/meta/; D9) */
  src: string;
  /** the tile behind it (a token sampled from the file; the spec's ig-gradient for Instagram) */
  tile: string;
  /** the artwork's height as a fraction of the tile side (uniform scale only) */
  scale: number;
  /** the file's width / height */
  aspect: number;
};

/**
 * THE switch point for the official Meta icons (D9, docs/RULES.md; assets/brand/meta/README.md).
 * A Meta app with `null` has no official file on Meta's Brand Resource Center and shows the plain
 * pending tile with no logo drawn. Never draw, trace, recolor or crop a Meta logo here: a file is only
 * scaled uniformly and masked by the iOS squircle.
 */
export const META_ICON_SRC: Record<MetaAppId, MetaIconArt | null> = {
  // the blue circle "f" fills the blue tile edge to edge, so the f lands on the tile's bottom edge
  facebook: { src: "/brand/meta/facebook/Facebook_Logo_Primary.png", tile: "var(--icon-facebook-tile)", scale: 1, aspect: 1 },
  instagram: { src: "/brand/meta/instagram/Instagram_Glyph_White.svg", tile: "var(--ig-gradient)", scale: 0.6, aspect: 1 },
  whatsapp: { src: "/brand/meta/whatsapp/Digital_Glyph_White_RGB_2026.svg", tile: "var(--icon-whatsapp-tile)", scale: 0.64, aspect: 1 },
  messenger: { src: "/brand/meta/messenger/Messenger_Icon_Primary_Blue.svg", tile: "var(--icon-messenger-tile)", scale: 0.66, aspect: 1 },
  threads: { src: "/brand/meta/threads/threads-logo-white.svg", tile: "var(--icon-threads-tile)", scale: 0.58, aspect: 976.98 / 1082 },
  "meta-ai": null,
  edits: null,
  "meta-horizon": null,
  "whatsapp-business": null,
  "meta-business-suite": null,
  "meta-ads-manager": null,
  "messenger-kids": null,
};

const META_APPS = new Set<string>(Object.keys(META_ICON_SRC));

export function isMetaApp(app: HomeAppId): app is MetaAppId {
  return META_APPS.has(app);
}

/** Drawn Apple look-alikes (D8/D9: Messages, Photos, Phone; never an Apple file). */
const APPLE: Partial<Record<HomeAppId, { tile: string; glyph: ReactNode }>> = {
  messages: { tile: "var(--icon-green-fill)", glyph: <MessagesGlyph /> },
  phone: { tile: "var(--icon-green-fill)", glyph: <PhoneGlyph /> },
  photos: { tile: "var(--icon-photos-fill)", glyph: <PhotosGlyph /> },
};

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
 * Un-Said: Gurneal's icon (UnsaidLogo). Meta apps: the official file on its tile (META_ICON_SRC), or
 * the plain pending tile. Apple apps: drawn look-alikes.
 */
export function AppGlyph({ app, size }: { app: HomeAppId; size: number }) {
  if (app === "unsaid") return <UnsaidLogo size={size} label="" />;

  if (isMetaApp(app)) {
    const art = META_ICON_SRC[app];
    if (!art) return <Tile size={size} background="var(--icon-meta-pending)" />;
    const h = size * art.scale;
    const w = h * art.aspect;
    return (
      <Tile size={size} background={art.tile}>
        <Image
          src={art.src}
          alt=""
          width={w}
          height={h}
          unoptimized
          draggable={false}
          style={{
            position: "absolute",
            left: (size - w) / 2,
            top: (size - h) / 2,
            width: w,
            height: h,
            objectFit: "contain",
          }}
        />
      </Tile>
    );
  }

  const apple = APPLE[app];
  return <Tile size={size} background={apple?.tile ?? "var(--icon-meta-pending)"}>{apple?.glyph}</Tile>;
}

export default AppGlyph;
