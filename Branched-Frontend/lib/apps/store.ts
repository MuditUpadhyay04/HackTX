/**
 * lib/apps/store.ts: which button's app is open (one at a time, like iOS) and the display it was
 * opened from. It stays open through a fold or unfold and shows on whichever display faces the
 * viewer. Buttons call openApp(); the app's own UI (or the home bar) calls closeApp().
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
  openApp: (target: AppTarget, display: HomeDisplay) => void;
  closeApp: () => void;
};

export const useAppStore = create<State>((set) => ({
  open: null,
  tone: { cover: "dark", inner: "dark" },
  setTone: (display, tone) => set((s) => ({ tone: { ...s.tone, [display]: tone } })),
  openApp: (target, display) => set({ open: { target, display } }),
  closeApp: () => set({ open: null }),
}));
