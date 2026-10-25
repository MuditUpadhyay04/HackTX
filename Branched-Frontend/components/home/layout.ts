// @token-source: home-screen geometry in dp (One UI 9 launcher on the Galaxy Z Fold 8)
/**
 * components/home/layout.ts: every number of the two home screens, in the displays' logical dp
 * (GEOM.viewport: cover 384 x 597.7, inner 801.5 x 597.7), plus the app lists and getIconRect().
 *
 * COVER (folded): the One UI phone launcher. Weather and Calendar widgets (2 x 2 each) on top, a
 * 4-column icon grid under them, the page indicator, and the dock (four icons, no labels) along the
 * bottom above the gesture handle.
 * INNER (unfolded): ONE home across both halves, as two 4-column blocks (one per half, never crossing
 * the crease). Left: Weather + Calendar, a row of icons, the Now playing widget. Right: two rows of
 * icons, the Gallery and Reminder widgets. Page indicator and the centered dock along the bottom.
 *
 * This file is a token module (first-line @token-source marker): numbers only, no styling.
 */
import { GEOM } from "@/components/device/geometry";

export type HomeDisplay = "cover" | "inner";

/** Every app on the home screen (D8). Meta apps use the official artwork where it exists (D9). */
export type HomeAppId =
  | "facebook"
  | "instagram"
  | "whatsapp"
  | "messenger"
  | "threads"
  | "meta-ai"
  | "edits"
  | "meta-horizon"
  | "whatsapp-business"
  | "meta-business-suite"
  | "meta-ads-manager"
  | "messenger-kids"
  | "unsaid"
  | "messages"
  | "photos"
  | "phone";

/** Home-screen labels, word for word from D8 (docs/RULES.md) and the spec. */
export const APP_NAMES: Record<HomeAppId, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  threads: "Threads",
  "meta-ai": "Meta AI",
  edits: "Edits",
  "meta-horizon": "Meta Horizon",
  "whatsapp-business": "WhatsApp Business",
  "meta-business-suite": "Meta Business Suite",
  "meta-ads-manager": "Meta Ads Manager",
  "messenger-kids": "Messenger Kids",
  unsaid: "Un-Said",
  messages: "Messages",
  photos: "Gallery",
  phone: "Phone",
};

/** The dock (left to right). */
export const DOCK_APPS: HomeAppId[] = ["phone", "messages", "whatsapp", "instagram"];

/** The grid, in reading order: Meta apps first (most prominent), Un-Said among them. */
export const GRID_APPS: HomeAppId[] = [
  "facebook",
  "messenger",
  "threads",
  "meta-ai",
  "edits",
  "meta-horizon",
  "photos",
  "unsaid",
  "whatsapp-business",
  "meta-business-suite",
  "meta-ads-manager",
  "messenger-kids",
];

/** Shared icon metrics (dp). */
export const ICON = {
  /** grid icon side */
  size: 56,
  /** dock icon side (One UI: the same as the grid) */
  dockSize: 56,
  /** icon -> label gap */
  labelGap: 6,
  /** label line box (12 sp) */
  labelHeight: 15,
  /** column pitch (icon + gap) */
  pitchX: 86,
  /** row pitch */
  pitchY: 90,
} as const;

/** Widgets: 2 x 2 cells, or 4 x 2 for the medium ones. One UI widget corners are about 26 dp. */
export const WIDGET = {
  size: ICON.pitchX + ICON.size, // 142
  height: ICON.pitchY + ICON.size, // 146
  mediumWidth: 3 * ICON.pitchX + ICON.size, // 314
  radius: 26,
  padding: 14,
  labelGap: 5,
  /** calendar event color bar */
  eventBar: 3,
} as const;

/** Cover-display punch-hole in dp. */
export const PUNCH = {
  diameter: GEOM.punch.cover.diameter / GEOM.viewport.scale,
  fromRight: GEOM.punch.cover.fromRight / GEOM.viewport.scale,
  fromTop: GEOM.punch.cover.fromTop / GEOM.viewport.scale,
} as const;

export { STATUS, HOME_INDICATOR } from "@/components/lookalike/metrics";

/** The dock: a row of icons along the bottom, no background (One UI default). */
export const DOCK = {
  /** gap between the dock icons' bottom and the display's bottom (clears the gesture handle) */
  bottom: 26,
  pitch: 86,
  innerPitch: 96,
} as const;

/** Search: not on the One UI home screen; kept as the launch origin for the "search" target. */
export const SEARCH = { size: 36, glyph: 15, bottom: 20 } as const;
/** Page indicator: small dots just above the dock. */
export const DOTS = { size: 6, gap: 8, aboveDock: 14 } as const;

export type Rect = { x: number; y: number; w: number; h: number };

type ScreenLayout = {
  width: number;
  height: number;
  /** x of each grid column, left to right */
  cols: number[];
  /** y of each grid row, top to bottom */
  rows: number[];
  /** slot (col, row) of every grid app */
  slots: Record<string, { col: number; row: number }>;
  widgets: { weather: Rect; calendar: Rect; photos?: Rect; music?: Rect; reminders?: Rect };
  /** top of the dock icons */
  dockY: number;
  /** left x of each dock icon */
  dockXs: number[];
  /** center x of the page dots */
  dotsX: number;
  /** right edge x for the trailing items (search launch origin) */
  railX: number;
};

const cover = GEOM.viewport.cover;
const inner = GEOM.viewport.inner;

