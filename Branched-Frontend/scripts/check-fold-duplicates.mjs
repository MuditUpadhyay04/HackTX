// scripts/check-fold-duplicates.mjs (npm run check:duplicates): opens each linked app on the unfolded
// phone, steps the hinge through 150/120/90/60/30, and fails if anything paints inside a flat screen layer
// while that layer is hidden (a second copy of the app laid over the folding halves). Needs the dev server
// on :3000 (and Un-Said built + its backend for the unsaid row). Uses local Chrome.
import { chromium } from "@playwright/test";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const res = {};
for (const app of ["whatsapp", "messages", "instagram", "photos", "unsaid"]) {
  await p.goto(`http://localhost:3000/device?state=unfolded&labels=off&toasts=off`, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  const r = await p.locator(`[data-fold-part="inner-content"] [data-app-icon="${app}"]`).first().boundingBox();
  await p.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await p.waitForTimeout(app === "unsaid" ? 3000 : 1200);
  const counts = [];
  for (const a of [150, 120, 90, 60, 30]) {
    await p.evaluate((a) => window.__unsaidDevice.setAngle(a), a); await p.waitForTimeout(250);
    // any app layer actually painted (visible) inside a hidden flat layer = a duplicate over the halves
    counts.push(await p.evaluate(() => [...document.querySelectorAll('[data-fold-part="inner-content"], [data-fold-part="cover-content"]')].filter((flat) => getComputedStyle(flat).visibility === "hidden").flatMap((flat) => [...flat.querySelectorAll("*")]).filter((e) => getComputedStyle(e).visibility === "visible" && e.getClientRects().length).length));
  }
  res[app] = counts.join(",");
}
console.log(JSON.stringify(res));
const bad = Object.entries(res).filter(([, c]) => c.split(",").some((n) => n !== "0"));
if (bad.length) { console.error("duplicate app copy over the fold:", bad.map(([a]) => a).join(", ")); process.exitCode = 1; } else console.log("no duplicates");
await b.close();
