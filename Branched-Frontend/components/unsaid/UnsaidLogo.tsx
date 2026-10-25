"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { iconSquircleClipPath } from "@/lib/squircle";

/** Gurneal's app icon (1254 x 1254, square; the squircle is applied here, never baked in). */
export const UNSAID_ICON_SRC = "/brand/unsaid-app-icon.png";

/**
 * The fallback glyph: the white rounded opening quote, traced from the PNG on its own
 * 1254-unit grid so the fallback sits exactly where the art's quote sits.
 */
const QUOTE_GLYPH =
  "M480 588C560 600 605 660 605 740C605 830 530 900 432 900C330 900 257 820 257 700" +
  "C257 560 350 430 525 362C560 350 592 370 592 400C592 420 580 432 565 445" +
  "C510 490 470 520 462 560C458 578 466 586 480 588Z";

export type UnsaidLogoProps = {
  /** Side length in pt (CSS px): 64 home icon, 38 banner icon, 120 splash. */
  size: number;
  /** Accessible name. Pass "" when a visible "Un-Said" label sits next to the icon. */
  label?: string;
  className?: string;
  /**
   * Extra styles for the masked tile. The clip-path cuts box-shadow: put shadows
   * (un-shadow-hero) on a parent, or as a `filter: drop-shadow(...)` on a wrapper.
   */
  style?: CSSProperties;
};

export function UnsaidLogo({ size, label = "Un-Said", className, style }: UnsaidLogoProps) {
  const [failed, setFailed] = useState(false);

  const tile: CSSProperties = {
    position: "relative",
    display: "block",
    flexShrink: 0,
    width: size,
    height: size,
    clipPath: iconSquircleClipPath(size),
    overflow: "hidden",
    ...style,
  };

  if (failed) {
    return (
      <span
        className={className}
        role={label ? "img" : undefined}
        aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
        style={{ ...tile, background: "var(--un-icon-gradient)" }}
      >
        <svg
          viewBox="0 0 1254 1254"
          width="100%"
          height="100%"
          aria-hidden
          focusable="false"
          style={{ display: "block", fill: "var(--un-text)" }}
        >
          <path d={QUOTE_GLYPH} />
          <path d={QUOTE_GLYPH} transform="translate(385 0)" />
        </svg>
      </span>
    );
  }

  return (
    <span className={className} aria-hidden={label ? undefined : true} style={tile}>
      <Image
        src={UNSAID_ICON_SRC}
        alt={label}
        width={size}
        height={size}
        draggable={false}
        onError={() => setFailed(true)}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </span>
  );
}

export default UnsaidLogo;
