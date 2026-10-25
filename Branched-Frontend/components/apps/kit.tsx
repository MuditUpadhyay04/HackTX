"use client";

/**
 * components/apps/kit.tsx: the shared shell for the look-alike apps that open on the phone.
 *
 *   <AppFrame display tone>   fills the display, provides the pane size, draws the in-app status bar
 *   useStack(root)            an iOS navigation stack: push slides in from the right, pop slides out,
 *                             the screen underneath parallaxes 30% (UINavigationController)
 *   <StackView stack render>  draws the stack
 *   <Split list detail>       the unfolded inner display: list pane left, detail pane right (iPad-style)
 *
 * Sizes are pt inside the display's viewport (cover 402 x 573, inner 822.5 x 573).
 */
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { STATUS } from "@/components/lookalike/metrics";
import { PaneContext, usePane, type Pane } from "@/components/lookalike/shared/pane";
import { CoverStatusBar } from "@/components/scene/CoverStatusBar";
import { GEOM } from "@/components/device/geometry";
import { useAppStore } from "@/lib/apps/store";
import { usePrefersReducedMotion } from "@/lib/motion";
import type { AppTarget } from "@/lib/apps/registry";

export type Tone = "dark" | "light";

/** iOS push/pop: a critically damped spring close to UIKit's 0.35 s curve. */
const PUSH = { type: "spring", stiffness: 420, damping: 44, mass: 1 } as const;

/** The list pane on the inner display (iPad Messages / WhatsApp sidebar width). */
export const SPLIT_LIST_WIDTH = 330;

export function AppFrame({
  display,
  tone = "dark",
  background,
  children,
}: {
  display: "cover" | "inner";
  tone?: Tone;
  background: string;
  children: ReactNode;
}) {
  const vp = display === "cover" ? GEOM.viewport.cover : GEOM.viewport.inner;
  const pane = useMemo<Pane>(() => ({ width: vp.width, height: vp.height, display }), [vp.width, vp.height, display]);
  // tell AppHost, so the home indicator over the app matches the status bar
  const setTone = useAppStore((s) => s.setTone);
  useEffect(() => setTone(display, tone), [setTone, display, tone]);
  return (
    <PaneContext.Provider value={pane}>
      <div
        data-app-frame={display}
        data-tone={tone}
        style={{
          position: "absolute",
          inset: 0,
          background,
          overflow: "hidden",
          fontFamily: "var(--font-system)",
          WebkitFontSmoothing: "antialiased",
          color: tone === "dark" ? "var(--ios-label)" : "var(--label-on-dark)",
        }}
      >
        {children}
        <CoverStatusBar tone={tone} />
      </div>
    </PaneContext.Provider>
  );
}

/** Narrows the pane for a column of a split view. */
export function PaneBox({ width, left = 0, children, style }: { width: number; left?: number; children: ReactNode; style?: CSSProperties }) {
  const outer = usePane();
  const pane = useMemo<Pane>(() => ({ ...outer, width }), [outer, width]);
  return (
    <PaneContext.Provider value={pane}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left, width, overflow: "hidden", ...style }}>{children}</div>
    </PaneContext.Provider>
  );
}

/** List left, detail right, a hairline between (the inner display only). */
export function Split({ list, detail, divider = "var(--ios-separator)" }: { list: ReactNode; detail: ReactNode; divider?: string }) {
  const { width } = usePane();
  return (
    <>
      <PaneBox width={SPLIT_LIST_WIDTH} style={{ boxShadow: `inset calc(-1 * var(--hairline)) 0 0 ${divider}`, zIndex: 1 }}>
        {list}
      </PaneBox>
      <PaneBox width={width - SPLIT_LIST_WIDTH} left={SPLIT_LIST_WIDTH}>
        {detail}
      </PaneBox>
    </>
  );
}

// ---------------------------------------------------------------------------
// Navigation stack
// ---------------------------------------------------------------------------

export type Stack<R> = {
  routes: R[];
  top: R;
  push: (r: R) => void;
  pop: () => void;
  /** replace the whole stack (split view: selecting a row in the list) */
  reset: (routes: R[]) => void;
};

