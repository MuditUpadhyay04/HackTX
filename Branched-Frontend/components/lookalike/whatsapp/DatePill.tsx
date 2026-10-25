import type { ReactNode } from "react";
import { WA } from "@/components/lookalike/metrics";
import { LockGlyph } from "./glyphs";

/** WhatsApp date pill (Phase 2 CHROME SPECS): centered, white 92%, 12.5 medium #54656F, radius 8. */
export function DatePill({ children, system }: { children: ReactNode; system?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingBlock: WA.pillGap, paddingInline: "var(--space-24)" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "flex-start",
          gap: "var(--space-4)",
          maxWidth: "100%",
          padding: `${WA.pillPadY}px ${WA.pillPadX}px`,
          borderRadius: WA.pillRadius,
          background: system ? "var(--wa-system-pill)" : "var(--wa-pill)",
          boxShadow: "var(--shadow-wa-bubble)",
          color: "var(--wa-pill-text)",
          fontSize: WA.pillSize,
          fontWeight: system ? 400 : 500,
          lineHeight: "var(--type-footnote-line-height)",
          textAlign: "center",
        }}
      >
        {system ? <LockGlyph size={WA.pillSize} style={{ marginTop: "var(--space-2)", flexShrink: 0 }} /> : null}
        {children}
      </span>
    </div>
  );
}
