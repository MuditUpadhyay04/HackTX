import { ICON_RADIUS_RATIO, squirclePath } from "@/lib/squircle";

/**
 * Phone look-alike (drawn; never an Apple file), iOS 26 style on a 60-unit grid. The frosted white handset (white at the earpiece fading to pale green at the mouthpiece) over the green tile gradient, and the glass rim.
 * Silhouette, frost gradient, bright glass edge and soft contact shadow were fitted by pixel-diff
 * against the iOS 26 icon at 1024 px (/workspace/icon-audit/apple3).
 */
/** The tile outline (the same continuous-corner squircle the icon is masked to). */
const TILE = squirclePath(60, 60, 60 * ICON_RADIUS_RATIO);

const D =
  "M12.59 13.05 L11.92 13.92 L11.40 14.97 L11.14 15.79 L10.93 17.08 L10.93 18.60 L11.15 20.13 L11.53 21.71 L11.99 23.06 L12.73 24.81 L13.43 26.22 L14.57 28.21 L15.92 30.26 L17.52 32.43 L19.23 34.53 L22.35 37.86 L23.64 39.11 L26.10 41.29 L28.10 42.89 L30.26 44.44 L31.73 45.39 L33.84 46.59 L35.48 47.39 L37.00 48.02 L38.70 48.57 L40.22 48.91 L41.46 49.07 L42.74 49.07 L43.86 48.92 L44.68 48.70 L45.44 48.40 L46.49 47.76 L47.31 47.02 L47.79 46.44 L48.28 45.67 L48.90 44.38 L49.05 43.86 L49.07 43.27 L48.90 42.57 L48.64 42.10 L48.13 41.60 L41.04 37.12 L40.34 36.77 L39.81 36.63 L39.11 36.59 L38.29 36.77 L35.13 38.37 L34.31 38.68 L33.49 38.76 L32.96 38.68 L32.43 38.49 L31.73 38.07 L29.97 36.66 L27.08 34.04 L24.87 31.76 L22.86 29.44 L21.93 28.27 L21.63 27.80 L21.32 27.04 L21.24 26.28 L21.33 25.69 L21.63 24.87 L23.08 22.06 L23.28 21.53 L23.41 20.89 L23.32 19.95 L23.02 19.19 L18.95 12.63 L18.51 11.98 L18.02 11.43 L17.55 11.13 L17.02 10.96 L16.20 10.93 L15.85 11.00 L15.21 11.25 L13.86 11.99 L13.33 12.37Z";

export function PhoneGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="phone-glyph" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFEFF" />
          <stop offset="0.1" stopColor="#FFFEFF" />
          <stop offset="0.2" stopColor="#FCFEFD" />
          <stop offset="0.3" stopColor="#F6FEF7" />
          <stop offset="0.4" stopColor="#EDFEF2" />
          <stop offset="0.5" stopColor="#E2FCE6" />
          <stop offset="0.6" stopColor="#D6F9DC" />
          <stop offset="0.7" stopColor="#CBF6D3" />
          <stop offset="0.8" stopColor="#B6EDC0" />
          <stop offset="0.9" stopColor="#A6E7AF" />
          <stop offset="1" stopColor="#A6E7AF" />
        </linearGradient>
        <linearGradient id="phone-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.7" />
        </linearGradient>
        <clipPath id="phone-clip">
          <path d={D} />
        </clipPath>
        <filter id="phone-edge-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.28" />
        </filter>
        <filter id="phone-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>
      <path d={D} fill="#0A6B1E" fillOpacity="0.16" transform="translate(0 0.45)" filter="url(#phone-shadow)" />
      <path d={D} fill="url(#phone-glyph)" />
      <g clipPath="url(#phone-clip)">
        <path d={D} fill="none" stroke="url(#phone-edge)" strokeWidth="1.9" filter="url(#phone-edge-blur)" />
      </g>
      <path d={D} fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.22" />
      <defs>
        <linearGradient id="phone-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.25" />
        </linearGradient>
        <filter id="phone-rim-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
      <path d={TILE} fill="none" stroke="url(#phone-rim)" strokeWidth="2.2" filter="url(#phone-rim-blur)" />
    </svg>
  );
}
