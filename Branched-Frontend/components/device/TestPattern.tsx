import { GEOM } from "./geometry";
import { type } from "@/lib/tokens";

/**
 * The /device geometry test pattern (spec Phase 1, /device PAGE; D10 displays): a 1 px grid every
 * 50 pt, the display outline and a size label, drawn in the display's logical pt viewport so the
 * cover and inner geometry can be checked in screenshots. Transparent: the lit screen shows through.
 */
export function TestPattern({ display }: { display: "cover" | "inner" }) {
  const vp = GEOM.viewport[display];
  const { grid, line, labelGap } = GEOM.testPattern;
  const w = Math.round(vp.width * 10) / 10;
  const h = Math.round(vp.height * 10) / 10;
  const xs = Array.from({ length: Math.floor(vp.width / grid) }, (_, i) => (i + 1) * grid);
  const ys = Array.from({ length: Math.floor(vp.height / grid) }, (_, i) => (i + 1) * grid);
  const title = type.title1;
  const caption = type.footnote;

  return (
    <div
      data-test-pattern={display}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, fontFamily: "var(--font-system)", color: "var(--device-test-label)" }}
    >
      <svg width={vp.width} height={vp.height} style={{ position: "absolute", left: 0, top: 0 }}>
        {xs.map((x) => (
          <line key={`x${x}`} x1={x} y1={0} x2={x} y2={vp.height} stroke="var(--device-test-grid)" strokeWidth={line} />
        ))}
        {ys.map((y) => (
          <line key={`y${y}`} x1={0} y1={y} x2={vp.width} y2={y} stroke="var(--device-test-grid)" strokeWidth={line} />
        ))}
        <rect
          x={line / 2}
          y={line / 2}
          width={vp.width - line}
          height={vp.height - line}
          fill="none"
          stroke="var(--device-test-outline)"
          strokeWidth={line}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: labelGap,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: `${title.size}px`,
            lineHeight: `${title.lineHeight}px`,
            letterSpacing: `${title.tracking}px`,
            fontWeight: 700,
          }}
        >
          {display === "cover" ? "COVER" : "INNER"} {w}x{h}pt
        </div>
        <div
          style={{
            fontSize: `${caption.size}px`,
            lineHeight: `${caption.lineHeight}px`,
            letterSpacing: `${caption.tracking}px`,
            opacity: 0.7,
          }}
        >
          grid {grid} pt
        </div>
      </div>
    </div>
  );
}