/**
 * The app's navigation stack, shared by its cover and inner copies (lib/apps/store.ts `routes`), so
 * the screen you are on survives a fold or unfold. `target` is the app's registry key.
 */
export function useStack<R>(target: AppTarget, root: R): Stack<R> {
  const stored = useAppStore((s) => s.routes[target]) as R[] | undefined;
  const routes = stored && stored.length ? stored : [root];
  const write = useCallback((fn: (r: R[]) => R[]) => {
    const st = useAppStore.getState();
    const cur = (st.routes[target] as R[] | undefined) ?? [root];
    st.setRoutes(target, fn(cur.length ? cur : [root]));
    // the root is a fresh object each render; only its shape matters here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  const push = useCallback((r: R) => write((s) => [...s, r]), [write]);
  const pop = useCallback(() => write((s) => (s.length > 1 ? s.slice(0, -1) : s)), [write]);
  const reset = useCallback((r: R[]) => write(() => r), [write]);
  return { routes, top: routes[routes.length - 1], push, pop, reset };
}

/**
 * Draws a stack: the top screen at 0, the one below parallaxed -30% (and only while the top one
 * slides), everything else unmounted. `keyOf` must be unique per route instance.
 */
export function StackView<R>({ stack, keyOf, render }: { stack: Stack<R>; keyOf: (r: R, i: number) => string; render: (r: R) => ReactNode }) {
  const { width } = usePane();
  const reduced = usePrefersReducedMotion();
  const n = stack.routes.length;
  const visible = stack.routes.map((r, i) => ({ r, i })).slice(Math.max(0, n - 2));
  const transition = reduced ? { duration: 0 } : PUSH;
  return (
    <AnimatePresence initial={false}>
      {visible.map(({ r, i }) => {
        const isTop = i === n - 1;
        return (
          <motion.div
            key={keyOf(r, i)}
            initial={i === 0 ? false : { x: width }}
            animate={{ x: isTop ? 0 : -width * 0.3 }}
            exit={{ x: width, transition }}
            transition={transition}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: i,
              boxShadow: isTop && i > 0 ? "-6px 0 18px var(--ios-push-shadow)" : undefined,
              pointerEvents: isTop ? "auto" : "none",
            }}
          >
            {render(r)}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Small shared pieces
// ---------------------------------------------------------------------------

/** Top inset every app screen leaves for the status bar. */
export const TOP = STATUS.height;

export const resetButton: CSSProperties = {
  appearance: "none",
  border: 0,
  margin: 0,
  padding: 0,
  background: "none",
  font: "inherit",
  color: "inherit",
  textAlign: "inherit",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};

/** A tap target with the iOS dim-on-press (nav bar buttons) or row highlight (lists). */
export function Tap({
  children,
  onPress,
  label,
  style,
  highlight,
}: {
  children: ReactNode;
  onPress?: () => void;
  label?: string;
  style?: CSSProperties;
  /** row highlight color (lists); default: the button dims */
  highlight?: string;
}) {
  const [down, setDown] = useState(false);
  const look: CSSProperties = highlight
    ? { background: down ? highlight : style?.background }
    : { opacity: down ? 0.3 : 1, transition: down ? undefined : "opacity 0.2s ease-out" };
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      onPointerCancel={() => setDown(false)}
      onClick={onPress}
      style={{ ...resetButton, ...style, ...look }}
    >
      {children}
    </button>
  );
}

/** A round avatar from public/mock. */
export function Avatar({ src, size, style }: { src: string; size: number; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} draggable={false} style={{ display: "block", borderRadius: "50%", objectFit: "cover", flexShrink: 0, ...style }} />
  );
}

/** One-line ellipsis text. */
export const ellipsis: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 };

/** A scrolling column that hides its scrollbar (iOS). */
export function Scroll({ children, style, top = 0, bottom = 0 }: { children: ReactNode; style?: CSSProperties; top?: number; bottom?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "none",
        paddingTop: top,
        paddingBottom: bottom,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
