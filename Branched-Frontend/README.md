# Un-Said · Branched-Frontend (concept mock)

The HackTX demo frontend: a foldable iPhone Duo web mock (natural titanium frame, D10) with look-alike apps and a scripted opening. Next.js 16 (App Router), React 19, Tailwind 4, framer-motion, zustand, sonner. Mock data only, no network.

## Run

```bash
npm install
npm run dev        # http://localhost:3000 (runs sync:theme first)
```

## Routes

- `/` dev index
- `/scenes` every route + state from `lib/scenes.ts`
- `/test/tokens` every token on its background
- `/test/placeholder` placeholder press states + the "concept only" toast
- `/device` the foldable phone: `?state=folded|unfolded|unfold-30…150|back`, `&bg=studio|black|white`, `&frame=bare`, `&debug=1`. F (or the Fold pill, or the hinge slider) folds and unfolds; the home buttons open the apps linked in `lib/apps/registry.tsx` (WhatsApp, Messages, Instagram, Photos); empty buttons do nothing
- `/scene/threads/mom` the WhatsApp thread with Mom on its own (`?state=`)

URL flags: `?labels=off`, `?badges=off`, `?dev=1`, `?toasts=off`, `?motion=reduced`, `?clock=HH:MM`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next dev server, production build, serve the build (`predev` / `prebuild` run `sync:theme`) |
| `npm run lint` | ESLint |
| `npm run sync:theme` | Copies the Un-Said theme from App-UI-Final (read-only) into `lib/`, `app/` and `public/unsaid-theme/` |
| `npm run check:tokens` | Fails on hex / rgb / hsl / raw px in `app/` and `components/` |
| `npm run check:placeholders` | Crawls every scene; fails on dead controls, `data-feature-id` or off-localhost requests |
| `npm run shoot` / `shoot:clean` | 1920x1080 Playwright screenshots into `screenshots/` (`--clean` hides labels, badges, dev) |
| `npx tsx scripts/fold-check.ts` | Hinge check on /device: frame times, the 1.4 s tween, reverse mid-move, Shift+F, reduced motion |

The Playwright scripts use the bundled Chromium when `npx playwright install chromium` has run, otherwise the local Google Chrome (`scripts/lib/browser.ts`; `PW_CHANNEL=chrome` forces it).

## Docs

- `docs/CLAUDE_PROMPT.md` is the spec (source of truth)
- `docs/plans/` holds the per-phase plans
- `docs/RULES.md` holds the global rules
- `AGENTS.md`: this is Next 16; read `node_modules/next/dist/docs/` before using a Next API
