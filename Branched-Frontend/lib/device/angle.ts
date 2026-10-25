/**
 * lib/device/angle.ts: the Galaxy Z Fold 8 (docs/RULES.md D10) as a pure function of openAngle. The
 * fold control, the static /device states and the opening timeline (Phases 4-5) all drive the
 * device through these functions.
 *
 *   openAngle 0 = folded (cover display facing the viewer), 180 = flat (one inner display).
 *   left half rotateY   = 180 - a   around the hinge axis (group x 590, z 0): it folds inward
 *   group translateX    = -295 * (1 - a/180)
 *   tilt rotateY        = -8deg * sin(pi a / 180)   (+ the pose of folded-angled / back)
 *   tilt rotateX        =  3deg * sin(pi a / 180)   (0 at 0 and 180: flat straight-on, D8)
 *   specular            = 0.15 -> 0.85 with a/180
 *
 * No "use client": pure math, importable from server components, scripts and tests.
 */
import { GEOM, clampAngle, groupShift } from "@/components/device/geometry";

export type DeviceState =
  | "folded"
  | "folded-off"
  | "folded-angled"
  | "unfold-30"
  | "unfold-60"
  | "unfold-90"
  | "unfold-120"
  | "unfold-150"
  | "unfolded"
  | "unfolded-off"
  | "back";

/** openAngle of every static state (spec STATIC STATES table). */
export const STATE_ANGLES: Record<DeviceState, number> = {
  folded: 0,
  "folded-off": 0,
  "folded-angled": 0,
  "unfold-30": 30,
  "unfold-60": 60,
  "unfold-90": 90,
  "unfold-120": 120,
  "unfold-150": 150,
  unfolded: 180,
  "unfolded-off": 180,
  back: 0,
};

export const DEVICE_STATES = Object.keys(STATE_ANGLES) as DeviceState[];

export type DevicePose = {
  /** extra whole-device tilt on top of the openAngle tilt (deg) */
  rotateY: number;
  rotateX: number;
};

export type DuoStateConfig = {
  openAngle: number;
  /** default for the screenOn prop in this state (D10: lit unless it is an -off state) */
  screenOn: boolean;
  pose: DevicePose;
};

const NO_POSE: DevicePose = { rotateY: 0, rotateX: 0 };

/** Everything a static state sets (openAngle, screenOn, pose). */
export const STATE_CONFIG: Record<DeviceState, DuoStateConfig> = {
  folded: { openAngle: 0, screenOn: true, pose: NO_POSE },
  "folded-off": { openAngle: 0, screenOn: false, pose: NO_POSE },
  "folded-angled": { openAngle: 0, screenOn: true, pose: { rotateY: -24, rotateX: 6 } },
  "unfold-30": { openAngle: 30, screenOn: true, pose: NO_POSE },
  "unfold-60": { openAngle: 60, screenOn: true, pose: NO_POSE },
  "unfold-90": { openAngle: 90, screenOn: true, pose: NO_POSE },
  "unfold-120": { openAngle: 120, screenOn: true, pose: NO_POSE },
  "unfold-150": { openAngle: 150, screenOn: true, pose: NO_POSE },
  unfolded: { openAngle: 180, screenOn: true, pose: NO_POSE },
  "unfolded-off": { openAngle: 180, screenOn: false, pose: NO_POSE },
  back: { openAngle: 0, screenOn: true, pose: { rotateY: 180, rotateX: 0 } },
};

export function isDeviceState(value: unknown): value is DeviceState {
  return typeof value === "string" && value in STATE_ANGLES;
}

export type DeviceTransform = {
  /** the angle actually used (clamped 0..180) */
  openAngle: number;
  /** left half rotation around the hinge axis (deg): 180 - a */
  leftRotateY: number;
  /** device group translateX (artboard px at scale 1) */
  groupTranslateX: number;
  /** whole-device tilt (deg), including the state's pose */
  tiltRotateY: number;
  tiltRotateX: number;
  /** specular sweep position 0..1 */
  specular: number;
  /** opacity of the spanning inner content (flat only) 0..1 */
  contentOpacity: number;
};

const ramp = (a: number, from: number, to: number) => Math.min(1, Math.max(0, (a - from) / (to - from)));
const smoothRamp = (a: number, from: number, to: number) => {
  const k = ramp(a, from, to);
  return k * k * (3 - 2 * k);
};

/** The device at `openAngle`, plus the pose of `state` (folded-angled, back) when given. */
export function deviceTransform(openAngle: number, state?: DeviceState): DeviceTransform {
  const a = clampAngle(openAngle);
  const wave = Math.sin((Math.PI * a) / 180);
  const pose = state ? STATE_CONFIG[state].pose : NO_POSE;
  const { folded, flat } = GEOM.specular;
  return {
    openAngle: a,
    leftRotateY: 180 - a,
    groupTranslateX: groupShift(a),
    tiltRotateY: GEOM.tilt.rotateYPeak * wave + pose.rotateY,
    tiltRotateX: GEOM.tilt.rotateXPeak * wave + pose.rotateX,
    specular: folded + (flat - folded) * (a / 180),
    // smoothstepped so the flat layer eases in with no visible start or finish
    contentOpacity: smoothRamp(a, GEOM.contentFade.from, GEOM.contentFade.to),
  };
}

