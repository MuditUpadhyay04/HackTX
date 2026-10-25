"use client";

/**
 * Samsung Gallery (One UI 9) look-alike that opens on the phone. Registry id stays "photos".
 *
 *   Pictures  the One UI extended app bar (big "Pictures" title + count in the empty upper part,
 *             collapsing into the toolbar on scroll), a dense square grid under month headers
 *   Albums    album tiles built from the same library (Camera, Favorites, Food, Trips, Screenshots);
 *             an album opens its own grid
 *   Stories   auto-made story cards from the library
 *   Menu (≡)  the Gallery menu list
 *   Viewer    black background, ← back with the date, bottom action bar: favorite, edit, share, delete
 *
 * Images are our own illustrations (scripts/make-mock-photos.py -> public/mock/photos); the story
 * photos (the 290 sunrise, Mom's dal, the kitchen, the lake) sit among Riley's camera roll. Sizes come
 * from the pane (usePane), so the same code fills the cover and the inner display.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { create } from "zustand";
import { SAFE_BOTTOM } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import { Placeholder } from "@/components/Placeholder";
import type { AppScreenProps } from "@/lib/apps/registry";
import { AppFrame, TOP, Tap, ellipsis, useStack } from "../kit";

type Photo = { id: string; at: string };

/** The library, oldest first. Dates are mock wall times in Riley's zone; the story photos keep their thread dates. */
const LIBRARY: Photo[] = [
  ["roll-09", "2026-08-02T18:40"],
  ["roll-04", "2026-08-14T20:05"],
  ["roll-07", "2026-08-21T13:12"],
  ["roll-15", "2026-08-25T09:30"],
  ["roll-02", "2026-08-29T08:44"],
  ["roll-08", "2026-09-05T22:31"],
  ["roll-05", "2026-09-07T17:02"],
  ["roll-11", "2026-09-12T23:48"],
  ["roll-14", "2026-09-14T19:20"],
  ["roll-13", "2026-09-20T19:11"],
  ["roll-10", "2026-09-24T11:03"],
  ["roll-16", "2026-09-27T15:40"],
  ["roll-01", "2026-10-01T10:15"],
  ["roll-06", "2026-10-03T20:22"],
  ["roll-17", "2026-10-05T07:58"],
  ["sunrise-290", "2026-10-09T01:07"],
  ["lake", "2026-10-11T09:52"],
  ["roll-03", "2026-10-13T22:10"],
  ["roll-12", "2026-10-15T08:31"],
  ["roll-19", "2026-10-17T16:44"],
  ["dal", "2026-10-18T13:20"],
  ["roll-18", "2026-10-19T21:15"],
  ["roll-20", "2026-10-21T18:52"],
  ["kitchen", "2026-10-23T12:18"],
].map(([id, at]) => ({ id, at }));

const idx = (id: string) => LIBRARY.findIndex((p) => p.id === id);
/** Gallery shows the newest first. */
const NEWEST_FIRST = LIBRARY.map((_, i) => i).reverse();
const byIds = (ids: string[]) => ids.map(idx).filter((i) => i >= 0).sort((a, b) => b - a);

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const src = (id: string) => `/mock/photos/${id}.svg`;

function parts(at: string) {
  const [d, t] = at.split("T");
  const [y, mo, da] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  return { y, mo, da, h, mi, dow: new Date(Date.UTC(y, mo - 1, da)).getUTCDay() };
}
/** "Oct 2026" */
const monthLabel = (at: string) => {
  const p = parts(at);
  return `${MON[p.mo - 1]} ${p.y}`;
};
/** "Fri, Oct 23, 2026" and "12:18 PM" */
function viewerLabel(at: string) {
  const p = parts(at);
  const h12 = ((p.h + 11) % 12) + 1;
  return { day: `${DOW[p.dow]}, ${MON[p.mo - 1]} ${p.da}, ${p.y}`, time: `${h12}:${String(p.mi).padStart(2, "0")} ${p.h < 12 ? "AM" : "PM"}` };
}