/** Grid apps fill free slots in reading order, skipping the widget slots. */
function fill(cols: number, rows: number, taken: (c: number, r: number) => boolean): Record<string, { col: number; row: number }> {
  const out: Record<string, { col: number; row: number }> = {};
  let i = 0;
  for (let r = 0; r < rows && i < GRID_APPS.length; r++) {
    for (let c = 0; c < cols && i < GRID_APPS.length; c++) {
      if (taken(c, r)) continue;
      out[GRID_APPS[i++]] = { col: c, row: r };
    }
  }
  return out;
}

const range = (n: number, start: number, step: number) => Array.from({ length: n }, (_, i) => start + i * step);
const dockXs = (width: number, pitch: number) => range(DOCK_APPS.length, width / 2 - ((DOCK_APPS.length - 1) * pitch) / 2 - ICON.dockSize / 2, pitch);
const dockY = (height: number) => height - DOCK.bottom - ICON.dockSize;

/** Cover (384 x 597.7): a 4-column grid, 314 dp wide, centered. */
const COVER_TOP = 50;
const COVER_LEFT = (cover.width - (3 * ICON.pitchX + ICON.size)) / 2;
const coverLayout: ScreenLayout = {
  width: cover.width,
  height: cover.height,
  cols: range(4, COVER_LEFT, ICON.pitchX),
  rows: range(5, COVER_TOP, ICON.pitchY),
  slots: fill(4, 5, (_c, r) => r < 2),
  widgets: {
    weather: { x: COVER_LEFT, y: COVER_TOP, w: WIDGET.size, h: WIDGET.height },
    calendar: { x: COVER_LEFT + 2 * ICON.pitchX, y: COVER_TOP, w: WIDGET.size, h: WIDGET.height },
  },
  dockY: dockY(cover.height),
  dockXs: dockXs(cover.width, DOCK.pitch),
  dotsX: cover.width / 2,
  railX: cover.width - COVER_LEFT,
};

/**
 * Inner (801.5 x 597.7): two 4-column blocks, one per half, so no icon crosses the crease
 * (x 400.75). Left block: Weather + Calendar (rows 0-1), four apps (row 2), Now playing (rows 3-4).
 * Right block: eight apps (rows 0-1), Gallery + Reminder widgets (rows 2-3).
 */
const INNER_TOP = 50;
const BLOCK = 3 * ICON.pitchX + ICON.size; // 314
const INNER_LEFT = (inner.width / 2 - BLOCK) / 2;
const INNER_RIGHT_BLOCK = inner.width / 2 + INNER_LEFT;
const innerLayout: ScreenLayout = {
  width: inner.width,
  height: inner.height,
  cols: [...range(4, INNER_LEFT, ICON.pitchX), ...range(4, INNER_RIGHT_BLOCK, ICON.pitchX)],
  rows: range(5, INNER_TOP, ICON.pitchY),
  slots: fill(8, 5, (c, r) => (c < 4 && r !== 2) || (c >= 4 && r >= 2)),
  widgets: {
    weather: { x: INNER_LEFT, y: INNER_TOP, w: WIDGET.size, h: WIDGET.height },
    calendar: { x: INNER_LEFT + 2 * ICON.pitchX, y: INNER_TOP, w: WIDGET.size, h: WIDGET.height },
    music: { x: INNER_LEFT, y: INNER_TOP + 3 * ICON.pitchY, w: WIDGET.mediumWidth, h: WIDGET.height },
    photos: { x: INNER_RIGHT_BLOCK, y: INNER_TOP + 2 * ICON.pitchY, w: WIDGET.size, h: WIDGET.height },
    reminders: { x: INNER_RIGHT_BLOCK + 2 * ICON.pitchX, y: INNER_TOP + 2 * ICON.pitchY, w: WIDGET.size, h: WIDGET.height },
  },
  dockY: dockY(inner.height),
  dockXs: dockXs(inner.width, DOCK.innerPitch),
  dotsX: inner.width / 2,
  railX: inner.width - INNER_LEFT,
};

export const HOME_LAYOUT: Record<HomeDisplay, ScreenLayout> = { cover: coverLayout, inner: innerLayout };

/** Icon rect (dp, in the display's viewport) of a grid or dock app. */
export function iconRectPt(display: HomeDisplay, app: HomeAppId): Rect | null {
  const L = HOME_LAYOUT[display];
  const slot = L.slots[app];
  if (slot) return { x: L.cols[slot.col], y: L.rows[slot.row], w: ICON.size, h: ICON.size };
  const d = DOCK_APPS.indexOf(app);
  if (d >= 0) return { x: L.dockXs[d], y: L.dockY, w: ICON.dockSize, h: ICON.dockSize };
  return null;
}

/**
 * The icon's artboard-pixel rect on the 1920 x 1080 stage at device scale 1 (spec: getIconRect, used by
 * the navigation shell's open/close morphs): unfolded = the inner display, folded = the cover display.
 */
export function getIconRect(app: HomeAppId, display: HomeDisplay = "inner"): Rect | null {
  const r = iconRectPt(display, app);
  if (!r) return null;
  const s = GEOM.viewport.scale;
  const origin =
    display === "inner"
      ? { x: GEOM.group.left + GEOM.band.inset, y: GEOM.group.top + GEOM.band.inset }
      : { x: GEOM.stage.cx - GEOM.panel.width / 2 + GEOM.band.inset, y: GEOM.group.top + GEOM.band.inset };
  return { x: origin.x + r.x * s, y: origin.y + r.y * s, w: r.w * s, h: r.h * s };
}
