/**
 * /test/tokens: the token swatch sheet (Phase 0). A fixed 1920x1080 artboard, no controls.
 *   (default)      ?state=palettes  every un-* token on un-bg + every look-alike palette on its own background
 *   ?state=scales  device colors + materials on the wallpaper, iOS materials, type, shadows, radius, space, blur
 * Every value is read from lib/tokens.ts / lib/unsaid-theme.json and painted with the CSS vars of
 * app/tokens.css / app/unsaid-theme.css, so a mismatch between the TS and CSS token files shows here.
 */
import Image from "next/image";
import { Suspense, type CSSProperties, type ReactNode } from "react";
import {
  blur,
  color,
  cssVar,
  gradient,
  material,
  palettes,
  radius,
  shadow,
  space,
  type,
  typeCssName,
  un,
  type TypeToken,
} from "@/lib/tokens";

/** Artboard and layout numbers (artboard px; numbers, not styling literals). */
const ARTBOARD = { width: 1920, height: 1080 };
const RAIL = 240;
const LIST_COL = 160;
const UN_CELL = 104;

type Tone = "light" | "dark" | "un";
const TONE: Record<Tone, { label: string; secondary: string; ring: string }> = {
  light: { label: cssVar("ios-label"), secondary: cssVar("ios-label-secondary"), ring: cssVar("ios-separator") },
  dark: { label: cssVar("ios-dark-label"), secondary: cssVar("ios-dark-label-2"), ring: cssVar("ios-dark-separator") },
  un: { label: cssVar("un-text"), secondary: cssVar("un-text-3"), ring: cssVar("un-hairline") },
};

const ring = (tone: Tone) => `inset 0 0 0 ${cssVar("hairline")} ${TONE[tone].ring}`;

const nameStyle = (tone: Tone): CSSProperties => ({
  font: cssVar("type-caption-2-semibold"),
  color: TONE[tone].label,
  whiteSpace: "nowrap",
});
const valueStyle = (tone: Tone): CSSProperties => ({
  font: cssVar("type-caption-2"),
  color: TONE[tone].secondary,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});
const titleStyle = (tone: Tone): CSSProperties => ({
  font: cssVar("type-caption-1-semibold"),
  color: TONE[tone].label,
  margin: 0,
});

function Caption({ name, value, tone, width }: { name: string; value: string; tone: Tone; width?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, width }}>
      <span style={nameStyle(tone)}>{name}</span>
      <span style={valueStyle(tone)} title={value}>
        {value}
      </span>
    </div>
  );
}

/** A list row: small chip + name/value. */
function ColorRow({ name, label, tone }: { name: string; label?: string; tone: Tone }) {
  const value = (color as Record<string, string>)[name] ?? (gradient as Record<string, string>)[name];
  const isGradient = name in gradient;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: space[8], width: LIST_COL }}>
      <span
        style={{
          flex: "none",
          width: space[24],
          height: space[24],
          borderRadius: radius[5],
          background: cssVar(name),
          boxShadow: ring(tone),
        }}
      />
      <Caption name={label ?? name} value={isGradient ? value.slice(0, value.indexOf("(")) : value} tone={tone} />
    </div>
  );
}

function Panel({
  title,
  tone,
  background,
  rows = 6,
  children,
  layer,
  style,
}: {
  title: string;
  tone: Tone;
  background: string;
  rows?: number;
  children: ReactNode;
  layer?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: radius[16],
        padding: space[14],
        background,
        boxShadow: ring(tone),
        ...style,
      }}
    >
      {layer}
      <div style={{ position: "relative" }}>
        <h3 style={{ ...titleStyle(tone), height: space[32], width: "min-content", minWidth: "100%" }}>{title}</h3>
        <div
          style={{
            display: "grid",
            gridTemplateRows: `repeat(${rows}, auto)`,
            gridAutoFlow: "column",
            columnGap: space[12],
            rowGap: space[2],
            marginTop: space[8],
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/** The Phase 1 wallpaper recipe as a panel background layer. */
function WallpaperLayer({ id }: { id: string }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: cssVar("ios-wallpaper-base") }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: cssVar("ios-wallpaper"),
          filter: cssVar("wallpaper-filter"),
          transform: `scale(${cssVar("wallpaper-scale")})`,
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: cssVar("wallpaper-noise-opacity") }}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </div>
  );
}

function SectionLabel({ children, tone }: { children: ReactNode; tone: Tone }) {
  return (
    <p style={{ ...titleStyle(tone), color: TONE[tone].secondary, margin: 0, marginBottom: space[10] }}>{children}</p>
  );
}

