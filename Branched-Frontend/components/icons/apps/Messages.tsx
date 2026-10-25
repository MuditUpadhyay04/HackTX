/**
 * Android Messages look-alike (drawn) on a 60-unit grid: a blue speech bubble with a lighter
 * inner fold and two text lines, on a white tile.
 */
export function MessagesGlyph() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <path d="M14 15.5c0-1.9 1.6-3.5 3.5-3.5h25c1.9 0 3.5 1.6 3.5 3.5v20c0 1.9-1.6 3.5-3.5 3.5H26l-8.6 7.6c-.9.8-2.4.2-2.4-1V39h-.5A3.5 3.5 0 0 1 14 35.5v-20Z" style={{ fill: "var(--icon-messages-bubble)" }} />
      <path d="M22 22.5h16M22 29h11" stroke="var(--icon-messages-line)" strokeWidth="3.6" strokeLinecap="round" />
    </svg>
  );
}
