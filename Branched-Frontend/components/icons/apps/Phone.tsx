/**
 * Galaxy Phone look-alike (drawn) on a 60-unit grid: a white handset tilted on One UI's green tile.
 */
const D =
  "M19.4 14.2c1.1-.1 2.1.5 2.7 1.6l2.9 5.4c.6 1.2.4 2.6-.6 3.5l-1.8 1.7c-.6.6-.7 1.5-.3 2.2 2.2 3.8 5.6 7.2 9.4 9.4.7.4 1.6.3 2.2-.3l1.7-1.8c.9-1 2.3-1.2 3.5-.6l5.4 2.9c1.1.6 1.7 1.6 1.6 2.7-.2 2.1-1.7 4.3-4.3 4.9-3.5.8-9.6-.8-15.8-5.8-6.1-4.9-10.4-11.4-11.6-17.6-.7-3.4.3-6.2 2.1-8.1.9-.8 1.9-1.4 2.9-1.5Z";

export function PhoneGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <path d={D} style={{ fill: "var(--on-accent)" }} />
    </svg>
  );
}
