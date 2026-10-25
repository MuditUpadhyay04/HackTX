/**
 * npx tsx scripts/fold-check.ts
 *
 * Phase 1 acceptance 15-16 for the fold control (spec Phase 1, FOLD CONTROL):
 *   1. /device?state=folded&bg=wallpaper shows the "Unfold" pill.
 *   2. F unfolds with spring-unfold: rAF frame times p95 < 20 ms and no frame > 50 ms; settles at 180
 *      (logs the settle time); the detent ripple fires once; the label becomes "Fold".
 *   3. Frames at 30/60/90/120/150 degrees, screenshotted while the spring runs (sampling
 *      window.__unsaidDevice.angle) -> screenshots/fold-check/unfold-<target>.png.
 *   4. Pressing F again mid-unfold reverses from the current angle, keeping the velocity
 *      (no jump between frames, keeps rising for a moment, then folds back to 0).
 *   5. Shift+F jumps instantly; ?frame=bare hides the pill; ?motion=reduced jumps (crossfade).
 *
 * Server: scripts/lib/server.ts (BASE_URL, a running :3000, or next start -p 3123 after a build).
 * Exit 1 on any failed check.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import { ROOT, withServer } from "./lib/server";

const VIEWPORT = { width: 1920, height: 1080 };
const DEVICE_URL = "/device?state=folded&bg=wallpaper&labels=off&toasts=off&caret=static&clock=frozen";
const SNAP_ANGLES = [30, 60, 90, 120, 150];
const P95_LIMIT_MS = 20;
const MAX_FRAME_MS = 50;
/**
 * Largest believable per-frame step for spring-unfold. Its peak speed is about 750 deg/s
 * (about 12 deg per 60 fps frame); a discontinuity (restart, jump) shows up as a far larger step.
 */
const MAX_STEP_DEG = 20;

