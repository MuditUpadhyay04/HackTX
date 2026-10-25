// @token-source: home-screen geometry in dp (One UI 9 launcher on the Galaxy Z Fold 8)
/**
 * components/home/layout.ts: every number of the two home screens, in the displays' logical dp
 * (GEOM.viewport: cover 384 x 587.2, inner 781 x 587.2), plus the app lists and getIconRect().
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
  pitchY: 88,
} as const;

/** Widgets: 2 x 2 cells, or 4 x 2 for the medium ones. One UI widget corners are about 26 dp. */
export const WIDGET = {
  size: ICON.pitchX + ICON.size, // 142
  height: ICON.pitchY + ICON.size, // 144
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

const range = (n: number, start: number, step: number) => Array.from({ length: n }, (_, i) => start + i * step);
const dockXs = (width: number, pitch: number) => range(DOCK_APPS.length, width / 2 - ((DOCK_APPS.length - 1) * pitch) / 2 - ICON.dockSize / 2, pitch);
const dockY = (height: number) => height - DOCK.bottom - ICON.dockSize;

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

/** Top of the first grid row on the device's displays. */
const GRID_TOP = 46;
/** Clear space kept between the last icon label and the page dots. */
const GRID_DOTS_GAP = 18;
/** The tallest row pitch a tall display spreads the grid to (One UI on a 20:9 phone). */
const MAX_PITCH_Y = 112;
/** Share of a tall display's spare height that goes above the grid (the rest stays above the dots). */
const SLACK_ABOVE = 0.45;
/** One icon plus its label, top to bottom. */
const CELL_HEIGHT = ICON.size + ICON.labelGap + ICON.labelHeight;

/**
 * The 5 grid rows for a display `height` dp tall. On the device's own displays (587.2 dp) this is
 * exactly GRID_TOP + n x ICON.pitchY; on a taller real screen (the /phone route on a phone held in the
 * hand) the rows spread out up to MAX_PITCH_Y and the block sits a little lower, like One UI does.
 */
function gridRows(height: number): { rows: number[]; pitch: number } {
  const bottom = dockY(height) - DOTS.aboveDock - DOTS.size - GRID_DOTS_GAP;
  const span = bottom - GRID_TOP - CELL_HEIGHT;
  const pitch = Math.min(MAX_PITCH_Y, Math.max(ICON.pitchY, span / 4));
  const slack = Math.max(0, span - 4 * pitch);
  return { rows: range(5, GRID_TOP + slack * SLACK_ABOVE, pitch), pitch };
}

/** A 2-row widget's height at a row pitch (144 at the default pitch). */
const widgetHeight = (pitch: number) => pitch + ICON.size;

/** Cover (384 x 587.2 on the device): a 4-column grid, 314 dp wide, centered. */
function coverLayout(width: number, height: number): ScreenLayout {
  const left = (width - (3 * ICON.pitchX + ICON.size)) / 2;
  const { rows, pitch } = gridRows(height);
  const top = rows[0];
  return {
    width,
    height,
    cols: range(4, left, ICON.pitchX),
    rows,
    slots: fill(4, 5, (_c, r) => r < 2),
    widgets: {
      weather: { x: left, y: top, w: WIDGET.size, h: widgetHeight(pitch) },
      calendar: { x: left + 2 * ICON.pitchX, y: top, w: WIDGET.size, h: widgetHeight(pitch) },
    },
    dockY: dockY(height),
    dockXs: dockXs(width, DOCK.pitch),
    dotsX: width / 2,
    railX: width - left,
  };
}

/**
 * Inner (781 x 587.2 on the device): two 4-column blocks, one per half, so no icon crosses the
 * crease (x = width / 2). Left block: Weather + Calendar (rows 0-1), four apps (row 2), Now playing
 * (rows 3-4). Right block: eight apps (rows 0-1), Gallery + Reminder widgets (rows 2-3).
 */
const BLOCK = 3 * ICON.pitchX + ICON.size; // 314
function innerLayout(width: number, height: number): ScreenLayout {
  const left = (width / 2 - BLOCK) / 2;
  const rightBlock = width / 2 + left;
  const { rows, pitch } = gridRows(height);
  const top = rows[0];
  const h = widgetHeight(pitch);
  return {
    width,
    height,
    cols: [...range(4, left, ICON.pitchX), ...range(4, rightBlock, ICON.pitchX)],
    rows,
    slots: fill(8, 5, (c, r) => (c < 4 && r !== 2) || (c >= 4 && r >= 2)),
    widgets: {
      weather: { x: left, y: top, w: WIDGET.size, h },
      calendar: { x: left + 2 * ICON.pitchX, y: top, w: WIDGET.size, h },
      music: { x: left, y: rows[3], w: WIDGET.mediumWidth, h },
      photos: { x: rightBlock, y: rows[2], w: WIDGET.size, h },
      reminders: { x: rightBlock + 2 * ICON.pitchX, y: rows[2], w: WIDGET.size, h },
    },
    dockY: dockY(height),
    dockXs: dockXs(width, DOCK.innerPitch),
    dotsX: width / 2,
    railX: width - left,
  };
}

export type HomeLayout = ScreenLayout;

/** A display's home layout at any dp size (the device's displays, or a real phone's screen on /phone). */
export function buildHomeLayout(display: HomeDisplay, width: number, height: number): ScreenLayout {
  return display === "cover" ? coverLayout(width, height) : innerLayout(width, height);
}

/** The device's two displays (GEOM.viewport). */
export const HOME_LAYOUT: Record<HomeDisplay, ScreenLayout> = {
  cover: buildHomeLayout("cover", GEOM.viewport.cover.width, GEOM.viewport.cover.height),
  inner: buildHomeLayout("inner", GEOM.viewport.inner.width, GEOM.viewport.inner.height),
};

/** Icon rect (dp, in the display's viewport) of a grid or dock app. */
export function iconRectPt(display: HomeDisplay, app: HomeAppId, L: ScreenLayout = HOME_LAYOUT[display]): Rect | null {
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