/** Favorites, shared by the cover and inner copies so a heart survives a fold/unfold. */
const useFavorites = create<{ liked: Record<string, boolean>; update: (fn: (l: Record<string, boolean>) => Record<string, boolean>) => void }>((set) => ({
  liked: { "sunrise-290": true, lake: true, dal: true },
  update: (fn) => set((st) => ({ liked: fn(st.liked) })),
}));

// ---------------------------------------------------------------------------
// Albums and stories (built from the same library)
// ---------------------------------------------------------------------------

type AlbumId = "camera" | "favorites" | "food" | "trips" | "screenshots";
const ALBUM_NAMES: Record<AlbumId, string> = { camera: "Camera", favorites: "Favorites", food: "Food", trips: "Trips", screenshots: "Screenshots" };
const ALBUM_ORDER: AlbumId[] = ["camera", "favorites", "food", "trips", "screenshots"];

function albumItems(a: AlbumId, liked: Record<string, boolean>): number[] {
  switch (a) {
    case "camera":
      return NEWEST_FIRST.filter((i) => LIBRARY[i].id !== "roll-10");
    case "favorites":
      return NEWEST_FIRST.filter((i) => liked[LIBRARY[i].id]);
    case "food":
      return byIds(["dal", "kitchen", "roll-06", "roll-14", "roll-02", "roll-12"]);
    case "trips":
      return byIds(["lake", "roll-07", "roll-16", "roll-09", "roll-17"]);
    case "screenshots":
      return byIds(["roll-10"]);
  }
}

const STORIES = [
  { id: "lake-weekend", title: "Weekend at the lake", dates: "Oct 5 – 11", cover: "lake", count: 3 },
  { id: "sunsets", title: "Golden hours", dates: "Aug 14 – Oct 21", cover: "roll-20", count: 4 },
  { id: "food-diary", title: "Home cooking", dates: "Sep 14 – Oct 23", cover: "dal", count: 4 },
];

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

type Tab = "pictures" | "albums" | "stories" | "menu";
type Route = { tab: Tab; album: AlbumId | null; photo: number | null };

export function PhotosApp({ display }: AppScreenProps) {
  // shared with the other display's copy, so a fold/unfold keeps the tab, album and open photo
  const stack = useStack<Route>("photos", { tab: "pictures", album: null, photo: null });
  // an older stored route may only carry { photo }
  const stored = stack.top as Partial<Route>;
  const route: Route = { tab: stored.tab ?? "pictures", album: stored.album ?? null, photo: stored.photo ?? null };
  const go = (r: Partial<Route>) => stack.reset([{ ...route, ...r }]);
  const liked = useFavorites((f) => f.liked);
  const setLiked = useFavorites((f) => f.update);

  // the set the viewer pages through: the open album, or the whole library
  const set = route.album ? albumItems(route.album, liked) : NEWEST_FIRST;
  const open = (i: number) => go({ photo: i });

  let body: ReactNode;
  if (route.album) {
    const items = albumItems(route.album, liked);
    body = (
      <OneUIPage key={`album-${route.album}`} title={ALBUM_NAMES[route.album]} subtitle={countLabel(items.length)} onBack={() => go({ album: null })}>
        <PhotoGrid items={items} onOpen={open} grouped={false} />
      </OneUIPage>
    );
  } else if (route.tab === "pictures") {
    body = (
      <OneUIPage key="pictures" title="Pictures" subtitle={countLabel(LIBRARY.length)}>
        <PhotoGrid items={NEWEST_FIRST} onOpen={open} grouped />
      </OneUIPage>
    );
  } else if (route.tab === "albums") {
    body = (
      <OneUIPage key="albums" title="Albums" subtitle={`${ALBUM_ORDER.length} albums`} extra={<Glyph.plus />}>
        <Albums liked={liked} onOpen={(a) => go({ album: a })} />
      </OneUIPage>
    );
  } else if (route.tab === "stories") {
    body = (
      <OneUIPage key="stories" title="Stories" subtitle={`${STORIES.length} stories`} extra={<Glyph.plus />}>
        <Stories />
      </OneUIPage>
    );
  } else {
    body = (
      <OneUIPage key="menu" title="Gallery" subtitle="Menu" noSearch>
        <Menu onFavorites={() => go({ tab: "albums", album: "favorites" })} />
      </OneUIPage>
    );
  }

  return (
    <AppFrame display={display} tone={route.photo !== null ? "light" : "dark"} background="var(--gallery-bg)">
      {body}
      {route.album ? null : <BottomNav tab={route.tab} onTab={(t) => go({ tab: t, album: null })} />}
      <AnimatePresence>
        {route.photo !== null ? (
          <Viewer key="viewer" index={route.photo} set={set} setIndex={open} liked={liked} setLiked={setLiked} onClose={() => go({ photo: null })} />
        ) : null}
      </AnimatePresence>
    </AppFrame>
  );
}

