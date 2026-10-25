"use client";

import { useFlags } from "@/lib/flags";

/** Spec Phase 0, rule 5: word for word. */
export const CONCEPT_LABEL = "concept mock · not affiliated with Apple or Meta";

/**
 * The concept label, fixed to the window's bottom-left corner (outside the
 * artboard's coordinate space, so it never scales with the stage).
 * Hidden with ?labels=off. Not interactive. Mounted once in app/layout.tsx
 * inside <Suspense>.
 */
export function ConceptLabel() {
  const { labels } = useFlags();
  if (!labels) return null;
  return (
    <p
      data-concept-label=""
      style={{
        position: "fixed",
        left: "var(--space-16)",
        bottom: "var(--space-12)",
        margin: 0,
        zIndex: 2,
        pointerEvents: "none",
        userSelect: "none",
        font: "var(--type-caption-2)",
        letterSpacing: "var(--type-caption-2-tracking)",
        // Low contrast on the dark stages, still legible on the white test stage.
        color: "var(--ios-gray)",
      }}
    >
      {CONCEPT_LABEL}
    </p>
  );
}
