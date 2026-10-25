/**
 * lib/keyboard/layout.ts: the Samsung Keyboard look-alike's layouts (One UI 9: QWERTY, shift,
 * the "!#1" symbol pages 1/2 and 2/2, emoji). Keys are drawn by components/system/Keyboard.tsx.
 */

export type KeyKind = "char" | "shift" | "delete" | "mode" | "space" | "return";

export type KeyDef = {
  kind: KeyKind;
  /** the character typed (char), or the mode switched to (mode) */
  value: string;
  /** the visible cap; defaults to value */
  label?: string;
  /** width in key units (1 = one letter key) */
  units?: number;
  /** small long-press hint in the key's top-right corner (Samsung shows the digits on the top row) */
  hint?: string;
};

export type Layout = "letters" | "numbers" | "symbols" | "emoji";

/** Shift / delete / !#1 / return width (key units). */
export const WIDE = 1.42;

const chars = (s: string): KeyDef[] => Array.from(s).map((c) => ({ kind: "char", value: c }));

const bottomRow = (mode: KeyDef): KeyDef[] => [
  { ...mode, units: WIDE },
  { kind: "char", value: "," },
  { kind: "space", value: " ", label: "English (US)" },
  { kind: "char", value: "." },
  { kind: "return", value: "\n", units: WIDE },
];

export const ROWS: Record<Exclude<Layout, "emoji">, KeyDef[][]> = {
  letters: [
    chars("qwertyuiop").map((k, i) => ({ ...k, hint: String((i + 1) % 10) })),
    chars("asdfghjkl"),
    [{ kind: "shift", value: "shift", units: WIDE }, ...chars("zxcvbnm"), { kind: "delete", value: "delete", units: WIDE }],
    bottomRow({ kind: "mode", value: "numbers", label: "!#1" }),
  ],
  numbers: [
    chars("1234567890"),
    chars("@#$%&-+()/"),
    [{ kind: "mode", value: "symbols", label: "1/2", units: WIDE }, ...chars("*\"':;!?"), { kind: "delete", value: "delete", units: WIDE }],
    bottomRow({ kind: "mode", value: "letters", label: "ABC" }),
  ],
  symbols: [
    chars("~`|•√π÷×¶∆"),
    chars("£€¥^°={}\\%"),
    [{ kind: "mode", value: "numbers", label: "2/2", units: WIDE }, ...chars("_<>[]©✓"), { kind: "delete", value: "delete", units: WIDE }],
    bottomRow({ kind: "mode", value: "letters", label: "ABC" }),
  ],
};

/** The emoji page: the ones the people in this story actually use, then common faces and hearts. */
export const EMOJI = [
  "😊", "❤️", "🙂", "🤍", "🌅", "😂", "🥲", "🙏",
  "👍", "🫶", "😅", "🥹", "😴", "🙃", "🤝", "💯",
  "🔥", "✨", "🏀", "🐶", "🍜", "☕️", "🎧", "📚",
  "🚗", "🌧️", "😭", "🙌", "😌", "🤔", "👀", "💙",
];

/** Auto-capitalization: shift turns on at the start of the field and after ". ", "? ", "! ", or a new line. */
export function autoShift(draft: string): boolean {
  if (draft.length === 0) return true;
  return /[.?!]\s$/.test(draft) || /\n$/.test(draft);
}
