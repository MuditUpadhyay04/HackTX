/**
 * lib/apps/store.ts: which button's app is open, and on which display (one at a time, like iOS).
 * Buttons call openApp(); the app's own UI (or the home bar) calls closeApp().
 */
import { create } from "zustand";
import type { HomeDisplay } from "@/components/home/layout";
import type { AppTarget } from "./registry";

type State = {
  open: { target: AppTarget; display: HomeDisplay } | null;
  openApp: (target: AppTarget, display: HomeDisplay) => void;
  closeApp: () => void;
};

export const useAppStore = create<State>((set) => ({
  open: null,
  openApp: (target, display) => set({ open: { target, display } }),
  closeApp: () => set({ open: null }),
}));
