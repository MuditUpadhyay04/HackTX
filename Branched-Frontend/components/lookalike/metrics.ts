// @token-source: look-alike app geometry in iOS pt, from CLAUDE_PROMPT.md Phase 2 CHROME SPECS (Apple HIG / the real apps where the spec gives none)
/**
 * Every size, gap, radius and type size the look-alike apps use, in pt (= CSS px inside the
 * cover display's 402 x 573.1 pt viewport, GEOM.viewport.cover). Components read these by name.
 * Colors are NOT here: they are CSS variables in app/tokens.css.
 */
import { GEOM } from "@/components/device/geometry";

export const SCREEN = {
  width: GEOM.viewport.cover.width,
  height: GEOM.viewport.cover.height,
} as const;

/** The cover display's punch-hole in viewport pt (center from the top-right corner). */
export const PUNCH_PT = {
  diameter: GEOM.punch.cover.diameter / GEOM.viewport.scale,
  fromRight: GEOM.punch.cover.fromRight / GEOM.viewport.scale,
  fromTop: GEOM.punch.cover.fromTop / GEOM.viewport.scale,
} as const;

export const STATUS = {
  /** status bar height (Phase 2 CHROME SPECS: 54 pt) */
  height: 54,
  /** items sit on the punch-hole's center line */
  center: PUNCH_PT.fromTop,
  timeSize: 17,
  timeLeft: 28,
  /** gap kept between the right cluster and the punch-hole */
  holeGap: 14,
  clusterGap: 6,
  cellular: { width: 18, height: 12 },
  wifi: { width: 16, height: 12 },
  battery: { width: 26, height: 12.5, nub: 1.5, inset: 2, radius: 4, level: 0.72 },
} as const;

export const HOME_INDICATOR = { width: 134, height: 5, radius: 2.5, bottom: 8 } as const;

/** Bottom safe area (home indicator) under the composer when the keyboard is down. */
export const SAFE_BOTTOM = 26;

export const KEYBOARD = {
  height: 291,
  predictive: 44,
  keyHeight: 42,
  rowGap: 11,
  keyGap: 6,
  sideInset: 3,
  topInset: 6,
  radius: 5,
  letterSize: 22.5,
  labelSize: 16,
  /** the bottom strip (emoji / dictation glyphs) below the key rows: height minus predictive bar and
   *  rows (44 + 0.5 + 4 × 42 + 5.5 + 3 × 11 = 251) leaves 40; 38 keeps a 2 pt gap above the glyphs */
  strip: 38,
  glyph: 26,
  pop: { width: 52, height: 108, letterSize: 34 },
  deleteRepeat: { delay: 400, start: 110, min: 40, accel: 0.85 },
} as const;

export const CARET = { width: 2, height: 20 } as const;

export const WA = {
  navHeight: 52,
  backChevron: { width: 12, height: 21 },
  avatar: 36,
  nameSize: 17,
  subtitleSize: 12,
  bubbleText: 16.5,
  bubbleLine: 21,
  bubbleRadius: 8,
  bubblePadX: 8,
  bubblePadTop: 6,
  bubblePadBottom: 7,
  bubbleMax: 0.8,
  bubbleSideInset: 14,
  tail: { width: 8, height: 13 },
  runGap: 2,
  groupGap: 8,
  timeSize: 11,
  timeSpacer: 58,
  timeSpacerMine: 72,
  tick: { width: 16, height: 11 },
  pillSize: 12.5,
  pillPadX: 10,
  pillPadY: 5,
  pillRadius: 8,
  pillGap: 10,
  missed: { glyph: 34, title: 15, sub: 13, width: 236 },
  seenSize: 12,
  seenGap: 4,
  photo: { width: 240, height: 300, inset: 3, radius: 6 },
  composer: { height: 52, field: 36, glyph: 26, gap: 14, fieldRadius: 18, send: 34, padX: 10 },
  chatList: {
    titleSize: 34,
    rowHeight: 76,
    avatar: 54,
    nameSize: 17,
    previewSize: 15,
    timeSize: 14,
    badge: 20,
    badgeSize: 13,
    chipHeight: 32,
    chipSize: 15,
    searchHeight: 36,
  },
  tabBar: { height: 50, glyph: 28, labelSize: 10, badge: 18 },
  doodleTile: 220,
} as const;

export const IMSG = {
  navHeight: 92,
  avatar: 54,
  nameSize: 12,
  bubbleText: 17,
  bubbleLine: 22,
  bubbleRadius: 18,
  bubblePadX: 12,
  bubblePadY: 7,
  bubbleMax: 0.72,
  sideInset: 16,
  runGap: 2,
  groupGap: 8,
  stampSize: 11,
  stampGap: 14,
  receiptSize: 11,
  tail: { width: 17, height: 21 },
  pill: { height: 20, minWidth: 20, size: 13 },
  composer: { height: 52, plus: 34, field: 36, glyph: 22, send: 28, gap: 8, padX: 12 },
  typing: { width: 58, height: 36, dot: 8, gap: 4 },
  facetime: { width: 30, height: 22 },
} as const;

export const IG = {
  navHeight: 56,
  avatar: 32,
  nameSize: 16,
  subtitleSize: 12,
  bubbleText: 16,
  bubbleLine: 21,
  bubbleRadius: 22,
  innerRadius: 4,
  bubblePadX: 14,
  bubblePadY: 9,
  bubbleMax: 0.7,
  sideInset: 14,
  runAvatar: 28,
  runAvatarGap: 8,
  runGap: 2,
  groupGap: 10,
  stampSize: 12,
  stampGap: 16,
  ageSize: 12,
  reel: { width: 160, height: 284, radius: 14, avatar: 24, handleSize: 13, glyph: 22, captionSize: 13 },
  photo: { width: 200, height: 260, radius: 18 },
  composer: { height: 60, field: 44, camera: 34, glyph: 24, gap: 16, padX: 12, sendSize: 16 },
  seenSize: 12,
} as const;

export const BANNER = {
  sideInset: 8,
  /** 6 pt under the camera area: the cover display's status bar */
  top: 10,
  radius: 24,
  pad: 14,
  icon: 38,
  iconGap: 10,
  titleSize: 15,
  bodySize: 15,
  line: 20,
  timeSize: 13,
  stackOffset: 8,
  stackScale: 0.05,
  dismissDistance: 40,
} as const;

export const SHEET = { radius: 14, rowHeight: 57, gap: 8, side: 8, titleSize: 20 } as const;
