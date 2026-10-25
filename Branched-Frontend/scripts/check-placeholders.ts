/**
 * npm run check:placeholders
 *
 * Crawls every scene in lib/scenes.ts (default state only) at 1920x1080 and fails on:
 *   (a) a visible button / a / [role=button] / [onclick] with no data-nav,
 *       data-placeholder or data-action (on itself, or data-placeholder on an
 *       ancestor, since <Placeholder> may wrap its child)
 *   (b) any element with data-feature-id
 *   (c) any http(s)/ws(s) request to a host other than localhost / 127.0.0.1 / ::1
 *       (or the BASE_URL host). Exception: requests from a frame inside
 *       [data-slot="unsaid"] (the UnsaidSlot iframe when a URL is set).
 *   (d) any data-placeholder not matching <app>:<control>
 *   (e) any console error or uncaught page error (errors located on an external
 *       URL are skipped: (c) already reports them, or they come from the slot)
 *
 * Always writes docs/PLACEHOLDERS.md (per app: every data-placeholder and the
 * routes it appears on; plus the UnsaidSlot status). Exits 1 on any failure.
 * Server: see scripts/lib/server.ts (BASE_URL, :3000, or next start -p 3123).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Frame } from "@playwright/test";
import { scenes, sceneUrl } from "../lib/scenes";
import { ROOT, withServer } from "./lib/server";

const APPS = ["whatsapp", "messages", "instagram", "photos", "facebook", "meta-ai", "ios", "unsaid"] as const;
const APP_TITLES: Record<(typeof APPS)[number], string> = {
  whatsapp: "WhatsApp",
  messages: "Messages",
  instagram: "Instagram",
  photos: "Photos",
  facebook: "Facebook",
  "meta-ai": "Meta AI",
  ios: "iOS",
  unsaid: "Un-Said",
};
const PLACEHOLDER_RE = /^(whatsapp|messages|instagram|photos|facebook|meta-ai|ios|unsaid):[a-z0-9-]+$/;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

type PageScan = {
  missing: string[];
  featureIds: string[];
  placeholders: string[];
};

/*
 * Runs in the page. Kept as a string so tsx/esbuild cannot inject helpers
 * (e.g. __name) that do not exist in the browser.
 */
const SCAN_SOURCE = `(() => {
  const visible = (el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    if (typeof el.checkVisibility === "function") {
      return el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    }
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none" && cs.opacity !== "0";
  };
  const snippet = (el) => {
    const html = el.outerHTML.replace(/\\s+/g, " ");
    return html.length > 200 ? html.slice(0, 200) + "…" : html;
  };
  const missing = [];
  for (const el of document.querySelectorAll("button, a, [role=button], [onclick]")) {
    if (!visible(el)) continue;
    if (el.hasAttribute("data-nav") || el.hasAttribute("data-action")) continue;
    if (el.closest("[data-placeholder]")) continue;
    missing.push(snippet(el));
  }
  const featureIds = Array.from(document.querySelectorAll("[data-feature-id]"), snippet);
  const placeholders = Array.from(
    document.querySelectorAll("[data-placeholder]"),
    (el) => el.getAttribute("data-placeholder") || "",
  );
  return { missing, featureIds, placeholders };
})()`;

async function isInsideUnsaidSlot(frame: Frame, mainFrame: Frame): Promise<boolean> {
  // Walk up to the frame whose parent is the main frame, then check its <iframe>.
  let current: Frame | null = frame;
  while (current && current.parentFrame() && current.parentFrame() !== mainFrame) {
    current = current.parentFrame();
  }
  if (!current || current === mainFrame) return false;
  try {
    const el = await current.frameElement();
    // Plain anonymous arrow: nothing for esbuild to wrap.
    return await el.evaluate((node: Element) => node.closest('[data-slot="unsaid"]') !== null);
  } catch {
    return false; // detached frame: cannot prove it was the slot
  }
}

function unsaidSlotSection(): string[] {
  const lines = ["## UnsaidSlot", ""];
  const built = existsSync(path.join(ROOT, "components", "UnsaidSlot.tsx"));
  if (!built) {
    lines.push("- Status: not built yet (components/UnsaidSlot.tsx arrives in Phase 3).");
  } else {
    let url = process.env.NEXT_PUBLIC_UNSAID_APP_URL?.trim() ?? "";
    const envLocal = path.join(ROOT, ".env.local");
    if (!url && existsSync(envLocal)) {
      const m = /^\s*NEXT_PUBLIC_UNSAID_APP_URL\s*=\s*["']?([^"'\r\n]*)["']?\s*$/m.exec(
        readFileSync(envLocal, "utf8"),
      );
      url = m?.[1].trim() ?? "";
    }
    lines.push("- Status: built (components/UnsaidSlot.tsx).");
    lines.push(`- Mode: ${url ? "frame" : "placeholder"}`);
    lines.push(`- URL: ${url || "none"}`);
  }
  lines.push("- Contract: see docs/UNSAID_SLOT.md (URL, size contract, framing headers, mic/camera rules).");
  return lines;
}

