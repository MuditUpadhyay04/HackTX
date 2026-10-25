/**
 * lib/tokens.ts: the single source of truth for every styling value in this build.
 *
 *   un        the Un-Said theme, synced from App-UI-Final (lib/unsaid-theme.json; never edit, never redefine)
 *   tokens    look-alike palettes + gradients + device colors (assets/palettes/branched-tokens.json,
 *             CLAUDE_PROMPT.md 4.2-4.3) and this build's own scales: space, radius, shadow, blur,
 *             type (iOS text styles + Meta sizes), device materials (Phase 1) and the wallpaper.
 *
 * app/tokens.css mirrors these values as CSS custom properties (same names: --wa-green,
 * --device-frame-base, --space-16, --radius-24, --shadow-banner, --blur-30, --type-body-size ...).
 * Keep the two in step; /test/tokens renders both side by side.
 * Phone motion lives in lib/motion.ts (section 4.4).
 */
import unTheme from "./unsaid-theme.json";
import branched from "../assets/palettes/branched-tokens.json";

/** The synced Un-Said theme (App-UI-Final/tokens/unsaid-tokens.json). Read only. */
export const un = unTheme;
export type UnTheme = typeof unTheme;

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
type Lookalike = typeof branched.lookalike;
type LookalikeColors = UnionToIntersection<Lookalike[keyof Lookalike]>;
type DeviceColors = { [K in keyof typeof branched.device as `device-${K & string}`]: string };

/** Look-alike palettes keyed by their section 4.2 group name (for swatch sheets). */
export const palettes = branched.lookalike;

/** Every look-alike color flattened by token name: wa-green ... ios-banner. */
const lookalikeColors = Object.assign({}, ...Object.values(branched.lookalike)) as LookalikeColors;

/** Device colors (section 4.3), prefixed: device-frame-base ... device-back-glass. */
const deviceColors = Object.fromEntries(
  Object.entries(branched.device).map(([k, v]) => [`device-${k}`, v]),
) as DeviceColors;

/** Colors this build adds beyond branched-tokens.json, each from the spec section noted. */
const extraColors = {
  // 4.3 stage (black behind the opening; white for light stages, Stage bg "white")
  "stage-black": "#000000",
  "stage-white": "#FFFFFF",
  // D12: the Apple product-page studio backdrop behind the device (warm off-white)
  "stage-studio": "#F5F5F1",
  // Phase 1 wallpaper base (the ios-wallpaper gradient sits on it)
  "ios-wallpaper-base": "#0B0B12",
  // iOS system label + separator colors (Apple HIG), light and dark, for iOS chrome text and hairlines
  "ios-label": "#000000",
  "ios-label-secondary": "rgba(60,60,67,0.6)",
  "ios-separator": "rgba(60,60,67,0.29)",
  "ios-bg": "#FFFFFF",
  "label-on-dark": "#FFFFFF",
  // iOS dark mode system colors (Apple HIG): elevated / grouped backgrounds, fill, separator, labels
  "ios-dark-elevated": "#1C1C1E",
  "ios-dark-grouped": "#2C2C2E",
  "ios-dark-fill": "#39393D",
  "ios-dark-separator": "rgba(84,84,88,0.65)",
  "ios-dark-label": "#FFFFFF",
  "ios-dark-label-2": "rgba(235,235,245,0.6)",
  "ios-dark-label-3": "rgba(235,235,245,0.3)",
  // Phase 1 device parts
  "device-island": "#000000",
  "device-display-off": "#000000",
  "device-hinge-cap": "#DCDBD6",
  "device-antenna": "#C4C3BD",
  "device-camera-control-ring": "#BFC3C9",
  "device-bump-rim": "#D2D1CC",
  "device-engraving": "#D2D1CC",
  "device-lidar": "#1A1C22",
  "device-mic": "#1A1C22",
  "device-front-camera-ring": "rgba(255,255,255,0.05)",
  "device-lens-reflection": "rgba(140,120,255,0.35)",
  "device-edge-highlight": "rgba(255,255,255,0.8)",
  "device-seam-highlight": "rgba(255,255,255,0.8)",
  "device-contact-shadow": "rgba(0,0,0,0.35)",
  "device-hinge-ripple": "rgba(255,255,255,0.25)",
  "device-test-grid": "rgba(255,255,255,0.22)",
  "device-test-outline": "rgba(255,255,255,0.7)",
  "device-test-label": "#FFFFFF",
  "device-debug-ruler": "rgba(255,255,255,0.55)",
  "device-debug-box": "#FF3B30",
  "device-debug-box-alt": "#0A84FF",
  "device-debug-label-bg": "rgba(0,0,0,0.72)",
  // Phase 2 look-alike apps (apps builder): CLAUDE_PROMPT.md Phase 2 CHROME SPECS, or the iOS system
  // colors (HIG) where the spec gives none
  "wa-wallpaper": "#EFE7DE",
  "wa-nav-material": "rgba(255,255,255,0.96)",
  "wa-pill": "rgba(255,255,255,0.92)",
  "wa-pill-text": "#54656F",
  "wa-missed-glyph": "#EA0038",
  "wa-missed-glyph-bg": "rgba(234,0,56,0.10)",
  "wa-caret": "#00A884",
  "wa-chip": "#F0F2F5",
  "wa-chip-active-text": "#15603E",
  "imsg-nav-material": "rgba(249,249,249,0.94)",
  "ios-fill-tertiary": "rgba(118,118,128,0.12)",
  "ios-scrim": "rgba(0,0,0,0.4)",
  "banner-stroke": "rgba(0,0,0,0.06)",
  "kb-label": "#000000",
  "kb-special-label": "#000000",
  "icon-photos-fill": "linear-gradient(180deg, #FFFFFF 0%, #ECECEC 100%)",
} as const;

