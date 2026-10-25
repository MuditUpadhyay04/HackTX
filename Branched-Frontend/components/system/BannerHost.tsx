"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { BANNER, SCREEN } from "@/components/lookalike/metrics";
import { springBanner, usePrefersReducedMotion, durations, ms, easeSoft } from "@/lib/motion";
import { BANNERS, type BannerId } from "@/lib/mock/threads";
import { useBanners, BANNER_MAX_VISIBLE } from "@/lib/store/banners";
import { tapBanner } from "@/lib/notify";
import { NotificationBanner } from "./NotificationBanner";

export type StaticBanner = { id: BannerId; state: "in" | "pressed" };

/**
 * The banner stack on one display (Phase 2 NOTIFICATION BANNERS): newest on top, up to 3 visible
 * (older ones tuck behind, smaller), then "+N more". A banner drops in on the banner spring, a tap
 * opens its thread (lib/notify onBannerTap), a swipe up dismisses it. `staticBanner` draws one
 * resting banner for the ?banner= screenshot frames.
 */
export function BannerHost({ staticBanner }: { staticBanner?: StaticBanner | null }) {
  const stack = useBanners((s) => s.stack);
  const dismiss = useBanners((s) => s.dismiss);
  const reduced = usePrefersReducedMotion();
  const visible = stack.slice(0, BANNER_MAX_VISIBLE);
  const more = stack.length - visible.length;
  const width = SCREEN.width - 2 * BANNER.sideInset;

  return (
    <div
      data-banner-host=""
      style={{ position: "absolute", left: BANNER.sideInset, top: BANNER.top, width, zIndex: 50, pointerEvents: "none" }}
    >
      {staticBanner ? (
        <div style={{ pointerEvents: "auto" }}>
          <NotificationBanner
            app={BANNERS[staticBanner.id].app}
            title={BANNERS[staticBanner.id].title}
            body={BANNERS[staticBanner.id].body}
            state={staticBanner.state}
          />
        </div>
      ) : null}
      <AnimatePresence initial={false}>
        {visible.map((b, i) => (
          <motion.div
            key={b.key}
            layout={!reduced}
            initial={reduced ? { opacity: 0 } : { y: -160, opacity: 1 }}
            animate={{ y: i * BANNER.stackOffset, scale: 1 - i * BANNER.stackScale, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: -160, opacity: 1 }}
            transition={reduced ? { duration: ms(durations.reducedShell), ease: easeSoft } : springBanner}
            drag={i === 0 ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.9, bottom: 0.15 }}
            onDragEnd={(_e, info: PanInfo) => {
              if (info.offset.y < -BANNER.dismissDistance || info.velocity.y < -400) dismiss(b.key);
            }}
            style={{
              position: i === 0 ? "relative" : "absolute",
              left: 0,
              top: 0,
              width,
              zIndex: BANNER_MAX_VISIBLE - i,
              transformOrigin: "50% 0%",
              pointerEvents: "auto",
            }}
          >
            <NotificationBanner app={b.app} title={b.title} body={b.body} onTap={() => tapBanner(b)} />
          </motion.div>
        ))}
      </AnimatePresence>
      {more > 0 ? (
        <div
          style={{
            marginTop: BANNER.stackOffset * 2,
            textAlign: "center",
            fontSize: BANNER.timeSize,
            fontWeight: 600,
            color: "var(--ui-label-secondary)",
          }}
        >
          +{more} more
        </div>
      ) : null}
    </div>
  );
}