// ---------------------------------------------------------------------------
// CSS transform strings (used per frame by components/device/GalaxyFold.tsx)
// ---------------------------------------------------------------------------

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** The device group: tilt around its center, after the fold shift. */
export function groupTransformCss(t: DeviceTransform, extra: DevicePose = NO_POSE): string {
  return (
    `rotateX(${r3(t.tiltRotateX + extra.rotateX)}deg) ` +
    `rotateY(${r3(t.tiltRotateY + extra.rotateY)}deg) ` +
    `translate3d(${r3(t.groupTranslateX)}px, 0, 0)`
  );
}

/** The left half: rotateY(180 - a), with transform-origin on the hinge axis (its right edge, z 0). */
export function leftPanelTransformCss(openAngle: number): string {
  return `rotateY(${r3(180 - clampAngle(openAngle))}deg)`;
}

// ---------------------------------------------------------------------------
// The hinge spine: a cylinder of radius = thickness around the hinge axis, spanning the angle
// between the two backs (0 when flat, a half cylinder bulging left when folded).
// ---------------------------------------------------------------------------

export type SpineFacet = {
  /** group-local position of the facet's left edge (as built: its start point) */
  x: number;
  z: number;
  /** rotateY (deg) of the facet around its start edge */
  rotateY: number;
  /** facet width (px); 0 when flat */
  length: number;
  /** outward normal (x, z), for shading */
  nx: number;
  nz: number;
};

/** Direction from the hinge axis at spine parameter psi (0 = right back edge, toward -z). */
function spinePoint(psi: number): { x: number; z: number } {
  const r = GEOM.spine.radius;
  return { x: GEOM.group.hinge - r * Math.sin(psi), z: -r * Math.cos(psi) };
}

/** Total spine sweep (rad) at `openAngle`: the left half's rotation, 0..pi. */
export function spineSweep(openAngle: number): number {
  return ((180 - clampAngle(openAngle)) * Math.PI) / 180;
}

/** Facet `index` (0 = at the right half's back edge) of the spine at `openAngle`. */
export function spineFacet(index: number, openAngle: number): SpineFacet {
  const n = GEOM.spine.facets;
  const sweep = spineSweep(openAngle);
  const p = spinePoint((sweep * index) / n);
  const q = spinePoint((sweep * (index + 1)) / n);
  const dx = q.x - p.x;
  const dz = q.z - p.z;
  const length = Math.hypot(dx, dz);
  // CSS rotateY(t) maps local +x to (cos t, -sin t) in (x, z)
  const rotateY = length < 1e-6 ? 180 : (Math.atan2(-dz, dx) * 180) / Math.PI;
  const mid = (sweep * (index + 0.5)) / n;
  return { x: p.x, z: p.z, rotateY, length, nx: -Math.sin(mid), nz: -Math.cos(mid) };
}

export function spineFacetTransformCss(f: SpineFacet): string {
  return `translate3d(${r3(f.x)}px, 0, ${r3(f.z)}px) rotateY(${r3(f.rotateY)}deg)`;
}

/**
 * The spine's end caps (y 0 and y 830) as a CSS polygon over a (2r x 2r) box centered on the hinge
 * axis, lying in the x-z plane: box-local u = x - (hinge - r), v = r - z (v grows toward -z).
 */
export function spineCapPolygon(openAngle: number, steps = 12): string {
  const r = GEOM.spine.radius;
  const sweep = spineSweep(openAngle);
  const pts: string[] = [`${r}px ${r}px`];
  for (let i = 0; i <= steps; i++) {
    const p = spinePoint((sweep * i) / steps);
    const u = p.x - (GEOM.group.hinge - r);
    const v = r - p.z;
    pts.push(`${r3(u)}px ${r3(v)}px`);
  }
  return `polygon(${pts.join(", ")})`;
}

/** Light direction for metal shading (front, slightly from the upper left), normalized (x, z). */
const LIGHT = (() => {
  const x = -0.4;
  const z = 1;
  const l = Math.hypot(x, z);
  return { x: x / l, z: z / l };
})();

/** Darkening (0..maxShade) of a surface with outward normal (nx, nz) under the key light. */
export function surfaceShade(nx: number, nz: number, maxShade = 0.55): number {
  const lambert = Math.max(0, nx * LIGHT.x + nz * LIGHT.z);
  return r3((1 - lambert) * maxShade);
}

/** Group-local center of the hinge for the hinge accessory (detent ripple): in front of the device. */
export function hingeCenter(openAngle: number): { x: number; z: number } {
  const a = clampAngle(openAngle);
  // folded, the device's front is the cover at z = +thickness; flat, the inner display at z 0
  const front = a < 90 ? GEOM.panel.thickness : 0;
  return { x: GEOM.group.hinge, z: front + GEOM.z.accessory };
}

/** Background-position-x (%) of the back-glass gloss for a specular position 0..1. */
export function specularPosition(specular: number): string {
  const { sweepFrom, sweepTo } = GEOM.specular;
  const s = Math.min(1, Math.max(0, specular));
  return `${r3(sweepFrom + (sweepTo - sweepFrom) * s)}%`;
}
