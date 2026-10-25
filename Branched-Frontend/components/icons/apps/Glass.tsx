/**
 * The iOS 26 "Liquid Glass" rim shared by the drawn Apple icons: a soft bright edge just inside the
 * squircle (the tile's mask clips the outside), on a 60-unit grid.
 */
export function GlassRim({ id, tone = "var(--icon-glass-rim)" }: { id: string; tone?: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tone} stopOpacity="0.9" />
          <stop offset="0.5" stopColor={tone} stopOpacity="0.35" />
          <stop offset="1" stopColor={tone} stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <rect x="0.9" y="0.9" width="58.2" height="58.2" rx="13" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1.8" />
    </>
  );
}
