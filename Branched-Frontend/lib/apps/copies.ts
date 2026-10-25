"use client";

import { createContext } from "react";

/**
 * true inside the phone's inert screen copies: the slices drawn on each half's face so the screen
 * stays visible while the hinge moves (components/device/parts/Screen.tsx FoldContent). They are
 * hidden behind the flat live layers whenever the phone is at rest, so apps skip mounting there
 * except mid-fold (components/home/AppHost.tsx).
 */
export const InertCopyContext = createContext(false);
