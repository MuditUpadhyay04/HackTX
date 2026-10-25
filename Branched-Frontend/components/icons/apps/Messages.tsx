/**
 * Messages look-alike (drawn; never an Apple file) on a 60-unit grid: a solid white oval speech
 * bubble with its tail at the lower left over the green tile, matched to the clean iOS icon
 * (aroundsketch Apple-App-Icons).
 */
const D =
  "M30 12.6 C42.4 12.6 52.4 20.1 52.4 29.4 C52.4 38.7 42.4 46.2 30 46.2 C27.4 46.2 24.9 45.9 22.6 45.3 C20.6 47.4 17.6 49.6 14.2 49.9 C13.7 49.9 13.5 49.4 13.9 49.1 C15.7 47.7 16.9 45.6 17.2 43.3 C11.4 40.2 7.6 35.1 7.6 29.4 C7.6 20.1 17.6 12.6 30 12.6 Z";

export function MessagesGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <path d={D} style={{ fill: "var(--on-accent)" }} />
    </svg>
  );
}
