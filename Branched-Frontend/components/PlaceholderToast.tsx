"use client";

import type { CSSProperties } from "react";
import { Toaster, toast } from "sonner";
import { useFlags } from "@/lib/flags";
import { durations, prefersReducedMotion } from "@/lib/motion";

/** The app part of a placeholder id (spec 8.1). */
export const PLACEHOLDER_PLATFORMS = [
  "whatsapp",
  "messages",
  "instagram",
  "photos",
  "phone",
  "facebook",
  "meta-ai",
  "oneui",
  "unsaid",
] as const;

export type PlaceholderPlatform = (typeof PLACEHOLDER_PLATFORMS)[number];

/** Spec 8.1: the only toast text. */
export const CONCEPT_ONLY = "concept only";
/** Spec 8.1: 1.6 s. */
export const CONCEPT_ONLY_DURATION = durations.conceptOnly;

const PILL_BASE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  paddingBlock: "var(--space-12)",
  paddingInline: "var(--space-20)",
  whiteSpace: "nowrap",
  pointerEvents: "none",
};

/**
 * Host apps get an Android toast: a compact dark-gray pill with white text (Roboto 14).
 */
const PILL_HOST: CSSProperties = {
  ...PILL_BASE,
  borderRadius: "var(--radius-pill)",
  background: "var(--toast-fill)",
  boxShadow: "var(--shadow-hud)",
  color: "var(--label-on-dark)",
  font: "400 14px/20px var(--font-system)",
};

/**
 * Inside Un-Said (the slot placeholder): App-UI-Final's toast (DESIGN_SPEC 2.7):
 * un-surface-raised, radius 16, un-caption in un-text. No material, no shadow.
 * Bottom-centered like App-UI-Final (Gurneal's decision, P0-R1-11); Android host toasts are bottom-center too.
 */
const PILL_UNSAID: CSSProperties = {
  ...PILL_BASE,
  borderRadius: "var(--un-r-row)",
  background: "var(--un-surface-raised)",
  color: "var(--un-text)",
  font: "var(--un-caption)",
  letterSpacing: "var(--un-caption-tracking)",
};

/** The "concept only" pill itself (also used statically on /test/placeholder). */
export function ConceptOnlyPill({ platform = "oneui" }: { platform?: PlaceholderPlatform }) {
  return (
    <div
      data-concept-toast={platform === "unsaid" ? "unsaid" : "host"}
      role="status"
      style={platform === "unsaid" ? PILL_UNSAID : PILL_HOST}
    >
      {CONCEPT_ONLY}
    </div>
  );
}

/** Sonner's list item: centered across the toaster column, soft ease instead of sonner's `ease`. */
const TOAST_ITEM: CSSProperties = {
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  pointerEvents: "none",
  transitionTimingFunction: "var(--ease-soft)",
};

/**
 * Reduced motion (OS setting or ?motion=reduced): no slide, an opacity crossfade at
 * --motion-reduced-shell. A class + !important rule is needed because sonner's own
 * prefers-reduced-motion block sets `transition: none !important` on every toast.
 */
const REDUCED_CLASS = "concept-only-reduced";
const REDUCED_CSS = `[data-sonner-toast].${REDUCED_CLASS},[data-sonner-toast].${REDUCED_CLASS}[data-mounted="true"]{transform:none !important;transition:opacity var(--motion-reduced-shell) var(--ease-soft) !important;}`;

let seq = 0;

/**
 * Shows the shared "concept only" toast. Never stacks: any toast on screen is
 * dismissed first. The platform picks the styling (Android toast or Un-Said toast).
 */
export function toastConceptOnly(platform: PlaceholderPlatform = "oneui"): void {
  toast.dismiss();
  seq += 1;
  const reduced = prefersReducedMotion();
  toast.custom(() => <ConceptOnlyPill platform={platform} />, {
    id: `concept-only-${seq}`,
    duration: CONCEPT_ONLY_DURATION,
    unstyled: true,
    dismissible: false,
    position: "bottom-center",
    className: reduced ? REDUCED_CLASS : undefined,
    style: TOAST_ITEM,
  });
}

/**
 * The one sonner Toaster (mounted once, in app/layout.tsx, inside <Suspense>).
 * Renders nothing with ?toasts=off.
 */
export function PlaceholderToaster() {
  const { toasts } = useFlags();
  if (!toasts) return null;
  return (
    <>
      <style>{REDUCED_CSS}</style>
      <Toaster
        position="bottom-center"
        offset={{ top: "var(--space-24)", bottom: "var(--space-24)" }}
        mobileOffset={{ top: "var(--space-16)", bottom: "var(--space-16)" }}
        visibleToasts={1}
        gap={0}
        duration={CONCEPT_ONLY_DURATION}
        swipeDirections={[]}
        toastOptions={{ unstyled: true }}
      />
    </>
  );
}
