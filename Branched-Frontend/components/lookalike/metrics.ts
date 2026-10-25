// @token-source: look-alike app geometry in Android dp (One UI 9 / the real Android apps)
/**
 * Every size, gap, radius and type size the look-alike apps use, in dp (= CSS px inside the
 * cover display's 384 x 587.2 dp viewport, GEOM.viewport.cover). Components read these by name.
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

/** One UI status bar (dp): the clock and icons on the punch-hole's center line. */
export const STATUS = {
  height: 38,
  /** items sit on the punch-hole's center line */
  center: PUNCH_PT.fromTop,
  timeSize: 14,
  /** leading / trailing inset, clear of the display's rounded corners */
  side: 22,
  clusterGap: 5,
  cellular: { width: 14, height: 14 },
  wifi: { width: 16, height: 13 },
  battery: { width: 22, height: 11, nub: 2, inset: 2, radius: 3, level: 0.72, textSize: 12.5, textGap: 3 },
  notif: { size: 14, gap: 4 },
} as const;

/** The One UI gesture handle (navigation gestures on): a thin pill near the bottom edge. */
export const HOME_INDICATOR = { width: 112, height: 4, radius: 2, bottom: 7 } as const;

/** Bottom safe area (gesture handle) under the composer when the keyboard is down. */
export const SAFE_BOTTOM = 18;

/**
 * Samsung Keyboard (One UI 9, light, QWERTY) at 384 dp wide. Height = toolbar 44 + topInset 6 +
 * 4 rows x 46 + 3 gaps x 8 + bottomInset 6 + the gesture strip 20 = 284.
 */
export const KEYBOARD = {
  height: 284,
  /** the toolbar row (emoji, stickers, GIF, voice, clipboard, settings, more) that suggestions replace */
  toolbar: 44,
  toolbarGlyph: 22,
  suggestionSize: 16,
  keyHeight: 46,
  rowGap: 8,
  keyGap: 5,
  sideInset: 4,
  topInset: 6,
  bottomInset: 6,
  radius: 9,
  letterSize: 21,
  labelSize: 15,
  /** the small long-press number in the top row keys' corner */
  hintSize: 9.5,
  /** width in key units of the shift / delete / !#1 / return keys */
  wideUnits: 1.42,
  /** the gesture-navigation strip under the key rows */
  strip: 20,
  glyph: 22,
  /** the key preview bubble shown above a pressed letter */
  pop: { width: 44, height: 50, gap: 6, radius: 12, letterSize: 26 },
  deleteRepeat: { delay: 400, start: 110, min: 40, accel: 0.85 },
} as const;

/** The Android text cursor: a 2 dp bar in the app's accent color. */
export const CARET = { width: 2, height: 20 } as const;

export const WA = {
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
  doodleTile: 220,
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

