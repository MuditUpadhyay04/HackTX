import { Suspense, type CSSProperties, type ReactNode } from "react";
import { Stage, Wallpaper } from "@/components/stage/Stage";
import { Placeholder } from "@/components/Placeholder";
import { ConceptOnlyPill } from "@/components/PlaceholderToast";
import { emphasizedWeight, size } from "@/lib/tokens";

/*
 * /test/placeholder (spec Phase 0, Step 4): one realistic sample control per
 * host-app placeholder platform, each on its own app's background, plus the
 * host "concept only" toast. Un-Said UI stays out of this board (spec 4.1, 12).
 * ?state=pressed renders every control pressed.
 * Layout: 1920x1080 artboard, 4 columns of phone-width (--size-test-tile-width) tiles.
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

/** An iOS / Meta text style from app/tokens.css; `emphasized` = the style's semibold variant (600). */
function textStyle(name: string, emphasized = false): CSSProperties {
  return {
    fontFamily: "var(--font-system)",
    fontSize: `var(--type-${name}-size)`,
    lineHeight: `var(--type-${name}-line-height)`,
    fontWeight: emphasized ? emphasizedWeight : `var(--type-${name}-weight)`,
    letterSpacing: `var(--type-${name}-tracking)`,
  };
}

const TILE_W = "var(--size-test-tile-width)";
const TILE_H = "var(--size-test-tile-height)";
const TAP = "var(--size-tap-target)";

const hairlineBottom = "inset 0 calc(-1 * var(--hairline)) 0 var(--ios-gray4)";
const hairlineTop = "inset 0 var(--hairline) 0 var(--ios-gray4)";
const WHITE = "var(--stage-white)";
const ON_DARK = "var(--ios-bg)";

const glyphButton: CSSProperties = {
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: TAP,
  height: TAP,
  padding: 0,
  margin: 0,
  border: 0,
  background: "none",
  color: "inherit",
};

/* ---------- glyphs ----------
 * Inline SVG on a 24-unit grid, shown at size.glyphSmall (20) or size.glyphLarge (24).
 * Stroke tokens (size.glyphStroke*) are rendered weights: Glyph scales them into grid units,
 * so a 20 pt and a 24 pt glyph draw the same line and every host reads equally heavy at 2x.
 * Each shape follows its own app's glyph (SF Symbols for iOS / Messages / Photos; the
 * WhatsApp, Instagram, Facebook and Meta AI glyphs for theirs). Round caps and joins throughout.
 */

const GLYPH_GRID = 24;

function Glyph({
  px,
  stroke,
  children,
}: {
  px: number;
  stroke: number;
  children: (gridStroke: number) => ReactNode;
}) {
  const gridStroke = (stroke * GLYPH_GRID) / px;
  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${GLYPH_GRID} ${GLYPH_GRID}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={gridStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children(gridStroke)}
    </svg>
  );
}

/** SF "magnifyingglass": a ring up-left, the handle a touch heavier than the ring. */
const SearchGlyph = () => (
  <Glyph px={size.glyphLarge} stroke={size.glyphStrokeIos}>
    {(w) => (
      <>
        <circle cx="10.25" cy="10.25" r="6.75" />
        <path d="M15.2 15.2 20.4 20.4" strokeWidth={w * 1.25} />
      </>
    )}
  </Glyph>
);

/** WhatsApp's chat-bar camera: a wide, short rounded body, a flat-topped hump centered on it
 *  and a big lens ring filling most of the body's height. */
const CameraGlyph = () => (
  <Glyph px={size.glyphLarge} stroke={size.glyphStrokeWhatsapp}>
    {() => (
      <>
        <path d="M5.25 8h2.4l1.2-2.2c.25-.45.72-.7 1.22-.7h3.86c.5 0 .97.25 1.22.7l1.2 2.2h2.4a3 3 0 0 1 3 3v6.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3z" />
        <circle cx="12" cy="13.85" r="4.35" />
      </>
    )}
  </Glyph>
);

/** SF "plus" inside the Messages apps circle. */
const PlusGlyph = () => (
  <Glyph px={size.glyphSmall} stroke={size.glyphStrokeIos}>
    {() => <path d="M12 5v14M5 12h14" />}
  </Glyph>
);

/** Instagram's share (Direct) plane: a slim, long dart aimed up-right, symmetric about its
 *  axis, softly rounded wing tips and nose, the fold line running from the tail notch to the nose. */
