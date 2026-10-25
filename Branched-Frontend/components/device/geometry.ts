/**
 * components/device/geometry.ts: every GEOMETRY number of the Samsung Galaxy Z Fold 8 (launched
 * July 22, 2026). Scaled from Samsung's published dimensions at 6.7 px per mm: folded 81.9 x 123.9 mm
 * (0.66 W:H), unfolded 161.4 x 123.9 mm (1.30 W:H); 5.5" 10:16 cover display, 7.6" 4:3 inner display,
 * an even band (Armor Aluminum frame + black bezel), rounded corners, a centered punch-hole on the
 * cover and one on the inner display's right half.
 *
 * Units: artboard px at scale 1 on the 1920x1080 stage.
 *
 * Group-local coordinates: origin at the top-left of the UNFOLDED device (1180 x 830). The left
 * half is x 0-590, the right half x 590-1180; the hinge axis is the vertical line x 590 on the
 * front plane z 0 (z grows toward the viewer). Each half is a 590 x 830 x 18 slab whose front face
 * (the inner display) is at z 0 and whose back face is at z -18.
 *
 * Folding: the left half turns rotateY(180 - a) around the hinge axis (a = openAngle, 0 folded,
 * 180 flat), so the inner display folds INWARD (book style) and, folded, the left half lies on top
 * of the right half with its back (the cover display) facing the viewer. The right half's back is
 * the glass back with the camera plateau. The hinge spine is a cylinder of radius = thickness
 * around the axis, between the two backs.
 *
 * This file is a token module (allowlisted in scripts/check-tokens.ts): numbers only, no styling.
 */

export type FoldSide = "left" | "right";
/** cover = the folded outer display; inner = the unfolded display; left / right = its halves. */
export type DisplayId = "cover" | "inner" | FoldSide;

export type Rect = { x: number; y: number; width: number; height: number };

/** Per-corner radii, clockwise from top-left (CSS border-radius order). */
export type CornerRadii = { tl: number; tr: number; br: number; bl: number };

const STAGE = { width: 1920, height: 1080, cx: 960, cy: 540 } as const;

/** One half of the device. */
const PANEL = {
  width: 549,
  height: 830,
  /** slab thickness (z) of one half; folded the device is 2x this */
  thickness: 18,
  /** corner radius of the outer corners (hinge-side corners are square) */
  radius: 48,
} as const;

/** The even band around every display: aluminum frame + black glass bezel. */
const BAND = {
  /** aluminum frame seen from the front */
  frame: 5,
  /** dark outer rim line of the frame */
  rim: 0.75,
  /** bright chamfer line inside the rim */
  chamfer: 1.25,
  /** dark line where the frame meets the glass */
  seat: 1,
  /** black bezel */
  bezel: 17,
  /** frame + bezel */
  inset: 22,
} as const;

const DISPLAY = {
  cover: {
    width: PANEL.width - 2 * BAND.inset, // 505
    height: PANEL.height - 2 * BAND.inset, // 786
    radiusOuter: PANEL.radius - BAND.inset,
    /** the cover display's corners on the hinge side (Fold 8: all four corners match) */
    radiusHinge: PANEL.radius - BAND.inset,
  },
  inner: {
    width: 2 * PANEL.width - 2 * BAND.inset, // 1054
    height: PANEL.height - 2 * BAND.inset, // 786
    radius: PANEL.radius - BAND.inset,
  },
} as const;

/**
 * Logical Android viewports (dp). The cover display is 384 dp wide (1248 px at density 3.25),
 * rendered at 505 / 384 = 1.315 px per dp; the inner display uses the same density (one dp is the
 * same size on both screens), which makes it a landscape 801.5 x 597.7 dp viewport.
 */
const VIEWPORT_SCALE = DISPLAY.cover.width / 384;
const VIEWPORT = {
  scale: VIEWPORT_SCALE,
  cover: { width: 402, height: DISPLAY.cover.height / VIEWPORT_SCALE },
  inner: { width: DISPLAY.inner.width / VIEWPORT_SCALE, height: DISPLAY.inner.height / VIEWPORT_SCALE },
} as const;

/**
 * Front camera punch-holes, centers measured from the display's top-right corner: centered on the
 * cover display; on the inner display, centered over its right half.
 */
const PUNCH = {
  cover: { diameter: 22, fromRight: DISPLAY.cover.width / 2, fromTop: 30 },
  inner: { diameter: 22, fromRight: (PANEL.width - BAND.inset) / 2, fromTop: 30 },
  /** glass ring around the lens */
  ring: 2,
} as const;

