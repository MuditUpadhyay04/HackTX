import { GlassRim } from "./Glass";

/**
 * Phone look-alike (drawn; never an Apple file), iOS 26 style on a 60-unit grid: the frosted white
 * handset (white at the earpiece fading to pale green at the mouthpiece, with a fine bright edge)
 * over the green tile gradient, and the glass rim.
 */
export function PhoneGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="phone-glyph" x1="0.2" y1="0.1" x2="0.8" y2="0.9">
          <stop offset="0" stopColor="var(--icon-glyph)" />
          <stop offset="0.45" stopColor="var(--icon-glyph-frost-mid)" />
          <stop offset="1" stopColor="var(--icon-glyph-frost-end)" />
        </linearGradient>
      </defs>
      <path
        transform="translate(30 30) scale(1.04) translate(-30 -30)"
        d="M21.3 12.4c1.4-.5 2.9 0 3.7 1.2l3.9 6.1c.8 1.3.6 3-.5 4l-2.8 2.6c-.6.5-.7 1.4-.3 2.1 1.9 3.3 4.5 6 7.8 8 .7.4 1.6.3 2.1-.3l2.6-2.8c1-1.1 2.7-1.3 4-.5l6.1 3.9c1.2.8 1.7 2.3 1.2 3.7l-1.3 3.6c-.8 2.1-2.8 3.5-5.1 3.4-6.9-.4-13.5-3.3-18.6-8.4-5.1-5.1-8-11.7-8.4-18.6-.1-2.3 1.3-4.3 3.4-5.1l2.2-.9Z"
        fill="url(#phone-glyph)"
        stroke="var(--icon-glyph)"
        strokeOpacity="0.7"
        strokeWidth="0.5"
      />
      <GlassRim id="phone" />
    </svg>
  );
}
