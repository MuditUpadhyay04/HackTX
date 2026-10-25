/**
 * lib/squircle.ts: the rounded shape for every app icon, banner icon and card in this build.
 *
 * One UI draws plain rounded rectangles (circular-arc corners), and its app icons use a large corner,
 * about a third of the side, so they read as a soft squircle.
 *
 * Usage:
 *   squirclePath(w, h, r)          SVG path `d` (absolute user units, origin top-left)
 *   squircleClipPath(w, h, r)      CSS `clip-path: path(...)` value for a box of known size
 *   iconSquircleClipPath(size)     the app-icon mask (r = 34% of the side)
 *   squircleMaskStyle(ratio)       size-independent CSS mask (an SVG data URI scaled to the box)
 */

/** One UI's app-icon corner radius as a fraction of the icon side. */
export const ICON_RADIUS_RATIO = 0.34;

/** Cubic control distance for a quarter circle. */
const ARC = 0.5522847498;

const fmt = (n: number) => String(Math.round(n * 1000) / 1000);

/** SVG path data for a rounded rectangle `w` x `h` with circular corners of radius `r`. */
export function squirclePath(w: number, h: number, r: number): string {
  const R = Math.max(0, Math.min(r, w / 2, h / 2));
  const k = R * (1 - ARC);
  const p = (x: number, y: number) => `${fmt(x)} ${fmt(y)}`;
  return [
    `M${p(R, 0)}`,
    `L${p(w - R, 0)}`,
    `C${p(w - k, 0)} ${p(w, k)} ${p(w, R)}`,
    `L${p(w, h - R)}`,
    `C${p(w, h - k)} ${p(w - k, h)} ${p(w - R, h)}`,
    `L${p(R, h)}`,
    `C${p(k, h)} ${p(0, h - k)} ${p(0, h - R)}`,
    `L${p(0, R)}`,
    `C${p(0, k)} ${p(k, 0)} ${p(R, 0)}`,
    "Z",
  ].join(" ");
}

/** CSS `clip-path` value (`path("...")`) for a box of exactly `w` x `h` CSS pixels. */
export function squircleClipPath(w: number, h: number, r: number): string {
  return `path("${squirclePath(w, h, r)}")`;
}

/** The One UI app-icon shape for a square icon of `size` CSS pixels. */
export function iconSquircleClipPath(size: number): string {
  return squircleClipPath(size, size, size * ICON_RADIUS_RATIO);
}

/**
 * A size-independent rounded mask: the path drawn in a 1000 x 1000 viewBox as an SVG data URI,
 * stretched to the element box. `ratio` is the corner radius as a fraction of the shorter side.
 */
export function squircleMaskStyle(ratio: number = ICON_RADIUS_RATIO): {
  maskImage: string;
  WebkitMaskImage: string;
  maskSize: string;
  WebkitMaskSize: string;
  maskRepeat: string;
  WebkitMaskRepeat: string;
} {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none"><path d="${squirclePath(1000, 1000, 1000 * ratio)}"/></svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };
}
