"use client";

import type { CSSProperties } from "react";
import { Placeholder } from "@/components/Placeholder";
import { AppGlyph } from "@/components/icons/AppGlyph";
import { APP_NAMES, ICON, type HomeAppId } from "@/components/home/layout";
import { type as typeScale } from "@/lib/tokens";
import { useOpenApp } from "@/lib/apps/useOpenApp";

const label = typeScale.caption2;

/**
 * A home-screen app icon: the squircle artwork, and (outside the dock) its name under it in 11 pt
 * white with the label shadow, one line, truncated at the tail. Until each app's screen
 * is registered with the shell, a tap is a placeholder (press state + "concept only").
 *
 * `x` / `y` place the icon's top-left in the display's pt viewport.
 */
export function AppIcon({
  app,
  x,
  y,
  size = ICON.size,
  showLabel = true,
  pressed,
}: {
  app: HomeAppId;
  x: number;
  y: number;
  size?: number;
  showLabel?: boolean;
  pressed?: boolean;
}) {
  const name = APP_NAMES[app];
  // opens this icon's app from lib/apps/registry.tsx (for the display it is on)
  const onClick = useOpenApp(app);
  const labelWidth = ICON.pitchX - label.size / 2;
  const button: CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    width: size,
    height: size,
    padding: 0,
    margin: 0,
    border: 0,
    background: "none",
    color: "inherit",
    font: "inherit",
    appearance: "none",
    WebkitTapHighlightColor: "transparent",
    outline: "none",
  };
  return (
    <Placeholder id={`oneui:app-${app}`} pressed={pressed} press="darken">
      <button type="button" aria-label={name} data-app-icon={app} style={button} onClick={onClick}>
        <AppGlyph app={app} size={size} />
        {showLabel ? (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: (size - labelWidth) / 2,
              top: size + ICON.labelGap,
              width: labelWidth,
              fontSize: label.size,
              lineHeight: `${label.lineHeight}px`,
              letterSpacing: label.tracking,
              fontWeight: 500,
              color: "var(--label-on-dark)",
              textShadow: "var(--shadow-icon-label)",
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              pointerEvents: "none",
            }}
          >
            {name}
          </span>
        ) : null}
      </button>
    </Placeholder>
  );
}

export default AppIcon;