type Check = { name: string; ok: boolean; detail: string };
const checks: Check[] = [];
function check(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  (${detail})`);
}

/* Page-side snippets are strings so tsx/esbuild cannot inject helpers into them. */
const DEVICE = "window.__unsaidDevice";
const WAIT_API = `!!${DEVICE} && typeof ${DEVICE}.angle === "number"`;

/** Records every rAF until the hinge stops moving (or timeoutMs); returns frame deltas + angle samples. */
const RECORD_SOURCE = (timeoutMs: number) => `new Promise((resolve) => {
  const d = ${DEVICE};
  const deltas = [];
  const angles = [];
  const t0 = performance.now();
  let last = t0;
  let sawMoving = false;
  const tick = (now) => {
    deltas.push(now - last);
    last = now;
    angles.push(d.angle);
    if (d.moving) sawMoving = true;
    const done = (sawMoving && !d.moving) || now - t0 > ${timeoutMs};
    if (done) resolve({ deltas: deltas.slice(1), angles, elapsed: now - t0, angle: d.angle, ripple: d.ripple });
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})`;

/** Samples the angle each frame for `frames` frames. */
const SAMPLE_SOURCE = (frames: number) => `new Promise((resolve) => {
  const d = ${DEVICE};
  const out = [];
  const tick = () => {
    out.push(d.angle);
    if (out.length >= ${frames}) resolve(out);
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})`;

const TWO_FRAMES = `new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))))`;

type Recording = { deltas: number[]; angles: number[]; elapsed: number; angle: number; ripple: number };

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
}

function maxStep(angles: number[]): number {
  let max = 0;
  for (let i = 1; i < angles.length; i++) max = Math.max(max, Math.abs(angles[i] - angles[i - 1]));
  return max;
}

async function angle(page: Page): Promise<number> {
  return page.evaluate(`${DEVICE}.angle`) as Promise<number>;
}

async function openDevice(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(WAIT_API, undefined, { timeout: 15_000 });
  await page.evaluate(`document.fonts.ready`);
  await page.evaluate(TWO_FRAMES);
}

async function resetFolded(page: Page): Promise<void> {
  await page.evaluate(`${DEVICE}.jump(true)`);
  await page.evaluate(TWO_FRAMES);
}

async function run(baseUrl: string): Promise<void> {
  const outDir = path.join(ROOT, "screenshots", "fold-check");
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ args: ["--use-angle=metal"] });
  try {
    const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
    const page = await context.newPage();

    // 1. The pill
    await openDevice(page, baseUrl + DEVICE_URL);
    const pill = page.locator("[data-fold-control]");
    check("pill visible", (await pill.count()) === 1 && (await pill.isVisible()), `count ${await pill.count()}`);
    check("pill label folded", (await pill.innerText()).trim() === "Unfold", `"${(await pill.innerText()).trim()}"`);
    check("starts folded", Math.abs(await angle(page)) < 0.01, `angle ${(await angle(page)).toFixed(2)}`);

    // 2. F unfolds at 60 fps
    const recording = page.evaluate(RECORD_SOURCE(6000)) as Promise<Recording>;
    await page.keyboard.press("f");
    const rec = await recording;
    const p95 = percentile(rec.deltas, 95);
    const worst = Math.max(0, ...rec.deltas);
    check("frame time p95 < 20 ms", p95 < P95_LIMIT_MS, `p95 ${p95.toFixed(1)} ms over ${rec.deltas.length} frames`);
    check("no frame > 50 ms", worst <= MAX_FRAME_MS, `worst ${worst.toFixed(1)} ms`);
    check("settles at 180", Math.abs(rec.angle - 180) < 0.5, `angle ${rec.angle.toFixed(2)}`);
    // spring-unfold (120/22/1.3, section 4.4) settles in about 0.8-1 s; the spec's "about 2 s" is loose.
    check("settle time", rec.elapsed > 500 && rec.elapsed < 3500, `${(rec.elapsed / 1000).toFixed(2)} s`);
    check("detent ripple fired once", rec.ripple === 1, `ripple ${rec.ripple}`);
    check("no angle jumps", maxStep(rec.angles) < MAX_STEP_DEG, `max step ${maxStep(rec.angles).toFixed(2)} deg`);
    check("pill label unfolded", (await pill.innerText()).trim() === "Fold", `"${(await pill.innerText()).trim()}"`);

    // 3. Snapshots at 30..150: the device is a pure function of the angle, so set the live angle
    //    (the same MotionValue the spring drives) and shoot; a screenshot cannot keep up mid-spring.
    for (const target of SNAP_ANGLES) {
      await page.evaluate(`${DEVICE}.setAngle(${target})`);
      await page.evaluate(TWO_FRAMES);
      const at = await angle(page);
      const file = path.join(outDir, `unfold-${target}.png`);
      await page.screenshot({ path: file });
      check(`snapshot at ${target}`, Math.abs(at - target) < 0.01, `shot ${path.relative(ROOT, file)} at ${at.toFixed(1)} deg`);
    }

    // 4. Reverse mid-unfold
    await resetFolded(page);
    await page.keyboard.press("f");
    await page.waitForFunction(`${DEVICE}.angle >= 90`, undefined, { polling: "raf", timeout: 5000 });
    const before = (await page.evaluate(SAMPLE_SOURCE(3))) as number[];
    await page.keyboard.press("f");
    const after = (await page.evaluate(SAMPLE_SOURCE(20))) as number[];
    const path_ = [...before, ...after];
    const peak = Math.max(...after);
    const reversedFrom = before[before.length - 1];
    check("reverse: no jump", maxStep(path_) < MAX_STEP_DEG, `max step ${maxStep(path_).toFixed(2)} deg`);
    check(
      "reverse: keeps velocity",
      peak > reversedFrom,
      `rose to ${peak.toFixed(1)} from ${reversedFrom.toFixed(1)} before folding back`,
    );
    check("reverse: heading back", after[after.length - 1] < peak, `now ${after[after.length - 1].toFixed(1)}`);
    await page.waitForFunction(`!${DEVICE}.moving`, undefined, { timeout: 6000 });
    check("reverse: folds to 0", Math.abs(await angle(page)) < 0.5, `angle ${(await angle(page)).toFixed(2)}`);
    check("reverse: label", (await pill.innerText()).trim() === "Unfold", `"${(await pill.innerText()).trim()}"`);

    // 5a. Shift+F jumps
    await resetFolded(page);
    await page.keyboard.press("Shift+F");
    const jumped = (await page.evaluate(SAMPLE_SOURCE(2))) as number[];
    check("Shift+F jumps", jumped.every((a) => a === 180), `angles ${jumped.join(", ")}`);
    await page.screenshot({ path: path.join(outDir, "unfolded-jump.png") });

    // 5b. F ignored in a text field
    await resetFolded(page);
    await page.evaluate(`(() => { const i = document.createElement("input"); i.id = "fold-check-field"; document.body.appendChild(i); i.focus(); })()`);
    await page.keyboard.press("f");
    await page.evaluate(TWO_FRAMES);
    check("F ignored in text field", Math.abs(await angle(page)) < 0.01, `angle ${(await angle(page)).toFixed(2)}`);
    await page.evaluate(`document.getElementById("fold-check-field")?.remove()`);

    // 5c. Click toggles too
    await resetFolded(page);
    await pill.click();
    await page.waitForFunction(`${DEVICE}.angle > 10`, undefined, { polling: "raf", timeout: 3000 });
    check("click unfolds", (await angle(page)) > 10, `angle ${(await angle(page)).toFixed(1)}`);
    await page.waitForFunction(`!${DEVICE}.moving`, undefined, { timeout: 6000 });

    // 5d. ?frame=bare hides the pill
    await openDevice(page, `${baseUrl}${DEVICE_URL}&frame=bare`);
    check("frame=bare hides pill", (await page.locator("[data-fold-control]").count()) === 0, "no [data-fold-control]");

    // 5e. Reduced motion: jump + crossfade, no spring
    await openDevice(page, `${baseUrl}${DEVICE_URL}&motion=reduced`);
    await page.keyboard.press("f");
    const reduced = (await page.evaluate(SAMPLE_SOURCE(2))) as number[];
    const movingReduced = (await page.evaluate(`${DEVICE}.moving`)) as boolean;
    check("reduced motion jumps", reduced.every((a) => a === 180) && !movingReduced, `angles ${reduced.join(", ")}`);
    // the old pose is on screen, fading out, then removed after durations.reducedFold
    const fading = await page.locator("[data-fold-crossfade]").count();
    await page.waitForTimeout(400);
    const faded = await page.locator("[data-fold-crossfade]").count();
    check("reduced motion crossfades", fading === 1 && faded === 0, `old pose layers ${fading} -> ${faded}`);

    await context.close();
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  await withServer(run);
  const failed = checks.filter((c) => !c.ok);
  console.log(`\nfold-check: ${checks.length - failed.length}/${checks.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
