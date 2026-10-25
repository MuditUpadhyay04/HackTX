"use client";

import { CARET } from "@/components/lookalike/metrics";
import { useFlags } from "@/lib/flags";

/**
 * The iOS text caret: a 2 pt bar in the app's tint, blinking 500 ms on / 500 ms off
 * (caret-blink, section 4.4). ?caret=static keeps it on for screenshots.
 */
export function Caret({ tint, height = CARET.height }: { tint: string; height?: number }) {
  const { caret } = useFlags();
  return (
    <span
      aria-hidden="true"
      data-caret=""
      style={{
        display: "inline-block",
        width: CARET.width,
        height,
        marginLeft: CARET.width / 2,
        marginRight: -CARET.width,
        verticalAlign: "middle",
        borderRadius: CARET.width / 2,
        background: tint,
        animation: caret === "static" ? undefined : "ui-caret-blink calc(var(--motion-caret-on) + var(--motion-caret-off)) steps(1, end) infinite",
      }}
    />
  );
}

/** The keyframes the caret uses (mounted once per screen). */
export function CaretKeyframes() {
  return <style>{`@keyframes ui-caret-blink { 0% { opacity: 1; } 50% { opacity: 0; } }`}</style>;
}
