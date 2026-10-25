"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { foldDevice, useFoldKeys } from "@/lib/device/fold";
import { useFoldStore } from "@/lib/device/store";
import { STAGE_WIDTH } from "@/components/stage/Stage";
import { press, usePrefersReducedMotion } from "@/lib/motion";

/**
 * The Fold / Unfold control (spec Phase 1, FOLD CONTROL). A small iOS-material glass pill on the
 * demo stage, centered below the device at artboard y 1012, 36 pt tall. Part of the stage, not the
 * phone UI: shown by default, hidden with ?frame=bare (the F keys still work), never in /opening.
 *
 * Render it inside <Stage> (artboard units). Click or F toggles; Shift+F jumps (no animation).
 */

/** Spec: artboard y 1012 (the pill's vertical center), horizontally centered on the stage. */
export const FOLD_CONTROL_Y = 1012;

export type FoldControlProps = {
  /** "dark" on black / wallpaper stages, "light" on white. Default: read from the enclosing <Stage>. */
  tone?: "dark" | "light";
  /** Force-hide the pill (the keyboard shortcuts stay on). Default: hidden when the URL has ?frame=bare. */
  hidden?: boolean;
  /** Artboard center; defaults to (960, 1012). */
  x?: number;
  y?: number;
};

function subscribeLocation(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}
const bareSnapshot = () => new URLSearchParams(window.location.search).get("frame") === "bare";
const bareServerSnapshot = () => false;

function HingeGlyph() {
  // Two panels on a spine, drawn at the SF symbol weight of 15 pt semibold text.
  return (
    <svg width={18} height={16} viewBox="0 0 18 16" fill="none" aria-hidden="true" focusable="false">
      <rect x={1.25} y={1.75} width={6.25} height={12.5} rx={1.75} stroke="currentColor" strokeWidth={1.5} />
      <rect x={10.5} y={1.75} width={6.25} height={12.5} rx={1.75} stroke="currentColor" strokeWidth={1.5} />
      <line x1={9} y1={3.5} x2={9} y2={12.5} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

export function FoldControl({ tone, hidden, x = STAGE_WIDTH / 2, y = FOLD_CONTROL_Y }: FoldControlProps) {
  // only `folded` (the label): a per-frame setAngle from the opening must not re-render the pill
  const folded = useFoldStore((s) => s.folded);
  const toggle = foldDevice.toggle;
  const reduced = usePrefersReducedMotion();
  useFoldKeys();

  const bare = useSyncExternalStore(subscribeLocation, bareSnapshot, bareServerSnapshot);
  const isHidden = hidden ?? bare;

  const ref = useRef<HTMLButtonElement>(null);
  const [stageTone, setStageTone] = useState<"dark" | "light">("dark");
  useLayoutEffect(() => {
    if (tone || !ref.current) return;
    const stage = ref.current.closest<HTMLElement>("[data-stage]")?.dataset.stage;
    setStageTone(stage === "white" ? "light" : "dark");
  }, [tone, isHidden]);
  const material = tone ?? stageTone;

  const [down, setDown] = useState(false);

  if (isHidden) return null;

  const label = folded ? "Unfold" : "Fold";
  const dark = material === "dark";

  const style: CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    translate: "-50% -50%",
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-8)",
    height: "var(--space-36)",
    padding: "0 var(--space-16) 0 var(--space-12)",
    margin: 0,
    appearance: "none",
    border: `var(--hairline) solid ${dark ? "var(--material-glass-stroke)" : "var(--ui-separator)"}`,
    borderRadius: "var(--radius-pill)",
    background: dark ? "var(--material-pill-dark)" : "var(--material-pill-light)",
    backdropFilter: "var(--material-pill-filter)",
    WebkitBackdropFilter: "var(--material-pill-filter)",
    color: dark ? "var(--label-on-dark)" : "var(--ui-label)",
    font: "var(--type-subheadline-semibold)",
    letterSpacing: "var(--type-subheadline-tracking)",
    whiteSpace: "nowrap",
    cursor: "pointer",
    touchAction: "manipulation",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    // Press lands in under 100 ms (--motion-press-in); release eases back over --motion-press.
    // Reduced motion keeps the darken and drops the scale. Focus ring: [data-fold-control]:focus-visible.
    scale: down && !reduced ? String(press.scale) : "1",
    filter: down ? `brightness(${press.brightness})` : "brightness(1)",
    transition: `scale ${down ? "var(--motion-press-in)" : "var(--motion-press)"} var(--ease-std), filter ${
      down ? "var(--motion-press-in)" : "var(--motion-press)"
    } var(--ease-std)`,
  };

  return (
    <button
      ref={ref}
      type="button"
      data-action={folded ? "device-unfold" : "device-fold"}
      data-fold-control=""
      aria-keyshortcuts="F"
      style={style}
      onPointerDown={(event) => {
        if (event.button === 0) setDown(true);
      }}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      onPointerCancel={() => setDown(false)}
      onClick={(e) => {
        toggle();
        // don't keep focus after a click: with focus parked here, the next F press (or the slider's
        // arrow keys) flips the browser into keyboard mode and draws the focus ring round the pill
        e.currentTarget.blur();
      }}
    >
      <HingeGlyph />
      <span>{label}</span>
    </button>
  );
}

export default FoldControl;
