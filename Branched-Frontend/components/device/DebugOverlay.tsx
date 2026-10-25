import { ARTBOARD, GEOM, punchCenter, type Rect } from "./geometry";
import { STAGE_HEIGHT, STAGE_WIDTH } from "@/components/stage/Stage";
import { type } from "@/lib/tokens";

/**
 * The /device?debug=1 spec overlay (dev only): artboard-pixel rulers along the top and left edges
 * and the box of every main part, labeled with its artboard coordinates, all read from geometry.ts.
 * The boxes are the straight-on views (folded, unfolded, back); angled states show the folded /
 * unfolded footprint they start from.
 */

type Box = { label: string; rect: Rect; alt?: boolean };

const r1 = (n: number) => Math.round(n * 10) / 10;

function punchBox(host: Rect): Rect {
  const c = punchCenter(host.width);
  const d = GEOM.punch.cover.diameter;
  return { x: host.x + c.x - d / 2, y: host.y + c.y - d / 2, width: d, height: d };
}

function buttonBoxes(rightHalfX: number): Box[] {
  const b = GEOM.buttons;
  const top = ARTBOARD.folded.device.y - b.protrude;
  const names = { power: "power", volumeUp: "volume up", volumeDown: "volume down" } as const;
  return (["power", "volumeUp", "volumeDown"] as const).map((name) => ({
    label: names[name],
    alt: true,
    rect: { x: rightHalfX + GEOM.panel.width - b[name].fromOuter - b[name].length, y: top, width: b[name].length, height: b.protrude },
  }));
}

function boxesFor(view: "folded" | "unfolded" | "back"): Box[] {
  if (view === "unfolded") {
    const u = ARTBOARD.unfolded;
    return [
      { label: "left half", rect: u.leftHalf },
      { label: "right half", rect: u.rightHalf },
      { label: "inner display", rect: u.inner, alt: true },
      ...buttonBoxes(u.rightHalf.x),
    ];
  }
  const f = ARTBOARD.folded;
  if (view === "back") {
    const p = GEOM.plateau;
    return [
      { label: "device", rect: f.device },
      { label: "camera plateau", rect: { x: f.device.x + p.x, y: f.device.y + p.y, width: p.width, height: p.height }, alt: true },
    ];
  }
  return [
    { label: "device", rect: f.device },
    { label: "cover display", rect: f.cover, alt: true },
    { label: "punch", rect: punchBox(f.cover), alt: true },
    ...buttonBoxes(f.device.x),
  ];
}

export function DebugOverlay({ view }: { view: "folded" | "unfolded" | "back" }) {
  const d = GEOM.debug;
  const label = type.caption2;
  const xTicks = Array.from({ length: Math.floor(STAGE_WIDTH / d.minorTick) + 1 }, (_, i) => i * d.minorTick);
  const yTicks = Array.from({ length: Math.floor(STAGE_HEIGHT / d.minorTick) + 1 }, (_, i) => i * d.minorTick);
  const textStyle = { fontFamily: "var(--font-system)", fontSize: `${label.size}px`, fill: "var(--device-debug-ruler)" };

  return (
    <svg
      data-debug-overlay={view}
      aria-hidden="true"
      width={STAGE_WIDTH}
      height={STAGE_HEIGHT}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      {xTicks.map((x) => {
        const major = x % d.majorTick === 0;
        return (
          <g key={`x${x}`}>
            <line x1={x} y1={0} x2={x} y2={major ? d.majorLength : d.minorLength} stroke="var(--device-debug-ruler)" strokeWidth={d.line} />
            {major && x > 0 ? (
              <text x={x + d.labelGap} y={d.ruler - d.labelGap} style={textStyle}>
                {x}
              </text>
            ) : null}
          </g>
        );
      })}
      {yTicks.map((y) => {
        const major = y % d.majorTick === 0;
        return (
          <g key={`y${y}`}>
            <line x1={0} y1={y} x2={major ? d.majorLength : d.minorLength} y2={y} stroke="var(--device-debug-ruler)" strokeWidth={d.line} />
            {major && y > 0 ? (
              <text x={d.majorLength + d.labelGap} y={y + label.size / 2} style={textStyle}>
                {y}
              </text>
            ) : null}
          </g>
        );
      })}
      {boxesFor(view).map((b, i) => {
        const stroke = b.alt ? "var(--device-debug-box-alt)" : "var(--device-debug-box)";
        const text = `${b.label} ${r1(b.rect.x)},${r1(b.rect.y)} ${r1(b.rect.width)}x${r1(b.rect.height)}`;
        // labels stack below each box's top-left corner so neighbours never overlap
        const ty = b.rect.y + d.labelPad + label.lineHeight * (1 + (i % 3));
        const ly = b.rect.height < label.lineHeight * 3 ? b.rect.y - d.labelGap - label.lineHeight * (i % 3) : ty;
        return (
          <g key={b.label + i}>
            <rect
              x={b.rect.x + d.line / 2}
              y={b.rect.y + d.line / 2}
              width={b.rect.width - d.line}
              height={b.rect.height - d.line}
              fill="none"
              stroke={stroke}
              strokeWidth={d.line}
            />
            <rect
              x={b.rect.x + d.labelPad - d.labelGap}
              y={ly - label.size}
              width={text.length * label.size * d.charWidth + 2 * d.labelGap}
              height={label.lineHeight}
              fill="var(--device-debug-label-bg)"
            />
            <text x={b.rect.x + d.labelPad} y={ly} style={{ ...textStyle, fill: stroke }}>
              {text}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
