import { Platform, type TextStyle } from "react-native";

// Un-Said tokens, light theme. Brand values come from Gurneal's design/tokens/unsaid-tokens.json;
// the neutrals were flipped to white/near-white with dark ink (Nick, Oct 24 2026: "no dark mode").
// Every text pair here passes WCAG AA (4.5:1) on bg, surface and surfaceRaised.
export const color = {
  stage: "#F4F2FB",
  bg: "#FFFFFF",
  surface: "#F6F4FD",
  surfaceRaised: "#EEEAFB",
  hairline: "#E4E0F0",
  text: "#1D1742",
  text2: "#3B3570",
  text3: "#5F5A78",
  text4: "#66617E",
  // Text/icons that sit on the blue/indigo gradients (pills, mic, hero card).
  onAccent: "#FFFFFF",
  // Accent for text and small icons on light surfaces (violet is too pale for text on white).
  accent: "#5B45D6",
  // Soft violet tint for chips, selected rows and badges.
  tint: "rgba(168,144,246,0.16)",
  scrim: "rgba(29,23,66,0.28)",
  violet: "#A890F6",
  blue: "#4F62F4",
  indigo: "#4046EE",
  indigoDeep: "#3949EA",
  periwinkle: "#728CF4",
  lilac: "#B9ABF6",
  violetSoft: "#9885F4",
  caret: "#5B59F2",
  letter: "#EEEAFB",
  letterInk: "#1D1742",
  letterLabel: "#3B3570",
  letterAccent: "#504FF3",
  danger: "#D70015",
} as const;

// The only three gradients allowed inside Un-Said.
export const pillGradient = {
  colors: ["#4F62F4", "#4046EE", "#9885F4"] as const,
  locations: [0, 0.45, 1] as const,
};

export const space = { s4: 4, s8: 8, s12: 12, s16: 16, s24: 24, s32: 32, s48: 48, s64: 64 } as const;
export const inset = { text: 24, card: 16 } as const;
export const radius = { hero: 28, row: 16, square: 16, pill: 999 } as const;

// System stack only. iOS keeps SF; web uses system-ui. No downloaded font.
const sans = Platform.select<string | undefined>({ web: "system-ui", android: "sans-serif", default: undefined });

const t = (size: number, lineHeight: number, weight: TextStyle["fontWeight"], trackingEm = 0): TextStyle => ({
  fontSize: size,
  lineHeight,
  fontWeight: weight,
  letterSpacing: trackingEm * size,
  color: color.text,
  ...(sans ? { fontFamily: sans } : {}),
});

export const type = {
  wordmark: t(24, 28, "800", -0.01),
  display: t(36, 42, "800", -0.02),
  cardTitle: t(32, 40, "800", -0.02),
  compose: t(34, 42, "700", -0.02),
  letterHero: t(64, 72, "800", -0.03),
  letterBody: t(22, 28, "500"),
  signature: t(17, 22, "700"),
  navTitle: t(17, 22, "600", -0.01),
  section: t(18, 24, "700", -0.01),
  button: t(17, 22, "600"),
  rowName: t(15, 20, "700"),
  rowPreview: { ...t(13, 18, "400"), color: color.text2 },
  caption: { ...t(13, 18, "400"), color: color.text3 },
  meta: { ...t(12, 16, "500"), color: color.text3 },
  overline: { ...t(11, 14, "700", 0.1), color: color.text4, textTransform: "uppercase" },
  tab: t(11, 13, "600"),
  // A person's own words on cards (un-compose scaled to 22/28).
  words: t(22, 28, "700", -0.02),
} satisfies Record<string, TextStyle>;

export const shadow = {
  hero: { shadowColor: "#3949EA", shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  pill: { shadowColor: "#4046EE", shadowOpacity: 0.28, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  letter: { shadowColor: "#3949EA", shadowOpacity: 0.14, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 8 },
  // Soft lift for white cards on the white page.
  card: { shadowColor: "#1D1742", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
} as const;

// Springs from the motion tokens, as React Native Animated.spring configs.
export const spring = {
  press: { stiffness: 600, damping: 40, mass: 0.6 },
  sheet: { stiffness: 320, damping: 32, mass: 1 },
  banner: { stiffness: 300, damping: 30, mass: 1 },
  cardIn: { stiffness: 260, damping: 28, mass: 1 },
} as const;
