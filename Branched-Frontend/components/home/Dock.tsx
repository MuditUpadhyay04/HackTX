"use client";

import { AppIcon } from "@/components/system/AppIcon";
import { DOCK_APPS, ICON, iconRectPt, type HomeDisplay } from "./layout";

/** The One UI dock: four icons in a row along the bottom, no labels and no background. */
export function Dock({ display }: { display: HomeDisplay }) {
  return (
    <>
      {DOCK_APPS.map((app) => {
        const r = iconRectPt(display, app);
        return r ? <AppIcon key={app} app={app} x={r.x} y={r.y} size={ICON.dockSize} showLabel={false} /> : null;
      })}
    </>
  );
}
