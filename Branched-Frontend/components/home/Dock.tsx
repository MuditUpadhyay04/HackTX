"use client";

import { AppIcon } from "@/components/ios/AppIcon";
import { DOCK, DOCK_APPS, HOME_LAYOUT, ICON, iconRectPt, type HomeDisplay } from "./layout";

/**
 * The vertical dock on the right edge (D8; the reference's folded and unfolded homes): a Liquid
 * Glass capsule holding four icons without labels. The glass is a translucent fill with a lit edge
 * (no backdrop-filter: the dock rides the moving half during the fold).
 */
export function Dock({ display }: { display: HomeDisplay }) {
  const L = HOME_LAYOUT[display];
  return (
    <>
      <div
        aria-hidden="true"
        data-dock={display}
        style={{
          position: "absolute",
          left: L.railX - DOCK.width / 2,
          top: L.dockTop,
          width: DOCK.width,
          height: DOCK.height,
          borderRadius: DOCK.radius,
          background: "var(--home-glass-sheen), var(--material-glass)",
          boxShadow: "var(--shadow-glass-stroke)",
          pointerEvents: "none",
        }}
      />
      {DOCK_APPS.map((app) => {
        const r = iconRectPt(display, app);
        return r ? <AppIcon key={app} app={app} x={r.x} y={r.y} size={ICON.dockSize} showLabel={false} /> : null;
      })}
    </>
  );
}
