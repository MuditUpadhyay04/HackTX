"use client";

import { useCallback, useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { KEYBOARD } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import { Placeholder } from "@/components/Placeholder";
import { EMOJI, ROWS, autoShift, type KeyDef, type Layout } from "@/lib/keyboard/layout";
import { predictions as predictWords } from "@/lib/mock/predict";
import { useMessaging, type ThreadId } from "@/lib/store/messaging";
import { KeyPop } from "./KeyPop";

/** Key unit width for a keyboard `width` dp wide (ten letter keys and nine gaps per row). */
const unitFor = (width: number) => (width - 2 * KEYBOARD.sideInset - 9 * KEYBOARD.keyGap) / 10;

/** Two shift taps closer than this lock caps (Samsung Keyboard: double-tap shift). */
const CAPS_LOCK_MS = 350;

export type KeyboardProps = {
  threadId: ThreadId;
  /** the app's platform for placeholders ("whatsapp" | "messages" | "instagram") */
  platform: "whatsapp" | "messages" | "instagram";
};

/**
 * The Samsung Keyboard look-alike (One UI 9, light theme): a toolbar row on top (emoji, stickers,
 * GIF, voice input, clipboard, settings, more) that three suggestions replace once you start typing,
 * QWERTY with white rounded keys on a light gray panel, long-press digit hints on the top row,
 * shift (double tap locks caps), the "!#1" symbol pages, an emoji page, hold-to-delete that repeats
 * and accelerates, and the physical keyboard bridged in while it is up.
 */
export function Keyboard({ threadId, platform }: KeyboardProps) {
  const { width } = usePane();
  const unit = unitFor(width);
  const draft = useMessaging((s) => s.threads[threadId].draft);
  const [layout, setLayout] = useState<Layout>("letters");
  const [shiftOverride, setShiftOverride] = useState<boolean | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);
  const [toolbarPinned, setToolbarPinned] = useState(false);
  const lastShiftTap = useRef(0);
  const shift = capsLock || (shiftOverride ?? autoShift(draft));
  const words = predictWords(threadId, draft);
  const showSuggestions = draft.length > 0 && !toolbarPinned && layout !== "emoji";

  // reset the manual shift whenever the draft changes (auto-shift takes over again)
  const lastDraft = useRef(draft);
  useEffect(() => {
    if (lastDraft.current !== draft) {
      lastDraft.current = draft;
      setShiftOverride(null);
      setToolbarPinned(false);
    }
  }, [draft]);

  const typeChar = useCallback(
    (ch: string) => {
      useMessaging.getState().type(threadId, ch);
    },
    [threadId],
  );

  // hold-to-delete: once, then repeat after 400 ms, accelerating
  const repeat = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopDelete = useCallback(() => {
    if (repeat.current) clearTimeout(repeat.current);
    repeat.current = null;
  }, []);
  const startDelete = useCallback(() => {
    const r = KEYBOARD.deleteRepeat;
    useMessaging.getState().backspace(threadId);
    let interval: number = r.start;
    const tick = () => {
      useMessaging.getState().backspace(threadId);
      interval = Math.max(r.min, interval * r.accel);
      repeat.current = setTimeout(tick, interval);
    };
    repeat.current = setTimeout(tick, r.delay);
  }, [threadId]);
  useEffect(() => stopDelete, [stopDelete]);

  // physical keyboard bridge (only while this keyboard is up). The phone draws each screen more than
  // once (inert copies on the moving halves, the cover and inner hosts), so only the copy that is
  // visible and not inert handles keys; otherwise every copy would type the same letter.
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const live = () => {
      const el = root.current;
      return !!el && !el.closest("[inert]") && getComputedStyle(el).visibility === "visible" && el.getClientRects().length > 0;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!live()) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        useMessaging.getState().backspace(threadId);
        setPressed("delete:delete");
      } else if (e.key === "Enter") {
        e.preventDefault();
        typeChar("\n");
      } else if (e.key.length === 1 || /\p{Extended_Pictographic}/u.test(e.key)) {
        e.preventDefault();
        typeChar(e.key);
        setPressed(`char:${e.key.toLowerCase()}`);
      }
    };
    const onUp = () => setPressed(null);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [threadId, typeChar]);

  /** `at`: the pointer event's timeStamp (ms), for the double-tap caps lock. */
  const press = (k: KeyDef, at: number) => {
    switch (k.kind) {
      case "char": {
        const ch = layout === "letters" && shift ? k.value.toUpperCase() : k.value;
        typeChar(ch);
        if (shiftOverride) setShiftOverride(false);
        break;
      }
      case "shift": {
        const now = at;
        if (capsLock) {
          setCapsLock(false);
          setShiftOverride(false);
        } else if (shift && now - lastShiftTap.current < CAPS_LOCK_MS) {
          setCapsLock(true);
        } else {
          setShiftOverride(!shift);
        }
        lastShiftTap.current = now;
        break;
      }
      case "mode":
        setLayout(k.value as Layout);
        break;
      case "space":
        typeChar(" ");
        if (layout !== "letters") setLayout("letters");
        break;
      case "return":
        typeChar("\n");
        break;
      default:
        break;
    }
  };

  const rows = layout === "emoji" ? null : ROWS[layout];
  const toggleEmoji = () => setLayout(layout === "emoji" ? "letters" : "emoji");

  return (
    <div
      ref={root}
      data-keyboard={threadId}
      style={{
        position: "relative",
        width,
        height: KEYBOARD.height,
        background: "var(--ui-kb-bg)",
        color: "var(--kb-label)",
        fontFamily: "var(--font-system)",
        touchAction: "manipulation",
        userSelect: "none",
      }}
      onPointerUp={() => {
        setPressed(null);
        stopDelete();
      }}
      onPointerLeave={() => {
        setPressed(null);
        stopDelete();
      }}
    >
      {/* toolbar, or the suggestion strip while typing */}
      <div style={{ display: "flex", height: KEYBOARD.toolbar, alignItems: "center", paddingInline: KEYBOARD.sideInset + 2 }}>
        {showSuggestions ? (
          <>
            <button
              type="button"
              data-action="key-toolbar"
              aria-label="show toolbar"
              onClick={() => setToolbarPinned(true)}
              style={{ ...resetButton, width: 34, height: "100%", color: "var(--kb-icon)" }}
            >
              <ChevronGlyph />
            </button>
            {words.map((w, i) => (
              <div key={`${w}-${i}`} style={{ flex: 1, display: "flex", alignItems: "center", height: "100%", minWidth: 0 }}>
                {i > 0 ? (
                  <span aria-hidden="true" style={{ width: 1, height: KEYBOARD.toolbar * 0.42, background: "var(--kb-divider)" }} />
                ) : null}
                <button
                  type="button"
                  data-action="predict"
                  onClick={() => useMessaging.getState().predict(threadId, w)}
                  style={{
                    ...resetButton,
                    flex: 1,
                    minWidth: 0,
                    height: "100%",
                    fontSize: KEYBOARD.suggestionSize,
                    color: "var(--kb-label)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {w}
                </button>
              </div>
            ))}
            <span style={{ width: 34 }} />
          </>
        ) : (
          <>
            <ToolButton label="emoji" action="key-emoji" active={layout === "emoji"} onClick={toggleEmoji}>
              <EmojiGlyph />
            </ToolButton>
            <Placeholder id={`${platform}:keyboard-stickers`}>
              <ToolButton label="stickers">
                <StickerGlyph />
              </ToolButton>
            </Placeholder>
            <Placeholder id={`${platform}:keyboard-gif`}>
              <ToolButton label="GIF">
                <GifGlyph />
              </ToolButton>
            </Placeholder>
            <Placeholder id={`${platform}:dictation`}>
              <ToolButton label="voice input">
                <MicGlyph />
              </ToolButton>
            </Placeholder>
            <Placeholder id={`${platform}:keyboard-clipboard`}>
              <ToolButton label="clipboard">
                <ClipboardGlyph />
              </ToolButton>
            </Placeholder>
            <Placeholder id={`${platform}:keyboard-settings`}>
              <ToolButton label="keyboard settings">
                <GearGlyph />
              </ToolButton>
            </Placeholder>
            <span style={{ flex: 1 }} />
            <Placeholder id={`${platform}:keyboard-more`}>
              <ToolButton label="more">
                <MoreGlyph />
              </ToolButton>
            </Placeholder>
          </>
        )}
      </div>

      {/* key rows */}
      {rows ? (
        <div style={{ paddingTop: KEYBOARD.topInset, paddingInline: KEYBOARD.sideInset }}>
          {rows.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: "flex",
                gap: KEYBOARD.keyGap,
                height: KEYBOARD.keyHeight,
                marginTop: ri === 0 ? 0 : KEYBOARD.rowGap,
                paddingInline: layout === "letters" && ri === 1 ? (unit + KEYBOARD.keyGap) / 2 : 0,
              }}
            >
              {row.map((k, ki) => {
                const id = `${k.kind}:${k.value}`;
                const isPressed = pressed === id;
                const special = k.kind !== "char" && k.kind !== "space";
                const isReturn = k.kind === "return";
                const isShiftOn = k.kind === "shift" && shift;
                // the third row's edge keys (shift / page / delete) take up the slack
                const stretch = k.kind === "space" || (ri === 2 && (ki === 0 || ki === row.length - 1));
                const label =
                  k.kind === "char" && layout === "letters" && shift ? k.value.toUpperCase() : (k.label ?? k.value);
                const w = (k.units ?? 1) * unit;
                const bg = isReturn
                  ? isPressed
                    ? "var(--kb-key-special-pressed)"
                    : "var(--kb-return-bg)"
                  : special
                    ? isPressed
                      ? "var(--kb-key-special-pressed)"
                      : "var(--ui-kb-key-special)"
                    : isPressed
                      ? "var(--kb-key-pressed)"
                      : "var(--ui-kb-key)";
                return (
                  <button
                    key={`${ri}-${ki}`}
                    type="button"
                    data-action={k.kind === "char" ? "type-key" : `key-${k.kind}`}
                    data-key={k.value}
                    aria-label={k.kind === "char" ? undefined : k.kind === "space" ? "space" : k.kind}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setPressed(id);
                      if (k.kind === "delete") startDelete();
                      else press(k, e.timeStamp);
                    }}
                    onPointerUp={() => {
                      if (k.kind === "delete") stopDelete();
                    }}
                    style={{
                      ...resetButton,
                      position: "relative",
                      width: stretch ? undefined : w,
                      minWidth: stretch ? w : undefined,
                      flex: stretch ? 1 : undefined,
                      height: KEYBOARD.keyHeight,
                      borderRadius: KEYBOARD.radius,
                      background: bg,
                      fontSize: k.kind === "char" ? KEYBOARD.letterSize : KEYBOARD.labelSize,
                      fontWeight: k.kind === "mode" ? 500 : 400,
                      lineHeight: 1,
                      color: isReturn ? "var(--kb-return-label)" : "var(--kb-label)",
                    }}
                  >
                    {k.kind === "shift" ? (
                      <ShiftGlyph on={isShiftOn} locked={capsLock} />
                    ) : k.kind === "delete" ? (
                      <DeleteGlyph />
                    ) : k.kind === "return" ? (
                      <ReturnGlyph />
                    ) : k.kind === "space" ? (
                      <span style={{ fontSize: KEYBOARD.labelSize - 2, color: "var(--kb-hint)" }}>{label}</span>
                    ) : (
                      <span>{label}</span>
                    )}
                    {k.hint && layout === "letters" ? (
                      <span
                        aria-hidden="true"
                        style={{ position: "absolute", top: 3, right: 5, fontSize: KEYBOARD.hintSize, lineHeight: 1, color: "var(--kb-hint)" }}
                      >
                        {k.hint}
                      </span>
                    ) : null}
                    {k.kind === "char" && isPressed ? <KeyPop label={label} keyWidth={w} keyHeight={KEYBOARD.keyHeight} /> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <EmojiPage threadId={threadId} unit={unit} onAbc={() => setLayout("letters")} />
      )}
    </div>
  );
}

function ToolButton({
  children,
  label,
  action,
  active,
  onClick,
  style,
  ...rest
}: {
  children: ReactNode;
  label: string;
  action?: string;
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "style">) {
  // Placeholder clones this with its own handlers and press style, so pass everything through
  return (
    <button
      type="button"
      aria-label={label}
      data-action={action}
      {...rest}
      onClick={onClick}
      style={{
        ...resetButton,
        width: 42,
        height: KEYBOARD.toolbar,
        color: active ? "var(--kb-accent)" : "var(--kb-icon)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function EmojiPage({ threadId, unit, onAbc }: { threadId: ThreadId; unit: number; onAbc: () => void }) {
  const gridHeight = KEYBOARD.keyHeight * 3 + KEYBOARD.rowGap * 2;
  const keyStyle: CSSProperties = {
    ...resetButton,
    height: KEYBOARD.keyHeight,
    borderRadius: KEYBOARD.radius,
    background: "var(--ui-kb-key-special)",
    fontSize: KEYBOARD.labelSize,
    fontWeight: 500,
  };
  return (
    <div style={{ paddingInline: KEYBOARD.sideInset, paddingTop: KEYBOARD.topInset }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gridAutoRows: "1fr", height: gridHeight }}>
        {EMOJI.map((e) => (
          <button
            key={e}
            type="button"
            data-action="type-emoji"
            onClick={() => useMessaging.getState().type(threadId, e)}
            style={{ ...resetButton, fontSize: KEYBOARD.letterSize + 6 }}
          >
            {e}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: KEYBOARD.keyGap, marginTop: KEYBOARD.rowGap }}>
        <button type="button" data-action="key-mode" onClick={onAbc} style={{ ...keyStyle, width: unit * 2 }}>
          ABC
        </button>
        <button
          type="button"
          data-action="key-space"
          onClick={() => useMessaging.getState().type(threadId, " ")}
          style={{ ...keyStyle, flex: 1, background: "var(--ui-kb-key)", fontWeight: 400 }}
        >
          <span style={{ fontSize: KEYBOARD.labelSize - 2, color: "var(--kb-hint)" }}>English (US)</span>
        </button>
        <button
          type="button"
          data-action="key-delete"
          aria-label="delete"
          onClick={() => useMessaging.getState().backspace(threadId)}
          style={{ ...keyStyle, width: unit * 2 }}
        >
          <DeleteGlyph />
        </button>
      </div>
    </div>
  );
}

const resetButton: CSSProperties = {
  appearance: "none",
  border: 0,
  margin: 0,
  padding: 0,
  background: "none",
  font: "inherit",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  outline: "none",
  touchAction: "manipulation",
  WebkitTapHighlightColor: "transparent",
};

// ---------------------------------------------------------------------------
// Glyphs (One UI line icons, 1.6 dp strokes)
// ---------------------------------------------------------------------------

const G = KEYBOARD.glyph;
const T = KEYBOARD.toolbarGlyph;
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function ShiftGlyph({ on, locked }: { on: boolean; locked: boolean }) {
  return (
    <svg width={G} height={G} viewBox="0 0 24 24" aria-hidden="true" style={{ color: on ? "var(--kb-accent)" : "currentColor" }}>
      <path d="M12 4 4.5 11.6h4.3v5.2h6.4v-5.2h4.3L12 4Z" {...line} fill={on ? "currentColor" : "none"} />
      {locked ? <path d="M8.8 20h6.4" {...line} /> : null}
    </svg>
  );
}

function DeleteGlyph() {
  return (
    <svg width={G + 2} height={G} viewBox="0 0 26 24" aria-hidden="true">
      <path d="M8.6 5.5h13.2c1 0 1.7.8 1.7 1.7v9.6c0 1-.8 1.7-1.7 1.7H8.6L3 12l5.6-6.5Z" {...line} />
      <path d="m12.2 9.2 5.6 5.6m0-5.6-5.6 5.6" {...line} />
    </svg>
  );
}

function ReturnGlyph() {
  return (
    <svg width={G} height={G} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 5.5v6.2c0 1-.8 1.8-1.8 1.8H5.5" {...line} />
      <path d="m9.2 9.6-3.9 3.9 3.9 3.9" {...line} />
    </svg>
  );
}

function ChevronGlyph() {
  return (
    <svg width={T} height={T} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m14.5 6-6 6 6 6" {...line} />
    </svg>
  );
}

function EmojiGlyph() {
  return (
    <svg width={T} height={T} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.8" {...line} />
      <circle cx="9" cy="10" r="1.1" fill="currentColor" />
      <circle cx="15" cy="10" r="1.1" fill="currentColor" />
      <path d="M8.3 14c.9 1.5 2.2 2.3 3.7 2.3s2.8-.8 3.7-2.3" {...line} />
    </svg>
  );
}

function StickerGlyph() {
  return (
    <svg width={T} height={T} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 13.5V6.8c0-1.8-1.5-3.3-3.3-3.3H6.8c-1.8 0-3.3 1.5-3.3 3.3v10.4c0 1.8 1.5 3.3 3.3 3.3h6.7l7-7Z" {...line} />
      <path d="M13.5 20.5v-3.7c0-1.8 1.5-3.3 3.3-3.3h3.7" {...line} />
      <circle cx="9" cy="9.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="9.5" r="1" fill="currentColor" />
    </svg>
  );
}

function GifGlyph() {
  return (
    <svg width={T + 2} height={T} viewBox="0 0 26 24" aria-hidden="true">
      <rect x="2.5" y="5" width="21" height="14" rx="3.5" {...line} />
      <text x="13" y="15.6" textAnchor="middle" fontSize="8.4" fontWeight="700" fontFamily="var(--font-system)" fill="currentColor">
        GIF
      </text>
    </svg>
  );
}

function MicGlyph() {
  return (
    <svg width={T} height={T} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3.2" width="6" height="11" rx="3" {...line} />
      <path d="M5.8 11.2c0 3.4 2.8 6.2 6.2 6.2s6.2-2.8 6.2-6.2M12 17.4v3.4" {...line} />
    </svg>
  );
}

function ClipboardGlyph() {
  return (
    <svg width={T} height={T} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 5H7c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-1.5" {...line} />
      <rect x="8.5" y="3" width="7" height="4" rx="1.4" {...line} />
      <path d="M8.8 11.5h6.4M8.8 15h4.4" {...line} />
    </svg>
  );
}

function GearGlyph() {
  return (
    <svg width={T} height={T} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="2.8" {...line} />
      <path
        d="M12 3.2l1.6 1.9 2.5-.4.9 2.4 2.4.9-.4 2.5 1.9 1.6-1.9 1.6.4 2.5-2.4.9-.9 2.4-2.5-.4L12 20.8l-1.6-1.9-2.5.4-.9-2.4-2.4-.9.4-2.5L3.2 12l1.9-1.6-.4-2.5 2.4-.9.9-2.4 2.5.4L12 3.2Z"
        {...line}
      />
    </svg>
  );
}

function MoreGlyph() {
  return (
    <svg width={T} height={T} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5.5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
