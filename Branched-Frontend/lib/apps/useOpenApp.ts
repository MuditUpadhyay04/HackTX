"use client";

import { createContext, useContext, type MouseEvent } from "react";
import type { HomeDisplay } from "@/components/home/layout";
import { appScreen, type AppTarget } from "./registry";
import { useAppStore } from "./store";

/** Which display a home screen is on; HomeScreen provides it so its buttons know. */
export const HomeDisplayContext = createContext<HomeDisplay>("cover");

/**
 * onClick for a home button: opens its registered app on this display. A button with no app
 * (null in lib/apps/registry.tsx) is an empty button: the tap does nothing (no "concept only" toast).
 */
export function useOpenApp(target: AppTarget): (event: MouseEvent<HTMLElement>) => void {
  const display = useContext(HomeDisplayContext);
  const openApp = useAppStore((s) => s.openApp);
  const linked = !!appScreen(target, display);
  return (event) => {
    event.preventDefault();
    if (linked) openApp(target, display);
  };
}
