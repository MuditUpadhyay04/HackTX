/**
 * Photos look-alike glyph (drawn; never an Apple file): eight overlapping translucent petals in a
 * pinwheel on the white tile, on a 60-unit grid.
 */
const PETALS = [
  "var(--photos-petal-orange)",
  "var(--photos-petal-yellow)",
  "var(--photos-petal-lime)",
  "var(--photos-petal-green)",
  "var(--photos-petal-teal)",
  "var(--photos-petal-blue)",
  "var(--photos-petal-purple)",
  "var(--photos-petal-pink)",
] as const;

export function PhotosGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(30 30)">
        {PETALS.map((fill, i) => (
          <rect
            key={fill}
            x="-2"
            y="-23.5"
            width="12.5"
            height="21"
            rx="6.25"
            fill={fill}
            opacity="0.86"
            transform={`rotate(${i * 45})`}
            style={{ mixBlendMode: "multiply" }}
          />
        ))}
      </g>
    </svg>
  );
}
