import { ICON_RADIUS_RATIO, squirclePath } from "@/lib/squircle";

/**
 * Messages look-alike (drawn; never an Apple file), iOS 26 style on a 60-unit grid. The frosted white speech bubble (white at the top fading to pale green at the bottom) with its tail at the lower left, over the green tile gradient, and the glass rim.
 * Silhouette, frost gradient, bright glass edge and soft contact shadow were fitted by pixel-diff
 * against the iOS 26 icon at 1024 px (/workspace/icon-audit/apple3).
 */
/** The tile outline (the same continuous-corner squircle the icon is masked to). */
const TILE = squirclePath(60, 60, 60 * ICON_RADIUS_RATIO);

const D =
  "M48.75 19.07 L47.43 17.49 L45.78 15.95 L44.15 14.76 L42.39 13.71 L40.34 12.75 L38.00 11.94 L35.71 11.38 L33.54 11.04 L31.49 10.87 L28.51 10.87 L25.58 11.16 L23.23 11.61 L20.71 12.35 L18.25 13.37 L16.32 14.44 L14.91 15.41 L14.02 16.12 L12.57 17.49 L11.43 18.84 L10.39 20.36 L9.50 22.06 L8.84 23.76 L8.38 25.52 L8.17 26.81 L8.06 28.04 L8.06 29.91 L8.27 31.79 L8.68 33.54 L9.05 34.72 L9.56 35.95 L10.40 37.53 L11.54 39.35 L11.94 40.17 L12.31 41.22 L12.45 42.04 L12.41 43.15 L12.15 44.03 L11.68 44.91 L11.31 45.44 L10.43 46.32 L10.34 46.55 L10.43 46.84 L10.69 47.00 L11.22 47.02 L12.74 46.81 L13.80 46.54 L15.67 45.81 L16.90 45.15 L17.90 44.48 L18.08 44.43 L19.72 45.14 L21.30 45.72 L23.88 46.40 L25.40 46.68 L26.63 46.85 L28.80 47.02 L31.20 47.02 L33.43 46.85 L35.60 46.51 L37.35 46.11 L38.53 45.77 L40.11 45.21 L41.69 44.52 L42.80 43.93 L44.21 43.08 L45.15 42.42 L46.38 41.40 L47.72 40.05 L48.64 38.94 L49.60 37.53 L50.38 36.06 L50.95 34.72 L51.45 33.08 L51.72 31.79 L51.94 29.85 L51.94 28.04 L51.78 26.46 L51.50 24.99 L50.99 23.29 L50.50 22.06 L49.61 20.36Z";

export function MessagesGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="messages-glyph" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.1" stopColor="#FFFFFF" />
          <stop offset="0.2" stopColor="#FAFEFB" />
          <stop offset="0.3" stopColor="#F3FCF4" />
          <stop offset="0.4" stopColor="#ECFBEE" />
          <stop offset="0.5" stopColor="#DFF7E3" />
          <stop offset="0.6" stopColor="#D4F3D8" />
          <stop offset="0.7" stopColor="#C4EFCB" />
          <stop offset="0.8" stopColor="#B4EBBE" />
          <stop offset="0.9" stopColor="#A7E9B1" />
          <stop offset="1" stopColor="#A7E9B1" />
        </linearGradient>
        <linearGradient id="messages-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.7" />
        </linearGradient>
        <clipPath id="messages-clip">
          <path d={D} />
        </clipPath>
        <filter id="messages-edge-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.28" />
        </filter>
        <filter id="messages-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>
      <path d={D} fill="#0A6B1E" fillOpacity="0.16" transform="translate(0 0.45)" filter="url(#messages-shadow)" />
      <path d={D} fill="url(#messages-glyph)" />
      <g clipPath="url(#messages-clip)">
        <path d={D} fill="none" stroke="url(#messages-edge)" strokeWidth="1.9" filter="url(#messages-edge-blur)" />
      </g>
      <path d={D} fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.22" />
      <defs>
        <linearGradient id="messages-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.25" />
        </linearGradient>
        <filter id="messages-rim-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
      <path d={TILE} fill="none" stroke="url(#messages-rim)" strokeWidth="2.2" filter="url(#messages-rim-blur)" />
    </svg>
  );
}
