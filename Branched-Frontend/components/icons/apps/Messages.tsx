/**
 * Messages look-alike glyph (drawn; never an Apple file): a white speech bubble with a tail at the
 * lower left, on a 60-unit grid. The green tile comes from AppGlyph (homeGradient icon-green-fill).
 */
export function MessagesGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <path
        d="M30 12.6c-12.9 0-23.3 8.3-23.3 18.6 0 5.8 3.3 11 8.6 14.4-.4 2.7-1.8 5.2-3.7 7.1-.3.3-.1.9.3.9 3.8-.1 7.3-1.5 10-3.8 2.6.8 5.3 1.2 8.1 1.2 12.9 0 23.3-8.3 23.3-18.6S42.9 12.6 30 12.6Z"
        fill="var(--icon-glyph)"
      />
    </svg>
  );
}
