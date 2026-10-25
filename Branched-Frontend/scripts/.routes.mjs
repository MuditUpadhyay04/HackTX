import { chromium } from "@playwright/test";
import sharp from "sharp";
const out = process.argv[2]; const routes = process.argv.slice(3);
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 402, height: 499 }, deviceScaleFactor: 1 });
const tiles = [];
for (const r of routes) {
  await p.goto("http://localhost:3000/unsaid" + r, { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
  tiles.push(await p.screenshot());
}
const cols = 6, W = 402, H = 499;
await sharp({ create: { width: cols * (W + 6), height: Math.ceil(tiles.length / cols) * (H + 6), channels: 3, background: "#ff00ff" } }).composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * (W + 6), top: Math.floor(i / cols) * (H + 6) }))).png().toFile(`${out}/sheet.png`);
await b.close();
