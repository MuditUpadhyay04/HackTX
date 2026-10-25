/**
 * npm run shoot [-- --clean] [-- --hi] [-- --only <id,id>]
 * npm run shoot:clean
 *
 * Screenshots every scene in lib/scenes.ts with Playwright Chromium at
 * 1920x1080, deviceScaleFactor 1 (--hi: 2, files get an "@2x" suffix).
 * Every URL gets caret=static&clock=frozen; --clean also adds
 * labels=off&badges=off&dev=off&toasts=off.
 * Waits for document.fonts.ready, network idle and two animation frames,
 * then saves screenshots/<sceneFileName>.
 * Server: see scripts/lib/server.ts (BASE_URL, :3000, or next start -p 3123).
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { scenes, sceneFileName, sceneUrl, type Scene } from "../lib/scenes";
import { ROOT, withServer } from "./lib/server";

/* Runs in the page; a string so tsx/esbuild cannot inject helpers. */
const SETTLE_SOURCE = `(async () => {
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
})()`;

function parseArgs(argv: string[]) {
  const args = { clean: false, hi: false, only: [] as string[] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--clean") args.clean = true;
    else if (arg === "--hi") args.hi = true;
    else if (arg === "--only") args.only.push(...(argv[++i] ?? "").split(","));
    else if (arg.startsWith("--only=")) args.only.push(...arg.slice("--only=".length).split(","));
    else {
      console.error(`unknown argument: ${arg}\nusage: shoot [--clean] [--hi] [--only <id,id>]`);
      process.exit(1);
    }
  }
  args.only = args.only.map((s) => s.trim()).filter(Boolean);
  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  let selected: Scene[] = scenes;
  if (args.only.length) {
    const unknown = args.only.filter((id) => !scenes.some((s) => s.id === id));
    if (unknown.length) {
      console.error(`unknown scene id(s): ${unknown.join(", ")}\nknown: ${scenes.map((s) => s.id).join(", ")}`);
      process.exit(1);
    }
    selected = scenes.filter((s) => args.only.includes(s.id));
  }

  const extra: Record<string, string> = { caret: "static", clock: "frozen" };
  if (args.clean) Object.assign(extra, { labels: "off", badges: "off", dev: "off", toasts: "off" });
  const scale = args.hi ? 2 : 1;
  const suffix = args.hi ? "@2x" : "";
  const outDir = path.join(ROOT, "screenshots");
  mkdirSync(outDir, { recursive: true });

  const written: string[] = [];
  const failures: string[] = [];

  await withServer(async (baseUrl) => {
    const browser = await chromium.launch();
    try {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: scale,
      });
      for (const scene of selected) {
        const rel = sceneUrl(scene, extra);
        const page = await context.newPage();
        try {
          const res = await page.goto(baseUrl + rel, { waitUntil: "networkidle", timeout: 30_000 });
          if (!res || !res.ok()) failures.push(`${rel}: HTTP ${res ? res.status() : "no response"}`);
          await page.evaluate(SETTLE_SOURCE);
          const file = path.join(outDir, sceneFileName(scene, suffix));
          await page.screenshot({ path: file, fullPage: false });
          written.push(path.relative(ROOT, file));
        } catch (err) {
          failures.push(`${rel}: ${(err as Error).message.split("\n")[0]}`);
        } finally {
          await page.close();
        }
      }
      await context.close();
    } finally {
      await browser.close();
    }
  });

  console.log(`wrote ${written.length} screenshot(s)${args.clean ? " (clean)" : ""}${args.hi ? " (@2x)" : ""}:`);
  for (const f of written) console.log(`  ${f}`);
  if (failures.length) {
    console.error(`\nshoot had ${failures.length} failure(s):`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