const GROUP = {
  width: 2 * PANEL.width, // 1098
  height: PANEL.height, // 830
  /** group-local x of the hinge axis */
  hinge: PANEL.width, // 549
  /** artboard top-left of the unfolded group when centered at (960, 540) */
  left: STAGE.cx - PANEL.width, // 411
  top: STAGE.cy - PANEL.height / 2, // 125
  /** translateX folded (the right half centered on the stage); 0 unfolded */
  foldedShift: -PANEL.width / 2, // -274.5
  perspective: 4200,
} as const;

/** The hinge spine: a half cylinder of radius PANEL.thickness, built from flat facets. */
const SPINE = { facets: 14, radius: PANEL.thickness } as const;

/**
 * The rear cameras on the right half's back (back-local coordinates: as seen from behind): Fold 8's
 * two "floating" lens rings stacked vertically near the outer top corner (50 MP wide over 50 MP
 * ultra-wide), with the flash and mic beside them. The plateau box itself is not drawn.
 */
const PLATEAU = {
  x: 30,
  y: 30,
  width: 150,
  height: 196,
  radius: 0,
  raise: 3,
  lens: { ring: 84, glass: 66, centers: [[46, 46], [46, 150]] as const },
  lensReflection: { width: 18, height: 10 },
  lensSpecular: 5,
  flash: { diameter: 16, center: [118, 40] as const },
  mic: { diameter: 5, center: [118, 76] as const },
} as const;

/**
 * Side keys, all on the right half's outer (right) edge, measured from the top: the volume rocker
 * (drawn as one key, two hit areas) above the side key with its fingerprint sensor. Nothing else.
 */
const BUTTONS = {
  /** depth across the thickness and protrusion out of the edge */
  depth: 7,
  protrude: 2.4,
  radius: 3,
  volumeUp: { fromTop: 200, length: 60 },
  volumeDown: { fromTop: 260, length: 60 },
  power: { fromTop: 360, length: 76 },
} as const;

/** z offsets (px) of layers that must never share a plane with a face. */
const Z = {
  /** spanning inner content in front of the display plane */
  content: 0.5,
  /** the hinge accessory (detent ripple) in front of the display / spine */
  accessory: 1,
  /** the panel shadow plane, inside the slab */
  shadowPlane: -PANEL.thickness / 2,
  /** the glass back's camera plateau */
  plateau: PLATEAU.raise,
} as const;

const SHADOW = {
  /** contact shadow ellipse: 70% of the visible device width x 28 px, center 18 px below the bottom */
  contactWidthRatio: 0.7,
  contactHeight: 28,
  contactBelow: 18,
  /** how far the panel drop shadow may spread past the outline (clip margin) */
  spread: 240,
} as const;

const REFLECTION = { gap: 14, opacity: 0.1 } as const;

/** Specular sweep position (0..1) folded -> flat (the back glass gloss). */
const SPECULAR = { folded: 0.15, flat: 0.85, sweepFrom: -150, sweepTo: 150 } as const;

/** Spanning inner content fades in over this openAngle range (it is flat; the halves are not). */
const CONTENT_FADE = { from: 168, to: 180 } as const;

/** Whole-device tilt peaks (deg) at 90 degrees open; 0 at 0 and 180 (D8: flat straight-on). */
const TILT = { rotateYPeak: -8, rotateXPeak: 3 } as const;

/** /device test pattern, in display pt (spec: 1 px grid every 50 pt + the display outline). */
const TEST_PATTERN = { grid: 50, line: 1, labelGap: 8 } as const;

/** /device?debug=1 spec overlay, in artboard px. */
const DEBUG = { ruler: 22, minorTick: 50, majorTick: 100, minorLength: 6, majorLength: 12, line: 1, labelPad: 4, labelGap: 3, charWidth: 0.56 } as const;

const SQUARE: CornerRadii = { tl: 0, tr: 0, br: 0, bl: 0 };

/**
 * Outline radii of one half. `view` "front" = seen from the front (hinge on the right for the left
 * half); "back" = seen from behind (left-right mirrored: hinge on the left for the left half).
 */
function halfRadii(side: FoldSide, view: "front" | "back", r: number, hinge = 0): CornerRadii {
  const hingeOnRight = (side === "left") === (view === "front");
  return hingeOnRight ? { tl: r, tr: hinge, br: hinge, bl: r } : { tl: hinge, tr: r, br: r, bl: hinge };
}

export const GEOM = {
  stage: STAGE,
  panel: PANEL,
  band: BAND,
  display: DISPLAY,
  viewport: VIEWPORT,
  punch: PUNCH,
  group: GROUP,
  spine: SPINE,
  plateau: PLATEAU,
  buttons: BUTTONS,
  z: Z,
  shadow: SHADOW,
  reflection: REFLECTION,
  specular: SPECULAR,
  contentFade: CONTENT_FADE,
  tilt: TILT,
  testPattern: TEST_PATTERN,
  debug: DEBUG,
  square: SQUARE,
  halfRadii,
} as const;

export type Geom = typeof GEOM;

