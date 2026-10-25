import type { CSSProperties } from "react";
import { homeWallpaper as P } from "@/lib/tokens";

/**
 * The home-screen wallpaper (D12): an iOS 26-style silk "swoosh" in the neutral family of Gurneal's
 * reference: an ink / slate field, silver-lilac and pearl ribbons sweeping down from the top, an
 * espresso band and a gold glow on the right. Every ribbon is a sheet with a crisp leading edge (a
 * hairline highlight), a soft cast shadow and a body that fades into the field, so the folds read
 * as light on fabric, not as gradient blobs.
 *
 * The art is one SVG built once at module load and used as a background image (a data URI), so the
 * browser rasterizes it once and every home instance (cover, the inner halves, the flat inner
 * layer) shares it. Colors come only from lib/tokens.ts `homeWallpaper`.
 */

/** Art box: 2x the inner display's pt viewport (822.5 x 573). */
const W = 1645;
const H = 1146;

type Pt = readonly [number, number];
/** An edge: a start point and cubic segments [c1, c2, end]. */
type Edge = readonly [Pt, ...(readonly [Pt, Pt, Pt])[]];

const p = (v: Pt, dx = 0, dy = 0) => `${v[0] + dx} ${v[1] + dy}`;

function forward(e: Edge, dx = 0, dy = 0): string {
  const [start, ...segs] = e;
  return `M${p(start, dx, dy)} ` + segs.map(([a, b, c]) => `C${p(a, dx, dy)} ${p(b, dx, dy)} ${p(c, dx, dy)}`).join(" ");
}

function backward(e: Edge, dx: number, dy: number): string {
  const [start, ...segs] = e;
  let out = "";
  for (let i = segs.length - 1; i >= 0; i--) {
    const [a, b] = segs[i];
    const prev = i === 0 ? start : segs[i - 1][2];
    out += ` C${p(b, dx, dy)} ${p(a, dx, dy)} ${p(prev, dx, dy)}`;
  }
  return out;
}

const endOf = (e: Edge): Pt => {
  const segs = e.slice(1) as (readonly [Pt, Pt, Pt])[];
  return segs[segs.length - 1][2];
};

/** The region on one side of an edge, closed through `corners`. */
const region = (e: Edge, corners: Pt[]) => `${forward(e)} ${corners.map((c) => `L${p(c)}`).join(" ")} Z`;

/** A strip along the edge, shifted by (dx, dy): the part of a sheet that casts the shadow. */
const strip = (e: Edge, dx: number, dy: number) => {
  const end = endOf(e);
  return `${forward(e)} L${p(end, dx, dy)}${backward(e, dx, dy)} Z`;
};

type Stop = readonly [offset: number, color: string, opacity?: number];

