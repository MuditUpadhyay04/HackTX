import type { CSSProperties } from "react";
import { homeWallpaper as P } from "@/lib/tokens";

/**
 * The home-screen wallpaper: a One UI-style abstract. Soft, overlapping rounded forms in deep blue,
 * violet and teal glow out of a dark field, each lit along one edge, like Samsung's default
 * wallpapers. The art is one SVG built once at module load and used as a background image (a data
 * URI), so every home instance (cover, the inner halves, the flat inner layer) shares one raster.
 * Colors come only from lib/tokens.ts `homeWallpaper`.
 */

/** Art box: 2x the inner display's dp viewport. */
const W = 1562;
const H = 1174;

type Blob = { cx: number; cy: number; rx: number; ry: number; rot: number; from: string; to: string; opacity: number };

const BLOBS: Blob[] = [
  { cx: 1180, cy: 260, rx: 560, ry: 380, rot: -24, from: P.violet, to: P.indigo, opacity: 0.95 },
  { cx: 360, cy: 900, rx: 640, ry: 360, rot: 18, from: P.teal, to: P.blue, opacity: 0.9 },
  { cx: 860, cy: 720, rx: 420, ry: 300, rot: -36, from: P.blue, to: P.violet, opacity: 0.85 },
  { cx: 240, cy: 180, rx: 360, ry: 260, rot: 30, from: P.indigo, to: P.ink, opacity: 0.9 },
  { cx: 1320, cy: 1020, rx: 380, ry: 240, rot: 12, from: P.coral, to: P.violet, opacity: 0.75 },
];

function buildArt(): string {
  const defs = BLOBS.map(
    (b, i) =>
      `<linearGradient id="g${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b.from}"/><stop offset="1" stop-color="${b.to}"/></linearGradient>`,
  ).join("");
  const shapes = BLOBS.map(
    (b, i) =>
      `<g transform="rotate(${b.rot} ${b.cx} ${b.cy})" opacity="${b.opacity}">` +
      `<ellipse cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}" fill="url(#g${i})"/>` +
      `<ellipse cx="${b.cx}" cy="${b.cy - b.ry * 0.06}" rx="${b.rx * 0.98}" ry="${b.ry * 0.96}" fill="none" stroke="${P.light}" stroke-opacity="0.18" stroke-width="3"/>` +
      `</g>`,
  ).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `<defs>${defs}<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="38"/></filter></defs>` +
    `<rect width="${W}" height="${H}" fill="${P.ink}"/>` +
    `<g filter="url(#soft)">${shapes}</g>` +
    `</svg>`
  );
}

/** The SVG source (exported for scripts / tests). */
export const WALLPAPER_SVG = buildArt();
const WALLPAPER_URL = `url("data:image/svg+xml,${encodeURIComponent(WALLPAPER_SVG)}")`;

/** Where each display's crop sits on the art. */
const CROP: Record<"cover" | "inner", string> = {
  cover: "70% 40%",
  inner: "50% 50%",
};

export function HomeWallpaper({ display, style }: { display: "cover" | "inner"; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      data-home-wallpaper={display}
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "var(--home-wallpaper-ink)",
        // dimmed so the white icon labels read clearly
        backgroundImage: `linear-gradient(var(--home-wallpaper-dim), var(--home-wallpaper-dim)), ${WALLPAPER_URL}`,
        backgroundSize: "cover, cover",
        backgroundPosition: `0 0, ${CROP[display]}`,
        backgroundRepeat: "no-repeat",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

export default HomeWallpaper;