export function clampAngle(a: number): number {
  return Math.min(180, Math.max(0, a));
}

/** Device group translateX: -295 * (1 - a/180) (the visible device stays centered). */
export function groupShift(openAngle: number): number {
  const a = clampAngle(openAngle);
  return GROUP.foldedShift * (1 - a / 180);
}

/**
 * Group-local (x, z) of a point on the LEFT half, given its distance `d` from the hinge (along the
 * half, 0..590) and its depth `depth` inside the slab (0 = front face, -thickness = back face).
 */
export function leftHalfPoint(d: number, depth: number, openAngle: number): { x: number; z: number } {
  const t = ((180 - clampAngle(openAngle)) * Math.PI) / 180;
  // rotateY(t) maps local +x to (cos t, -sin t) and local +z to (sin t, cos t)
  return {
    x: GROUP.hinge - d * Math.cos(t) + depth * Math.sin(t),
    z: d * Math.sin(t) + depth * Math.cos(t),
  };
}

/** Leftmost group-local x of the device silhouette (front view, no tilt, no perspective). */
export function silhouetteLeft(openAngle: number): number {
  const a = clampAngle(openAngle);
  const outer = leftHalfPoint(PANEL.width, 0, a).x;
  const outerBack = leftHalfPoint(PANEL.width, -PANEL.thickness, a).x;
  const spine = GROUP.hinge - SPINE.radius * Math.sin(Math.min(Math.PI / 2, ((180 - a) * Math.PI) / 180));
  return Math.min(outer, outerBack, spine);
}

export type DisplayRectOptions = {
  /** artboard center of the device group (default 960, 540) */
  x?: number;
  y?: number;
  /** device scale (default 1) */
  scale?: number;
};

/**
 * Artboard rect of a display at `openAngle` (scale 1 default, group centered at 960, 540).
 * Exact at 0 (cover) and 180 (inner, left, right). In between, the swinging left half is an
 * orthographic projection (no tilt / perspective): the cover is visible below 90, the left half of
 * the inner display above 90; a hidden display has width 0.
 */
export function displayRect(display: DisplayId, openAngle: number, opts: DisplayRectOptions = {}): Rect {
  const cx = opts.x ?? STAGE.cx;
  const cy = opts.y ?? STAGE.cy;
  const s = opts.scale ?? 1;
  const a = clampAngle(openAngle);
  const shift = groupShift(a);
  const inset = BAND.inset;

  const project = (d1: number, d2: number, depth: number) => {
    const x1 = leftHalfPoint(d1, depth, a).x;
    const x2 = leftHalfPoint(d2, depth, a).x;
    return { left: Math.min(x1, x2), right: Math.max(x1, x2) };
  };

  let left: number;
  let right: number;
  if (display === "right") {
    left = GROUP.hinge;
    right = GROUP.width - inset;
  } else if (display === "left") {
    const p = a > 90 ? project(0, PANEL.width - inset, 0) : { left: GROUP.hinge, right: GROUP.hinge };
    left = p.left;
    right = p.right;
  } else if (display === "inner") {
    const p = a > 90 ? project(0, PANEL.width - inset, 0) : { left: GROUP.hinge, right: GROUP.hinge };
    left = p.left;
    right = GROUP.width - inset;
  } else {
    const p = a < 90 ? project(inset, PANEL.width - inset, -PANEL.thickness) : { left: GROUP.hinge, right: GROUP.hinge };
    left = p.left;
    right = p.right;
  }

  const groupLeft = cx - GROUP.width / 2;
  const groupTop = cy - GROUP.height / 2;
  return {
    x: cx + (groupLeft + left + shift - cx) * s,
    y: cy + (groupTop + inset - cy) * s,
    width: (right - left) * s,
    height: DISPLAY.inner.height * s,
  };
}

/** Artboard coordinates of the main parts (scale 1), for the ?debug=1 overlay and tests. */
export const ARTBOARD = {
  unfolded: {
    group: { x: 411, y: 125, width: 1098, height: 830 },
    leftHalf: { x: 411, y: 125, width: 549, height: 830 },
    rightHalf: { x: 960, y: 125, width: 549, height: 830 },
    inner: { x: 433, y: 147, width: 1054, height: 786 },
  },
  folded: {
    device: { x: 685.5, y: 125, width: 549, height: 830 },
    cover: { x: 707.5, y: 147, width: 505, height: 786 },
  },
} as const satisfies Record<string, Record<string, Rect>>;

// ---------------------------------------------------------------------------
// Rounded corners with per-corner radii (circular arcs, the Fold 8's corner shape)
// ---------------------------------------------------------------------------

/** Cubic control distance for a quarter circle (1 - 0.5523). */
const CIRCLE = 1 - 0.5522847498;

type Pt = { x: number; y: number };
type Seg = { kind: "L"; to: Pt } | { kind: "C"; c1: Pt; c2: Pt; to: Pt };

