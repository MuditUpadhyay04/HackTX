/**
 * Photos look-alike (drawn; never an Apple file) on a 60-unit grid: eight translucent capsule
 * petals in a ring (orange at the top, clockwise) that multiply where they overlap, on the white
 * tile, matched to the clean iOS icon (aroundsketch Apple-App-Icons). The colours are literal
 * values fitted to that icon rather than theme tokens.
 */
const PETALS = ["#F7931E", "#F4D02A", "#A3CB38", "#4DB89B", "#5AA9E6", "#5C5FB5", "#A782C3", "#EE5A5A"] as const;

/** Petal capsule in its own frame: from just off the centre out to the ring's edge, pointing up. */
const W = 13.4;
const R = W / 2;
const Y = -27.2;
const H = 25.4;

export function PhotosGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(30 30)" style={{ isolation: "isolate" }}>
        {PETALS.map((fill, i) => (
          <rect
            key={fill}
            x={-R}
            y={Y}
            width={W}
            height={H}
            rx={R}
            fill={fill}
            fillOpacity="0.88"
            transform={`rotate(${i * 45})`}
            style={{ mixBlendMode: "multiply" }}
          />
        ))}
      </g>
    </svg>
  );
}
