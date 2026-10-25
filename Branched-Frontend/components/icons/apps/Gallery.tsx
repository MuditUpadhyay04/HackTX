/**
 * Samsung Gallery look-alike (drawn) on a 60-unit grid: a white four-petal flower with a soft
 * center on the pink-red tile.
 */
export function GalleryGlyph() {
  const petal = "M30 30c-6.2-1.6-9.6-6.2-8.8-11.2.6-3.4 3.6-5.8 7-5.4 1 .1 1.8.9 1.8 1.9V30Z";
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      {[0, 90, 180, 270].map((deg) => (
        <path key={deg} d={petal} transform={`rotate(${deg} 30 30)`} style={{ fill: "var(--on-accent)", opacity: deg % 180 === 0 ? 1 : 0.82 }} />
      ))}
      <circle cx="30" cy="30" r="3.2" style={{ fill: "var(--icon-gallery-center)" }} />
    </svg>
  );
}