export const color = { ...lookalikeColors, ...deviceColors, ...extraColors };
export type ColorToken = keyof typeof color;

// ---------------------------------------------------------------------------
// Gradients (look-alike, section 4.2; ios-wallpaper per the Phase 1 recipe)
// ---------------------------------------------------------------------------

/**
 * Phase 1 /device wallpaper: radial blobs from the synced un-icon-* colors (Gurneal's app icon) on #0B0B12.
 * The base is a flat linear-gradient so the whole value is a valid background-image list.
 * Render it on a layer with `wallpaper.filter` and `wallpaper.scale` (see below).
 */
const c = unTheme.color;
const iosWallpaper = [
  // Apple keynote look (D12): a dark vignette holding luminous blue -> violet -> orchid fields with
  // one bright lilac core, all blurred together so the colors bleed like light, not like blobs
  `radial-gradient(125% 100% at 50% 56%, transparent 52%, #05050B 100%)`,
  `radial-gradient(26% 32% at 57% 50%, ${c["un-icon-lilac"]}, transparent 70%)`,
  `radial-gradient(52% 66% at 82% 40%, ${c["un-icon-orchid"]}, transparent 72%)`,
  `radial-gradient(56% 76% at 20% 72%, ${c["un-icon-blue"]}, transparent 72%)`,
  `radial-gradient(62% 72% at 50% 62%, ${c["un-icon-violet"]}, transparent 72%)`,
  `radial-gradient(40% 48% at 86% 88%, ${c["un-icon-plum"]}, transparent 70%)`,
  `radial-gradient(36% 44% at 16% 22%, ${c["un-icon-periwinkle"]}, transparent 70%)`,
  `linear-gradient(#05050B, #05050B)`,
].join(", ");

/** The lit device display (iPhone Fold, Phase 1): the same synced un-icon-* colors, unblurred. */
const screenWallpaper = [
  // same keynote family as the stage (D12): luminous fields on a deep base, crisp (no blur on glass)
  `radial-gradient(42% 46% at 62% 40%, ${c["un-icon-lilac"]} 0%, transparent 72%)`,
  `radial-gradient(62% 72% at 88% 12%, ${c["un-icon-orchid"]} 0%, transparent 72%)`,
  `radial-gradient(75% 85% at 18% 92%, ${c["un-icon-blue"]} 0%, transparent 74%)`,
  `radial-gradient(85% 95% at 48% 58%, ${c["un-icon-violet"]} 0%, transparent 76%)`,
  `radial-gradient(50% 60% at 8% 12%, ${c["un-icon-periwinkle"]} 0%, transparent 72%)`,
  `linear-gradient(160deg, #120E2A 0%, #07060F 100%)`,
].join(", ");

