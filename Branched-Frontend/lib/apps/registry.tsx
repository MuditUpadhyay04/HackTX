/**
 * lib/apps/registry.tsx: THE place to link every button on the phone to an app.
 *
 * APP_SCREENS is ONE table for both displays: a button that exists on the outer (cover) screen and
 * on the inner screen (the same app icon, widget, Search) opens the same app on either. Targets:
 *   - app icons (grid + dock): HomeAppId, e.g. "facebook", "messages", "unsaid"
 *   - widgets: "widget-weather", "widget-calendar", "widget-photos", "widget-music", "widget-reminders"
 *   - the home Search button: "search"
 *   - the hardware buttons: "hw-volume-up", "hw-volume-down", "hw-touch-id", "hw-camera"
 *
 * Link a button by setting its entry to your component:  facebook: MyFacebook,
 * Only if a button should do something different on one display, add it to DISPLAY_OVERRIDES.
 * An entry left `null` is an empty button: tapping it does nothing.
 *
 * An app opened on one display carries over when the phone folds or unfolds (lib/apps/store.ts):
 * the component is told which display it is on (cover 402 x 573 pt, inner 822.5 x 573 pt).
 */
import type { ComponentType } from "react";
import { APP_NAMES, type HomeAppId, type HomeDisplay } from "@/components/home/layout";
import { InstagramApp } from "@/components/apps/instagram/InstagramApp";
import { PhotosApp } from "@/components/apps/photos/PhotosApp";
import { MessagesApp } from "@/components/apps/messages/MessagesApp";
import { WhatsAppApp } from "@/components/apps/whatsapp/WhatsAppApp";

export type WidgetTarget = "widget-weather" | "widget-calendar" | "widget-photos" | "widget-music" | "widget-reminders";
export type HardwareTarget = "hw-volume-up" | "hw-volume-down" | "hw-touch-id" | "hw-camera";
export type AppTarget = HomeAppId | WidgetTarget | HardwareTarget | "search";

export type AppScreenProps = {
  /** the button that opened it */
  target: AppTarget;
  /** the display it is on right now (changes when the phone folds or unfolds with it open) */
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
  "hw-volume-up": "Volume up",
  "hw-volume-down": "Volume down",
  "hw-touch-id": "Touch ID button",
  "hw-camera": "Camera Control",
};

const ALL = Object.keys(TARGET_NAMES) as AppTarget[];
/** Every button starts empty: tapping it does nothing. */
const EMPTY = Object.fromEntries(ALL.map((t) => [t, null])) as Record<AppTarget, Screen>;

/** One app per button, the same on both displays. */
export const APP_SCREENS: Record<AppTarget, Screen> = {
  ...EMPTY,
  // The story's look-alike apps (CLAUDE_PROMPT.md Phase 2)
  whatsapp: WhatsAppApp,
  messages: MessagesApp,
  instagram: InstagramApp,
  photos: PhotosApp,
  // Un-Said: left empty on purpose; link the real app here when it is built.
  unsaid: null,
};

/** Only for a button that should open something different on one display. */
export const DISPLAY_OVERRIDES: Partial<Record<HomeDisplay, Partial<Record<AppTarget, Screen>>>> = {
  cover: {},
  inner: {},
};

export function appScreen(target: AppTarget, display: HomeDisplay): Screen | undefined {
  const override = DISPLAY_OVERRIDES[display];
  return override && target in override ? override[target] : APP_SCREENS[target];
}