function Reference({ src, alt, width, height, tone }: { src: string; alt: string; width: number; height: number; tone: Tone }) {
  return (
    <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: space[6] }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        style={{ width, height, borderRadius: radius[8], boxShadow: ring(tone), objectFit: "cover", objectPosition: "top" }}
      />
      <figcaption style={valueStyle(tone)}>{alt}</figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Sheet 1: palettes
// ---------------------------------------------------------------------------

type Group = { title: string; names: string[]; background: string; tone: Tone; rows?: number; width?: number };

const g = palettes as Record<string, Record<string, string>>;
const keysOf = (group: string) => Object.keys(g[group]);
const IG = "Instagram (light DMs, dark Reels)";
const IOS = "iOS system (light, plus dark where used)";
const iosExtras = Object.keys(color).filter(
  (k) => (k.startsWith("ios-") || k === "label-on-dark") && !keysOf(IOS).includes(k) && k !== "ios-wallpaper-base",
);

const ROW_1: Group[] = [
  { title: "WhatsApp (iOS, light)", names: keysOf("WhatsApp (iOS, light)"), background: cssVar("wa-chat-bg"), tone: "light" },
  { title: "WhatsApp calls (dark call screen)", names: keysOf("WhatsApp calls (dark call screen)"), background: cssVar("wa-call-bg"), tone: "dark" },
  { title: "Messages / iMessage (iOS, light)", names: keysOf("Messages / iMessage (iOS, light)"), background: cssVar("stage-white"), tone: "light", rows: 4 },
  { title: IG, names: keysOf(IG).filter((k) => k !== "ig-reels-bg"), background: cssVar("stage-white"), tone: "light", rows: 4 },
  { title: "dark Reels", names: ["ig-reels-bg"], background: cssVar("ig-reels-bg"), tone: "dark" },
];
const ROW_2: Group[] = [
  { title: "Facebook (light)", names: keysOf("Facebook (light)"), background: cssVar("fb-bg"), tone: "light" },
  { title: "Meta AI (light)", names: keysOf("Meta AI (light)"), background: cssVar("stage-white"), tone: "light" },
  { title: IOS, names: [...keysOf(IOS), ...iosExtras], background: cssVar("ios-gray6"), tone: "light" },
  { title: "Look-alike gradients", names: Object.keys(gradient), background: cssVar("stage-white"), tone: "light" },
  { title: "Stage", names: ["stage-black", "stage-white", "ios-wallpaper-base"], background: cssVar("stage-black"), tone: "dark" },
];

function GroupPanel({ group }: { group: Group }) {
  return (
    <Panel title={group.title} tone={group.tone} background={group.background} rows={group.rows ?? 6}>
      {group.names.map((name) => (
        <ColorRow key={name} name={name} tone={group.tone} />
      ))}
    </Panel>
  );
}

const unType = Object.entries(un.type) as Array<[string, { size: number; lineHeight: number; weight: number; tracking: string }]>;
const UN_TYPE_BIG = new Set(["un-letter-hero", "un-display", "un-compose", "un-card-title"]);

function UnBand() {
  return (
    <div style={{ background: cssVar("un-bg"), padding: `${space[28]}px ${space[40]}px`, display: "flex", gap: space[32] }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: space[20] }}>
        <div>
          <SectionLabel tone="un">un-* · lib/unsaid-theme.json · app/unsaid-theme.css</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(14, ${UN_CELL}px)`, columnGap: space[8], rowGap: space[12] }}>
            {Object.entries(un.color).map(([name, value]) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: space[6] }}>
                <span style={{ height: space[36], borderRadius: radius[8], background: cssVar(name), boxShadow: ring("un") }} />
                <Caption name={name} value={value} tone="un" width={UN_CELL} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: space[16], alignItems: "flex-start" }}>
          {Object.entries(un.gradient).map(([name, value]) => {
            const shape: CSSProperties =
              name === "un-pill-gradient"
                ? { width: 200, borderRadius: cssVar("un-r-pill") }
                : name === "un-icon-gradient"
                  ? { width: space[56], borderRadius: cssVar("un-r-icon") }
                  : { width: 200, borderRadius: cssVar("un-r-row") };
            return (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: space[6], width: name === "un-icon-gradient" ? 120 : 200 }}>
                <span style={{ height: space[56], background: cssVar(name), ...shape }} />
                <Caption name={name} value={value} tone="un" width={name === "un-icon-gradient" ? 120 : 200} />
              </div>
            );
          })}
          {Object.entries(un.shadow).map(([name, value]) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: space[6], width: 120 }}>
              <span style={{ height: space[56], borderRadius: cssVar("un-r-row"), background: cssVar("un-surface"), boxShadow: cssVar(name) }} />
              <Caption name={name} value={value} tone="un" width={120} />
            </div>
          ))}
          {Object.entries(un.radius).map(([name, value]) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: space[6], width: space[72] }}>
              <span style={{ width: space[56], height: space[56], borderRadius: cssVar(name), background: cssVar("un-surface-raised") }} />
              <Caption name={name} value={String(value)} tone="un" width={space[72]} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: space[12] }}>
          {[true, false].map((big) => (
            <div key={String(big)} style={{ display: "flex", gap: big ? space[40] : space[20], alignItems: "flex-end", flexWrap: "nowrap" }}>
              {unType
                .filter(([name]) => UN_TYPE_BIG.has(name) === big)
                .map(([name, t]) => (
                  <div key={name} style={{ display: "flex", flexDirection: "column", gap: space[4] }}>
                    <span style={{ font: cssVar(name), letterSpacing: cssVar(`${name}-tracking`), color: cssVar("un-text"), whiteSpace: "nowrap" }}>
                      {name}
                    </span>
                    <span style={valueStyle("un")}>{`${t.size}/${t.lineHeight} · ${t.weight} · ${t.tracking}`}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ width: RAIL, flex: "none" }}>
        <Reference src="/unsaid-theme/unsaid-palette.png" alt="App-UI-Final/tokens/unsaid-palette.png" width={RAIL} height={198} tone="un" />
      </div>
    </div>
  );
}

function PalettesSheet() {
  return (
    <>
      <UnBand />
      <div style={{ padding: `${space[24]}px ${space[40]}px`, display: "flex", gap: space[32] }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: space[12] }}>
          <SectionLabel tone="dark">look-alike palettes · assets/palettes/branched-tokens.json · app/tokens.css</SectionLabel>
          {[ROW_1, ROW_2].map((row, i) => (
            <div key={i} style={{ display: "flex", gap: space[12], alignItems: "flex-start" }}>
              {row.map((group) => (
                <GroupPanel key={group.title} group={group} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ width: RAIL, flex: "none" }}>
          <Reference
            src="/test/branched-frontend-palette.png"
            alt="assets/palettes/branched-frontend-palette.png"
            width={RAIL}
            height={435}
            tone="dark"
          />
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sheet 2: scales
// ---------------------------------------------------------------------------

const deviceColors = Object.keys(color).filter((k) => k.startsWith("device-"));
const deviceMaterials = Object.keys(material).filter((k) => k.startsWith("device-"));
const iosMaterials = Object.keys(material).filter((k) => k.startsWith("material-") && !k.endsWith("-filter") && !k.endsWith("-stroke"));
const strip = (k: string) => k.replace(/^device-/, "");

function Tile({ name, value, fill, tone, extra, width = 112 }: { name: string; value: string; fill: string; tone: Tone; extra?: CSSProperties; width?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space[6], width }}>
      <span style={{ height: space[44], borderRadius: radius[10], background: fill, ...extra }} />
      <Caption name={name} value={value} tone={tone} width={width} />
    </div>
  );
}

function ScalesSheet() {
  const iosType = (Object.keys(type) as TypeToken[]).filter((k) => !k.startsWith("meta"));
  const metaType = (Object.keys(type) as TypeToken[]).filter((k) => k.startsWith("meta"));
  return (
    <div style={{ padding: `${space[32]}px ${space[40]}px`, display: "flex", flexDirection: "column", gap: space[16] }}>
      <div style={{ display: "flex", gap: space[16], alignItems: "stretch" }}>
        <Panel title="device-* · colors (section 4.3, Phase 1)" tone="dark" background={cssVar("ios-wallpaper-base")} rows={4} layer={<WallpaperLayer id="tokens-noise-a" />}>
          {deviceColors.map((name) => (
            <ColorRow key={name} name={name} label={strip(name)} tone="dark" />
          ))}
        </Panel>
        <Panel title="iOS materials · blur" tone="dark" background={cssVar("ios-wallpaper-base")} rows={1} layer={<WallpaperLayer id="tokens-noise-b" />} style={{ flex: 1 }}>
          {iosMaterials.map((name) => (
            <Tile
              key={name}
              name={name}
              value={material[name as keyof typeof material]}
              fill={cssVar(name)}
              tone="dark"
              width={128}
              extra={{
                backdropFilter: cssVar(name.startsWith("material-pill") ? "material-pill-filter" : `${name}-filter`),
                boxShadow: name === "material-glass" ? cssVar("shadow-glass-stroke") : name === "material-light" ? cssVar("shadow-banner") : undefined,
                borderRadius: name === "material-light" ? radius[24] : radius[10],
              }}
            />
          ))}
        </Panel>
      </div>
      <Panel title="device-* · materials (Phase 1)" tone="dark" background={cssVar("ios-wallpaper-base")} rows={2} layer={<WallpaperLayer id="tokens-noise-c" />}>
        {deviceMaterials.map((name) => (
          <Tile key={name} name={strip(name)} value={material[name as keyof typeof material]} fill={cssVar(name)} tone="dark" width={LIST_COL} />
        ))}
      </Panel>
      <div style={{ display: "flex", gap: space[16], alignItems: "stretch" }}>
        <Panel title="type · iOS text styles + Meta sizes" tone="light" background={cssVar("stage-white")} rows={7}>
          {[...iosType, ...metaType].map((name) => {
            const t = type[name];
            const css = typeCssName(name);
            return (
              <div key={name} style={{ display: "flex", flexDirection: "column", width: 260 }}>
                <span style={{ font: cssVar(`type-${css}`), letterSpacing: cssVar(`type-${css}-tracking`), color: cssVar("ios-label"), whiteSpace: "nowrap" }}>
                  {name}
                </span>
                <span style={valueStyle("light")}>{`--type-${css} · ${t.size}/${t.lineHeight} · ${t.weight} · ${t.tracking}`}</span>
              </div>
            );
          })}
        </Panel>
        <Panel title="shadow-*" tone="light" background={cssVar("ios-gray6")} rows={4}>
          {Object.entries(shadow).map(([name, value]) => {
            const onDark = name === "device-rim-light" || name === "device-bezel-inner" || name === "icon-stroke" || name === "glass-stroke";
            return (
              <Tile
                key={name}
                name={name}
                value={value}
                tone="light"
                width={LIST_COL}
                fill={onDark ? cssVar("device-bezel") : cssVar("stage-white")}
                extra={name === "icon-label" ? {} : { boxShadow: cssVar(`shadow-${name}`) }}
              />
            );
          })}
        </Panel>
        <div style={{ display: "flex", flexDirection: "column", gap: space[16], flex: 1 }}>
          <Panel title="radius-*" tone="light" background={cssVar("stage-white")} rows={3}>
            {Object.entries(radius).map(([name, value]) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: space[4], width: space[72] }}>
                <span style={{ width: space[44], height: space[44], borderTopLeftRadius: cssVar(`radius-${name}`), background: cssVar("ios-gray5"), boxShadow: ring("light") }} />
                <Caption name={name} value={typeof value === "number" ? String(value) : value} tone="light" width={space[72]} />
              </div>
            ))}
          </Panel>
          <Panel title="space · blur · hairline" tone="light" background={cssVar("stage-white")} rows={9}>
            {Object.entries(space).map(([name, value]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: space[8], width: 192 }}>
                <span style={{ ...nameStyle("light"), width: space[64] }}>{`space-${name}`}</span>
                <span style={{ width: value, height: space[8], borderRadius: radius[2], background: cssVar("ios-blue") }} />
              </div>
            ))}
            {Object.entries(blur).map(([name, value]) => (
              <div key={`blur-${name}`} style={{ display: "flex", alignItems: "center", gap: space[8], width: 192 }}>
                <span style={{ ...nameStyle("light"), width: space[64] }}>{`blur-${name}`}</span>
                <span style={valueStyle("light")}>{String(value)}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: space[8], width: 192 }}>
              <span style={{ ...nameStyle("light"), width: space[64] }}>hairline</span>
              <span style={{ width: space[64], height: cssVar("hairline"), background: cssVar("ios-separator") }} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

async function Sheet({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { state } = await searchParams;
  return state === "scales" ? <ScalesSheet /> : <PalettesSheet />;
}

export default function TokensPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <main
      data-scene="test-tokens"
      style={{
        position: "relative",
        width: ARTBOARD.width,
        height: ARTBOARD.height,
        overflow: "hidden",
        background: cssVar("stage-black"),
        fontFamily: cssVar("font-system"),
      }}
    >
      <Suspense fallback={null}>
        <Sheet searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
