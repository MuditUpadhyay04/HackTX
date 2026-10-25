"use client";

import { KEYBOARD } from "@/components/lookalike/metrics";

/**
 * Samsung Keyboard's key preview: a plain rounded bubble floating just above the pressed key,
 * showing the letter larger. Positioned by the caller inside the pressed key (centered over it).
 */
export function KeyPop({ label, keyWidth, keyHeight }: { label: string; keyWidth: number; keyHeight: number }) {
  const pw = Math.max(KEYBOARD.pop.width, keyWidth + 4);
  return (
    <span
      aria-hidden="true"
      data-key-pop=""
      style={{
        position: "absolute",
        left: (keyWidth - pw) / 2,
        bottom: keyHeight + KEYBOARD.pop.gap,
        width: pw,
        height: KEYBOARD.pop.height,
        borderRadius: KEYBOARD.pop.radius,
        background: "var(--kb-pop-bg)",
        boxShadow: "0 2px 10px var(--kb-pop-shadow)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: KEYBOARD.pop.letterSize,
        color: "var(--kb-label)",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      {label}
    </span>
  );
}
