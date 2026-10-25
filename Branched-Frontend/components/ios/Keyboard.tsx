"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { KEYBOARD, SCREEN } from "@/components/lookalike/metrics";
import { Placeholder } from "@/components/Placeholder";
import { EMOJI, ROWS, autoShift, type KeyDef, type Layout } from "@/lib/keyboard/layout";
import { predictions as predictWords } from "@/lib/mock/predict";
import { useMessaging, type ThreadId } from "@/lib/store/messaging";
import { KeyPop } from "./KeyPop";

const UNIT = (SCREEN.width - 2 * KEYBOARD.sideInset - 9 * KEYBOARD.keyGap) / 10;
const keyWidth = (units = 1) => units * UNIT;

export type KeyboardProps = {
  threadId: ThreadId;
  /** the app's platform for placeholders ("whatsapp" | "messages" | "instagram") */
  platform: "whatsapp" | "messages" | "instagram";
};

/**
 * The iOS keyboard look-alike (Phase 2 CHROME SPECS + INTERACTIVE MESSAGING): light, QWERTY, 291 pt
 * tall at 402 wide including the predictive bar, key radius 5 with the 1 pt key shadow, the key-pop
 * callout, auto-shift that releases after one letter, 123 / #+= / emoji layouts, hold-to-delete that
 * repeats and accelerates, and the physical keyboard bridged in while it is up.
 */