export const gradient = {
  "ig-gradient": branched.lookalike_gradient["ig-gradient"],
  "ig-dm-out": branched.lookalike_gradient["ig-dm-out"],
  "messenger-gradient": branched.lookalike_gradient["messenger-gradient"],
  "meta-ai-gradient": branched.lookalike_gradient["meta-ai-gradient"],
  "ios-wallpaper": iosWallpaper,
};
export type GradientToken = keyof typeof gradient;

/** How the ios-wallpaper layer is rendered (Phase 1): blurred, scaled past its edges, 4% noise. */
export const wallpaper = {
  gradient: iosWallpaper,
  base: "#05050B",
  filter: "blur(80px) saturate(1.35)",
  scale: 1.2,
  noiseOpacity: 0.04,
} as const;

// ---------------------------------------------------------------------------
// Device (section 4.3) and Phase 1 materials
// ---------------------------------------------------------------------------

/** White iPhone Duo colors, unprefixed, exactly as branched-tokens.json `device`. */
export const device = branched.device;

/** Phase 1 device materials and the iOS materials of Phases 2-3 (full CSS values). */
export const material = {
  // white frame (titanium-ceramic)
  "device-frame-fill": "linear-gradient(135deg, #FFFFFF 0%, #EDECE8 18%, #D8D7D2 46%, #F4F3EF 68%, #BDBCB6 100%)",
  "device-frame-side-fill": "linear-gradient(225deg, #FFFFFF 0%, #EDECE8 18%, #D8D7D2 46%, #F4F3EF 68%, #BDBCB6 100%)",
  "device-frame-sheen":
    "repeating-linear-gradient(90deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 1px, rgba(255,255,255,0.10) 1px, rgba(255,255,255,0.10) 2px)",
  // black glass bezel
  "device-bezel-glare": "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 30%)",
  // hinge
  "device-hinge-segment": "linear-gradient(90deg, #CFCFCB 0%, #FFFFFF 32%, #EDECE8 55%, #C9C8C2 80%, #B2B1AB 100%)",
  // side buttons (left edge; the mirrored fill is for the right edge)
  "device-button-fill": "linear-gradient(90deg, #BDBCB6, #F4F3EF 60%, #D8D7D2)",
  "device-button-fill-mirrored": "linear-gradient(270deg, #BDBCB6, #F4F3EF 60%, #D8D7D2)",
  "device-camera-control-fill": "linear-gradient(90deg, #E4E6EA, #C9CDD3 50%, #F2F3F5)",
  // back glass and gloss (gloss uses background-size 250% 100%)
  "device-back-glass-fill": "linear-gradient(180deg, #F7F7F4 0%, #EFEFEB 55%, #E6E6E1 100%)",
  "device-back-gloss": "linear-gradient(105deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 65%)",
  // camera bump and lenses
  "device-camera-bump-fill": "linear-gradient(145deg, #FBFBF9, #E9E9E5)",
  "device-lens-ring-fill": "linear-gradient(135deg, #F2F1ED, #BDBCB6)",
  "device-lens": "radial-gradient(circle at 38% 32%, #3A4256 0%, #12151D 45%, #050608 100%)",
  "device-front-camera": "radial-gradient(circle at 35% 35%, #2B3140 0%, #0A0C12 60%, #000000 100%)",
  "device-flash": "radial-gradient(#FFF8E7, #E9DFC8)",
  // reflection fade (mask-image)
  "device-reflection-mask": "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0) 35%)",
  "device-reflection-filter": "blur(1.5px)",
  // iPhone Fold, natural titanium (RULES.md D10)
  "device-ti-band": "linear-gradient(135deg, #ECE9E3 0%, #A9A49B 16%, #D9D5CE 34%, #8E8A82 58%, #CFCBC4 78%, #6E6A63 100%)",
  "device-ti-side": "linear-gradient(180deg, #46443F 0%, #A39E95 10%, #F6F4F0 28%, #C3BEB5 50%, #DEDAD3 68%, #77736C 90%, #46443F 100%)",
  "device-ti-spine": "linear-gradient(180deg, #D9D5CE 0%, #B3AEA5 30%, #D2CEC7 55%, #8E8A82 100%)",
  "device-ti-brush": "repeating-linear-gradient(90deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 2px, rgba(255,255,255,0.07) 2px, rgba(255,255,255,0.07) 3px)",
  "device-back-glass-ti-fill": "linear-gradient(165deg, #E5E1DA 0%, #D5D1C9 45%, #C5C0B7 100%)",
  "device-back-glass-ti-gloss": "linear-gradient(110deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.32) 48%, rgba(255,255,255,0) 62%)",
  "device-plateau-fill": "linear-gradient(170deg, #DCD8D1 0%, #C9C4BB 55%, #B9B4AA 100%)",
  "device-lens-ring-ti": "linear-gradient(135deg, #E6E2DC 0%, #A39E95 55%, #46443F 100%)",
  // lit display wallpaper: the synced un-icon-* colors (Gurneal's app icon), deepened toward the bottom
  "device-screen-wallpaper": screenWallpaper,
  "device-screen-off": "linear-gradient(160deg, #17181C 0%, #060607 36%, #000000 100%)",
  "device-glass-sheen": "linear-gradient(118deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 22%, rgba(255,255,255,0) 40%)",
  // iOS light notification material (banners, Phase 2): fill + backdrop filter
  "material-light": "rgba(245,245,245,0.78)",
  "material-light-filter": "blur(30px) saturate(180%)",
  // home-screen glass (widgets, dock, search pill; Phase 3)
  "material-glass": "rgba(255,255,255,0.22)",
  "material-glass-filter": "blur(30px) saturate(1.6)",
  "material-glass-stroke": "rgba(255,255,255,0.35)",
  // fold-control pill (Phase 1), on dark / light stages
  "material-pill-dark": "rgba(255,255,255,0.14)",
  "material-pill-light": "rgba(0,0,0,0.06)",
  "material-pill-filter": "blur(20px)",
  // Messages look-alike app icon tile (Phase 2 banners; drawn, never an Apple file)
  "icon-messages-fill": "linear-gradient(180deg, #5CF777 0%, #0EBE2C 100%)",
} as const;
export type MaterialToken = keyof typeof material;

