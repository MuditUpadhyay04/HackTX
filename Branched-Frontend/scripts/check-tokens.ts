/**
 * npm run check:tokens
 *
 * Fails (exit 1) on hard-coded styling values outside the token files:
 *   - hex colors            #fff, #A890F6, #00000080
 *   - color functions       rgb( rgba( hsl( hsla(
 *   - raw px values         "12px", 0.5px, Tailwind arbitrary w-[12px]
 *   - Tailwind default grey palettes   bg-zinc-200, text-slate-500, border-gray-300, ...
 *   - Tailwind default focus rings     focus:ring, focus-visible:ring-2, ring-offset-2
 *   - bare numeric sizes    `width: 44`, `padding: 8`, `borderRadius: 12` (React reads these as px)
 *                           on size / spacing / radius / type style keys, inside `style={{ }}`,
 *                           `style: { }`, `CSSProperties` constants and functions returning
 *                           CSSProperties, in components/ and app/ (.ts .tsx). Allowed: 0,
 *                           unitless lineHeight (< 4), and any expression that references an
 *                           identifier (`GEOM.x`, `size`, `2 * SWITCH.inset`). A ternary is
 *                           checked branch by branch.
 *   - px built in a template literal   `${12}px`, `repeat(14, ${CELL}px)` where CELL is a
 *                           same-file `const CELL = 104` (components/, app/). Interpolations that
 *                           reference anything else (props, geometry tokens, runtime values:
 *                           `${GEOM.x}px`, `${-(thickness + GAP)}px`) are computed, not literals.
 *   - numeric size defaults on parameters / destructuring   `{ width = 112 }`, `(size = 24)`,
 *                           `strokeWidth = 2` on width / height / size / radius / gap / padding /
 *                           margin / inset / stroke-named bindings (components/, app/). 0 is allowed;
 *                           a default that references a token (`width = size.x`) is fine.
 *
 * Scans components/, app/ and lib/ (.ts .tsx .js .jsx .mjs .css). Lines inside
 * comments are skipped.
 *
 * Allowlist (these files ARE the tokens):
 *   lib/tokens.ts, lib/motion.ts, app/tokens.css, app/unsaid-theme.css,
 *   lib/unsaid-theme.json, components/device/geometry.ts
 *
 * Escape hatch: a file whose FIRST line contains the marker `@token-source`
 * (e.g. `// @token-source: device geometry from spec section Phase 1`) is
 * treated as a token module and skipped. Use it only for files that define
 * values, never for components that consume them; reviewers check every use.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/server";

const SCAN_DIRS = ["components", "app", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]);
const SKIP_DIRS = new Set(["node_modules", ".next"]);
const ALLOWLIST = new Set([
  "lib/tokens.ts",
  "lib/motion.ts",
  "app/tokens.css",
  "app/unsaid-theme.css",
  "lib/unsaid-theme.json",
  "components/device/geometry.ts",
]);
const MARKER = "@token-source";

type Rule = { name: string; re: RegExp };
const RULES: Rule[] = [
  // Not after "&" (HTML entities like &#123;) or a word char; not an anchor href.
  { name: "hex color", re: /(?<![&\w])(?<!href=\{?["'`]?)#[0-9a-fA-F]{3,8}\b/g },
  { name: "color function", re: /\b(?:rgba?|hsla?)\(/g },
  { name: "raw px", re: /\b\d+(?:\.\d+)?px\b/g },
  {
    name: "tailwind default palette",
    re: /\b(?:bg|text|border|ring|from|to|via|fill|stroke)-(?:zinc|slate|gray|neutral|stone)-\d{2,3}\b/g,
  },
  {
    name: "tailwind default focus ring",
    re: /\b(?:focus|focus-visible|focus-within):ring(?:-\d+)?(?![\w[-])|\bring-offset-\d+\b/g,
  },
];

/* ---------- bare numeric sizes in style objects (P0-R1-9) ---------- */

const NUMERIC_SCAN_DIRS = ["components/", "app/"];
const NUMERIC_EXTENSIONS = new Set([".ts", ".tsx"]);

/** Style keys whose bare numbers React renders as px. */
const SIZE_KEY = new RegExp(
  String.raw`(^|[{,\s(])(` +
    [
      "width",
      "height",
      "(?:min|max)(?:Width|Height|InlineSize|BlockSize)",
      "inlineSize",
      "blockSize",
      "flexBasis",
      "padding(?:Top|Right|Bottom|Left|Inline|Block|InlineStart|InlineEnd|BlockStart|BlockEnd)?",
      "margin(?:Top|Right|Bottom|Left|Inline|Block|InlineStart|InlineEnd|BlockStart|BlockEnd)?",
      "gap",
      "rowGap",
      "columnGap",
      "top",
      "left",
      "right",
      "bottom",
      "inset(?:Inline|Block|InlineStart|InlineEnd|BlockStart|BlockEnd)?",
      "border(?:TopLeft|TopRight|BottomLeft|BottomRight|StartStart|StartEnd|EndStart|EndEnd)?Radius",
      "borderWidth",
      "outlineWidth",
      "outlineOffset",
      "fontSize",
      "lineHeight",
      "letterSpacing",
    ].join("|") +
    String.raw`)\s*:`,
  "g",
);

