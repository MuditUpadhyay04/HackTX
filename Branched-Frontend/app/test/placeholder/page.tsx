import { Suspense, type CSSProperties, type ReactNode } from "react";
import { Stage, Wallpaper } from "@/components/stage/Stage";
import { Placeholder } from "@/components/Placeholder";
import { ConceptOnlyPill } from "@/components/PlaceholderToast";

/*
 * /test/placeholder (spec Phase 0, Step 4): one realistic sample control per
 * placeholder platform, each on its own app's background, plus both looks of
 * the "concept only" toast. ?state=pressed renders every control pressed.
 * Layout: 1920x1080 artboard, 4 columns of phone-width (408) tiles.
 */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function PlaceholderTestPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Stage background="white" data-scene="test-placeholder">
      <Suspense fallback={<Board pressed={false} />}>
        <BoardFromUrl searchParams={searchParams} />
      </Suspense>
    </Stage>
  );
}

async function BoardFromUrl({ searchParams }: { searchParams: SearchParams }) {
  const { state } = await searchParams;
  return <Board pressed={state === "pressed"} />;
}

/* ---------- type + layout helpers (tokens only) ---------- */

function textStyle(name: string, weight?: number): CSSProperties {
  return {
    fontFamily: "var(--font-system)",
    fontSize: `var(--type-${name}-size)`,
    lineHeight: `var(--type-${name}-line-height)`,
    fontWeight: weight ?? `var(--type-${name}-weight)`,
    letterSpacing: `var(--type-${name}-tracking)`,
  };
}

const TILE_W = 408;
const TILE_H = 236;

const hairlineBottom = "inset 0 calc(-1 * var(--hairline)) 0 var(--ios-gray4)";
const hairlineTop = "inset 0 var(--hairline) 0 var(--ios-gray4)";
// TOKEN NEEDED: --stage-white and --ios-bg (#FFFFFF); fall back to the white key fill until added.
const WHITE = "var(--stage-white, var(--ios-kb-key))";
const ON_DARK = "var(--ios-bg, var(--ios-kb-key))";

const glyphButton: CSSProperties = {
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 44,
  height: 44,
  padding: 0,
  margin: 0,
  border: 0,
  background: "none",
  color: "inherit",
};

/* ---------- glyphs (inline SVG, 24-unit grid, iOS / Meta stroke weights) ---------- */

