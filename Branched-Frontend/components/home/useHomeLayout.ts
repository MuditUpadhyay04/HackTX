"use client";

import { useMemo } from "react";
import { useDisplaySize } from "@/lib/device/viewport";
import { HOME_LAYOUT, buildHomeLayout, type HomeDisplay, type HomeLayout } from "./layout";

/** The display's home layout at its current dp size (the device's, or the real screen's on /phone). */
export function useHomeLayout(display: HomeDisplay): HomeLayout {
  const { width, height } = useDisplaySize(display);
  return useMemo(() => {
    const base = HOME_LAYOUT[display];
    return base.width === width && base.height === height ? base : buildHomeLayout(display, width, height);
  }, [display, width, height]);
}
