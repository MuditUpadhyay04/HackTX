import { GlassRim } from "./Glass";

/**
 * Photos look-alike (drawn; never an Apple file), iOS 26 style on a 60-unit grid: eight translucent
 * capsule petals in a ring (orange at the top, clockwise), darker where they overlap, each with a
 * fine bright edge, on the soft white-to-grey tile, and the glass rim.
 */
const PETALS = [
  "var(--photos-petal-orange)",
  "var(--photos-petal-yellow)",
  "var(--photos-petal-lime)",
  "var(--photos-petal-green)",
  "var(--photos-petal-blue)",
  "var(--photos-petal-purple)",
  "var(--photos-petal-pink)",
  "var(--photos-petal-red)",
] as const;

export function PhotosGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(30 30)">
        {PETALS.map((fill, i) => (
          <rect
            key={fill}
            x="-6.4"
            y="-23.6"
            width="12.8"
            height="19.4"
            rx="6.4"
            fill={fill}
            fillOpacity="0.95"
            stroke="var(--icon-glyph)"
            strokeOpacity="0.45"
            strokeWidth="0.35"
            transform={`rotate(${i * 45})`}
            style={{ mixBlendMode: "multiply" }}
          />
        ))}
      </g>
      <GlassRim id="photos" />
    </svg>
  );
}