/** Where a style object region starts; the match ends right before its opening brace. */
const REGION_START = [
  /\bstyle=\{\s*(?=\{)/g, // style={{ ... }}
  /\bstyle\s*:\s*(?=\{)/g, // style: { ... } (toast options, motion props)
  /\bCSSProperties\s*=\s*(?=\{)/g, // const x: CSSProperties = { ... }
  /\)\s*:\s*CSSProperties\s*(?=\{)/g, // function f(): CSSProperties { ... }
];

/** Index of the brace matching the one at `open`, skipping strings and template text. */
function matchBrace(src: string, open: number): number {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      for (i++; i < src.length && src[i] !== q; i++) {
        if (src[i] === "\\") i++;
        else if (q === "`" && src[i] === "$" && src[i + 1] === "{") i = matchBrace(src, i + 1);
      }
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return i;
  }
  return src.length - 1;
}

/** The value expression after `key:` up to the next top-level `,` or the region end. */
function readValue(src: string, from: number, end: number): string {
  let depth = 0;
  let i = from;
  for (; i < end; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      for (i++; i < end && src[i] !== q; i++) if (src[i] === "\\") i++;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") {
      if (depth === 0) break;
      depth--;
    } else if (ch === "," && depth === 0) break;
  }
  return src.slice(from, i);
}

/** True when a ternary-free expression is a bare nonzero number (no identifiers, no strings). */
function isBareNumber(expr: string, key: string): boolean {
  const e = expr.trim();
  if (!/^[-+*/%().\d\s]+$/.test(e)) return false; // identifiers, strings, templates: fine
  const nums = e.match(/\d+(?:\.\d+)?/g) ?? [];
  if (!nums.some((n) => Number(n) !== 0)) return false;
  if (key === "lineHeight") return nums.some((n) => Number(n) >= 4); // unitless multipliers are fine
  return true;
}

/** Splits `a ? b : c` at the top level into its two branches (nested ternaries recurse). */
function branches(expr: string): string[] {
  let depth = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      for (i++; i < expr.length && expr[i] !== q; i++) if (expr[i] === "\\") i++;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth--;
    else if (ch === "?" && depth === 0 && expr[i + 1] !== "?" && expr[i + 1] !== ".") {
      // find the matching ":" for this "?"
      let d = 0;
      let nest = 0;
      for (let j = i + 1; j < expr.length; j++) {
        const c = expr[j];
        if (c === "(" || c === "[" || c === "{") d++;
        else if (c === ")" || c === "]" || c === "}") d--;
        else if (d === 0 && c === "?" && expr[j + 1] !== "?" && expr[j + 1] !== ".") nest++;
        else if (d === 0 && c === ":") {
          if (nest === 0) return [...branches(expr.slice(i + 1, j)), ...branches(expr.slice(j + 1))];
          nest--;
        }
      }
    }
  }
  return [expr];
}

function numericHits(rel: string, code: string): string[] {
  const out: string[] = [];
  const lineStarts = [0];
  for (let i = 0; i < code.length; i++) if (code[i] === "\n") lineStarts.push(i + 1);
  const lineOf = (idx: number) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= idx) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
  const seen = new Set<number>();
  for (const start of REGION_START) {
    start.lastIndex = 0;
    for (const m of code.matchAll(start)) {
      const open = (m.index ?? 0) + m[0].length;
      if (seen.has(open)) continue;
      seen.add(open);
      const close = matchBrace(code, open);
      const region = code.slice(open + 1, close);
      SIZE_KEY.lastIndex = 0;
      for (const k of region.matchAll(SIZE_KEY)) {
        const key = k[2];
        const valueFrom = (k.index ?? 0) + k[0].length;
        const value = readValue(region, valueFrom, region.length);
        for (const branch of branches(value)) {
          if (isBareNumber(branch, key)) {
            const at = open + 1 + (k.index ?? 0) + k[1].length;
            out.push(`${rel}:${lineOf(at)}: ${key}: ${value.trim()}  (bare numeric size)`);
            break;
          }
        }
      }
    }
  }
  return out;
}

/* ---------- px through template literals + numeric size defaults (P0-R2-15) ---------- */