function writeReport(found: Map<string, Set<string>>): string {
  const lines = [
    "# Placeholders",
    "",
    "GENERATED by scripts/check-placeholders.ts (npm run check:placeholders). Do not edit.",
    "",
    "Every `data-placeholder` found while crawling the scenes in lib/scenes.ts (default state),",
    'grouped by app. Each one is a pressable control that shows the "concept only" toast.',
    "",
  ];
  for (const app of APPS) {
    lines.push(`## ${APP_TITLES[app]} (\`${app}:\`)`, "");
    const ids = [...found.keys()].filter((id) => id.startsWith(`${app}:`)).sort();
    if (!ids.length) lines.push("- none yet");
    for (const id of ids) {
      const routes = [...found.get(id)!].sort().map((r) => `\`${r}\``);
      lines.push(`- \`${id}\`: ${routes.join(", ")}`);
    }
    lines.push("");
  }
  const invalid = [...found.keys()].filter((id) => !PLACEHOLDER_RE.test(id)).sort();
  if (invalid.length) {
    lines.push("## Invalid ids (fix these)", "");
    for (const id of invalid) lines.push(`- \`${id}\`: ${[...found.get(id)!].sort().join(", ")}`);
    lines.push("");
  }
  lines.push(...unsaidSlotSection(), "");
  const out = path.join(ROOT, "docs", "PLACEHOLDERS.md");
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, lines.join("\n"));
  return path.relative(ROOT, out);
}

async function main(): Promise<void> {
  const failures: string[] = [];
  const found = new Map<string, Set<string>>();

  await withServer(async (baseUrl) => {
    const allowedHosts = new Set(LOCAL_HOSTS);
    allowedHosts.add(new URL(baseUrl).hostname);

    const browser = await chromium.launch();
    try {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
      for (const scene of scenes) {
        const rel = sceneUrl(scene);
        const page = await context.newPage();
        const fail = (msg: string) => failures.push(`${rel}: ${msg}`);
        const external: { url: string; frame: Frame }[] = [];
        const consoleErrors: string[] = [];

        page.on("request", (req) => {
          let u: URL;
          try {
            u = new URL(req.url());
          } catch {
            return;
          }
          if (!/^(https?|wss?):$/.test(u.protocol)) return; // data:, blob:, about:
          if (allowedHosts.has(u.hostname)) return;
          external.push({ url: req.url(), frame: req.frame() });
        });
        page.on("console", (msg) => {
          if (msg.type() !== "error") return;
          // Errors located on an external URL are either a request (c) already
          // reports, or come from the UnsaidSlot's own app: not counted twice.
          let host = "";
          try {
            host = new URL(msg.location().url).hostname;
          } catch {
            /* no location */
          }
          if (host && !allowedHosts.has(host)) return;
          consoleErrors.push(msg.text());
        });
        page.on("pageerror", (err) => consoleErrors.push(`uncaught: ${err.message}`));

        try {
          const res = await page.goto(baseUrl + rel, { waitUntil: "networkidle", timeout: 30_000 });
          if (!res) fail("no response");
          else if (!res.ok()) fail(`HTTP ${res.status()}`);
        } catch (err) {
          fail(`navigation failed: ${(err as Error).message.split("\n")[0]}`);
          await page.close();
          continue;
        }

        const scan = (await page.evaluate(SCAN_SOURCE)) as PageScan;

        for (const html of scan.missing) fail(`(a) control without data-nav / data-placeholder / data-action: ${html}`);
        for (const html of scan.featureIds) fail(`(b) data-feature-id is banned: ${html}`);
        for (const id of scan.placeholders) {
          if (!found.has(id)) found.set(id, new Set());
          found.get(id)!.add(rel);
          if (!PLACEHOLDER_RE.test(id)) fail(`(d) data-placeholder "${id}" does not match <app>:<control>`);
        }
        for (const req of external) {
          if (await isInsideUnsaidSlot(req.frame, page.mainFrame())) continue;
          fail(`(c) request leaves localhost: ${req.url}`);
        }
        for (const text of consoleErrors) fail(`(e) console error: ${text}`);

        console.log(
          `${rel}: ${scan.placeholders.length} placeholder(s), ${scan.missing.length} unmarked control(s), ${external.length} external request(s), ${consoleErrors.length} console error(s)`,
        );
        await page.close();
      }
      await context.close();
    } finally {
      await browser.close();
    }
  });

  const report = writeReport(found);
  console.log(`wrote ${report} (${found.size} placeholder id(s))`);

  if (failures.length) {
    console.error(`\ncheck:placeholders FAILED (${failures.length}):`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`check:placeholders OK (${scenes.length} scenes)`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
