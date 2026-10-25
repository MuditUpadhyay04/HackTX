import { GlassRim } from "./Glass";

/**
 * Messages look-alike (drawn; never an Apple file), iOS 26 style on a 60-unit grid: the frosted
 * white speech bubble (white at the top fading to pale green at the bottom, fine bright edge) with
 * its tail at the lower left, over the green tile gradient, and the glass rim.
 */
export function MessagesGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="messages-glyph" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--icon-glyph)" />
          <stop offset="0.5" stopColor="var(--icon-glyph-frost-mid)" />
          <stop offset="1" stopColor="var(--icon-glyph-frost-end)" />
        </linearGradient>
      </defs>
      <path d="M14.2 37.6c.4 3.9-1.1 7.2-3.6 9.3-.3.3-.1.7.3.7 4.2-.1 7.9-1.6 10.4-4.2Z" fill="url(#messages-glyph)" />
      <ellipse
        cx="30.1"
        cy="27.9"
        rx="21.6"
        ry="16.7"
        fill="url(#messages-glyph)"
        stroke="var(--icon-glyph)"
        strokeOpacity="0.7"
        strokeWidth="0.5"
      />
      <GlassRim id="messages" />
    </svg>
  );
}