const countLabel = (n: number) => `${n} ${n === 1 ? "picture" : "pictures"}`;

// ---------------------------------------------------------------------------
// Glyphs (our own drawings in the One UI outline style)
// ---------------------------------------------------------------------------

const st = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;
type G = { size?: number };
const Svg = ({ size = 24, children }: { size?: number; children: ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

const Glyph = {
  back: ({ size }: G) => (
    <Svg size={size}>
      <path d="M20 12H4.6M11 5.4 4.4 12l6.6 6.6" {...st} strokeWidth={1.9} />
    </Svg>
  ),
  search: ({ size }: G) => (
    <Svg size={size}>
      <circle cx="10.8" cy="10.8" r="6.3" {...st} />
      <path d="m15.6 15.6 4.6 4.6" {...st} />
    </Svg>
  ),
  more: ({ size }: G) => (
    <Svg size={size}>
      <circle cx="12" cy="5.5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="18.5" r="1.5" fill="currentColor" />
    </Svg>
  ),
  plus: ({ size }: G) => (
    <Svg size={size}>
      <path d="M12 4.5v15M4.5 12h15" {...st} />
    </Svg>
  ),
  menu: ({ size }: G) => (
    <Svg size={size}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" {...st} />
    </Svg>
  ),
  heart: ({ size, filled }: G & { filled?: boolean }) => (
    <Svg size={size}>
      <path
        d="M12 20s-7.6-4.6-7.6-10.1A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.6 2.7C19.6 15.4 12 20 12 20Z"
        {...st}
        fill={filled ? "var(--gallery-favorite)" : "none"}
        stroke={filled ? "var(--gallery-favorite)" : "currentColor"}
      />
    </Svg>
  ),
  edit: ({ size }: G) => (
    <Svg size={size}>
      <path d="M14.6 5.4 18.6 9.4M4.5 19.5l1-4.3L15.9 4.8a1.8 1.8 0 0 1 2.6 0l.7.7a1.8 1.8 0 0 1 0 2.6L8.8 18.5l-4.3 1Z" {...st} />
    </Svg>
  ),
  share: ({ size }: G) => (
    <Svg size={size}>
      <circle cx="17.5" cy="5.8" r="2.4" {...st} />
      <circle cx="6.5" cy="12" r="2.4" {...st} />
      <circle cx="17.5" cy="18.2" r="2.4" {...st} />
      <path d="m8.6 10.8 6.8-3.8M8.6 13.2l6.8 3.8" {...st} />
    </Svg>
  ),
  trash: ({ size }: G) => (
    <Svg size={size}>
      <path d="M4.5 6.5h15M9.5 6.5V5a1.2 1.2 0 0 1 1.2-1.2h2.6A1.2 1.2 0 0 1 14.5 5v1.5M6.3 6.5l.8 12.2a1.6 1.6 0 0 0 1.6 1.5h6.6a1.6 1.6 0 0 0 1.6-1.5l.8-12.2M10 10.5v6M14 10.5v6" {...st} />
    </Svg>
  ),
  video: ({ size }: G) => (
    <Svg size={size}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="3" {...st} />
      <path d="M10.3 9.3v5.4l4.5-2.7-4.5-2.7Z" fill="currentColor" />
    </Svg>
  ),
  clock: ({ size }: G) => (
    <Svg size={size}>
      <circle cx="12" cy="12" r="8" {...st} />
      <path d="M12 7.5V12l3 2" {...st} />
    </Svg>
  ),
  pin: ({ size }: G) => (
    <Svg size={size}>
      <path d="M12 20.5s6-5.6 6-10.5a6 6 0 0 0-12 0c0 4.9 6 10.5 6 10.5Z" {...st} />
      <circle cx="12" cy="10" r="2.2" {...st} />
    </Svg>
  ),
  sparkle: ({ size }: G) => (
    <Svg size={size}>
      <path d="M12 3.5 13.8 10.2 20.5 12l-6.7 1.8L12 20.5l-1.8-6.7L3.5 12l6.7-1.8L12 3.5Z" {...st} />
    </Svg>
  ),
  people: ({ size }: G) => (
    <Svg size={size}>
      <circle cx="9" cy="8.5" r="3" {...st} />
      <path d="M3.5 19c.4-3 2.7-5 5.5-5s5.1 2 5.5 5M15.5 6a3 3 0 0 1 0 5.6M17 14.3c2 .5 3.3 2.2 3.5 4.7" {...st} />
    </Svg>
  ),
  gear: ({ size }: G) => (
    <Svg size={size}>
      <circle cx="12" cy="12" r="3" {...st} />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6" {...st} />
    </Svg>
  ),
};

// ---------------------------------------------------------------------------
// The One UI page: extended app bar (cover) + toolbar that stays
// ---------------------------------------------------------------------------

const TOOLBAR = 56;
const NAV = 58;

function OneUIPage({
  title,
  subtitle,
  onBack,
  extra,
  noSearch,
  children,
}: {
  title: string;
  subtitle: string;
  onBack?: () => void;
  extra?: ReactNode;
  noSearch?: boolean;
  children: ReactNode;
}) {
  const { display, height } = usePane();
  // One UI drops the extended title in landscape (the inner display), keeping just the toolbar
  const expanded = display === "cover" ? Math.round((height - TOP) * 0.36) : 0;
  const [y, setY] = useState(0);
  const collapsed = expanded === 0 || y > expanded - 24;
  const bottom = onBack ? SAFE_BOTTOM : NAV + SAFE_BOTTOM;
  const icon = { width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gallery-text)" } as const;
  return (
    <div
      onScroll={(e) => setY(e.currentTarget.scrollTop)}
      style={{ position: "absolute", left: 0, right: 0, top: TOP, bottom, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none", color: "var(--gallery-text)" }}
    >
      {expanded ? (
        <div style={{ height: expanded, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 24px 14px", opacity: Math.max(0, 1 - y / (expanded * 0.6)) }}>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -0.3, lineHeight: "40px", ...ellipsis }}>{title}</div>
          <div style={{ fontSize: 14, color: "var(--gallery-text-secondary)", marginTop: 4 }}>{subtitle}</div>
        </div>
      ) : null}
      <div style={{ position: "sticky", top: 0, zIndex: 2, height: TOOLBAR, display: "flex", alignItems: "center", gap: 4, paddingLeft: onBack ? 8 : 20, paddingRight: 8, background: "var(--gallery-bg)" }}>
        {onBack ? (
          <Tap label="Back" onPress={onBack} style={icon}>
            <Glyph.back />
          </Tap>
        ) : null}
        <div style={{ flex: 1, minWidth: 0, opacity: collapsed ? 1 : 0, transition: "opacity 0.15s" }}>
          <div style={{ fontSize: 20, fontWeight: 600, ...ellipsis }}>{title}</div>
          {expanded === 0 ? <div style={{ fontSize: 12, color: "var(--gallery-text-secondary)" }}>{subtitle}</div> : null}
        </div>
        {extra ? (
          <Placeholder id="photos:create">
            <span aria-label="Create" style={icon}>
              {extra}
            </span>
          </Placeholder>
        ) : null}
        {noSearch ? null : (
          <Placeholder id="photos:search">
            <span aria-label="Search" style={icon}>
              <Glyph.search />
            </span>
          </Placeholder>
        )}
        <Placeholder id="photos:more-options">
          <span aria-label="More options" style={icon}>
            <Glyph.more />
          </span>
        </Placeholder>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pictures grid
// ---------------------------------------------------------------------------

function PhotoGrid({ items, onOpen, grouped }: { items: number[]; onOpen: (i: number) => void; grouped: boolean }) {
  const { display } = usePane();
  const cols = display === "inner" ? 8 : 4;
  const groups: { label: string; items: number[] }[] = [];
  for (const i of items) {
    const label = grouped ? monthLabel(LIBRARY[i].at) : "";
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.items.push(i);
    else groups.push({ label, items: [i] });
  }
  return (
    <div style={{ paddingBottom: 12 }}>
      {groups.map((g) => (
        <section key={g.label || "all"}>
          {g.label ? <div style={{ height: 40, display: "flex", alignItems: "center", paddingInline: 20, fontSize: 15, fontWeight: 600 }}>{g.label}</div> : null}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
            {g.items.map((i) => (
              <Tap key={LIBRARY[i].id} label={viewerLabel(LIBRARY[i].at).day} onPress={() => onOpen(i)} style={{ display: "block", aspectRatio: "1", overflow: "hidden", background: "var(--gallery-thumb-bg)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src(LIBRARY[i].id)} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </Tap>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Albums, Stories, Menu
// ---------------------------------------------------------------------------

function Albums({ liked, onOpen }: { liked: Record<string, boolean>; onOpen: (a: AlbumId) => void }) {
  const { display } = usePane();
  const cols = display === "inner" ? 6 : 3;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "18px 12px", padding: "8px 16px 16px" }}>
      {ALBUM_ORDER.map((a) => {
        const items = albumItems(a, liked);
        const cover = items[0];
        return (
          <Tap key={a} label={ALBUM_NAMES[a]} onPress={() => onOpen(a)} style={{ display: "block", minWidth: 0 }}>
            <span style={{ display: "block", aspectRatio: "1", borderRadius: 18, overflow: "hidden", background: "var(--gallery-thumb-bg)" }}>
              {cover !== undefined ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src(LIBRARY[cover].id)} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : null}
            </span>
            <span style={{ display: "block", fontSize: 14, fontWeight: 500, marginTop: 6, ...ellipsis }}>{ALBUM_NAMES[a]}</span>
            <span style={{ display: "block", fontSize: 12, color: "var(--gallery-text-secondary)", marginTop: 1 }}>{items.length}</span>
          </Tap>
        );
      })}
    </div>
  );
}

function Stories() {
  const { display } = usePane();
  const cols = display === "inner" ? 3 : 1;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14, padding: "8px 16px 16px" }}>
      {STORIES.map((s) => (
        <Placeholder key={s.id} id="photos:story">
          <div style={{ position: "relative", aspectRatio: display === "inner" ? "3 / 4" : "16 / 10", borderRadius: 24, overflow: "hidden", background: "var(--gallery-thumb-bg)", color: "var(--gallery-on-photo)", cursor: "pointer" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src(s.cover)} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <span style={{ position: "absolute", inset: 0, background: "var(--gallery-story-scrim)" }} />
            <span style={{ position: "absolute", left: 18, right: 18, bottom: 16 }}>
              <span style={{ display: "block", fontSize: 19, fontWeight: 600, ...ellipsis }}>{s.title}</span>
              <span style={{ display: "block", fontSize: 13, opacity: 0.85, marginTop: 2 }}>
                {s.dates} · {s.count} items
              </span>
            </span>
          </div>
        </Placeholder>
      ))}
    </div>
  );
}

function Menu({ onFavorites }: { onFavorites: () => void }) {
  const row = { display: "flex", alignItems: "center", gap: 16, width: "100%", height: 56, paddingInline: 20, fontSize: 16 } as const;
  const items: { label: string; icon: ReactNode; id: string }[] = [
    { label: "Videos", icon: <Glyph.video />, id: "videos" },
    { label: "Recent", icon: <Glyph.clock />, id: "recent" },
    { label: "Locations", icon: <Glyph.pin />, id: "locations" },
    { label: "Suggestions", icon: <Glyph.sparkle />, id: "suggestions" },
    { label: "Shared albums", icon: <Glyph.people />, id: "shared-albums" },
    { label: "Recycle bin", icon: <Glyph.trash />, id: "recycle-bin" },
  ];
  const card = { margin: "8px 12px 12px", borderRadius: 26, background: "var(--gallery-card)", overflow: "hidden" } as const;
  return (
    <>
      <div style={card}>
        <Tap label="Favorites" onPress={onFavorites} highlight="var(--gallery-pressed)" style={row}>
          <Glyph.heart />
          Favorites
        </Tap>
        {items.map((it) => (
          <Placeholder key={it.id} id={`photos:menu-${it.id}`} press="darken">
            <div style={{ ...row, cursor: "pointer" }}>
              {it.icon}
              {it.label}
            </div>
          </Placeholder>
        ))}
      </div>
      <div style={card}>
        <Placeholder id="photos:settings" press="darken">
          <div style={{ ...row, cursor: "pointer" }}>
            <Glyph.gear />
            Settings
          </div>
        </Placeholder>
      </div>
    </>
  );
}

function BottomNav({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "pictures", label: "Pictures" },
    { id: "albums", label: "Albums" },
    { id: "stories", label: "Stories" },
  ];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: NAV + SAFE_BOTTOM, paddingBottom: SAFE_BOTTOM, background: "var(--gallery-bg)", display: "flex", alignItems: "center", paddingInline: 8, zIndex: 5 }}>
      <div style={{ flex: 1, display: "flex", maxWidth: 560, margin: "0 auto" }}>
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <Tap key={t.id} label={t.label} onPress={() => onTab(t.id)} style={{ flex: 1, height: NAV, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <span style={{ fontSize: 15, fontWeight: on ? 700 : 500, color: on ? "var(--gallery-text)" : "var(--gallery-tab-inactive)" }}>{t.label}</span>
              <span style={{ width: 22, height: 3, borderRadius: 2, background: on ? "var(--gallery-text)" : "transparent" }} />
            </Tap>
          );
        })}
        <Tap label="Menu" onPress={() => onTab("menu")} style={{ width: 64, height: NAV, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: tab === "menu" ? "var(--gallery-text)" : "var(--gallery-tab-inactive)" }}>
          <Glyph.menu />
          <span style={{ width: 22, height: 3, borderRadius: 2, background: tab === "menu" ? "var(--gallery-text)" : "transparent" }} />
        </Tap>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Viewer
// ---------------------------------------------------------------------------

function Viewer({
  index,
  set,
  setIndex,
  liked,
  setLiked,
  onClose,
}: {
  index: number;
  set: number[];
  setIndex: (i: number) => void;
  liked: Record<string, boolean>;
  setLiked: (fn: (l: Record<string, boolean>) => Record<string, boolean>) => void;
  onClose: () => void;
}) {
  const [chrome, setChrome] = useState(true);
  const p = LIBRARY[index];
  const d = viewerLabel(p.at);
  const fav = !!liked[p.id];
  const pos = set.indexOf(index);
  // the grid is newest first, so "next" (right) is older, like swiping in Gallery
  const prev = pos > 0 ? set[pos - 1] : null;
  const next = pos >= 0 && pos < set.length - 1 ? set[pos + 1] : null;
  const top = TOP + TOOLBAR;
  const bar = 60 + SAFE_BOTTOM;
  const tool = { flex: 1, height: 60, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gallery-viewer-icon)" } as const;
  const fade = { opacity: chrome ? 1 : 0, pointerEvents: chrome ? "auto" : "none", transition: "opacity 0.2s" } as const;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ position: "absolute", inset: 0, zIndex: 20, background: "var(--gallery-viewer-bg)", color: "var(--gallery-viewer-icon)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src(p.id)} alt="" draggable={false} style={{ position: "absolute", left: 0, top: TOP, width: "100%", height: `calc(100% - ${TOP + SAFE_BOTTOM}px)`, objectFit: "contain" }} />
      {/* tap the left / right third to page through (like a swipe), the middle to hide the controls */}
      <button type="button" aria-label="Newer photo" onClick={() => prev !== null && setIndex(prev)} style={{ position: "absolute", left: 0, top, bottom: bar, width: "33%", background: "none", border: 0, cursor: "pointer" }} />
      <button type="button" aria-label="Show or hide controls" onClick={() => setChrome((c) => !c)} style={{ position: "absolute", left: "33%", right: "33%", top, bottom: bar, background: "none", border: 0, cursor: "pointer" }} />
      <button type="button" aria-label="Older photo" onClick={() => next !== null && setIndex(next)} style={{ position: "absolute", right: 0, top, bottom: bar, width: "33%", background: "none", border: 0, cursor: "pointer" }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 24, paddingTop: TOP, background: "var(--gallery-viewer-top-scrim)", ...fade }}>
        <div style={{ height: TOOLBAR, display: "flex", alignItems: "center", gap: 6, paddingLeft: 8, paddingRight: 8 }}>
          <Tap label="Back" onPress={onClose} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Glyph.back />
          </Tap>
          <div style={{ flex: 1, minWidth: 0, lineHeight: "18px" }}>
            <div style={{ fontSize: 15, fontWeight: 500, ...ellipsis }}>{d.day}</div>
            <div style={{ fontSize: 12, color: "var(--gallery-viewer-text-secondary)" }}>{d.time}</div>
          </div>
          <Placeholder id="photos:viewer-more">
            <span aria-label="More options" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Glyph.more />
            </span>
          </Placeholder>
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bar + 20, paddingTop: 20, paddingBottom: SAFE_BOTTOM, background: "var(--gallery-viewer-bottom-scrim)", ...fade }}>
        <div style={{ height: 60, display: "flex", alignItems: "center", maxWidth: 520, margin: "0 auto", paddingInline: 8 }}>
          <Tap label={fav ? "Remove from favorites" : "Add to favorites"} onPress={() => setLiked((l) => ({ ...l, [p.id]: !l[p.id] }))} style={tool}>
            <Glyph.heart size={26} filled={fav} />
          </Tap>
          <Placeholder id="photos:edit">
            <span aria-label="Edit" style={tool}>
              <Glyph.edit size={26} />
            </span>
          </Placeholder>
          <Placeholder id="photos:share">
            <span aria-label="Share" style={tool}>
              <Glyph.share size={26} />
            </span>
          </Placeholder>
          <Placeholder id="photos:delete">
            <span aria-label="Delete" style={tool}>
              <Glyph.trash size={26} />
            </span>
          </Placeholder>
        </div>
      </div>
    </motion.div>
  );
}
