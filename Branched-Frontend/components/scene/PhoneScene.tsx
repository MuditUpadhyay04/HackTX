"use client";

import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stage, type StageBackground } from "@/components/stage/Stage";
import { GalaxyFold } from "@/components/device/GalaxyFold";
import { PhoneScreen } from "@/components/system/PhoneScreen";
import type { StaticBanner } from "@/components/system/BannerHost";
import { configureClock } from "@/lib/mock/clock";
import { useFlags } from "@/lib/flags";
import { BANNERS, QUICK_REPLIES, type BannerId } from "@/lib/mock/threads";
import { useMessaging } from "@/lib/store/messaging";
import { useBanners } from "@/lib/store/banners";
import { bannerRoute, notifyScripted, onBannerTap } from "@/lib/notify";

const BACKGROUNDS: StageBackground[] = ["studio", "black", "white", "wallpaper"];
const isBannerId = (v: string | null): v is BannerId => v !== null && v in BANNERS;

/** Kept for later calls UI: the quick replies live in lib/mock/threads.ts. */
export const QUICK_REPLY_COUNT = QUICK_REPLIES.length;

export type PhoneSceneProps = {
  children?: ReactNode;
  statusTone?: "dark" | "light";
  indicatorTone?: "dark" | "light";
  indicator?: boolean;
  /** the folded Duo asleep (state=off) */
  off?: boolean;
};

/**
 * Every Phase 2 app route: the Stage (studio off-white by default, D12; ?bg=black|white) with the
 * folded iPhone Fold, the app screen on its cover display (402 x 573.1 pt, D10).
 *
 * URL: &bg= · &clock=frozen|HH:MM · &reset=1 · &replies=on · &banner=sarah|michael|unsaid
 * &banner-state=in|pressed (a static banner frame) · &notify=sarah|michael|unsaid (fires once after
 * &notify-delay=<ms>, default 600; &at=<ms> is an alias) · &banner-hold=on (no auto-dismiss).
 */
export function PhoneScene({ children, statusTone = "dark", indicatorTone, indicator = true, off = false }: PhoneSceneProps) {
  const params = useSearchParams();
  const flags = useFlags();
  const router = useRouter();
  const rawBg = params.get("bg") as StageBackground | null;
  const bg = rawBg && BACKGROUNDS.includes(rawBg) ? rawBg : "studio";
  const bannerParam = params.get("banner");
  const staticBanner: StaticBanner | null = isBannerId(bannerParam)
    ? { id: bannerParam, state: params.get("banner-state") === "pressed" ? "pressed" : "in" }
    : null;
  const notifyParam = params.get("notify");
  const notifyDelay = Number(params.get("notify-delay") ?? params.get("at") ?? 600);
  const reset = params.get("reset") === "1";
  const replies = params.get("replies") === "on";
  const hold = params.get("banner-hold") === "on";

  useLayoutEffect(() => {
    configureClock(flags.clock);
  }, [flags.clock]);

  useLayoutEffect(() => {
    if (reset) useMessaging.getState().reset();
  }, [reset]);

  useEffect(() => {
    useMessaging.getState().setReplies(replies);
    useBanners.getState().setHold(hold);
  }, [replies, hold]);

  useEffect(() => onBannerTap((b) => router.push(bannerRoute(b))), [router]);

  useEffect(() => {
    if (!isBannerId(notifyParam)) return;
    const id = setTimeout(() => notifyScripted(notifyParam), Number.isFinite(notifyDelay) ? notifyDelay : 600);
    return () => clearTimeout(id);
  }, [notifyParam, notifyDelay]);

  return (
    <Stage background={bg} data-scene="phone">
      <GalaxyFold
        state={off ? "folded-off" : "folded"}
        cover={
          off ? undefined : (
            <PhoneScreen
              statusTone={statusTone}
              indicatorTone={indicatorTone}
              indicator={indicator}
              staticBanner={staticBanner}
            >
              {children}
            </PhoneScreen>
          )
        }
      />
    </Stage>
  );
}
