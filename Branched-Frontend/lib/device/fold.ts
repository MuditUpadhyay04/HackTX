/**
 * lib/device/fold.ts: the hinge driver (spec Phase 1, FOLD CONTROL; section 4.4 spring-unfold).
 *
 *   useFold()          { folded, moving, fold(), unfold(), toggle(), jump(), setAngle(a) }
 *   useDeviceAngle()   the live openAngle as a MotionValue<number>: pass it straight to
 *                      <IPhoneDuo openAngle={...}>; it animates at 60 fps without re-rendering React.
 *   useFoldCrossfade() the reduced-motion crossfade the page renders (null when none).
 *   useFoldKeys()      F toggles, Shift+F jumps (ignored in text fields). FoldControl calls it.
 *   foldDevice         the same actions without React (the opening timeline, the dev panel).
 *   window.__unsaidDevice  the same actions + live angle, in dev/test builds (and ?dev=1).
 *
 * Motion: framer-motion animate(angleValue, target, springUnfold), interruptible: a new command
 * mid-move starts from the current angle with the current velocity (no jump, no restart).
 * Detent: crossing 178 while unfolding / 2 while folding bumps `ripple` (HingeRipple plays).
 * Reduced motion (prefers-reduced-motion or ?motion=reduced): the angle jumps and `crossfade`
 * is set for durations.reducedFold ms so the page can fade the old snapshot out.
 *
 * Client components only (hooks). No "use client" so plain modules can import the types.
 */
import { useEffect, useState } from "react";
import { animate, motionValue, type AnimationPlaybackControlsWithThen, type MotionValue } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { durations, prefersReducedMotion, springUnfold } from "@/lib/motion";
import {
  FOLDED_ANGLE,
  UNFOLDED_ANGLE,
  angleValue,
  isFoldedAngle,
  useFoldStore,
  type FoldCrossfade,
} from "@/lib/device/store";

export { FOLDED_ANGLE, UNFOLDED_ANGLE, useFoldStore, type FoldCrossfade } from "@/lib/device/store";

/** The hinge "click" (spec: as openAngle crosses ~178, or ~2 when folding). */
export const DETENT_UNFOLD = 178;
export const DETENT_FOLD = 2;

// ---------------------------------------------------------------------------
// Driver (module scope: one hinge per page)
// ---------------------------------------------------------------------------

let controls: AnimationPlaybackControlsWithThen | null = null;
let crossfadeTimer: ReturnType<typeof setTimeout> | null = null;
let crossfadeKey = 0;
let driverReady = false;

function stopSpring(): void {
  if (controls) {
    controls.stop();
    controls = null;
  }
}

function clearCrossfade(): void {
  if (crossfadeTimer) {
    clearTimeout(crossfadeTimer);
    crossfadeTimer = null;
  }
}

/** Detent listener + window API, installed once on the client. */
function ensureDriver(): void {
  if (driverReady || typeof window === "undefined") return;
  driverReady = true;

  let previous = angleValue.get();
  angleValue.on("change", (next) => {
    const { target, moving } = useFoldStore.getState();
    if (moving) {
      const unfolding = target > previous;
      if (unfolding && previous < DETENT_UNFOLD && next >= DETENT_UNFOLD) bumpRipple();
      if (!unfolding && previous > DETENT_FOLD && next <= DETENT_FOLD) bumpRipple();
    }
    previous = next;
  });

  installWindowApi();
}

function bumpRipple(): void {
  useFoldStore.setState((s) => ({ ripple: s.ripple + 1 }));
}

/** Springs (or, under reduced motion, crossfade-jumps) the hinge to `target` degrees. */
function moveTo(target: number): void {
  ensureDriver();
  clearCrossfade();
  const from = angleValue.get();

  if (prefersReducedMotion()) {
    stopSpring();
    useFoldStore.setState({ moving: false }); // before the jump: the detent listener must not ripple
    angleValue.jump(target);
    const crossfade: FoldCrossfade = { from, to: target, duration: durations.reducedFold, key: ++crossfadeKey };
    useFoldStore.setState({
      angle: target,
      target,
      folded: isFoldedAngle(target),
      moving: false,
      crossfade: from === target ? null : crossfade,
    });
    if (from !== target) {
      crossfadeTimer = setTimeout(() => {
        crossfadeTimer = null;
        useFoldStore.setState({ crossfade: null });
      }, durations.reducedFold);
    }
    return;
  }

  // Read the velocity BEFORE stopping: a reversal mid-move keeps it (interruptible, no restart).
  const velocity = angleValue.getVelocity();
  stopSpring();
  useFoldStore.setState({ target, folded: isFoldedAngle(target), moving: true, crossfade: null });

  const run = animate(angleValue, target, { ...springUnfold, velocity });
  controls = run;
  run.then(() => {
    if (controls !== run) return; // superseded by a newer move
    controls = null;
    useFoldStore.setState({ angle: angleValue.get(), moving: false });
  });
}

/** Sets the hinge instantly, no animation, no ripple (Shift+F, screenshots, the page's ?state=). */
function jumpTo(angle: number): void {
  ensureDriver();
  stopSpring();
  clearCrossfade();
  useFoldStore.setState({ moving: false }); // before the jump: a jump never ripples
  angleValue.jump(angle);
  useFoldStore.setState({
    angle,
    target: angle,
    folded: isFoldedAngle(angle),
    moving: false,
    crossfade: null,
  });
}

function currentTarget(): number {
  return useFoldStore.getState().target;
}