/** The outline as a start point and segments, clockwise on screen (top edge left -> right). */
function outlineSegments(x: number, y: number, w: number, h: number, r: CornerRadii): { start: Pt; segs: Seg[] } {
  const clampR = (v: number) => Math.max(0, Math.min(v, Math.min(w, h) / 2));
  const R = { tl: clampR(r.tl), tr: clampR(r.tr), br: clampR(r.br), bl: clampR(r.bl) };
  type Map = (a: number, b: number) => Pt;
  const segs: Seg[] = [];
  const corner = (rr: number, m: Map) => {
    if (rr === 0) {
      segs.push({ kind: "L", to: m(0, 0) });
      return;
    }
    const p = (a: number, b: number) => m(a * rr, b * rr);
    segs.push({ kind: "C", c1: p(CIRCLE, 0), c2: p(0, CIRCLE), to: p(0, 1) });
  };
  // a = distance from the corner along the incoming edge, b = along the outgoing edge (inward)
  const topRight: Map = (a, b) => ({ x: x + w - a, y: y + b });
  const bottomRight: Map = (a, b) => ({ x: x + w - b, y: y + h - a });
  const bottomLeft: Map = (a, b) => ({ x: x + a, y: y + h - b });
  const topLeft: Map = (a, b) => ({ x: x + b, y: y + a });
  const s = (v: number) => v;
  const start = { x: x + s(R.tl), y };
  segs.push({ kind: "L", to: { x: x + w - s(R.tr), y } });
  corner(R.tr, topRight);
  segs.push({ kind: "L", to: { x: x + w, y: y + h - s(R.br) } });
  corner(R.br, bottomRight);
  segs.push({ kind: "L", to: { x: x + s(R.bl), y: y + h } });
  corner(R.bl, bottomLeft);
  segs.push({ kind: "L", to: { x, y: y + s(R.tl) } });
  corner(R.tl, topLeft);
  return { start, segs };
}

const f2 = (n: number) => String(Math.round(n * 100) / 100);
const pt = (p: Pt) => `${f2(p.x)} ${f2(p.y)}`;

/** SVG path data of a continuous-corner rect with per-corner radii (square where r = 0). */
export function continuousRectPath(x: number, y: number, w: number, h: number, r: CornerRadii): string {
  const { start, segs } = outlineSegments(x, y, w, h, r);
  const body = segs.map((s) => (s.kind === "L" ? `L${pt(s.to)}` : `C${pt(s.c1)} ${pt(s.c2)} ${pt(s.to)}`));
  return [`M${pt(start)}`, ...body, "Z"].join(" ");
}

/** CSS clip-path value for a box whose own origin is the path origin. */
export function continuousClip(w: number, h: number, r: CornerRadii, holes: string[] = []): string {
  const path = [continuousRectPath(0, 0, w, h, r), ...holes].join(" ");
  return holes.length ? `path(evenodd, "${path}")` : `path("${path}")`;
}

/** The outline sampled as a polygon (clockwise on screen), `perCubic` points per cubic. */
export function continuousRectPoints(w: number, h: number, r: CornerRadii, perCubic = 5): Pt[] {
  const { start, segs } = outlineSegments(0, 0, w, h, r);
  const pts: Pt[] = [start];
  let cur = start;
  for (const s of segs) {
    if (s.kind === "L") {
      pts.push(s.to);
    } else {
      for (let i = 1; i <= perCubic; i++) {
        const t = i / perCubic;
        const u = 1 - t;
        pts.push({
          x: u * u * u * cur.x + 3 * u * u * t * s.c1.x + 3 * u * t * t * s.c2.x + t * t * t * s.to.x,
          y: u * u * u * cur.y + 3 * u * u * t * s.c1.y + 3 * u * t * t * s.c2.y + t * t * t * s.to.y,
        });
      }
    }
    cur = s.to;
  }
  // drop zero-length steps
  return pts.filter((p, i) => i === 0 || Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) > 0.01);
}

/** SVG path of a circle (for clip-path holes). */
export function circlePath(cx: number, cy: number, radius: number): string {
  return `M${f2(cx - radius)} ${f2(cy)} A${radius} ${radius} 0 1 0 ${f2(cx + radius)} ${f2(cy)} A${radius} ${radius} 0 1 0 ${f2(cx - radius)} ${f2(cy)} Z`;
}

/** Display-local center of a display's punch-hole on a display `width` wide. */
export function punchCenter(width: number, display: "cover" | "inner" = "cover"): Pt {
  const p = PUNCH[display];
  return { x: width - p.fromRight, y: p.fromTop };
}

/** CSS border-radius string for per-corner radii (shadow planes only; faces use continuous paths). */
export function cornerRadiusCss(r: CornerRadii): string {
  return `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px`;
}
