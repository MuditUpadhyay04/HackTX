/**
 * lib/store/banners.ts: the iOS notification banner stack (Phase 2 NOTIFICATION BANNERS).
 * Newest on top, max 3 visible then "+N more", auto-dismiss after 5 s unless held (?banner-hold=on).
 */
import { create } from "zustand";
import type { AppId, ThreadId } from "@/lib/mock/threads";

export type BannerApp = AppId | "unsaid";

export type Banner = {
  key: string;
  app: BannerApp;
  threadId: ThreadId | null;
  title: string;
  body: string;
};

export const BANNER_AUTO_DISMISS = 5000;
export const BANNER_MAX_VISIBLE = 3;

type State = {
  stack: Banner[];
  hold: boolean;
  push: (b: Omit<Banner, "key">) => Banner;
  dismiss: (key: string) => void;
  clear: () => void;
  setHold: (on: boolean) => void;
};

let n = 0;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export const useBanners = create<State>()((set, get) => ({
  stack: [],
  hold: false,
  push: (b) => {
    const banner: Banner = { ...b, key: `banner-${++n}` };
    set((s) => ({ stack: [banner, ...s.stack] }));
    if (!get().hold && typeof window !== "undefined") {
      timers.set(banner.key, setTimeout(() => get().dismiss(banner.key), BANNER_AUTO_DISMISS));
    }
    return banner;
  },
  dismiss: (key) => {
    const t = timers.get(key);
    if (t) clearTimeout(t);
    timers.delete(key);
    set((s) => ({ stack: s.stack.filter((b) => b.key !== key) }));
  },
  clear: () => {
    timers.forEach(clearTimeout);
    timers.clear();
    set({ stack: [] });
  },
  setHold: (on) => set({ hold: on }),
}));
