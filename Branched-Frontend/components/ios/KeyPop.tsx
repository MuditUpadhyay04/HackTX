"use client";

import { KEYBOARD } from "@/components/lookalike/metrics";

/**
 * The iOS key-pop callout: the pressed key grows a wider bulb above itself showing the letter
 * larger. Drawn as one path (bulb, curved neck, the key itself) so the outline is continuous.
 * Positioned by the caller over the pressed key: the box's bottom edge is the key's bottom edge.
 */
export function KeyPop({ label, keyWidth, keyHeight }: { label: string; keyWidth: number; keyHeight: number }) {
  const pw = Math.max(KEYBOARD.pop.width, keyWidth + 2 * KEYBOARD.keyGap);
  const neck = 12;
  const bulb = KEYBOARD.pop.height - keyHeight - neck;
  const ph = bulb + neck + keyHeight;
  const x0 = (pw - keyWidth) / 2;
  const x1 = x0 + keyWidth;
  const r = 9;
  const kr = KEYBOARD.radius;
  const d = [
    `M${r} 0H${pw - r}Q${pw} 0 ${pw} ${r}V${bulb}`,
    `C${pw} ${bulb + neck * 0.55} ${x1} ${bulb + neck * 0.45} ${x1} ${bulb + neck}`,
    `V${ph - kr}Q${x1} ${ph} ${x1 - kr} ${ph}H${x0 + kr}Q${x0} ${ph} ${x0} ${ph - kr}V${bulb + neck}`,
    `C${x0} ${bulb + neck * 0.45} 0 ${bulb + neck * 0.55} 0 ${bulb}V${r}Q0 0 ${r} 0Z`,
  ].join("");
  return (
    <div
      aria-hidden="true"
      data-key-pop=""
      style={{
        position: "absolute",
        left: (keyWidth - pw) / 2,
        bottom: 0,
        width: pw,
        height: ph,
        pointerEvents: "none",
        zIndex: 5,
        filter: "drop-shadow(0 var(--hairline) 0 var(--ios-separator)) drop-shadow(0 var(--space-2) var(--space-4) var(--ios-scrim))",
      }}
    >
      <svg width={pw} height={ph} viewBox={`0 0 ${pw} ${ph}`} style={{ position: "absolute", inset: 0 }}>
        <path d={d} fill="var(--ios-kb-key)" />
      </svg>
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: pw,
          height: bulb,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: KEYBOARD.pop.letterSize,
          fontWeight: 300,
          color: "var(--kb-label)",
        }}
      >
        {label}
      </span>
    </div>
  );
}