// ---------------------------------------------------------------------------
// Scales
// ---------------------------------------------------------------------------

/** 4-pt grid (pt = CSS px at 1x). 2/6/10/14 are the iOS half-steps the spec uses. */
export const space = {
  0: 0, 2: 2, 4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 14: 14, 16: 16, 20: 20, 24: 24, 28: 28,
  32: 32, 36: 36, 40: 40, 44: 44, 48: 48, 56: 56, 64: 64, 72: 72, 80: 80, 96: 96, 120: 120,
} as const;
export type SpaceToken = keyof typeof space;

/** iOS radii (pt). squircle = continuous-corner app icon (22.37%); pill = capsule. */
export const radius = {
  2: 2, 4: 4, 5: 5, 8: 8, 10: 10, 12: 12, 14: 14, 16: 16, 18: 18, 22: 22, 24: 24, 26: 26,
  28: 28, 34: 34, 40: 40, 44: 44, 52: 52, 62: 62, 68: 68,
  squircle: "22.37%",
  pill: 999,
} as const;
export type RadiusToken = keyof typeof radius;

/**
 * Fixed control sizes (pt) used in style props, so components never carry bare numbers.
 * iOS HIG: 44 pt minimum hit target; UISwitch 51 x 31 with a 27 pt knob inset 2 pt;
 * sheet grabber 36 x 5. The rest are this build's dev / test layouts.
 * Mirrored in app/tokens.css as --size-<kebab-name>.
 */
