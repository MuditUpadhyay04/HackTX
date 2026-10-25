/**
 * lib/keyboard/layout.ts: the iOS keyboard look-alike's layouts (Phase 2 CHROME SPECS + INTERACTIVE
 * MESSAGING: QWERTY, shift, 123, emoji). Keys are drawn by components/ios/Keyboard.tsx.
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
};

export type Layout = "letters" | "numbers" | "symbols" | "emoji";

const chars = (s: string): KeyDef[] => Array.from(s).map((c) => ({ kind: "char", value: c }));

export const ROWS: Record<Exclude<Layout, "emoji">, KeyDef[][]> = {
  letters: [
    chars("qwertyuiop"),
    chars("asdfghjkl"),
    [{ kind: "shift", value: "shift", units: 1.3 }, ...chars("zxcvbnm"), { kind: "delete", value: "delete", units: 1.3 }],
    [
      { kind: "mode", value: "numbers", label: "123", units: 2.6 },
      { kind: "space", value: " ", label: "space", units: 6.1 },
      { kind: "return", value: "\n", label: "return", units: 2.6 },
    ],
  ],
  numbers: [
    chars("1234567890"),
    chars("-/:;()$&@\""),
    [
      { kind: "mode", value: "symbols", label: "#+=", units: 1.3 },
      ...chars(".,?!'").map((k) => ({ ...k, units: 1.38 })),
      { kind: "delete", value: "delete", units: 1.3 },
    ],
    [
      { kind: "mode", value: "letters", label: "ABC", units: 2.6 },
      { kind: "space", value: " ", label: "space", units: 6.1 },
      { kind: "return", value: "\n", label: "return", units: 2.6 },
    ],
  ],
  symbols: [
    chars("[]{}#%^*+="),
    chars("_\\|~<>€£¥•"),
    [
      { kind: "mode", value: "numbers", label: "123", units: 1.3 },
      ...chars(".,?!'").map((k) => ({ ...k, units: 1.38 })),
      { kind: "delete", value: "delete", units: 1.3 },
    ],
    [
      { kind: "mode", value: "letters", label: "ABC", units: 2.6 },
      { kind: "space", value: " ", label: "space", units: 6.1 },
      { kind: "return", value: "\n", label: "return", units: 2.6 },
    ],
  ],
};

/** The emoji page: the ones the people in this story actually use, then common faces and hearts. */
export const EMOJI = [
  "😊", "❤️", "🙂", "🤍", "🌅", "😂", "🥲", "🙏",
  "👍", "🫶", "😅", "🥹", "😴", "🙃", "🤝", "💯",
  "🔥", "✨", "🏀", "🐶", "🍜", "☕️", "🎧", "📚",
  "🚗", "🌧️", "😭", "🙌", "😌", "🤔", "👀", "💙",
];

/** iOS auto-capitalization: shift turns on at the start of the field and after ". ", "? ", "! ". */
export function autoShift(draft: string): boolean {
  if (draft.length === 0) return true;
  return /[.?!]\s$/.test(draft) || /\n$/.test(draft);
}
