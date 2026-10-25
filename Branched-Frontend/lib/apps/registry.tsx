/**
 * lib/apps/registry.tsx: THE place to link every home-screen button to an app.
 *
 * Two tables, one per display: `cover` (the outer screen, folded) and `inner` (the unfolded screen).
 * Every button on each has an entry: the grid and dock app icons (HomeAppId), the widgets
 * ("widget-weather", ...) and the Search button ("search"). Swap ExampleApp for your component:
 *
 *   import { MyInstagram } from "@/components/apps/MyInstagram";
 *   inner: { ...DEFAULTS, instagram: MyInstagram }
 *
 * Set an entry to `null` to make that button show the "concept only" toast instead.
 * The component fills the whole display (cover 402 x 573 pt, inner 822.5 x 573 pt).
 */
import type { ComponentType } from "react";
import { APP_NAMES, type HomeAppId, type HomeDisplay } from "@/components/home/layout";
import { ExampleApp } from "@/components/apps/ExampleApp";

export type WidgetTarget = "widget-weather" | "widget-calendar" | "widget-photos" | "widget-music" | "widget-reminders";
export type AppTarget = HomeAppId | WidgetTarget | "search";

export type AppScreenProps = {
  /** the button that opened it */
  target: AppTarget;
  display: HomeDisplay;
  /** go back to the home screen */
  close: () => void;
};

type Screen = ComponentType<AppScreenProps> | null;

export const TARGET_NAMES: Record<AppTarget, string> = {
  ...APP_NAMES,
  "widget-weather": "Weather",
  "widget-calendar": "Calendar",
  "widget-photos": "Photos widget",
  "widget-music": "Music",
  "widget-reminders": "Reminders",
  search: "Search",
};

const ALL = Object.keys(TARGET_NAMES) as AppTarget[];
const DEFAULTS = Object.fromEntries(ALL.map((t) => [t, ExampleApp])) as Record<AppTarget, Screen>;

export const APP_SCREENS: Record<HomeDisplay, Record<AppTarget, Screen>> = {
  // ---- outer (cover) screen ----
  cover: {
    ...DEFAULTS,
    // facebook: MyFacebook,
  },
  // ---- inner (unfolded) screen ----
  inner: {
    ...DEFAULTS,
    // facebook: MyFacebook,
  },
};

export function appScreen(target: AppTarget, display: HomeDisplay): Screen | undefined {
  return APP_SCREENS[display][target];
}
