/**
 * npm run check:tokens
 *
 * Fails (exit 1) on hard-coded styling values outside the token files:
 *   - hex colors            #fff, #A890F6, #00000080
 *   - color functions       rgb( rgba( hsl( hsla(
 *   - raw px values         "12px", 0.5px, Tailwind arbitrary w-[12px]
 *   - Tailwind default grey palettes   bg-zinc-200, text-slate-500, border-gray-300, ...
 *   - Tailwind default focus rings     focus:ring, focus-visible:ring-2, ring-offset-2
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
    lines.forEach((raw, idx) => {
      const code = stripComments(raw, state, isCss);
      if (!code.trim()) return;
      for (const rule of RULES) {
        rule.re.lastIndex = 0;
        for (const m of code.matchAll(rule.re)) {
          hits.push(`${rel}:${idx + 1}: ${m[0]}  (${rule.name})`);
        }
      }
    });
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
