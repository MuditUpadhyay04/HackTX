/**
 * lib/notify.ts: fire a push like iOS does (Phase 2 NOTIFICATION BANNERS, "Code trigger").
 * notify() appends the incoming message to that thread (unless the thread already ends on it),
 * bumps its unread badge and drops the banner on the current display.
 * onBannerTap() registers what a tap does (Phase 2: a route change; Phase 3: the shell).
 */
import { BANNERS, type BannerId, type ThreadId } from "@/lib/mock/threads";
import { messaging } from "@/lib/store/messaging";
import { useBanners, type Banner, type BannerApp } from "@/lib/store/banners";

export type NotifyInput = { app: BannerApp; threadId: ThreadId | null; title: string; body: string };

export function notify(input: NotifyInput): Banner {
  if (input.threadId) {
    const thread = messaging.thread(input.threadId);
    const last = thread.messages[thread.messages.length - 1];
    const already = last && last.from === "them" && last.text === input.body;
    if (already) {
      // the message is already in the seed (Sarah's default thread ends on it): only the badge changes
      if (thread.unread === 0) messaging.get().setUnread(input.threadId, 1);
    } else {
      messaging.get().receive(input.threadId, { kind: "text", text: input.body });
    }
  }
  return useBanners.getState().push(input);
}

/** Fires one of the scripted banners: notifyScripted("sarah"). */
export function notifyScripted(id: BannerId): Banner {
  return notify(BANNERS[id]);
}

type TapHandler = (banner: Banner) => void;
let tapHandler: TapHandler | null = null;

/** Registers the banner-tap behavior; returns an unregister function. */
export function onBannerTap(handler: TapHandler): () => void {
  tapHandler = handler;
  return () => {
    if (tapHandler === handler) tapHandler = null;
  };
}

export function tapBanner(banner: Banner) {
  useBanners.getState().dismiss(banner.key);
  tapHandler?.(banner);
}

/** Route each banner opens (Phase 2: Sarah -> Messages, Michael -> Instagram, Un-Said -> splash). */
export function bannerRoute(banner: Pick<Banner, "app" | "threadId">): string {
  if (banner.app === "unsaid") return "/scene/launch";
  switch (banner.threadId) {
    case "sarah":
      return "/scene/threads/sarah";
    case "michael":
      return "/scene/threads/michael";
    case "mom":
      return "/scene/threads/mom";
    default:
      return "/scene/threads/whatsapp-chats";
  }
}
