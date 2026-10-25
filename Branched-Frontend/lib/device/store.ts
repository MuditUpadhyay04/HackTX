/**
 * lib/device/store.ts: the one source of truth for the Duo's hinge (spec Phase 1, FOLD CONTROL).
 *
 * Two layers, on purpose:
 *   - `angleValue`: a framer-motion MotionValue<number> holding the LIVE openAngle (0 folded ... 180 flat).
 *     The spring writes it every frame; IPhoneDuo reads it without a React re-render per frame.
 *   - `useFoldStore`: a zustand store with the React-visible state that changes a few times per move
 *     (target, folded, moving, the settled angle, the reduced-motion crossfade).
 *
 * The spring driver, the hooks and window.__unsaidDevice live in lib/device/fold.ts.
 */
import { create } from "zustand";
import { motionValue, type MotionValue } from "framer-motion";

/** Hinge end stops (degrees). */
export const FOLDED_ANGLE = 0;
export const UNFOLDED_ANGLE = 180;

/** A reduced-motion jump: the page renders a snapshot at `from` fading out over `duration` ms. */
export type FoldCrossfade = {
  /** openAngle of the outgoing snapshot. */
  from: number;
  /** openAngle the device jumped to. */
  to: number;
  /** ms (durations.reducedFold). */
  duration: number;
  /** Changes on every jump; use as the React key of the fading snapshot. */
  key: number;
};

export type FoldState = {
  /** Settled openAngle: updated when a move ends, on a jump and on setAngle (NOT every frame). */
  angle: number;
  /** Where the hinge is heading: 0 or 180 (or the angle given to setAngle). */
  target: number;
  /** true while the device is folded or folding (target below 90). Drives the "Unfold"/"Fold" label. */
  folded: boolean;
  /** true while the spring is running. */
  moving: boolean;
  /** Set during a reduced-motion jump, null otherwise. */
  crossfade: FoldCrossfade | null;
};

export const useFoldStore = create<FoldState>(() => ({
  angle: FOLDED_ANGLE,
  target: FOLDED_ANGLE,
  folded: true,
  moving: false,
  crossfade: null,
}));

/** The live openAngle. One per page (client); see fold.ts for the server-safe accessor. */
export const angleValue: MotionValue<number> = motionValue(FOLDED_ANGLE);

/** folded is "closer to 0 than to 180" for any resting angle. */
export function isFoldedAngle(angle: number): boolean {
  return angle < (FOLDED_ANGLE + UNFOLDED_ANGLE) / 2;
}
