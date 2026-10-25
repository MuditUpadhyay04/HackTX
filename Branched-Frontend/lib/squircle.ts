/**
 * lib/squircle.ts: the iOS continuous-corner ("squircle") shape for every app icon,
 * banner icon and card in this build (CLAUDE_PROMPT.md section 5: continuous-corner radii).
 *
 * The outline is Apple's continuous rounded rectangle (the shape UIKit draws for
 * `UIBezierPath(roundedRect:cornerRadius:)` since iOS 7 and SwiftUI's
 * `RoundedRectangle(style: .continuous)`): each corner is a clothoid-like blend of three
 * cubic beziers that starts 1.528 r from the corner instead of r, so the curvature ramps
 * in smoothly instead of jumping like a CSS border-radius arc.
 *
 * Usage:
 *   squirclePath(w, h, r)          SVG path `d` (absolute user units, origin top-left)
 *   squircleClipPath(w, h, r)      CSS `clip-path: path(...)` value for a box of known size
 *   iconSquircleClipPath(size)     the app-icon mask (r = un-r-icon, 22.37% of the side)
 *   squircleMaskStyle(ratio)       size-independent CSS mask (an SVG data URI scaled to the box)
 */
import { un } from "./tokens";

/** Apple's continuous-corner coefficients, as multiples of the corner radius r. */
const K = {
  start: 1.52866483,
  c1: 1.08849323,
  c2: 0.86840689,
  p1x: 0.66993427,
  p1y: 0.065496,
  p2x: 0.63149399,
  p2y: 0.074911,
  c3x: 0.37282392,
  c3y: 0.16905899,
  c4x: 0.16906013,
  c4y: 0.37282401,
  p3x: 0.07491176,
  p3y: 0.63149399,
  c5: 0.86840701,
  c6: 1.08849299,
} as const;

/** The iOS app-icon corner radius as a fraction of the icon side (un-r-icon = "22.37%"). */
export const ICON_RADIUS_RATIO = parseFloat(String(un.radius["un-r-icon"])) / 100;

const fmt = (n: number) => String(Math.round(n * 1000) / 1000);

/**
 * SVG path data for a continuous-corner rectangle `w` x `h` with corner radius `r`.
 * `r` is clamped so the corner blends (1.528 r each) never overlap; past that point
 * the shape approaches a continuous capsule, as UIKit does.
 */
export function squirclePath(w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2 / K.start));
  if (rr === 0) return `M0 0H${fmt(w)}V${fmt(h)}H0Z`;

  // One corner, expressed in a local frame: `a` runs along the incoming edge toward the
  // corner, `b` runs along the outgoing edge away from it. Each corner maps (a, b) to x, y.
  type Map = (a: number, b: number) => [number, number];
  const corner = (m: Map): string => {
    const p = (a: number, b: number) => m(a * rr, b * rr).map(fmt).join(" ");
    return [
      `C${p(K.c1, 0)} ${p(K.c2, 0)} ${p(K.p1x, K.p1y)}`,
      `L${p(K.p2x, K.p2y)}`,
      `C${p(K.c3x, K.c3y)} ${p(K.c4x, K.c4y)} ${p(K.p3x, K.p3y)}`,
      `C${p(0, K.c5)} ${p(0, K.c6)} ${p(0, K.start)}`,
    ].join(" ");
  };

  // a = distance from the corner along the incoming edge, b = distance from the corner
  // along the outgoing edge (both inward).
  const topRight: Map = (a, b) => [w - a, b];
  const bottomRight: Map = (a, b) => [w - b, h - a];
  const bottomLeft: Map = (a, b) => [a, h - b];
  const topLeft: Map = (a, b) => [b, a];

  const s = K.start * rr;
  return [
    `M${fmt(s)} 0`,
    `L${fmt(w - s)} 0`,
    corner(topRight),
    `L${fmt(w)} ${fmt(h - s)}`,
    corner(bottomRight),
    `L${fmt(s)} ${fmt(h)}`,
    corner(bottomLeft),
    `L0 ${fmt(s)}`,
    corner(topLeft),
    "Z",
  ].join(" ");
}

/** CSS `clip-path` value (`path("...")`) for a box of exactly `w` x `h` CSS pixels. */
export function squircleClipPath(w: number, h: number, r: number): string {
  return `path("${squirclePath(w, h, r)}")`;
}

/** The iOS app-icon squircle for a square icon of `size` CSS pixels (r = 22.37% of size). */
export function iconSquircleClipPath(size: number): string {
  return squircleClipPath(size, size, size * ICON_RADIUS_RATIO);
}

/**
 * A size-independent squircle mask: the path drawn in a 1000 x 1000 viewBox as an SVG
 * data URI, stretched to the element box. Use it when the box size is not known in JS
 * (fluid cards); for icons with a known size prefer `iconSquircleClipPath`.
 * `ratio` is the corner radius as a fraction of the shorter side (default: the icon ratio).
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
