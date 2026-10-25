"use client";

import {
  createContext,
  useContext,
  useId,
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

/** The artboard every scene is laid out in (spec 4.3, Phase 0 Step 4). */
export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

export type StageBackground = "black" | "un-stage" | "wallpaper" | "white";

/** Letterbox + artboard fill per background (all CSS vars from the token files). */
const FILL: Record<StageBackground, string> = {
  black: "var(--stage-black)",
  "un-stage": "var(--un-stage)",
  wallpaper: "var(--ios-wallpaper-base)",
  white: "var(--stage-white)",
};

export type StageScale = {
  /** Uniform scale from artboard units to window CSS pixels. */
  scale: number;
  /** Window-space position of the artboard's top-left corner. */
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  /** False until the window has been measured (first client frame). */
  ready: boolean;
  /** Window point (e.g. event.clientX/Y) to artboard units. */
  toArtboard: (clientX: number, clientY: number) => { x: number; y: number };
  /** Artboard units to a window point. */
  toWindow: (x: number, y: number) => { x: number; y: number };
};

function fit(viewW: number, viewH: number, ready: boolean): StageScale {
  const scale = Math.min(viewW / STAGE_WIDTH, viewH / STAGE_HEIGHT);
  const offsetX = (viewW - STAGE_WIDTH * scale) / 2;
  const offsetY = (viewH - STAGE_HEIGHT * scale) / 2;
  return {
    scale,
    offsetX,
    offsetY,
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    ready,
    toArtboard: (clientX, clientY) => ({
      x: (clientX - offsetX) / scale,
      y: (clientY - offsetY) / scale,
    }),
    toWindow: (x, y) => ({ x: offsetX + x * scale, y: offsetY + y * scale }),
  };
}

const UNMEASURED = fit(STAGE_WIDTH, STAGE_HEIGHT, false);
const StageScaleContext = createContext<StageScale>(UNMEASURED);

/** Scale + coordinate helpers for children laid out in artboard units. */
export function useStageScale(): StageScale {
  return useContext(StageScaleContext);
}

// Window size as an external store; a string snapshot keeps identity stable.
function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}
const windowSnapshot = () => `${window.innerWidth}x${window.innerHeight}`;
const serverSnapshot = () => null;

export type StageProps = {
  background?: StageBackground;
  children?: ReactNode;
  /** Extra attributes for the artboard, e.g. data-scene. */
  className?: string;
  style?: CSSProperties;
  "data-scene"?: string;
};

/**
 * A fixed 1920x1080 artboard, scaled uniformly to fit the window (transform
 * only), centered and letterboxed with the background fill. Children render
 * in artboard units.
 */
export function Stage({
  background = "black",
  children,
  className,
  style,
  "data-scene": dataScene,
}: StageProps) {
  const size = useSyncExternalStore(subscribe, windowSnapshot, serverSnapshot);

  const value = useMemo(() => {
    if (!size) return UNMEASURED;
    const [w, h] = size.split("x").map(Number);
    return fit(w, h, true);
  }, [size]);

  return (
    <StageScaleContext.Provider value={value}>
      <div
        data-stage={background}
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          background: FILL[background],
        }}
      >
        <div
          data-artboard=""
          data-scene={dataScene}
          className={className}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            overflow: "hidden",
            transformOrigin: "0 0",
            transform: `translate3d(${value.offsetX}px, ${value.offsetY}px, 0) scale(${value.scale})`,
            visibility: value.ready ? "visible" : "hidden",
            background: FILL[background],
            ...style,
          }}
        >
          {background === "wallpaper" ? <Wallpaper variant="stage" /> : null}
          {children}
        </div>
      </div>
    </StageScaleContext.Provider>
  );
}

/**
 * The `ios-wallpaper` token recipe (spec 4.2; Phase 1 build note): base,
 * four radial blobs sampled from Gurneal's icon, the whole layer blurred 80
 * and saturated 1.2, scaled 1.2 so the blur has no edges, plus a 4% noise
 * overlay against banding. Static in Phase 0; Phase 1's device builder refines it.
 */
export function Wallpaper({ variant = "stage" }: { variant?: "stage" }) {
  const noiseId = `wallpaper-noise-${useId().replace(/:/g, "")}`;
  return (
    <div
      aria-hidden="true"
      data-wallpaper={variant}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "var(--ios-wallpaper-base)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "var(--ios-wallpaper)",
          filter: "var(--wallpaper-filter)",
          transform: "scale(var(--wallpaper-scale))",
        }}
      />
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: "var(--wallpaper-noise-opacity)" }}
      >
        <filter id={noiseId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={3}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
      </svg>
    </div>
  );
}