function Glyph({ size = 24, stroke = 2, children }: { size?: number; stroke?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const SearchGlyph = () => (
  <Glyph size={22} stroke={2.1}>
    <circle cx="10.5" cy="10.5" r="6.75" />
    <path d="M15.4 15.4 20.5 20.5" />
  </Glyph>
);

const CameraGlyph = () => (
  <Glyph size={24} stroke={1.7}>
    <path d="M3.5 8.75A2 2 0 0 1 5.5 6.75h2.1l1.5-2.25h5.8l1.5 2.25h2.1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
    <circle cx="12" cy="13.25" r="3.6" />
  </Glyph>
);

const PlusGlyph = () => (
  <Glyph size={18} stroke={2.4}>
    <path d="M12 5v14M5 12h14" />
  </Glyph>
);

const PaperPlaneGlyph = () => (
  <Glyph size={24} stroke={1.9}>
    <path d="M21.5 3 9.6 10.1" />
    <path d="M21.5 3 2.5 3.1l7.1 7 2.5 10.1z" />
  </Glyph>
);

const HeartGlyph = () => (
  <Glyph size={24} stroke={1.8}>
    <path d="M12 20.25s-7.25-4.4-9.1-8.85C1.6 8.25 3.4 4.75 6.75 4.75c2.1 0 3.45 1.15 5.25 3.2 1.8-2.05 3.15-3.2 5.25-3.2 3.35 0 5.15 3.5 3.85 6.65-1.85 4.45-9.1 8.85-9.1 8.85z" />
  </Glyph>
);

const TrashGlyph = () => (
  <Glyph size={24} stroke={1.7}>
    <path d="M4 6.5h16M9.25 6.5V4.75h5.5V6.5" />
    <path d="m6 6.5 1 13.1a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 6.5" />
    <path d="M10 10.5V17M14 10.5V17" />
  </Glyph>
);

const ThumbGlyph = () => (
  <Glyph size={20} stroke={1.8}>
    <path d="M7.25 10.25V20H4.5a1 1 0 0 1-1-1v-7.75a1 1 0 0 1 1-1z" />
    <path d="m7.25 10.25 3.5-6.5a1.6 1.6 0 0 1 3 .95l-.6 4.05h5.1a2 2 0 0 1 1.95 2.4l-1.35 6.75A2 2 0 0 1 16.9 20H7.25" />
  </Glyph>
);

const SendArrowGlyph = () => (
  <Glyph size={18} stroke={2.4}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Glyph>
);

/* ---------- tiles ---------- */

function Tile({
  name,
  id,
  background,
  align = "center",
  children,
}: {
  name: string;
  id: string;
  background: string;
  align?: "center" | "end";
  children: ReactNode;
}) {
  return (
    <figure style={{ margin: 0, width: TILE_W }}>
      <div
        style={{
          position: "relative",
          width: TILE_W,
          height: TILE_H,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: align === "end" ? "flex-end" : "center",
          alignItems: "stretch",
          borderRadius: "var(--radius-16)",
          background,
          boxShadow: "inset 0 0 0 var(--hairline) var(--ios-gray4)",
        }}
      >
        {children}
      </div>
      <figcaption
        style={{
          display: "flex",
          gap: "var(--space-8)",
          marginTop: "var(--space-12)",
          ...textStyle("footnote"),
        }}
      >
        <span style={{ color: "var(--ios-label)", fontWeight: 600 }}>{name}</span>
        <span style={{ color: "var(--ios-gray)" }}>{id}</span>
      </figcaption>
    </figure>
  );
}

function Board({ pressed }: { pressed: boolean }) {
  return (
    <main
      data-scene="test-placeholder"
      data-state={pressed ? "pressed" : "default"}
      style={{
        position: "absolute",
        inset: 0,
        padding: "var(--space-64) var(--space-96)",
        background: WHITE,
      }}
    >
      <header style={{ marginBottom: "var(--space-32)", ...textStyle("footnote") }}>
        <span style={{ color: "var(--ios-gray)" }}>
          /test/placeholder{pressed ? "?state=pressed" : ""}
        </span>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(4, ${TILE_W}fr)`,
          columnGap: "var(--space-32)",
          rowGap: "var(--space-28)",
        }}
      >
        {/* iOS: a search glyph button on the grouped background */}
        <Tile name="iOS" id="ios:search" background="var(--ios-gray6)">
          <div style={{ display: "flex", justifyContent: "flex-end", paddingInline: "var(--space-8)" }}>
            <Placeholder id="ios:search" pressed={pressed}>
              <button type="button" aria-label="Search" style={{ ...glyphButton, color: "var(--ios-blue)" }}>
                <SearchGlyph />
              </button>
            </Placeholder>
          </div>
        </Tile>

        {/* WhatsApp: the camera glyph in the nav bar */}
        <Tile name="WhatsApp" id="whatsapp:camera" background="var(--wa-bubble-in)">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              height: 44,
              paddingInline: "var(--space-8)",
              background: "var(--wa-nav)",
              boxShadow: `${hairlineTop}, ${hairlineBottom}`,
            }}
          >
            <Placeholder id="whatsapp:camera" pressed={pressed}>
              <button type="button" aria-label="Camera" style={{ ...glyphButton, color: "var(--ios-label)" }}>
                <CameraGlyph />
              </button>
            </Placeholder>
          </div>
        </Tile>

        {/* Messages: the "+" circle at the composer's leading edge */}
        <Tile name="Messages" id="messages:plus" background={WHITE}>
          <div style={{ display: "flex", alignItems: "center", paddingInline: "var(--space-8)" }}>
            <Placeholder id="messages:plus" pressed={pressed}>
              <button type="button" aria-label="Apps" style={glyphButton}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    borderRadius: "var(--radius-pill)",
                    background: "var(--imsg-gray)",
                    color: "var(--imsg-meta)",
                  }}
                >
                  <PlusGlyph />
                </span>
              </button>
            </Placeholder>
          </div>
        </Tile>

        {/* Instagram: the paper-plane share glyph */}
        <Tile name="Instagram" id="instagram:share" background={WHITE}>
          <div style={{ display: "flex", alignItems: "center", paddingInline: "var(--space-4)" }}>
            <Placeholder id="instagram:share" pressed={pressed}>
              <button type="button" aria-label="Share" style={{ ...glyphButton, color: "var(--ig-text)" }}>
                <PaperPlaneGlyph />
              </button>
            </Placeholder>
          </div>
        </Tile>

        {/* Photos: heart and trash in the viewer's bottom bar, on black */}
        <Tile name="Photos" id="photos:favorite · photos:trash" background="var(--stage-black)" align="end">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: 44,
              paddingInline: "var(--space-16)",
              marginBottom: "var(--space-24)",
              color: ON_DARK,
            }}
          >
            <Placeholder id="photos:favorite" pressed={pressed}>
              <button type="button" aria-label="Favorite" style={glyphButton}>
                <HeartGlyph />
              </button>
            </Placeholder>
            <Placeholder id="photos:trash" pressed={pressed}>
              <button type="button" aria-label="Delete" style={glyphButton}>
                <TrashGlyph />
              </button>
            </Placeholder>
          </div>
        </Tile>

        {/* Facebook: the "Like" row action at the foot of a post card (press = darken) */}
        <Tile name="Facebook" id="facebook:like" background="var(--fb-bg)">
          <div style={{ background: "var(--fb-card)", paddingInline: "var(--space-12)" }}>
            <div
              style={{
                display: "flex",
                height: 44,
                boxShadow: "inset 0 var(--hairline) 0 var(--fb-divider)",
              }}
            >
              <Placeholder id="facebook:like" press="darken" pressed={pressed}>
                <button
                  type="button"
                  style={{
                    appearance: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--space-6)",
                    margin: 0,
                    border: 0,
                    paddingInline: "var(--space-12)",
                    background: "var(--fb-card)",
                    color: "var(--fb-secondary)",
                    ...textStyle("meta-15", 600),
                  }}
                >
                  <ThumbGlyph />
                  Like
                </button>
              </Placeholder>
            </div>
          </div>
        </Tile>

        {/* Meta AI: the send arrow in the input well */}
        <Tile name="Meta AI" id="meta-ai:send" background={WHITE}>
          <div style={{ paddingInline: "var(--space-16)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                height: 44,
                paddingInline: "var(--space-6)",
                borderRadius: "var(--radius-pill)",
                background: "var(--meta-ai-surface)",
              }}
            >
              <Placeholder id="meta-ai:send" pressed={pressed}>
                <button
                  type="button"
                  aria-label="Send"
                  style={{
                    ...glyphButton,
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-pill)",
                    background: "var(--meta-ai-blue)",
                    color: ON_DARK,
                  }}
                >
                  <SendArrowGlyph />
                </button>
              </Placeholder>
            </div>
          </div>
        </Tile>

        {/* Un-Said: the primary pill (App-UI-Final DESIGN_SPEC 2.7; COPY_AND_NAMES 3.3) */}
        <Tile name="Un-Said" id="unsaid:preview-letter" background="var(--un-bg)">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Placeholder id="unsaid:preview-letter" pressed={pressed}>
              <button
                type="button"
                style={{
                  appearance: "none",
                  width: 366,
                  height: 56,
                  margin: 0,
                  padding: 0,
                  border: 0,
                  borderRadius: "var(--un-r-pill)",
                  background: "var(--un-pill-gradient)",
                  boxShadow: "var(--un-shadow-pill)",
                  color: "var(--un-text)",
                  font: "var(--un-button)",
                  letterSpacing: "var(--un-button-tracking)",
                }}
              >
                Preview letter
              </button>
            </Placeholder>
          </div>
        </Tile>

        {/* The toast, both looks, shown statically (tap any control above for the live one) */}
        <Tile name="Toast" id="host apps" background="var(--ios-wallpaper-base)">
          <Wallpaper variant="stage" />
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <ConceptOnlyPill platform="ios" />
          </div>
        </Tile>

        <Tile name="Toast" id="unsaid" background="var(--un-bg)">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ConceptOnlyPill platform="unsaid" />
          </div>
        </Tile>
      </div>
    </main>
  );
}
