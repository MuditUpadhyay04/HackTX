"use client";

import { createContext, useContext } from "react";
import { SCREEN } from "@/components/lookalike/metrics";

/**
 * The size of the pane a look-alike app is drawn in (pt). On the folded cover display that is the
 * whole 402 x 573 screen; on the unfolded inner display an app splits into a list pane and a detail
 * pane (iPad-style), and each part reads its own width from here instead of SCREEN.
 */
export type Pane = { width: number; height: number; display: "cover" | "inner" };

export const PaneContext = createContext<Pane>({ width: SCREEN.width, height: SCREEN.height, display: "cover" });

export function usePane(): Pane {
  return useContext(PaneContext);
}