/** `${expr}px` inside a template literal: the px unit is written after an interpolation. */
const TEMPLATE_PX = /\$\{([^`]*?)\}px\b/g;

/** Names bound in this file by `const NAME = <number literal>` (optionally typed / negative). */
function numericConsts(code: string): Set<string> {
  const names = new Set<string>();
  for (const m of code.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*(?::\s*number\s*)?=\s*-?\d+(?:\.\d+)?\s*(?:as\s+const\s*)?[;\n]/g)) {
    names.add(m[1]);
  }
  return names;
}

/** True when an interpolation is only number literals and same-file numeric consts (one nonzero). */
function isLiteralPx(expr: string, consts: Set<string>): boolean {
  const ids = expr.match(/[A-Za-z_$][\w$]*/g) ?? [];
  if (ids.some((id) => !consts.has(id))) return false;
  if (!/^[-+*/%().\d\s\w$]+$/.test(expr)) return false;
  const nums = expr.match(/(?<![\w$])\d+(?:\.\d+)?/g) ?? [];
  return ids.length > 0 || nums.some((n) => Number(n) !== 0);
}

/**
 * `name = <number>` where name is size-like and the binding is a parameter or destructuring
 * default: preceded by `(`, `{`, `,` or the start of a line, followed by `,`, `}`, `)` or the
 * end of the line (a `;` statement is an assignment, not a default).
 */
const SIZE_DEFAULT =
  /(?:^|[({,])\s*(\w*(?:[Ww]idth|[Hh]eight|[Ss]ize|[Rr]adius|[Gg]ap|[Pp]adding|[Mm]argin|[Ii]nset|[Ss]troke)\w*)\s*(?::\s*number\s*)?=(?![=>])\s*(-?\d+(?:\.\d+)?)\s*(?=[,})]|$)/g;

function lineHits(rel: string, lines: string[]): string[] {
  const out: string[] = [];
  const consts = numericConsts(lines.join("\n"));
  lines.forEach((code, idx) => {
    if (!code.trim()) return;
    TEMPLATE_PX.lastIndex = 0;
    for (const m of code.matchAll(TEMPLATE_PX)) {
      if (isLiteralPx(m[1], consts)) out.push(`${rel}:${idx + 1}: ${m[0]}  (px in template literal)`);
    }
    SIZE_DEFAULT.lastIndex = 0;
    for (const m of code.matchAll(SIZE_DEFAULT)) {
      if (Number(m[2]) === 0) continue;
      out.push(`${rel}:${idx + 1}: ${m[1]} = ${m[2]}  (numeric size default)`);
    }
  });
  return out;
}

function walk(dir: string, out: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries.sort()) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(path.extname(name))) out.push(full);
  }
}

/** Removes block comments (tracking state across lines) and // line comments. */
function stripComments(line: string, state: { inBlock: boolean }, isCss: boolean): string {
  let out = "";
  let i = 0;
  while (i < line.length) {
    if (state.inBlock) {
      const end = line.indexOf("*/", i);
      if (end === -1) return out;
      state.inBlock = false;
      i = end + 2;
      continue;
    }
    const start = line.indexOf("/*", i);
    const rest = start === -1 ? line.slice(i) : line.slice(i, start);
    out += rest;
    if (start === -1) break;
    state.inBlock = true;
    i = start + 2;
  }
  if (!isCss) {
    // A // that is not part of a URL (://) starts a line comment.
    const m = /(^|[^:"'`\\])\/\/.*$/.exec(out);
    if (m) out = out.slice(0, m.index + m[1].length);
  }
  return out;
}

function main(): void {
  const files: string[] = [];
  for (const dir of SCAN_DIRS) walk(path.join(ROOT, dir), files);

  const hits: string[] = [];
  let scanned = 0;
  const escaped: string[] = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    if (ALLOWLIST.has(rel)) continue;
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    if (lines[0]?.includes(MARKER)) {
      escaped.push(rel);
      continue;
    }
    scanned++;
    const state = { inBlock: false };
    const isCss = rel.endsWith(".css");
    const stripped: string[] = [];
    lines.forEach((raw, idx) => {
      const code = stripComments(raw, state, isCss);
      stripped.push(code);
      if (!code.trim()) return;
      for (const rule of RULES) {
        rule.re.lastIndex = 0;
        for (const m of code.matchAll(rule.re)) {
          hits.push(`${rel}:${idx + 1}: ${m[0]}  (${rule.name})`);
        }
      }
    });
    if (
      NUMERIC_SCAN_DIRS.some((dir) => rel.startsWith(dir)) &&
      NUMERIC_EXTENSIONS.has(path.extname(rel))
    ) {
      const found = [...numericHits(rel, stripped.join("\n")), ...lineHits(rel, stripped)];
      found.sort((a, b) => Number(a.split(":")[1]) - Number(b.split(":")[1]));
      hits.push(...found);
    }
  }

  if (escaped.length) {
    console.log(`skipped via ${MARKER} marker: ${escaped.join(", ")}`);
  }
  if (hits.length) {
    for (const hit of hits) console.log(hit);
    console.error(
      `\ncheck:tokens FAILED: ${hits.length} hit(s) in ${scanned} files. Use a token from @/lib/tokens, @/lib/motion or a CSS var from app/tokens.css / app/unsaid-theme.css.`,
    );
    process.exit(1);
  }
  console.log(`check:tokens OK (${scanned} files)`);
}

main();
