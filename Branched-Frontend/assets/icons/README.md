# Look-alike app icons (notes, no files)

Every Apple and Meta app icon in the build is a **look-alike recreated in SVG/CSS**: a brand-coloured tile plus a simple drawn glyph. **No official logo files, icons, screenshots or fonts are ever downloaded, traced or stored here or in `public/`.** The specs live in `CLAUDE_PROMPT.md` Phase 3 ("Meta family" / "Apple apps") and are implemented in `components/ios/AppIcon` (+ `components/meta/*`). This folder holds notes only; if an icon is ever exported for docs/slides, export it from our own SVG component and add a README row marked "generated look-alike".

| Icon | Recreation | Lands in |
|---|---|---|
| Un-Said | **Not a look-alike: Gurneal's own art** `../brand/unsaid-app-icon.png`, masked to the iOS squircle (22.37%). Label "Un-Said". Same art as App-UI-Final. | home screen, dock/search, notification banner, splash |
| Instagram | ig radial gradient tile, white rounded-square outline + circle + dot | home screen, banners |
| WhatsApp | `#25D366` tile, white bubble outline with handset | home screen, banners |
| Facebook | `#0866FF` tile, "f" built from paths (no font) | home screen |
| Messenger | messenger-gradient tile, bubble with bolt cutout | home screen |
| Threads | black tile, "@"-like spiral stroke | home screen |
| Meta AI | white (dark #0B0B0F) tile, ring stroked with meta-ai-gradient | home screen, Meta AI shell (Phase 6) |
| Edits | black tile, film-strip/scissor glyph, thin ig underline | home screen |
| Apple apps | Weather, Calendar, Photos, Clock, Notes, Maps, Settings, Mail, Reminders, Health, Messages, Phone, Safari, Camera, App Store: simple gradient + glyph per Phase 3 | home screen, dock |
