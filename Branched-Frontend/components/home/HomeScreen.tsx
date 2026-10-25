"use client";

import { AppIcon } from "@/components/system/AppIcon";
import { StatusBar } from "@/components/system/StatusBar";
import { HomeDisplayContext } from "@/lib/apps/useOpenApp";
import { AppHost } from "./AppHost";
import { Dock } from "./Dock";
import { HomeWallpaper } from "./HomeWallpaper";
import { GRID_APPS, HOME_INDICATOR, iconRectPt, type HomeAppId, type HomeDisplay } from "./layout";
import { useHomeLayout } from "./useHomeLayout";
import { PageDots } from "./PageDots";
import { CalendarWidget, MusicWidget, PhotosWidget, RemindersWidget, WeatherWidget } from "./Widgets";

export type HomeScreenProps = {
  display: HomeDisplay;
  /** render this icon in its pressed state (static screenshots) */
  pressed?: HomeAppId;
};

/**
 * One One UI home screen filling a display's dp viewport (GEOM.viewport.cover / .inner): wallpaper,
 * status bar, widgets, the icon grid, the page indicator, the dock along the bottom and the gesture
 * handle. Layout: components/home/layout.ts.
 */
export function HomeScreen({ display, pressed }: HomeScreenProps) {
  const L = useHomeLayout(display);
  // the display, for the buttons' app links (lib/apps/registry.tsx)
  return (
    <HomeDisplayContext.Provider value={display}>
      <div
        data-home={display}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: L.width,
          height: L.height,
          overflow: "hidden",
          fontFamily: "var(--font-system)",
          WebkitFontSmoothing: "antialiased",
          userSelect: "none",
        }}
      >
        <HomeWallpaper display={display} />
        <WeatherWidget rect={L.widgets.weather} />
        <CalendarWidget rect={L.widgets.calendar} />
        {L.widgets.photos ? <PhotosWidget rect={L.widgets.photos} /> : null}
        {L.widgets.music ? <MusicWidget rect={L.widgets.music} /> : null}
        {L.widgets.reminders ? <RemindersWidget rect={L.widgets.reminders} /> : null}
        {GRID_APPS.map((app) => {
          const r = iconRectPt(display, app, L);
          return r ? <AppIcon key={app} app={app} x={r.x} y={r.y} pressed={pressed === app} /> : null;
        })}
        <Dock display={display} />
        <PageDots display={display} />
        <StatusBar width={L.width} tone="light" />
        <GestureHandle width={L.width} />
        <AppHost display={display} />
      </div>
    </HomeDisplayContext.Provider>
  );
}

/** The One UI gesture handle at the bottom of the home screen. */
function GestureHandle({ width }: { width: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        left: (width - HOME_INDICATOR.width) / 2,
        bottom: HOME_INDICATOR.bottom,
        width: HOME_INDICATOR.width,
        height: HOME_INDICATOR.height,
        borderRadius: HOME_INDICATOR.radius,
        background: "var(--label-on-dark)",
        opacity: 0.8,
        pointerEvents: "none",
      }}
    />
  );
}

/** The folded cover display's home (the phone launcher). */
export function CoverHome(props: Omit<HomeScreenProps, "display">) {
  return <HomeScreen display="cover" {...props} />;
}

/** The unfolded inner display's home (one home across both halves). */
export function InnerHome(props: Omit<HomeScreenProps, "display">) {
  return <HomeScreen display="inner" {...props} />;
}

export default HomeScreen;
