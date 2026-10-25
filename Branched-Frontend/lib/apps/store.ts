/**
 * lib/apps/store.ts: which button's app is open (one at a time, like iOS) and the display it was
 * opened from. It stays open through a fold or unfold and shows on whichever display faces the
 * viewer. Buttons call openApp(); the app's own UI (or the home bar) calls closeApp().
 *
 * `routes` is each open app's navigation stack (what screen you are on: a chat, a call, a photo),
 * shared by the cover and inner copies of the app, so folding or unfolding keeps you where you were.
 * It is cleared when the app closes, so the next launch starts at the app's root.
 */
import { create } from "zustand";
import type { HomeDisplay } from "@/components/home/layout";
import type { AppTarget } from "./registry";

type State = {
  open: { target: AppTarget; display: HomeDisplay } | null;
  /** The open app's status-bar tone on each display (AppFrame reports it; each display runs its own
   *  copy of the app): "light" = drawn light-on-dark, so the home indicator over it turns light too. */
  tone: Record<HomeDisplay, "dark" | "light">;
  setTone: (display: HomeDisplay, tone: "dark" | "light") => void;
  routes: Partial<Record<AppTarget, unknown[]>>;
  setRoutes: (target: AppTarget, routes: unknown[]) => void;
  openApp: (target: AppTarget, display: HomeDisplay) => void;
  closeApp: () => void;
};

export const useAppStore = create<State>((set) => ({
  open: null,
  tone: { cover: "dark", inner: "dark" },
  setTone: (display, tone) => set((s) => ({ tone: { ...s.tone, [display]: tone } })),
  routes: {},
  setRoutes: (target, routes) => set((s) => ({ routes: { ...s.routes, [target]: routes } })),
  openApp: (target, display) => set({ open: { target, display } }),
  closeApp: () => set({ open: null, routes: {} }),
}));
