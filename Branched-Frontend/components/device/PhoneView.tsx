"use client";

import { useLayoutEffect, useSyncExternalStore, type CSSProperties } from "react";
import { CoverHome, InnerHome } from "@/components/home/HomeScreen";
import type { HomeDisplay } from "@/components/home/layout";
import { FOLDED_ANGLE, UNFOLDED_ANGLE, angleValue, useFoldStore } from "@/lib/device/store";
import { DisplaySizeProvider, displayForScreen, displaySizesForScreen } from "@/lib/device/viewport";

/**
 * /phone: "real phone mode". The One UI home, every look-alike app and Un-Said at the full size of the
 * browser window, with no device body, no stage and no controls, for opening the mock in Chrome on a
 * real Galaxy Z Fold (added to the home screen, it runs full screen from app/phone/manifest).
 *
 * The window's shape picks the display: narrow and tall is the cover screen, wide or near-square is
 * the inner screen (lib/device/viewport.ts). It follows resizes live, so folding or unfolding the real
 * phone swaps the layout. Both displays stay mounted (the hidden one inert), like the two screens of
 * the 3D device, and the fold store is set to match, so the open app (lib/apps/store.ts) and its
 * screen carry over and Un-Said's web app is already loaded on the other side.
 */
const DISPLAYS: HomeDisplay[] = ["cover", "inner"];

function subscribe(onChange: () => void): () => void {
  window.addEventListener("resize", onChange);
  window.visualViewport?.addEventListener("resize", onChange);
  screen.orientation?.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    window.visualViewport?.removeEventListener("resize", onChange);
    screen.orientation?.removeEventListener("change", onChange);
  };
}

const windowSize = () => `${window.innerWidth}x${window.innerHeight}`;
const noSize = () => "";

const ROOT: CSSProperties = {
  position: "fixed",
  inset: 0,
  overflow: "hidden",
  background: "var(--stage-black)",
  touchAction: "manipulation",
  overscrollBehavior: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
  WebkitTapHighlightColor: "transparent",
};

export function PhoneView() {
  const raw = useSyncExternalStore(subscribe, windowSize, noSize);
  const [width, height] = raw ? raw.split("x").map(Number) : [0, 0];
  const ready = width > 0 && height > 0;
  const display = displayForScreen(width, height);

  // the apps decide which copy is live from the fold store (AppHost: cover when folded)
  useLayoutEffect(() => {
    if (!ready) return;
    const angle = display === "cover" ? FOLDED_ANGLE : UNFOLDED_ANGLE;
    angleValue.set(angle);
    useFoldStore.setState({ angle, target: angle, folded: display === "cover", moving: false, crossfade: null });
  }, [display, ready]);

  if (!ready) return <div data-phone="" style={ROOT} />;
  const { sizes, scale } = displaySizesForScreen(width, height);

  return (
    <div data-phone={display} style={ROOT}>
      <DisplaySizeProvider sizes={sizes}>
        {DISPLAYS.map((d) => {
          const live = d === display;
          return (
            <div
              key={d}
              data-phone-display={d}
              inert={!live}
              aria-hidden={live ? undefined : true}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: sizes[d].width,
                height: sizes[d].height,
                transform: `scale(${scale[d]})`,
                transformOrigin: "0 0",
                visibility: live ? "visible" : "hidden",
                pointerEvents: live ? "auto" : "none",
              }}
            >
              {d === "cover" ? <CoverHome /> : <InnerHome />}
            </div>
          );
        })}
      </DisplaySizeProvider>
    </div>
  );
}

export default PhoneView;
