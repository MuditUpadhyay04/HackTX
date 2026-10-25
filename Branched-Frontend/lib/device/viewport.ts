"use client";

/**
 * lib/device/viewport.ts: the dp size of each display, and which display a real screen is.
 *
 * On /device the displays are the Fold's own (GEOM.viewport: cover 384 x 587.2, inner 781 x 587.2).
 * On /phone the mock runs full screen in a real phone's browser, so each display takes the screen's
 * shape: the design width is kept (cover 384 dp, inner 781 dp, so every app lays out as designed) and
 * the height follows the screen's aspect. DisplaySizeProvider sets that; useDisplaySize reads it.
 */
import { createContext, createElement, useContext, type ReactNode } from "react";
import { GEOM } from "@/components/device/geometry";
import type { HomeDisplay } from "@/components/home/layout";

export type DisplaySize = { width: number; height: number };
export type DisplaySizes = Record<HomeDisplay, DisplaySize>;

const DisplaySizeContext = createContext<DisplaySizes | null>(null);

export function DisplaySizeProvider({ sizes, children }: { sizes: DisplaySizes; children: ReactNode }) {
  return createElement(DisplaySizeContext.Provider, { value: sizes }, children);
}

/** The display's dp size: the /phone screen's when inside DisplaySizeProvider, else the device's. */
export function useDisplaySize(display: HomeDisplay): DisplaySize {
  const sizes = useContext(DisplaySizeContext);
  return sizes ? sizes[display] : GEOM.viewport[display];
}

/**
 * Cover or inner, from a real screen's CSS size. A Fold-class cover screen is narrow and tall
 * (about 412 x 915, width/height 0.45); the inner screen is near-square (about 884 x 1000, 0.88); a
 * laptop window is wide. Anything narrower than COVER_MAX_ASPECT is the cover screen.
 */
export const COVER_MAX_ASPECT = 0.65;

export function displayForScreen(width: number, height: number): HomeDisplay {
  return height > 0 && width / height < COVER_MAX_ASPECT ? "cover" : "inner";
}

/** Each display's dp size and CSS scale on a `width` x `height` screen (design width kept). */
export function displaySizesForScreen(width: number, height: number): { sizes: DisplaySizes; scale: Record<HomeDisplay, number> } {
  const fit = (display: HomeDisplay) => {
    const designWidth = GEOM.viewport[display].width;
    const scale = width / designWidth;
    return { size: { width: designWidth, height: height / scale }, scale };
  };
  const cover = fit("cover");
  const inner = fit("inner");
  return { sizes: { cover: cover.size, inner: inner.size }, scale: { cover: cover.scale, inner: inner.scale } };
}
