/**
 * lib/motion.ts: phone and opening motion (CLAUDE_PROMPT.md section 4.4). Use these by name.
 * Springs are Framer Motion transitions ({ type: "spring", stiffness, damping, mass }); the same
 * numbers drive Remotion's spring({ config }).
 *
 * App-UI-Final's own springs are NOT the phone's springs (its spring-banner is 300/30, the phone's
 * is 420/34). They are exposed only as `unMotion`, for the Un-Said splash and the slot placeholder.
 *
 * No "use client" here on purpose: server components import the constants. The hook below is only
 * callable from client components.
 */
import * as React from "react";
import unTheme from "./unsaid-theme.json";

// ---------------------------------------------------------------------------
// Springs (section 4.4)
// ---------------------------------------------------------------------------

/** App open from an icon (Phase 3). */
export const springOpen = { type: "spring", stiffness: 340, damping: 32, mass: 1 } as const;
/** App open from a banner (B13, B20). */
export const springOpenBanner = { type: "spring", stiffness: 320, damping: 32, mass: 1 } as const;
/** App close into its icon; switcher kill. */
export const springClose = { type: "spring", stiffness: 300, damping: 30, mass: 1 } as const;
/** Weak swipes, carousel, app switch. */
export const springSnapback = { type: "spring", stiffness: 400, damping: 35, mass: 1 } as const;
/** Notification banner drop. */
export const springBanner = { type: "spring", stiffness: 420, damping: 34, mass: 1 } as const;
/** Sent bubble rising from the composer (B17, B24). */
export const springSend = { type: "spring", stiffness: 500, damping: 36, mass: 0.8 } as const;
/** The camera pull-back from the black screen (B03). */
export const springPullback = { type: "spring", stiffness: 75, damping: 20, mass: 1.2 } as const;
/** The hinge: fold and unfold (fold control, banner tap, B27). */
export const springUnfold = { type: "spring", stiffness: 120, damping: 22, mass: 1.3 } as const;

export type SpringSpec = { readonly type: "spring"; readonly stiffness: number; readonly damping: number; readonly mass: number };

export const springs = {
  springOpen,
  springOpenBanner,
  springClose,
  springSnapback,
  springBanner,
  springSend,
  springPullback,
  springUnfold,
} as const satisfies Record<string, SpringSpec>;

// ---------------------------------------------------------------------------
// Easings (section 4.4): bezier arrays for Framer Motion, CSS strings for transitions
// ---------------------------------------------------------------------------

/** Fades in, the splash, the cold-open text. */
export const easeSoft = [0.22, 1, 0.36, 1] as const;
/** Keyboard rise (300 ms), press (120 ms), display wake. */
export const easeIos = [0.32, 0.72, 0, 1] as const;
/** Camera drifts, the specular sweep. */
export const easeBreath = [0.45, 0, 0.55, 1] as const;

export const easeSoftCss = "cubic-bezier(0.22, 1, 0.36, 1)";
export const easeIosCss = "cubic-bezier(0.32, 0.72, 0, 1)";
export const easeBreathCss = "cubic-bezier(0.45, 0, 0.55, 1)";

export const easings = {
  easeSoft: { bezier: easeSoft, css: easeSoftCss },
  easeIos: { bezier: easeIos, css: easeIosCss },
  easeBreath: { bezier: easeBreath, css: easeBreathCss },
} as const;

// ---------------------------------------------------------------------------
// Timing (ms)
// ---------------------------------------------------------------------------

/** iOS caret in the host apps: 500 ms on / 500 ms off. */
export const caretBlink = { on: 500, off: 500 } as const;

export const durations = {
  /** keyboard rise, easeIos */
  keyboardRise: 300,
  /** press feedback, easeIos */
  press: 120,
  /** display wake, easeIos */
  displayWake: 400,
  /** reduced motion: crossfade between key states in the opening */
  reducedOpening: 400,
  /** reduced motion: crossfade in the shell */
  reducedShell: 200,
  /** reduced motion: fold control jumps with a crossfade */
  reducedFold: 200,
  /** Un-Said splash hold */
  splashHold: 900,
  /** Un-Said splash -> slot crossfade */
  splashCrossfade: 200,
  /** hinge "click" ripple, CLAUDE_PROMPT.md Phase 1 fold control ("24 pt ... over 220 ms"), easeSoft */
  hingeRipple: 220,
  /** "concept only" toast on screen (section 8.1: 1.6 s) */
  conceptOnly: 1600,
} as const;

/** Seconds, for Framer Motion `duration`. */
export const ms = (value: number): number => value / 1000;

// ---------------------------------------------------------------------------
// App-UI-Final motion (splash and slot placeholder ONLY), parsed from the synced theme
// ---------------------------------------------------------------------------

type UnMotionKey = keyof typeof unTheme.motion;
type CamelCase<S extends string> = S extends `${infer H}-${infer T}` ? `${H}${Capitalize<CamelCase<T>>}` : S;
type UnSpringName = { [K in UnMotionKey]: K extends `spring-${infer N}` ? CamelCase<N> : never }[UnMotionKey];

const camel = (s: string): string => s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

function parseUnMotion(): { springs: Record<UnSpringName, SpringSpec>; durations: Record<string, number> } {
  const springsOut: Record<string, SpringSpec> = {};
  const durationsOut: Record<string, number> = {};
  for (const [key, raw] of Object.entries(unTheme.motion) as Array<[string, string]>) {
    if (key.startsWith("spring-")) {
      const m = /stiffness\s+([\d.]+).*?damping\s+([\d.]+).*?mass\s+([\d.]+)/.exec(raw);
      if (!m) throw new Error(`lib/motion: cannot parse App-UI-Final motion "${key}": "${raw}" (THEME NEEDED)`);
      springsOut[camel(key.slice("spring-".length))] = {
        type: "spring",
        stiffness: Number(m[1]),
        damping: Number(m[2]),
        mass: Number(m[3]),
      };
    } else if (key.startsWith("dur-") || key === "stagger") {
      const m = /^([\d.]+)\s*ms/.exec(raw);
      if (m) durationsOut[camel(key.replace(/^dur-/, ""))] = Number(m[1]);
    }
  }
  return { springs: springsOut as Record<UnSpringName, SpringSpec>, durations: durationsOut };
}

const parsedUn = parseUnMotion();

/** App-UI-Final springs (appOpen, appClose, banner, sheet, press, cardIn, bloom). Splash/slot only. */
export const unMotion = parsedUn.springs;
/** App-UI-Final durations in ms (press, fade, hold, stagger). Splash/slot only. */
export const unDurations = parsedUn.durations;

// ---------------------------------------------------------------------------
// Reduced motion: prefers-reduced-motion OR ?motion=reduced
// ---------------------------------------------------------------------------

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/** Non-hook check (client only; false on the server). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("motion") === "reduced") return true;
  return window.matchMedia(REDUCED_QUERY).matches;
}

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

/** True when the OS asks for reduced motion or the URL has ?motion=reduced. Client components only. */
export function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
