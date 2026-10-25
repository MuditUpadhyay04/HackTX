/**
 * Scene registry: every route + designed state in the build (docs/RULES.md rule 3).
 *
 * Read by:
 *   - app/scenes/page.tsx        (the /scenes dev index)
 *   - scripts/shoot.ts           (npm run shoot / shoot:clean)
 *   - scripts/check-placeholders.ts (npm run check:placeholders)
 *   - components/dev/DevPanel.tsx (scene jump list)
 *
 * Later phases APPEND scenes to `scenes`; keep the `Scene` shape stable.
 * `id` must be unique and is what `npm run shoot -- --only <id,id>` takes.
 */
import { appScenes } from "./scenes-apps";

export type Scene = {
  /** Unique, kebab-case. Used by `shoot --only`. */
  id: string;
  /** App route, starting with "/". */
  route: string;
  /** Query that selects the designed state, e.g. { state: "unfolded", bg: "wallpaper" }. */
  query?: Record<string, string>;
  /** Short human label for /scenes and the dev panel. */
  label: string;
  /** Group heading in /scenes and the dev panel. */
  group: string;
  /** Build phase that introduced the scene. */
  phase: number;
  /** True when the page has no interactive or animated state (token/test pages). */
  static?: boolean;
};

export const scenes: Scene[] = [
  {
    id: "test-tokens",
    route: "/test/tokens",
    label: "Tokens",
    group: "Test",
    phase: 0,
    static: true,
  },
  {
    id: "test-placeholder",
    route: "/test/placeholder",
    label: "Placeholders",
    group: "Test",
    phase: 0,
  },
  ...deviceScenes(),
  ...homeScenes(),
  ...appScenes,
];

/** Phase 1: every /device state the acceptance list checks, plus the ?debug=1 overlays. */
function deviceScenes(): Scene[] {
  const rows: [state: string, bg: string, label: string, extra?: Record<string, string>][] = [
    ["folded-off", "black", "Folded, screen off"],
    ["folded", "black", "Folded"],
    ["folded", "studio", "Folded on wallpaper"],
    ["folded", "white", "Folded on white"],
    ["folded-angled", "black", "Folded, angled"],
    ["unfold-30", "studio", "Unfold 30°"],
    ["unfold-60", "studio", "Unfold 60°"],
    ["unfold-90", "studio", "Unfold 90°"],
    ["unfold-120", "studio", "Unfold 120°"],
    ["unfold-150", "studio", "Unfold 150°"],
    ["unfolded", "studio", "Unfolded"],
    ["unfolded", "black", "Unfolded on black"],
    ["unfolded-off", "black", "Unfolded, screen off"],
    ["back", "studio", "Back"],
    ["folded", "black", "Folded, spec overlay", { debug: "1", pattern: "on" }],
    ["unfolded", "black", "Unfolded, spec overlay", { debug: "1", pattern: "on" }],
    ["back", "black", "Back, spec overlay", { debug: "1", pattern: "on" }],
  ];
  return rows.map(([state, bg, label, extra]) => ({
    id: `device-${state}-${bg}${extra?.debug ? "-debug" : ""}`,
    route: "/device",
    query: { state, bg, ...extra },
    label,
    group: "Device",
    phase: 1,
  }));
}

/**
 * Phase 3 (D8, D12): the iOS home screens on the iPhone Fold, clean (no fold pill): the cover home
 * folded, the inner home unfolded, and the fold in between (content visible, motion blur mid-fold).
 */
function homeScenes(): Scene[] {
  const rows: [id: string, state: string, label: string][] = [
    ["home-cover", "folded", "Home, folded (cover)"],
    ["home-unfold-30", "unfold-30", "Home, unfolding 30°"],
    ["home-unfold-60", "unfold-60", "Home, unfolding 60°"],
    ["home-unfold-90", "unfold-90", "Home, unfolding 90°"],
    ["home-unfold-120", "unfold-120", "Home, unfolding 120°"],
    ["home-unfold-150", "unfold-150", "Home, unfolding 150°"],
    ["home-inner", "unfolded", "Home, unfolded (inner)"],
  ];
  return rows.map(([id, state, label]) => ({
    id,
    route: "/device",
    query: { state, bg: "studio", frame: "bare" },
    label,
    group: "Home",
    phase: 3,
  }));
}

/** Scenes grouped by `group`, in first-appearance order. */
export function scenesByGroup(list: Scene[] = scenes): { group: string; scenes: Scene[] }[] {
  const groups = new Map<string, Scene[]>();
  for (const scene of list) {
    const bucket = groups.get(scene.group);
    if (bucket) bucket.push(scene);
    else groups.set(scene.group, [scene]);
  }
  return Array.from(groups, ([group, items]) => ({ group, scenes: items }));
}

/**
 * Relative URL for a scene: route + its query, plus `extra` params
 * (extra wins on conflicts). Keys keep insertion order: scene query first, then extra.
 */
export function sceneUrl(scene: Scene, extra?: Record<string, string>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(scene.query ?? {})) params.set(key, value);
  for (const [key, value] of Object.entries(extra ?? {})) params.set(key, value);
  const qs = params.toString();
  return qs ? `${scene.route}?${qs}` : scene.route;
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "x"
  );
}

/**
 * Deterministic, filesystem-safe screenshot name:
 *   <route segments joined by "__">__<state>.png
 * where <state> is query.state (or "default"), followed by every other query
 * key as "<key>-<value>" in sorted key order, joined with "_".
 *
 *   /test/tokens                                 -> test__tokens__default.png
 *   /device?state=unfolded&bg=wallpaper          -> device__unfolded_bg-wallpaper.png
 *   /                                            -> root__default.png
 */
export function sceneFileName(scene: Scene, suffix = ""): string {
  const segments = scene.route.split("/").filter(Boolean).map(slug);
  const routePart = segments.length ? segments.join("__") : "root";
  const query = scene.query ?? {};
  const parts: string[] = [query.state ? slug(query.state) : "default"];
  for (const key of Object.keys(query).sort()) {
    if (key === "state") continue;
    parts.push(`${slug(key)}-${slug(query[key])}`);
  }
  return `${routePart}__${parts.join("_")}${suffix}.png`;
}