/** The hinge actions without React. */
export const foldDevice = {
  fold: () => moveTo(FOLDED_ANGLE),
  unfold: () => moveTo(UNFOLDED_ANGLE),
  /** Reverses toward the other end stop from wherever the hinge is now. */
  toggle: () => moveTo(isFoldedAngle(currentTarget()) ? UNFOLDED_ANGLE : FOLDED_ANGLE),
  /** Instantly to the other end stop (Shift+F), or to `folded` when given. */
  jump: (folded?: boolean) => {
    const toFolded = folded ?? !isFoldedAngle(currentTarget());
    jumpTo(toFolded ? FOLDED_ANGLE : UNFOLDED_ANGLE);
  },
  /** Instantly to any angle (the static ?state= snapshots, the opening timeline). */
  setAngle: (angle: number) => jumpTo(angle),
  /** Springs to any angle with spring-unfold. */
  animateTo: (angle: number) => moveTo(angle),
  /** The live openAngle right now. */
  getAngle: () => angleValue.get(),
  /** The MotionValue itself (the opening timeline can drive it frame by frame with .set()). */
  value: angleValue,
} as const;

// ---------------------------------------------------------------------------
// window.__unsaidDevice (dev/test builds, Playwright, ?dev=1)
// ---------------------------------------------------------------------------

/**
 * The shape installed on window. It is a superset of the `{ fold, unfold }` that
 * components/dev/DevPanel.tsx declares on Window, so DevPanel keeps working; scripts cast to this.
 */
export type UnsaidDeviceApi = {
  fold: () => void;
  unfold: () => void;
  toggle: () => void;
  jump: (folded?: boolean) => void;
  setAngle: (angle: number) => void;
  animateTo: (angle: number) => void;
  /** Live openAngle (reads the MotionValue). */
  readonly angle: number;
  readonly target: number;
  readonly folded: boolean;
  readonly moving: boolean;
  /** Detent count so far. */
  readonly ripple: number;
  readonly reducedMotion: boolean;
};

function shouldExposeWindowApi(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (typeof navigator !== "undefined" && navigator.webdriver) return true; // Playwright, fold-check
  const dev = new URLSearchParams(window.location.search).get("dev");
  return dev === "1" || dev === "on" || dev === "true";
}

function installWindowApi(): void {
  if (!shouldExposeWindowApi()) return;
  const api: UnsaidDeviceApi = {
    fold: foldDevice.fold,
    unfold: foldDevice.unfold,
    toggle: foldDevice.toggle,
    jump: foldDevice.jump,
    setAngle: foldDevice.setAngle,
    animateTo: foldDevice.animateTo,
    get angle() {
      return angleValue.get();
    },
    get target() {
      return useFoldStore.getState().target;
    },
    get folded() {
      return useFoldStore.getState().folded;
    },
    get moving() {
      return useFoldStore.getState().moving;
    },
    get ripple() {
      return useFoldStore.getState().ripple;
    },
    get reducedMotion() {
      return prefersReducedMotion();
    },
  };
  window.__unsaidDevice = api;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** No `angle` here: the live openAngle is useDeviceAngle() (a MotionValue, no re-render per frame). */
export type UseFold = {
  /** Folded or folding: label "Unfold". */
  folded: boolean;
  moving: boolean;
  fold: () => void;
  unfold: () => void;
  toggle: () => void;
  jump: (folded?: boolean) => void;
  setAngle: (angle: number) => void;
};

/** The shared hinge state + actions. Re-renders only when folded/moving change, never per frame. */
export function useFold(): UseFold {
  const state = useFoldStore(useShallow((s) => ({ folded: s.folded, moving: s.moving })));
  useEffect(ensureDriver, []);
  return {
    ...state,
    fold: foldDevice.fold,
    unfold: foldDevice.unfold,
    toggle: foldDevice.toggle,
    jump: foldDevice.jump,
    setAngle: foldDevice.setAngle,
  };
}

/**
 * The live openAngle MotionValue for <IPhoneDuo openAngle={useDeviceAngle(initial)}>.
 * `initialAngle` (e.g. STATE_ANGLES[state] from ?state=) is applied on mount and whenever it changes.
 * On the server it returns a fresh MotionValue at `initialAngle` so SSR matches the first client frame.
 */
export function useDeviceAngle(initialAngle?: number): MotionValue<number> {
  const [value] = useState<MotionValue<number>>(() => {
    if (typeof window === "undefined") return motionValue(initialAngle ?? FOLDED_ANGLE);
    // First client render of this mount: set the hinge MotionValue so this render matches SSR; the
    // store catches up in the effect below (no zustand write during render).
    if (initialAngle !== undefined && angleValue.get() !== initialAngle) angleValue.jump(initialAngle);
    return angleValue;
  });

  useEffect(() => {
    ensureDriver();
    if (initialAngle !== undefined && useFoldStore.getState().target !== initialAngle) jumpTo(initialAngle);
  }, [initialAngle]);

  return value;
}

/** The reduced-motion crossfade (null unless a jump happened in the last durations.reducedFold ms). */
export function useFoldCrossfade(): FoldCrossfade | null {
  return useFoldStore((s) => s.crossfade);
}

/** True when the event target is a text field (F is ignored there). */
function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) {
    return !["button", "checkbox", "radio", "range", "reset", "submit", "color", "file", "image"].includes(target.type);
  }
  return false;
}

/** F toggles fold/unfold; Shift+F jumps instantly. Ignored while a text field has focus. */
export function useFoldKeys(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    ensureDriver();
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "KeyF" || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (event.defaultPrevented || isTextField(event.target)) return;
      event.preventDefault();
      if (event.shiftKey) foldDevice.jump();
      else foldDevice.toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
