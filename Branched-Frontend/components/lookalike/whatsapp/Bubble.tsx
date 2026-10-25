"use client";

import type { ReactNode } from "react";
import { SCREEN, WA } from "@/components/lookalike/metrics";
import type { Receipt } from "@/lib/mock/threads";
import { Ticks } from "./glyphs";

/** The small hook on the first bubble of a run (incoming: top-left; outgoing: top-right). */
function Tail({ mine }: { mine: boolean }) {
  const { width, height } = WA.tail;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 8 13"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        [mine ? "right" : "left"]: -width + 0.5,
        transform: mine ? "scaleX(-1)" : undefined,
        filter: "drop-shadow(0 var(--hairline) 0 var(--ios-separator))",
      }}
    >
      <path d="M8 0H1.6C.4 0-.3 1.3.4 2.3L8 13V0Z" fill={mine ? "var(--wa-bubble-out)" : "var(--wa-bubble-in)"} />
    </svg>
  );
}

export function WaTime({ time, receipt, mine, onMedia }: { time: string; receipt?: Receipt; mine: boolean; onMedia?: boolean }) {
  const read = receipt === "read";
  return (
    <span
      style={{
        position: "absolute",
        right: "var(--space-8)",
        bottom: onMedia ? "var(--space-6)" : "var(--space-4)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        fontSize: WA.timeSize,
        lineHeight: 1,
        color: onMedia ? "var(--label-on-dark)" : "var(--wa-meta)",
        textShadow: onMedia ? "var(--shadow-photo-time)" : undefined,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      {time}
      {mine && receipt ? (
        <span style={{ color: read ? "var(--wa-tick-read)" : onMedia ? "var(--label-on-dark)" : "var(--wa-tick-sent)", display: "flex" }}>
          <Ticks double={receipt !== "sent" && receipt !== "sending"} width={WA.tick.width} height={WA.tick.height} />
        </span>
      ) : null}
    </span>
  );
}

export type BubbleProps = {
  mine: boolean;
  tail: boolean;
  time: string;
  receipt?: Receipt;
  children: ReactNode;
  /** media bubbles hug their content with a 3 pt frame */
  media?: boolean;
  width?: number;
};

/**
 * WhatsApp bubble (Phase 2 CHROME SPECS): incoming white / outgoing #D9FDD3, 16.5 pt text, radius 8,
 * a tail on the first bubble of each run, the time inside at the bottom right (11 pt) and the
 * double tick on his.
 */
export function Bubble({ mine, tail, time, receipt, children, media, width }: BubbleProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: mine ? "flex-end" : "flex-start",
        paddingInline: WA.bubbleSideInset,
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: SCREEN.width * WA.bubbleMax,
          width,
          background: mine ? "var(--wa-bubble-out)" : "var(--wa-bubble-in)",
          borderRadius: WA.bubbleRadius,
          borderTopLeftRadius: tail && !mine ? 0 : WA.bubbleRadius,
          borderTopRightRadius: tail && mine ? 0 : WA.bubbleRadius,
          boxShadow: "var(--shadow-wa-bubble)",
          padding: media ? WA.photo.inset : `${WA.bubblePadTop}px ${WA.bubblePadX}px ${WA.bubblePadBottom}px`,
          color: "var(--ios-label)",
          fontSize: WA.bubbleText,
          lineHeight: `${WA.bubbleLine}px`,
          letterSpacing: "var(--type-body-tracking)",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {tail ? <Tail mine={mine} /> : null}
        {children}
        {media ? null : (
          <span aria-hidden="true" style={{ display: "inline-block", width: mine ? WA.timeSpacerMine : WA.timeSpacer }} />
        )}
        <WaTime time={time} receipt={receipt} mine={mine} onMedia={media} />
      </div>
    </div>
  );
}