export const size = {
  tapTarget: 44,
  grabberWidth: 36,
  grabberHeight: 5,
  switchWidth: 51,
  switchHeight: 31,
  switchKnob: 27,
  switchInset: 2,
  focusRing: 2,
  imsgAppsButton: 34,
  metaAiSend: 32,
  devPanelWidth: 320,
  devClockField: 88,
  testTileWidth: 408,
  testTileHeight: 236,
  // host-app glyphs (/test/placeholder, the app shells): drawn on a 24-unit grid, shown at 20 or 24 pt
  glyphSmall: 20,
  glyphLarge: 24,
  // glyph stroke weight per host family, in RENDERED pt (the Glyph component scales it into the
  // 24-unit grid, so a 20 pt and a 24 pt glyph draw the same line). Tuned at 2x so every host's
  // outline reads as heavy as the iOS search / plus; Meta AI's arrow is white on a blue disc and
  // is drawn bold in Meta's UI, so it sits one step heavier.
  glyphStrokeIos: 1.6,
  glyphStrokeWhatsapp: 1.6,
  glyphStrokeInstagram: 1.6,
  glyphStrokeFacebook: 1.6,
  glyphStrokeMetaAi: 2,
  // iOS table-row disclosure chevron (8 x 13 pt, 2 pt stroke) on /scenes
  disclosureWidth: 8,
  disclosureHeight: 13,
  disclosureStroke: 2,
  // /test/tokens swatch-sheet layout (artboard px)
  testRail: 240,
  testListCol: 160,
  testSwatchWide: 200,
  testSwatchNarrow: 120,
  testSwatchTile: 112,
  testMaterialTile: 128,
  testTypeCol: 260,
  testScaleCol: 192,
  testUnCell: 104,
  testRefUnPaletteHeight: 198,
  testRefPaletteHeight: 435,
} as const;
export type SizeToken = keyof typeof size;

/** SF hairline (0.5 pt). */
export const hairline = 0.5;

/** Shadows: only where iOS uses them (section 5). Full box-shadow / text-shadow values. */
export const shadow = {
  // iOS notification banner (Phase 2: "the soft iOS banner shadow"; value chosen, spec gives none)
  banner: "0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)",
  // the "concept only" toast reads as an iOS HUD; same lift as the banner
  hud: "0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)",
  // floating iOS sheet (dev panel, sheets)
  sheet: "0 10px 40px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.08)",
  // iOS switch / slider knob
  knob: "0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06)",
  // iOS keyboard key (Phase 2)
  key: "0 1px 0 rgba(0,0,0,0.3)",
  // home-screen icon label (Phase 3, text-shadow)
  "icon-label": "0 0.5px 1px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.35)",
  // home-screen icon inner stroke (Phase 3)
  "icon-stroke": "inset 0 0 0 0.5px rgba(255,255,255,0.12)",
  // glass stroke for widgets / dock / pills (Phase 3)
  "glass-stroke": "inset 0 0 0 0.5px rgba(255,255,255,0.35)",
  // device (Phase 1)
  "device-drop": "0 2px 4px rgba(20,16,30,0.10), 0 24px 48px rgba(20,16,30,0.22), 0 60px 120px rgba(20,16,30,0.28)",
  "device-rim-light": "0 0 0 1px rgba(255,255,255,0.35), 0 0 60px rgba(255,255,255,0.05)",
  "device-outer-rim": "0 0 0 0.5px rgba(0,0,0,0.18)",
  "device-frame-inner": "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.12)",
  "device-bezel-inner": "inset 0 0 0 1px rgba(255,255,255,0.06)",
  "device-hinge-proud": "1px 0 0 rgba(0,0,0,0.08), -1px 0 0 rgba(0,0,0,0.08)",
  "device-camera-bump": "0 2px 6px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.08)",
  "device-plateau": "0 1px 0 rgba(255,255,255,0.55) inset, 0 -1px 0 rgba(0,0,0,0.10) inset, 0 0 0 0.75px rgba(0,0,0,0.16), 0 3px 8px rgba(0,0,0,0.16)",
  "device-lens-ring": "0 0 0 1px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.25)",
  "device-lens-glass": "inset 0 2px 6px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(0,0,0,0.6)",
  "device-button": "inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 0.5px rgba(0,0,0,0.25)",
  // Phase 2 look-alike apps
  "wa-bubble": "0 1px 0.5px rgba(11,20,26,0.13)",
  "key-pop": "0 1px 1px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.12)",
  "photo-time": "0 1px 2px rgba(0,0,0,0.45)",
} as const;
export type ShadowToken = keyof typeof shadow;

