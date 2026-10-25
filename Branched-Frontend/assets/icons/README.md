# App icons (notes)

**Meta apps use their official app icons, 1:1 (decision D9, `docs/RULES.md`).** Each one is the exact official file, stored unmodified in `assets/brand/meta/` with a source row (URL, date, original size) in `assets/README.md`. Rendering only scales it uniformly and applies the iOS squircle mask; it is never redrawn, traced, recolored, cropped or stretched. **Apple apps stay look-alikes recreated in SVG/CSS**; no Apple logo or icon files are ever stored here or in `public/`. Icons are implemented in `components/ios/AppIcon` (+ `components/icons/apps/*`). The home screen follows D8: no Safari, Camera or Settings.

| Icon | Source | Lands in |
|---|---|---|
| Un-Said | **Gurneal's own art** `../brand/unsaid-app-icon.png`, masked to the iOS squircle (22.37%). Label "Un-Said". Same art as App-UI-Final. | home screen, notification banner, splash |
| Facebook, Instagram, WhatsApp, Messenger, Threads, Meta AI, Edits, Meta Horizon, WhatsApp Business, Meta Business Suite, Meta Ads Manager, Messenger Kids | **Official app icon, 1:1**, from `../brand/meta/` (added in Phase 2/3, each with its source row) | home screen, dock, banners, Meta app shells |
| Apple apps | Messages, Photos, Phone: look-alike gradient + glyph per Phase 3 | home screen, dock |
