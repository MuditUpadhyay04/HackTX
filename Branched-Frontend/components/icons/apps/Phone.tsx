/**
 * Phone look-alike glyph (drawn; never an Apple file): the white handset on a 60-unit grid, earpiece
 * top-left and mouthpiece bottom-right joined by a curved grip. The green tile comes from AppGlyph.
 */
export function PhoneGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <path
        d="M21.3 12.4c1.4-.5 2.9 0 3.7 1.2l3.9 6.1c.8 1.3.6 3-.5 4l-2.8 2.6c-.6.5-.7 1.4-.3 2.1 1.9 3.3 4.5 6 7.8 8 .7.4 1.6.3 2.1-.3l2.6-2.8c1-1.1 2.7-1.3 4-.5l6.1 3.9c1.2.8 1.7 2.3 1.2 3.7l-1.3 3.6c-.8 2.1-2.8 3.5-5.1 3.4-6.9-.4-13.5-3.3-18.6-8.4-5.1-5.1-8-11.7-8.4-18.6-.1-2.3 1.3-4.3 3.4-5.1l2.2-.9Z"
        fill="var(--icon-glyph)"
      />
    </svg>
  );
}
