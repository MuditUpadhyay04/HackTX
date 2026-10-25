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
];

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