const PaperPlaneGlyph = () => (
  <Glyph px={size.glyphLarge} stroke={size.glyphStrokeInstagram}>
    {() => (
      <>
        <path d="M20.69 2.86 3.86 10.43Q2.49 11.05 3.9 11.55L10.2 13.8l2.25 6.3q.5 1.41 1.12.04L21.14 3.31Q21.51 2.49 20.69 2.86z" />
        <path d="M10.2 13.8 20.52 3.48" />
      </>
    )}
  </Glyph>
);

/** SF "heart": full round lobes meeting in a soft point. */
const HeartGlyph = () => (
  <Glyph px={size.glyphLarge} stroke={size.glyphStrokeIos}>
    {() => (
      <path d="M12 20.5c-.3 0-.6-.1-.9-.3C6.4 17.1 2.75 13.4 2.75 9.1 2.75 6.2 4.9 4 7.6 4c1.9 0 3.4 1 4.4 2.6C13 5 14.5 4 16.4 4c2.7 0 4.85 2.2 4.85 5.1 0 4.3-3.65 8-8.35 11.1-.3.2-.6.3-.9.3z" />
    )}
  </Glyph>
);

/** SF "trash": a full-width lid with the handle tab on top, a plain can tapering slightly to
 *  rounded bottom corners. */
const TrashGlyph = () => (
  <Glyph px={size.glyphLarge} stroke={size.glyphStrokeIos}>
    {() => (
      <>
        <path d="M3.75 5.75h16.5" />
        <path d="M9.25 5.75V4.5c0-.7.55-1.25 1.25-1.25h3c.7 0 1.25.55 1.25 1.25v1.25" />
        <path d="m5.6 5.75.95 13.1a2.1 2.1 0 0 0 2.1 1.9h6.7a2.1 2.1 0 0 0 2.1-1.9l.95-13.1" />
      </>
    )}
  </Glyph>
);

/** Facebook's Like thumb: a rounded cuff and a hand with a raised thumb. */
const ThumbGlyph = () => (
  <Glyph px={size.glyphSmall} stroke={size.glyphStrokeFacebook}>
    {() => (
      <>
        <path d="M3.5 10h3v10.5h-3a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1z" />
        <path d="M6.5 10.5 10.2 3.9c.3-.5.8-.8 1.4-.8 1.2 0 2.1 1.05 1.9 2.2L13 9h5.6c1.5 0 2.6 1.4 2.2 2.9l-1.8 7c-.27 1-1.2 1.6-2.2 1.6H6.5" />
      </>
    )}
  </Glyph>
);

/** Meta AI's composer send: a bold up arrow with round caps on the blue disc; a short shaft
 *  under a wide, open head. */
const SendArrowGlyph = () => (
  <Glyph px={size.glyphSmall} stroke={size.glyphStrokeMetaAi}>
    {() => <path d="M12 18.25V6.25M6.75 11 12 5.75 17.25 11" />}
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
        <span style={{ color: "var(--ios-label)", fontWeight: emphasizedWeight }}>{name}</span>
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
          gridTemplateColumns: `repeat(4, ${TILE_W})`,
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
              height: TAP,
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
                    width: "var(--size-imsg-apps-button)",
                    height: "var(--size-imsg-apps-button)",
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
              height: TAP,
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
                height: TAP,
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
                    marginTop: "var(--hairline)",
                    border: 0,
                    paddingInline: "var(--space-12)",
                    background: "var(--fb-card)",
                    color: "var(--fb-secondary)",
                    ...textStyle("meta-15", true),
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
                height: TAP,
                borderRadius: "var(--radius-pill)",
                background: "var(--meta-ai-surface)",
              }}
            >
              {/* 44 pt hit box (HIG) around the 32 pt disc; the disc sits 6 pt in from the well's edge */}
              <Placeholder id="meta-ai:send" pressed={pressed}>
                <button type="button" aria-label="Send" style={{ ...glyphButton, color: ON_DARK }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "var(--size-meta-ai-send)",
                      height: "var(--size-meta-ai-send)",
                      borderRadius: "var(--radius-pill)",
                      background: "var(--meta-ai-blue)",
                    }}
                  >
                    <SendArrowGlyph />
                  </span>
                </button>
              </Placeholder>
            </div>
          </div>
        </Tile>

        {/* The host toast, shown statically (tap any control above for the live one) */}
        <Tile name="Toast" id="host apps" background="var(--ios-wallpaper-base)">
          <Wallpaper variant="stage" />
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <ConceptOnlyPill platform="ios" />
          </div>
        </Tile>
      </div>
    </main>
  );
}
