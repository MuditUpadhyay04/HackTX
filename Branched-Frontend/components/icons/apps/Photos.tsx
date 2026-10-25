import { ICON_RADIUS_RATIO, squirclePath } from "@/lib/squircle";

/**
 * Photos look-alike (drawn; never an Apple file), iOS 26 style on a 60-unit grid: eight glossy
 * capsule petals in a ring (orange at the top, clockwise) on the soft white-to-grey tile. Each petal
 * is a saturated fill with a deeper-coloured glass edge and a bright, colour-dodged highlight band
 * just inside it; where neighbours overlap the colour deepens. Colours, petal geometry, rim and
 * overlap tones were fitted by pixel-diff against the iOS 26 icon at 1024 px
 * (/workspace/icon-audit/apple3), so they are literal values rather than theme tokens.
 */
const PETALS = [
  { fill: "#FF8700", overlap: "#E36107" }, // orange (top), and where it overlaps yellow
  { fill: "#FEC200", overlap: "#71890A" }, // yellow / lime
  { fill: "#70C101", overlap: "#058018" }, // lime / green
  { fill: "#36AD77", overlap: "#016986" }, // green / blue
  { fill: "#4E93EB", overlap: "#2D4FBA" }, // blue / purple
  { fill: "#9F7EDF", overlap: "#9822CE" }, // purple / pink
  { fill: "#F157C2", overlap: "#DE1E59" }, // pink / red
  { fill: "#FE535E", overlap: "#E73604" }, // red / orange
] as const;

const W = 13.4;
const Y = -24.1;
const H = 20.5;
const R = W / 2;
/** Inset of the highlight band from the petal edge. */
const HI = 0.45;
/** Width of the deeper-coloured glass edge. */
const EDGE = 0.6;
const TILE = squirclePath(60, 60, 60 * ICON_RADIUS_RATIO);

function Petal(props: React.SVGProps<SVGRectElement>) {
  return <rect x={-R} y={Y} width={W} height={H} rx={R} {...props} />;
}

export function PhotosGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <defs>
        {/* The next petal clockwise, in a petal's rotated frame. */}
        <clipPath id="photos-next-clip">
          <Petal transform="rotate(45)" />
        </clipPath>
        <filter id="photos-petal-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.18" />
        </filter>
        <filter id="photos-rim-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
      <g transform="translate(30 30)">
        {PETALS.map((p, i) => (
          <Petal key={p.fill} transform={`rotate(${i * 45})`} fill={p.fill} />
        ))}
        {PETALS.map((p, i) => (
          <g key={p.fill} transform={`rotate(${i * 45})`} clipPath="url(#photos-next-clip)">
            <Petal fill={p.overlap} />
          </g>
        ))}
        {PETALS.map((p, i) => (
          <g key={p.fill} transform={`rotate(${i * 45})`}>
            <rect
              x={-R + EDGE / 2}
              y={Y + EDGE / 2}
              width={W - EDGE}
              height={H - EDGE}
              rx={R - EDGE / 2}
              fill="none"
              stroke={p.fill}
              strokeOpacity="0.45"
              strokeWidth={EDGE}
              style={{ mixBlendMode: "multiply" }}
            />
            <rect
              x={-R + HI}
              y={Y + HI}
              width={W - 2 * HI}
              height={H - 2 * HI}
              rx={R - HI}
              fill="none"
              stroke="#5A5A5A"
              strokeWidth="0.55"
              filter="url(#photos-petal-blur)"
              style={{ mixBlendMode: "color-dodge" }}
            />
          </g>
        ))}
      </g>
      <path d={TILE} fill="none" stroke="#FFFFFF" strokeOpacity="0.95" strokeWidth="2.2" filter="url(#photos-rim-blur)" />
      <path d={TILE} fill="none" stroke="#000000" strokeOpacity="0.14" strokeWidth="0.45" />
    </svg>
  );
}