export function Keyboard({ threadId, platform }: KeyboardProps) {
  const draft = useMessaging((s) => s.threads[threadId].draft);
  const [layout, setLayout] = useState<Layout>("letters");
  const [shiftOverride, setShiftOverride] = useState<boolean | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const shift = shiftOverride ?? autoShift(draft);
  const words = predictWords(threadId, draft);

  // reset the manual shift whenever the draft changes (auto-shift takes over again)
  const lastDraft = useRef(draft);
  useEffect(() => {
    if (lastDraft.current !== draft) {
      lastDraft.current = draft;
      setShiftOverride(null);
    }
  }, [draft]);

  const typeChar = useCallback(
    (ch: string) => {
      const s = useMessaging.getState();
      s.type(threadId, ch);
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

  // physical keyboard bridge (only while this keyboard is up)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        useMessaging.getState().backspace(threadId);
        setPressed("delete");
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

  const press = (k: KeyDef) => {
    switch (k.kind) {
      case "char": {
        const ch = layout === "letters" && shift ? k.value.toUpperCase() : k.value;
        typeChar(ch);
        if (shiftOverride) setShiftOverride(false);
        break;
      }
      case "shift":
        setShiftOverride(!shift);
        break;
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

  return (
    <div
      data-keyboard={threadId}
      style={{
        position: "relative",
        width: SCREEN.width,
        height: KEYBOARD.height,
        background: "var(--ios-kb-bg)",
        color: "var(--kb-label)",
        touchAction: "manipulation",
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
      {/* predictive bar */}
      <div style={{ display: "flex", height: KEYBOARD.predictive, alignItems: "center" }}>
        {words.map((w, i) => (
          <div key={`${w}-${i}`} style={{ flex: 1, display: "flex", alignItems: "center", height: "100%" }}>
            {i > 0 ? (
              <span
                aria-hidden="true"
                style={{ width: "var(--hairline)", height: KEYBOARD.predictive / 2, background: "var(--ios-separator)" }}
              />
            ) : null}
            <button
              type="button"
              data-action="predict"
              onClick={() => useMessaging.getState().predict(threadId, w)}
              style={{ ...resetButton, flex: 1, height: "100%", fontSize: KEYBOARD.labelSize + 1, color: "var(--kb-label)" }}
            >
              {w}
            </button>
          </div>
        ))}
      </div>

      {/* key rows */}
      {rows ? (
        <div style={{ paddingTop: KEYBOARD.topInset - KEYBOARD.rowGap / 2, paddingInline: KEYBOARD.sideInset }}>
          {rows.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: "flex",
                gap: KEYBOARD.keyGap,
                height: KEYBOARD.keyHeight,
                marginTop: ri === 0 ? KEYBOARD.rowGap / 2 : KEYBOARD.rowGap,
                paddingInline: layout === "letters" && ri === 1 ? (UNIT + KEYBOARD.keyGap) / 2 : 0,
              }}
            >
              {row.map((k, ki) => {
                const id = `${k.kind}:${k.value}`;
                const special = k.kind !== "char" && k.kind !== "space";
                const isEdgeSpecial = ri === 2 && (k.kind === "shift" || k.kind === "delete" || k.kind === "mode");
                const flexGap = isEdgeSpecial && ((ki === 0) || ki === row.length - 1);
                const isShiftOn = k.kind === "shift" && shift;
                const label =
                  k.kind === "char" && layout === "letters" && shift ? k.value.toUpperCase() : (k.label ?? k.value);
                const w = k.kind === "space" ? undefined : keyWidth(k.units);
                return (
                  <KeyCell key={`${ri}-${ki}`} spacerAfter={flexGap && ki === 0} spacerBefore={flexGap && ki > 0}>
                    <button
                      type="button"
                      data-action={k.kind === "char" ? "type-key" : `key-${k.kind}`}
                      data-key={k.value}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setPressed(id);
                        if (k.kind === "delete") startDelete();
                        else press(k);
                      }}
                      onPointerUp={() => {
                        if (k.kind === "delete") stopDelete();
                      }}
                      style={{
                        ...resetButton,
                        position: "relative",
                        width: w,
                        flex: k.kind === "space" ? 1 : undefined,
                        height: KEYBOARD.keyHeight,
                        borderRadius: KEYBOARD.radius,
                        background:
                          special && !isShiftOn
                            ? pressed === id
                              ? "var(--ios-kb-key)"
                              : "var(--ios-kb-key-special)"
                            : pressed === id && k.kind !== "char"
                              ? "var(--ios-kb-key-special)"
                              : "var(--ios-kb-key)",
                        boxShadow: "var(--shadow-key)",
                        fontSize: k.kind === "char" ? KEYBOARD.letterSize : KEYBOARD.labelSize,
                        lineHeight: 1,
                        color: "var(--kb-label)",
                      }}
                    >
                      {k.kind === "shift" ? (
                        <ShiftGlyph on={isShiftOn} />
                      ) : k.kind === "delete" ? (
                        <DeleteGlyph />
                      ) : (
                        <span style={{ transform: k.kind === "char" && layout === "letters" && !shift ? "translateY(-8%)" : undefined }}>
                          {label}
                        </span>
                      )}
                      {k.kind === "char" && pressed === id ? (
                        <KeyPop label={label} keyWidth={w ?? UNIT} keyHeight={KEYBOARD.keyHeight} />
                      ) : null}
                    </button>
                  </KeyCell>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <EmojiPage threadId={threadId} onAbc={() => setLayout("letters")} />
      )}

      {/* bottom strip: emoji (layout switch) and dictation (placeholder) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: SCREEN.width,
          height: KEYBOARD.strip,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingInline: KEYBOARD.sideInset * 7,
          color: "var(--ios-gray)",
        }}
      >
        <button
          type="button"
          data-action="key-emoji"
          aria-label="emoji"
          onClick={() => setLayout(layout === "emoji" ? "letters" : "emoji")}
          style={{ ...resetButton, width: KEYBOARD.strip, height: KEYBOARD.strip - KEYBOARD.topInset * 2, color: "var(--kb-label)" }}
        >
          <EmojiGlyph />
        </button>
        <Placeholder id={`${platform}:dictation`}>
          <button
            type="button"
            aria-label="dictation"
            style={{ ...resetButton, width: KEYBOARD.strip, height: KEYBOARD.strip - KEYBOARD.topInset * 2, color: "var(--kb-label)" }}
          >
            <DictationGlyph />
          </button>
        </Placeholder>
      </div>
    </div>
  );
}

function KeyCell({ children, spacerAfter, spacerBefore }: { children: ReactNode; spacerAfter?: boolean; spacerBefore?: boolean }) {
  return (
    <>
      {spacerBefore ? <span style={{ flex: 1, marginLeft: -KEYBOARD.keyGap }} /> : null}
      {children}
      {spacerAfter ? <span style={{ flex: 1, marginRight: -KEYBOARD.keyGap }} /> : null}
    </>
  );
}

function EmojiPage({ threadId, onAbc }: { threadId: ThreadId; onAbc: () => void }) {
  return (
    <div style={{ paddingInline: KEYBOARD.sideInset * 3, paddingTop: KEYBOARD.topInset }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          rowGap: KEYBOARD.keyGap,
          height: KEYBOARD.keyHeight * 4 + KEYBOARD.rowGap * 2 - KEYBOARD.keyHeight,
        }}
      >
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
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: KEYBOARD.rowGap }}>
        <button
          type="button"
          data-action="key-mode"
          onClick={onAbc}
          style={{
            ...resetButton,
            width: keyWidth(2.6),
            height: KEYBOARD.keyHeight,
            borderRadius: KEYBOARD.radius,
            background: "var(--ios-kb-key-special)",
            boxShadow: "var(--shadow-key)",
            fontSize: KEYBOARD.labelSize,
          }}
        >
          ABC
        </button>
        <button
          type="button"
          data-action="key-delete"
          onClick={() => useMessaging.getState().backspace(threadId)}
          style={{
            ...resetButton,
            width: keyWidth(1.3),
            height: KEYBOARD.keyHeight,
            borderRadius: KEYBOARD.radius,
            background: "var(--ios-kb-key-special)",
            boxShadow: "var(--shadow-key)",
          }}
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
};

function ShiftGlyph({ on }: { on: boolean }) {
  return (
    <svg width={KEYBOARD.glyph * 0.85} height={KEYBOARD.glyph * 0.85} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.6 2.9 12.9h5v6.4c0 .6.4 1 1 1h6.2c.6 0 1-.4 1-1v-6.4h5L12 3.6Z"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteGlyph() {
  return (
    <svg width={KEYBOARD.glyph} height={KEYBOARD.glyph * 0.8} viewBox="0 0 30 24" aria-hidden="true">
      <path
        d="M9.6 3.5h15.2c1.5 0 2.7 1.2 2.7 2.7v11.6c0 1.5-1.2 2.7-2.7 2.7H9.6c-.8 0-1.5-.3-2-.9L2.3 13.3c-.7-.8-.7-1.9 0-2.6L7.6 4.4c.5-.6 1.2-.9 2-.9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m13.3 8.3 7.4 7.4m0-7.4-7.4 7.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function EmojiGlyph() {
  return (
    <svg width={KEYBOARD.glyph} height={KEYBOARD.glyph} viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="10.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9.4" cy="10.6" r="1.3" fill="currentColor" />
      <circle cx="16.6" cy="10.6" r="1.3" fill="currentColor" />
      <path d="M8.2 15.2c1 1.9 2.8 3 4.8 3s3.8-1.1 4.8-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DictationGlyph() {
  return (
    <svg width={KEYBOARD.glyph} height={KEYBOARD.glyph} viewBox="0 0 26 26" aria-hidden="true">
      <rect x="9.2" y="2.6" width="7.6" height="13.4" rx="3.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.6 12.2c0 4.1 3.3 7.4 7.4 7.4s7.4-3.3 7.4-7.4M13 19.6v3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
