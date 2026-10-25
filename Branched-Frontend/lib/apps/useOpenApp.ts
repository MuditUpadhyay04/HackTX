"use client";

import { createContext, useContext, type MouseEvent } from "react";
import type { HomeDisplay } from "@/components/home/layout";
import { appScreen, type AppTarget } from "./registry";
import { useAppStore } from "./store";

/** Which display a home screen is on; HomeScreen provides it so its buttons know. */
export const HomeDisplayContext = createContext<HomeDisplay>("cover");

/**
 * onClick for a home button: opens its registered app on this display (and skips the
 * Placeholder's "concept only" toast); undefined when the button has no app.
 */
export function useOpenApp(target: AppTarget): ((event: MouseEvent<HTMLElement>) => void) | undefined {
  const display = useContext(HomeDisplayContext);
  const openApp = useAppStore((s) => s.openApp);
  if (!appScreen(target, display)) return undefined;
  return (event) => {
    event.preventDefault();
    openApp(target, display);
  };
}