const gradient = (id: string, x1: number, y1: number, x2: number, y2: number, stops: Stop[]) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` +
  stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("") +
  `</linearGradient>`;

type SheetOptions = { shadowDx: number; shadowDy: number; shadow: number; highlight: number };

function sheet(e: Edge, corners: Pt[], fill: string, o: SheetOptions): string {
  return [
    `<path d="${strip(e, o.shadowDx, o.shadowDy)}" fill="${P.shade}" opacity="${o.shadow}" filter="url(#w-soft)"/>`,
    `<path d="${region(e, corners)}" fill="url(#${fill})"/>`,
    `<path d="${forward(e)}" fill="none" stroke="${P.light}" stroke-width="2" opacity="${o.highlight}" filter="url(#w-hair)"/>`,
  ].join("");
}

function buildArt(): string {
  const out = 40;
  const right = W + out;
  const bottom = H + out;

  const E1: Edge = [[720, -out], [[650, 260], [380, 560], [-120, 780]]];
  const E1b: Edge = [[860, -out], [[700, 420], [420, 760], [-120, 1000]]];
  const E2: Edge = [[880, -out], [[790, 360], [860, 760], [1130, bottom]]];
  const E2b: Edge = [[1040, -out], [[970, 320], [1060, 720], [1380, bottom]]];
  const E3: Edge = [[1290, -out], [[1200, 300], [1300, 600], [1520, 760]], [[1580, 805], [1630, 840], [right, 860]]];

  const defs = [
    `<filter id="w-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="24"/></filter>`,
    `<filter id="w-hair" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.2"/></filter>`,
    `<filter id="w-field" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="140"/></filter>`,
    `<filter id="w-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`,
    gradient("w-s1", 330, 330, 760, 760, [[0, P.pearl], [0.2, P.lilac], [0.6, P.steel, 0.7], [1, P.slate, 0]]),
    gradient("w-s1b", 120, 620, 420, 900, [[0, P.white, 0.9], [0.25, P.lilac, 0.8], [1, P.steel, 0]]),
    gradient("w-s2", 900, 400, 1340, 560, [[0, P.white], [0.18, P.cream], [0.55, P.taupe, 0.85], [1, P.espresso, 0]]),
    gradient("w-s2b", 1000, 420, 1400, 600, [[0, P.amber], [0.25, P.espresso], [0.7, P.espresso, 0.6], [1, P.espresso, 0]]),
    gradient("w-s3", 1330, 520, 1560, 360, [[0, P.white], [0.3, P.cream], [1, P.gold, 0.2]]),
    gradient("w-vig", 0, 0, 0, H, [[0, P.shade, 0.25], [0.3, P.shade, 0], [0.8, P.shade, 0], [1, P.shade, 0.1]]),
  ].join("");

  const body = [
    `<rect width="${W}" height="${H}" fill="${P.ink}"/>`,
    `<g filter="url(#w-field)">`,
    `<ellipse cx="200" cy="500" rx="520" ry="420" fill="${P.slate}"/>`,
    `<ellipse cx="350" cy="1150" rx="700" ry="320" fill="${P.lilac}"/>`,
    `<ellipse cx="760" cy="240" rx="260" ry="300" fill="${P.mauve}" opacity="0.6"/>`,
    `<ellipse cx="1180" cy="640" rx="380" ry="520" fill="${P.espresso}"/>`,
    `<ellipse cx="1520" cy="120" rx="520" ry="380" fill="${P.gold}"/>`,
    `<ellipse cx="1300" cy="320" rx="260" ry="240" fill="${P.amber}"/>`,
    `<ellipse cx="1500" cy="1080" rx="520" ry="300" fill="${P.cream}"/>`,
    `</g>`,
    sheet(E1, [[-120, bottom], [1000, bottom], [1000, -out]], "w-s1", { shadowDx: -50, shadowDy: -30, shadow: 0.6, highlight: 0.5 }),
    sheet(E1b, [[-120, bottom], [1000, bottom], [1000, -out]], "w-s1b", { shadowDx: -30, shadowDy: -30, shadow: 0.4, highlight: 0.5 }),
    sheet(E2, [[right, bottom], [right, -out]], "w-s2", { shadowDx: -50, shadowDy: 0, shadow: 0.65, highlight: 0.8 }),
    sheet(E2b, [[right, bottom], [right, -out]], "w-s2b", { shadowDx: -36, shadowDy: 0, shadow: 0.5, highlight: 0.45 }),
    sheet(E3, [[right, bottom], [right, -out]], "w-s3", { shadowDx: -40, shadowDy: -20, shadow: 0.45, highlight: 0.8 }),
    `<rect width="${W}" height="${H}" fill="url(#w-vig)"/>`,
    // a whisper of grain against banding in the long gradients
    `<rect width="${W}" height="${H}" filter="url(#w-grain)" opacity="0.035"/>`,
  ].join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>`;
}

/** The SVG source (exported for scripts / tests). */
export const WALLPAPER_SVG = buildArt();
const WALLPAPER_URL = `url("data:image/svg+xml,${encodeURIComponent(WALLPAPER_SVG)}")`;

/** Where each display's crop sits on the art (the cover shows the ribbons right of center). */
const CROP: Record<"cover" | "inner", string> = {
  cover: "68% 50%",
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