/** Backdrop / layer blur radii (px). 24 = device contact shadow. */
export const blur = { 20: 20, 24: 24, 30: 30, 60: 60, 80: 80 } as const;
export type BlurToken = keyof typeof blur;

// ---------------------------------------------------------------------------
// Phase 3 home screen (D8, D9, D12; home-screen builder). Mirrored in app/tokens.css as --home-* /
// --icon-* / --widget-* custom properties.
// ---------------------------------------------------------------------------

/**
 * The home-screen wallpaper (components/home/HomeWallpaper.tsx): the iOS 26 neutral silk "swoosh"
 * family, sampled from Gurneal's reference (https://iphone-duo-tawny.vercel.app, Launcher theme):
 * a deep ink / slate field on the left, silver-lilac and pearl ribbons, an espresso band and a gold
 * glow on the right. Drawn as SVG paths + gradients (no image file).
 */
export const homeWallpaper = {
  ink: "#141219",
  slate: "#2B3142",
  steel: "#5A6179",
  lilac: "#B7B6C4",
  pearl: "#DDD6D2",
  white: "#F4F1ED",
  mauve: "#8C8087",
  gold: "#CFA56C",
  amber: "#8A633D",
  espresso: "#2A1E18",
  taupe: "#7A6352",
  cream: "#E9DFD3",
  /** cast shadows and edge highlights inside the art */
  shade: "#000000",
  light: "#FFFFFF",
} as const;

/** Home-screen colors: icon tiles, widgets, page dots. */
export const homeColor = {
  // D9 official Meta icons: the tile each official file sits on, sampled from the file itself
  "icon-facebook-tile": "#0866FF", // Facebook_Logo_Primary.png circle fill (8, 102, 255)
  "icon-messenger-tile": "#FFFFFF", // the iOS Messenger icon: the blue bubble (Messenger_Icon_Primary_Blue.svg) on white
  "icon-whatsapp-tile": "#25D366", // Digital_Glyph_Green_RGB_2026.svg .cls-1 fill
  "icon-threads-tile": "#000000", // the iOS Threads icon: threads-logo-white.svg on black
  // D9: a Meta app with no official file yet shows a plain tile (no logo drawn)
  "icon-meta-pending": "#D1D1D6",
  // drawn Apple look-alikes (D8/D9: Messages, Phone, Photos)
  "icon-glyph": "#FFFFFF",
  "icon-green-top": "#54EF6D",
  "icon-green-bottom": "#25C040",
  "photos-petal-orange": "#FF8504",
  "photos-petal-yellow": "#FFC200",
  "photos-petal-lime": "#71C200",
  "photos-petal-green": "#2AA76D",
  "photos-petal-teal": "#38B6D8",
  "photos-petal-blue": "#3E8AEA",
  "photos-petal-purple": "#9A75DE",
  "photos-petal-pink": "#F057C1",
  "photos-petal-red": "#FF5560",
  "icon-glyph-frost-mid": "#ECFAEE",
  "icon-glyph-frost-end": "#B8ECC1",
  "icon-glass-rim": "#FFFFFF",
  // widgets (spec Phase 3 LAYOUT: Weather on a blue sky #3C8CE7 -> #7EC3F8; Calendar white with iOS red)
  "widget-weather-top": "#3C8CE7",
  "widget-weather-bottom": "#7EC3F8",
  "widget-weather-sun": "#FFD60A",
  "widget-calendar-bg": "#FFFFFF",
  "widget-event-blue": "#007AFF",
  "widget-event-purple": "#AF52DE",
  // page dots (spec: active white, inactive rgba(255,255,255,0.4))
  "home-dot-inactive": "rgba(255,255,255,0.4)",
  // Liquid Glass dock / search button edge highlight
  "home-glass-edge": "rgba(255,255,255,0.55)",
} as const;
export type HomeColorToken = keyof typeof homeColor;

