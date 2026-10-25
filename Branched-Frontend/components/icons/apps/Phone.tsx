/**
 * Phone look-alike (drawn; never an Apple file) on a 60-unit grid: a solid white handset with
 * smooth curves over the green tile, matched to the clean iOS icon (aroundsketch Apple-App-Icons).
 */
const D =
  "M16.6 10.8 C18 10.7 19.2 11.5 20 12.9 L23.3 19.1 C24.1 20.7 23.8 22.5 22.5 23.7 L20.6 25.5 C19.9 26.2 19.8 27.2 20.3 28 C23 32.6 27.4 37 32 39.7 C32.8 40.2 33.8 40.1 34.5 39.4 L36.3 37.5 C37.5 36.2 39.3 35.9 40.9 36.7 L47.1 40 C48.5 40.8 49.3 42 49.2 43.4 C49 45.8 47.2 48.5 44.1 49.2 C40 50.1 32.9 48.2 25.7 42.4 C18.6 36.7 12.3 29 10.9 21.8 C10.1 17.8 11.3 14.6 13.4 12.4 C14.3 11.5 15.4 10.9 16.6 10.8 Z";

export function PhoneGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <path d={D} style={{ fill: "var(--on-accent)" }} />
    </svg>
  );
}
