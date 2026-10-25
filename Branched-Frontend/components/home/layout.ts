// @token-source: Phase 3 home-screen geometry in pt (CLAUDE_PROMPT.md Phase 3 HOME GRID; D8 layout; measured from Gurneal's reference iphone-duo-tawny.vercel.app)
/**
 * components/home/layout.ts: every number of the two home screens, in the displays' logical pt
 * (GEOM.viewport: cover 402 x 573.1, inner 822.5 x 573.1), plus the app lists and getIconRect().
 *
 * COVER (folded, iPhone layout like the reference's folded state): two small widgets on top, a 4-column
 * icon grid under them, a vertical dock on the right edge under the punch-hole, the search button
 * bottom-right, page dots bottom-center.
 * INNER (unfolded, D8): ONE continuous iPadOS-style home across both halves: an 8-column grid (4 per
 * half, never crossing the hinge), Weather + Calendar widgets top-left, the time + Wi-Fi and the
 * vertical dock on the right edge, the search button bottom-right, page dots bottom-center.
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
  photos: "Photos",
  phone: "Phone",
};

/** The dock (top to bottom). */
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

/** Shared icon metrics (pt). */
export const ICON = {
  /** grid icon side */
  size: 52,
  /** dock icon side */
  dockSize: 46,
  /** icon -> label gap (spec: 5 pt) */
  labelGap: 5,
  /** label line box (11 pt caption 2) */
  labelHeight: 13,
  /** column pitch (icon + gap) */
  pitchX: 76,
  /** row pitch */
  pitchY: 84,
} as const;

/** Small widget: two columns by two rows minus the label line. */
export const WIDGET = {
  size: ICON.pitchX + ICON.size, // 128
  radius: 24,
  padding: 14,
  labelGap: 5,
  /** calendar event color bar */
  eventBar: 3,
} as const;

/** Cover-display punch-hole in pt (the status bar keeps its right cluster clear of it). */
export const PUNCH = {
  diameter: GEOM.punch.cover.diameter / GEOM.viewport.scale,
  fromRight: GEOM.punch.cover.fromRight / GEOM.viewport.scale,
  fromTop: GEOM.punch.cover.fromTop / GEOM.viewport.scale,
} as const;

/** Status bar (Phase 2 CHROME SPECS: "9:41" semibold 17 pt; 4 bars, 3 Wi-Fi arcs, battery). */
export const STATUS = {
  height: 54,
  timeSize: 17,
  /** cover: time at the leading edge on the punch-hole's center line */
  coverTimeLeft: 28,
  coverCenter: PUNCH.fromTop,
  /** gap between the right cluster and the punch-hole */
  holeGap: 12,
  clusterGap: 6,
  cellular: { width: 18, height: 12 },
  wifi: { width: 16, height: 12 },
  battery: { width: 26, height: 12.5, nub: 1.5, inset: 2, radius: 4, level: 0.72 },
  /** inner (D8): time + Wi-Fi stacked at the top of the right rail */
  railTimeTop: 24,
  railTimeSize: 15,
  railWifiGap: 8,
} as const;

/** Home indicator: 134 x 5 pt, 8 pt from the bottom (apps only; iOS hides it on the home screen). */
export const HOME_INDICATOR = { width: 134, height: 5, radius: 2.5, bottom: 8 } as const;

/** Vertical dock (Liquid Glass capsule). */
export const DOCK = {
  padding: 7,
  gap: 10,
  width: ICON.dockSize + 2 * 7, // 60
  height: 4 * ICON.dockSize + 3 * 10 + 2 * 7, // 228
  radius: 30,
} as const;

export const SEARCH = { size: 36, glyph: 15, bottom: 20 } as const;
export const DOTS = { size: 7, gap: 9, bottom: 16 } as const;

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
  widgets: { weather: Rect; calendar: Rect };
  /** center x of the right rail (dock, search, D8 status) */
  railX: number;
  dockTop: number;
  /** center x of the page dots */
  dotsX: number;
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

/** Cover (402 x 573.1): grid x 28-308, rail centered under the punch-hole. */
const COVER_TOP = 58;
const COVER_LEFT = 28;
const coverLayout: ScreenLayout = {
  width: cover.width,
  height: cover.height,
  cols: range(4, COVER_LEFT, ICON.pitchX),
  rows: range(6, COVER_TOP, ICON.pitchY),
  slots: fill(4, 6, (_c, r) => r < 2),
  widgets: {
    weather: { x: COVER_LEFT, y: COVER_TOP, w: WIDGET.size, h: WIDGET.size },
    calendar: { x: COVER_LEFT + 2 * ICON.pitchX, y: COVER_TOP, w: WIDGET.size, h: WIDGET.size },
  },
  railX: cover.width - 46,
  dockTop: 206,
  dotsX: cover.width / 2,
};

/**
 * Inner (822.5 x 573.1): two 4-column blocks, one per half, so no icon crosses the hinge
 * (x 411.25); the widgets fill the left block's first two rows.
 */
const INNER_TOP = 52;
const INNER_LEFT = 52;
const INNER_RIGHT_BLOCK = 436;
const innerLayout: ScreenLayout = {
  width: inner.width,
  height: inner.height,
  cols: [...range(4, INNER_LEFT, ICON.pitchX), ...range(4, INNER_RIGHT_BLOCK, ICON.pitchX)],
  rows: range(6, INNER_TOP, ICON.pitchY),
  slots: fill(8, 6, (c, r) => c < 4 && r < 2),
  widgets: {
    weather: { x: INNER_LEFT, y: INNER_TOP, w: WIDGET.size, h: WIDGET.size },
    calendar: { x: INNER_LEFT + 2 * ICON.pitchX, y: INNER_TOP, w: WIDGET.size, h: WIDGET.size },
  },
  railX: inner.width - 48,
  dockTop: 190,
  dotsX: (INNER_LEFT + INNER_RIGHT_BLOCK + 3 * ICON.pitchX + ICON.size) / 2,
};

export const HOME_LAYOUT: Record<HomeDisplay, ScreenLayout> = { cover: coverLayout, inner: innerLayout };

/** Icon rect (pt, in the display's viewport) of a grid or dock app. */
export function iconRectPt(display: HomeDisplay, app: HomeAppId): Rect | null {
  const L = HOME_LAYOUT[display];
  const slot = L.slots[app];
  if (slot) return { x: L.cols[slot.col], y: L.rows[slot.row], w: ICON.size, h: ICON.size };
  const d = DOCK_APPS.indexOf(app);
  if (d >= 0) {
    return {
      x: L.railX - ICON.dockSize / 2,
      y: L.dockTop + DOCK.padding + d * (ICON.dockSize + DOCK.gap),
      w: ICON.dockSize,
      h: ICON.dockSize,
    };
  }
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
