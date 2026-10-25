/**
 * npm run sync:theme  (also run by predev / prebuild)
 *
 * Copies the Un-Said theme from App-UI-Final (read only, never written) into this build:
 *   tokens/unsaid-tokens.json   -> lib/unsaid-theme.json            (+ "_generated" key)
 *   tokens/unsaid-tokens.css    -> app/unsaid-theme.css             (+ header comment)
 *   tokens/unsaid-palette.png   -> public/unsaid-theme/unsaid-palette.png   (/test/tokens comparison)
 *   assets/brand/*              -> public/unsaid-theme/brand/       (no .md files)
 * and this build's own assets that the app serves:
 *   assets/brand/unsaid-app-icon.png            -> public/brand/unsaid-app-icon.png
 *   assets/palettes/branched-frontend-palette.png -> public/test/branched-frontend-palette.png
 *
 * App-UI-Final lookup, first hit wins:
 *   1. ../App-UI-Final (repo root, next to Branched-Frontend/)
 *   2. ~/Desktop/Unsaid-Claude-Context/App-UI-Final
 *   3. git ref origin/app-ui-final, extracted with `git archive` into a temp dir (read-only git;
 *      never fetches; skipped when the ref is missing)
 * No source found: warn, keep the last synced copies, exit 0 (the build must still pass).
 * Nothing is ever written outside Branched-Frontend/ except the temp dir, which is removed.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

const HEADER = "GENERATED from App-UI-Final by scripts/sync-theme.ts. Do not edit.";
const GIT_REF = "origin/app-ui-final";

const BF = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(BF, "..");

type Source = { dir: string; label: string; cleanup?: () => void };

function isThemeDir(dir: string): boolean {
  return existsSync(path.join(dir, "tokens", "unsaid-tokens.json"));
}

function git(args: string[], input?: Buffer): Buffer {
  return execFileSync("git", ["-C", REPO_ROOT, ...args], {
    input,
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

function fromGitRef(): Source | null {
  try {
    git(["rev-parse", "--verify", "--quiet", `${GIT_REF}^{commit}`]);
  } catch {
    return null;
  }
  const tmp = mkdtempSync(path.join(os.tmpdir(), "unsaid-sync-theme-"));
  const cleanup = () => rmSync(tmp, { recursive: true, force: true });
  try {
    const tar = git(["archive", "--format=tar", GIT_REF, "App-UI-Final"]);
    execFileSync("tar", ["-x", "-C", tmp], { input: tar, stdio: ["pipe", "pipe", "pipe"] });
    const dir = path.join(tmp, "App-UI-Final");
    if (!isThemeDir(dir)) {
      cleanup();
      return null;
    }
    const sha = git(["rev-parse", "--short", GIT_REF]).toString().trim();
    return { dir, label: `git ref ${GIT_REF} (${sha})`, cleanup };
  } catch {
    cleanup();
    return null;
  }
}

function findSource(): Source | null {
  const candidates = [
    path.join(REPO_ROOT, "App-UI-Final"),
    path.join(os.homedir(), "Desktop", "Unsaid-Claude-Context", "App-UI-Final"),
  ];
  for (const dir of candidates) {
    if (isThemeDir(dir)) return { dir, label: dir };
  }
  return fromGitRef();
}

const results: string[] = [];

function rel(p: string): string {
  return path.relative(BF, p).split(path.sep).join("/");
}

/** Writes only when the bytes differ. Refuses any path outside Branched-Frontend/. */
function writeIfChanged(dest: string, data: Buffer): void {
  const target = path.resolve(dest);
  if (!target.startsWith(BF + path.sep)) {
    throw new Error(`refusing to write outside Branched-Frontend/: ${target}`);
  }
  mkdirSync(path.dirname(target), { recursive: true });
  const before = existsSync(target) ? readFileSync(target) : null;
  if (before && before.equals(data)) {
    results.push(`  unchanged  ${rel(target)}`);
    return;
  }
  writeFileSync(target, data);
  results.push(`  ${before ? "changed  " : "created  "}  ${rel(target)}`);
}

function copyIfChanged(src: string, dest: string): void {
  writeIfChanged(dest, readFileSync(src));
}

function syncTheme(src: string): void {
  // tokens JSON, with the generated marker as the first key
  const json = JSON.parse(readFileSync(path.join(src, "tokens", "unsaid-tokens.json"), "utf8"));
  const out = { _generated: HEADER, ...json };
  writeIfChanged(
    path.join(BF, "lib", "unsaid-theme.json"),
    Buffer.from(JSON.stringify(out, null, 2) + "\n"),
  );

  // tokens CSS, with a header comment
  const css = readFileSync(path.join(src, "tokens", "unsaid-tokens.css"), "utf8");
  writeIfChanged(path.join(BF, "app", "unsaid-theme.css"), Buffer.from(`/* ${HEADER} */\n${css}`));

  // palette sheet, for the /test/tokens side-by-side
  const palette = path.join(src, "tokens", "unsaid-palette.png");
  if (existsSync(palette)) {
    copyIfChanged(palette, path.join(BF, "public", "unsaid-theme", "unsaid-palette.png"));
  }

  // brand files (mirror: stale copies are removed; never .md)
  const brandSrc = path.join(src, "assets", "brand");
  const brandDest = path.join(BF, "public", "unsaid-theme", "brand");
  const names = existsSync(brandSrc)
    ? readdirSync(brandSrc).filter(
        (n) => !n.startsWith(".") && !n.toLowerCase().endsWith(".md") && statSync(path.join(brandSrc, n)).isFile(),
      )
    : [];
  for (const name of names.sort()) copyIfChanged(path.join(brandSrc, name), path.join(brandDest, name));
  if (existsSync(brandDest)) {
    for (const name of readdirSync(brandDest)) {
      if (!names.includes(name)) {
        unlinkSync(path.join(brandDest, name));
        results.push(`  removed    ${rel(path.join(brandDest, name))}`);
      }
    }
  }
}

function syncLocalAssets(): void {
  const local: Array<[string, string]> = [
    ["assets/brand/unsaid-app-icon.png", "public/brand/unsaid-app-icon.png"],
    ["assets/palettes/branched-frontend-palette.png", "public/test/branched-frontend-palette.png"],
  ];
  for (const [from, to] of local) {
    const src = path.join(BF, from);
    if (existsSync(src)) copyIfChanged(src, path.join(BF, to));
    else console.warn(`sync-theme: WARNING ${from} is missing; kept ${to} as is`);
  }
}

function main(): void {
  const source = findSource();
  if (!source) {
    console.warn(
      "sync-theme: WARNING App-UI-Final not found (../App-UI-Final, ~/Desktop/Unsaid-Claude-Context/App-UI-Final, " +
        `${GIT_REF}). Keeping the last synced copies.`,
    );
  } else {
    console.log(`sync-theme: source ${source.label}`);
    try {
      syncTheme(source.dir);
    } finally {
      source.cleanup?.();
    }
  }
  syncLocalAssets();
  for (const line of results) console.log(line);
  const changed = results.filter((l) => !l.includes("unchanged")).length;
  console.log(`sync-theme: ${changed ? `${changed} file(s) written` : "everything up to date"}`);
}

main();
