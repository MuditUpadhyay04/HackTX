"use client";

import { WA } from "@/components/lookalike/metrics";
import { Pressable } from "@/components/lookalike/shared/Pressable";
import { MissedCallGlyph } from "./glyphs";
import { WaTime } from "./Bubble";

/**
 * A missed-call row in the chat (Phase 2 CHROME SPECS): an incoming-side compact bubble with a red
 * phone glyph in a soft red circle, "Missed voice call" (15 semibold), "Tap to call back"
 * (13 secondary), the time at the right. Tapping opens the call action sheet.
 */
export function MissedCallRow({ label, sub, time, tail, onPress }: { label: string; sub: string; time: string; tail: boolean; onPress: () => void }) {
  return (
    <div style={{ display: "flex", paddingInline: WA.bubbleSideInset }}>
      <Pressable
        action="missed-call-sheet"
        feedback="darken"
        onPress={(e) => {
          e.stopPropagation();
          onPress();
        }}
        style={{
          position: "relative",
          width: WA.missed.width,
          display: "flex",
          alignItems: "center",
          gap: "var(--space-10)",
          padding: "var(--space-8) var(--space-10)",
          background: "var(--wa-bubble-in)",
          borderRadius: WA.bubbleRadius,
          borderTopLeftRadius: tail ? 0 : WA.bubbleRadius,
          boxShadow: "var(--shadow-wa-bubble)",
        }}
      >
        {tail ? (
          <svg
            width={WA.tail.width}
            height={WA.tail.height}
            viewBox="0 0 8 13"
            aria-hidden="true"
            style={{ position: "absolute", top: 0, left: -WA.tail.width + 0.5 }}
          >
            <path d="M8 0H1.6C.4 0-.3 1.3.4 2.3L8 13V0Z" fill="var(--wa-bubble-in)" />
          </svg>
        ) : null}
        <span
          style={{
            width: WA.missed.glyph,
            height: WA.missed.glyph,
            borderRadius: "50%",
            background: "var(--wa-missed-glyph-bg)",
            color: "var(--wa-missed-glyph)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MissedCallGlyph size={WA.missed.glyph * 0.6} />
        </span>
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ fontSize: WA.missed.title, fontWeight: 600, lineHeight: "var(--type-subheadline-line-height)", color: "var(--ios-label)", letterSpacing: "var(--type-subheadline-tracking)" }}>
            {label}
          </span>
          <span style={{ fontSize: WA.missed.sub, lineHeight: "var(--type-footnote-line-height)", color: "var(--wa-meta)" }}>
            {sub}
          </span>
        </span>
        <WaTime time={time} mine={false} />
      </Pressable>
    </div>
  );
}