/** Home-screen gradients (CSS values). */
export const homeGradient = {
  "icon-green-fill": `linear-gradient(180deg, ${homeColor["icon-green-top"]} 0%, ${homeColor["icon-green-bottom"]} 100%)`,
  "widget-weather-fill": `linear-gradient(180deg, ${homeColor["widget-weather-top"]} 0%, ${homeColor["widget-weather-bottom"]} 100%)`,
  // iOS 26 Liquid Glass sheen on the dock and the search button: lit top edge, clear body
  "home-glass-sheen": "linear-gradient(160deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.10) 40%, rgba(255,255,255,0.16) 100%)",
} as const;

/**
 * D12 smooth unfold: the moving half's content softens with a motion blur that is a pure function of
 * openAngle (0 at 0 and 180, peak mid-fold) and dims as it turns away from the viewer.
 * blurPeak / blurFloor in display px; dims are opacities of the content over the dark glass.
 */
export const foldMotion = {
  /** blur radius (px) at the middle of the fold */
  blurPeak: 9,
  /** below this radius the blur is dropped (lands sharp, no filter at rest) */
  blurFloor: 0.05,
  /** the curve of the blur over the fold: (sin(pi a / 180)) ^ blurCurve */
  blurCurve: 0.8,
  /** the cover home fades to this opacity as it swings edge-on (90 degrees) */
  coverDimTo: 0.3,
  /** the inner display's moving half starts from this opacity at 90 degrees */
  innerDimFrom: 0.4,
} as const;

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/** UI font: the system stack (SF on the recording Mac); Inter is a last-resort fallback only. */
export const font = {
  system: '-apple-system, "SF Pro Text", "SF Pro Display", system-ui, BlinkMacSystemFont, Inter, sans-serif',
} as const;

export type TypeStyle = {
  /** pt */
  size: number;
  /** pt */
  lineHeight: number;
  weight: number;
  /** letter-spacing in pt (SF tracking at this size, per the HIG) */
  tracking: number;
};

/**
 * iOS text styles (Apple HIG, Large / default Dynamic Type size) plus the Meta sizes
 * (Instagram / Facebook / Meta AI use 14, 15 and 17 pt; section 4.2).
 * The emphasized variant of an iOS style is the same metrics at weight 600.
 */
export const type = {
  largeTitle: { size: 34, lineHeight: 41, weight: 400, tracking: 0.4 },
  title1: { size: 28, lineHeight: 34, weight: 400, tracking: 0.38 },
  title2: { size: 22, lineHeight: 28, weight: 400, tracking: -0.26 },
  title3: { size: 20, lineHeight: 25, weight: 400, tracking: -0.45 },
  headline: { size: 17, lineHeight: 22, weight: 600, tracking: -0.43 },
  body: { size: 17, lineHeight: 22, weight: 400, tracking: -0.43 },
  callout: { size: 16, lineHeight: 21, weight: 400, tracking: -0.31 },
  subheadline: { size: 15, lineHeight: 20, weight: 400, tracking: -0.23 },
  footnote: { size: 13, lineHeight: 18, weight: 400, tracking: -0.08 },
  caption1: { size: 12, lineHeight: 16, weight: 400, tracking: 0 },
  caption2: { size: 11, lineHeight: 13, weight: 400, tracking: 0.06 },
  meta14: { size: 14, lineHeight: 18, weight: 400, tracking: 0 },
  meta15: { size: 15, lineHeight: 20, weight: 400, tracking: 0 },
  meta17: { size: 17, lineHeight: 22, weight: 600, tracking: 0 },
} as const satisfies Record<string, TypeStyle>;
export type TypeToken = keyof typeof type;

/** Weight used for the emphasized (semibold) variant of every iOS style. */
export const emphasizedWeight = 600;

/** CSS name of a type style: largeTitle -> large-title, meta14 -> meta-14. */
export function typeCssName(name: TypeToken): string {
  return name.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();
}

// ---------------------------------------------------------------------------

/** `cssVar("wa-green")` -> `var(--wa-green)`. Names are the app/tokens.css / app/unsaid-theme.css names. */
export function cssVar(name: string): string {
  return `var(--${name.replace(/^--/, "")})`;
}

export const tokens = {
  color,
  gradient,
  wallpaper,
  device,
  material,
  palettes,
  space,
  radius,
  size,
  hairline,
  shadow,
  blur,
  font,
  type,
  un,
} as const;

export default tokens;
