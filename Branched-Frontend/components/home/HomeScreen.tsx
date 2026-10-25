"use client";

import { AppIcon } from "@/components/ios/AppIcon";
import { StatusBar } from "@/components/ios/StatusBar";
import { Dock } from "./Dock";
import { HomeWallpaper } from "./HomeWallpaper";
import { GRID_APPS, HOME_LAYOUT, iconRectPt, type HomeAppId, type HomeDisplay } from "./layout";
import { PageDots } from "./PageDots";
import { SearchPill } from "./SearchPill";
import { CalendarWidget, PhotosWidget, WeatherWidget } from "./Widgets";

export type HomeScreenProps = {
  display: HomeDisplay;
  /** render this icon in its pressed state (static screenshots) */
  pressed?: HomeAppId;
};

/**
 * One iOS home screen filling a display's pt viewport (GEOM.viewport.cover / .inner):
 * wallpaper, status bar, Weather + Calendar widgets, the icon grid, the vertical dock on the right
 * edge, the Search button bottom-right and the page dots. No home indicator (iOS hides it on the home
 * screen). Layout: components/home/layout.ts.
 */
export function HomeScreen({ display, pressed }: HomeScreenProps) {
  const L = HOME_LAYOUT[display];
  return (
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
      {GRID_APPS.map((app) => {
        const r = iconRectPt(display, app);
        return r ? <AppIcon key={app} app={app} x={r.x} y={r.y} pressed={pressed === app} /> : null;
      })}
      <Dock display={display} />
      <SearchPill display={display} />
      <PageDots display={display} />
      <StatusBar display={display} tone="light" />
    </div>
  );
}

/** The folded cover display's home (iPhone layout). */
export function CoverHome(props: Omit<HomeScreenProps, "display">) {
  return <HomeScreen display="cover" {...props} />;
}

/** The unfolded inner display's home (D8: one continuous iPadOS-style home across both halves). */
export function InnerHome(props: Omit<HomeScreenProps, "display">) {
  return <HomeScreen display="inner" {...props} />;
}

export default HomeScreen;
