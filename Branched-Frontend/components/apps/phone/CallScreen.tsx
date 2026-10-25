"use client";

/**
 * components/apps/phone/CallScreen.tsx: the One UI in-call screen. Name, number and status on top
 * ("Calling…", then a running timer once the other side picks up), the caller's photo large, a grid
 * of round controls (speaker, mute, keypad, Bluetooth, add call, video call), and the red end-call
 * button. Ending shows "Call ended" for a beat, then returns to the app.
 *
 * Cover: one column. Inner (unfolded): caller on the left half, controls on the right half, so
 * nothing sits on the crease.
 */
import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { SAFE_BOTTOM } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import { Placeholder } from "@/components/Placeholder";
import { people, type PersonId } from "@/lib/mock/people";
import { Avatar, TOP, resetButton } from "../kit";
import { KEYPAD } from "./data";
import {
  AddCallGlyph,
  BluetoothGlyph,
  EndCallGlyph,
  KeypadGlyph,
  LetterAvatar,
  MuteGlyph,
  SpeakerGlyph,
  VideoGlyph,
} from "./glyphs";


export type CallRoute = { kind: "call"; who: PersonId | null; number: string; startedAt: number };

/** How long "Calling…" shows before the call connects (ms). */
const RING_MS = 2600;
const ENDED_MS = 1100;

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function CallScreen({ call, onEnd }: { call: CallRoute; onEnd: (connectedSeconds: number | null) => void }) {
  const { width, height, display } = usePane();
  const [now, setNow] = useState(call.startedAt);
  const [ended, setEnded] = useState<number | null>(null);
  const [toggles, setToggles] = useState({ speaker: false, mute: false, bluetooth: false });
  const [keypad, setKeypad] = useState(false);
  const [tones, setTones] = useState("");

  useEffect(() => {
    if (ended !== null) return;
    const tick = () => setNow(performance.now());
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [ended]);

  const elapsed = (ended ?? now) - call.startedAt;
  const connected = elapsed >= RING_MS;
  const seconds = connected ? Math.floor((elapsed - RING_MS) / 1000) : 0;
  const status = ended !== null ? "Call ended" : connected ? mmss(seconds) : "Calling…";

  const end = () => {
    if (ended !== null) return;
    setEnded(now);
    setTimeout(() => onEnd(connected ? seconds : null), ENDED_MS);
  };

  const p = call.who ? people[call.who] : null;
  const inner = display === "inner";
  const half = width / 2;

  const caller = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingInline: 24 }}>
      <div style={{ fontSize: 30, fontWeight: 400, color: "var(--ph-label)", lineHeight: 1.2 }}>{p ? p.name : call.number}</div>
      {p ? (
        <div style={{ marginTop: 6, fontSize: 15, color: "var(--ph-secondary)" }}>Mobile {call.number}</div>
      ) : (
        <div style={{ marginTop: 6, fontSize: 15, color: "var(--ph-secondary)" }}>Austin, TX</div>
      )}
      <div
        data-call-status=""
        style={{
          marginTop: 10,
          fontSize: 16,
          fontVariantNumeric: "tabular-nums",
          color: ended !== null ? "var(--ph-end)" : connected ? "var(--ph-label)" : "var(--ph-secondary)",
        }}
      >
        {status}
      </div>
      {tones ? (
        <div style={{ marginTop: 6, fontSize: 20, letterSpacing: 2, color: "var(--ph-label)" }}>{tones}</div>
      ) : null}
    </div>
  );

  const photo = p ? <Avatar src={p.avatar} size={inner ? 150 : 96} /> : <LetterAvatar size={inner ? 150 : 96} />;

  const controls = keypad ? (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", columnGap: 26, rowGap: 6, justifyContent: "center" }}>
      {KEYPAD.map((k) => (
        <button
          key={k.digit}
          type="button"
          data-action="call-dtmf"
          onClick={() => setTones((t) => (t + k.digit).slice(-14))}
          style={{ ...resetButton, height: 56, borderRadius: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
        >
          <span style={{ fontSize: 28, lineHeight: 1, color: "var(--ph-label)" }}>{k.digit}</span>
          <span style={{ fontSize: 10, letterSpacing: 1, height: 12, color: "var(--ph-secondary)" }}>{k.letters}</span>
        </button>
      ))}
    </div>
  ) : (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 84px)", columnGap: 18, rowGap: 12, justifyContent: "center" }}>
      <Control label="Speaker" on={toggles.speaker} onPress={() => setToggles((t) => ({ ...t, speaker: !t.speaker }))}>
        <SpeakerGlyph size={26} />
      </Control>
      <Control label="Mute" on={toggles.mute} onPress={() => setToggles((t) => ({ ...t, mute: !t.mute }))}>
        <MuteGlyph size={26} />
      </Control>
      <Control label="Keypad" onPress={() => setKeypad(true)}>
        <KeypadGlyph size={26} />
      </Control>
      <Control label="Bluetooth" on={toggles.bluetooth} onPress={() => setToggles((t) => ({ ...t, bluetooth: !t.bluetooth }))}>
        <BluetoothGlyph size={26} />
      </Control>
      <Control label="Add call" placeholder="phone:call-add">
        <AddCallGlyph size={26} />
      </Control>
      <Control label="Video call" placeholder="phone:call-video">
        <VideoGlyph size={26} />
      </Control>
    </div>
  );

  const endRow = (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
      <button
        type="button"
        aria-label="End call"
        data-action="call-end"
        onClick={end}
        style={{
          ...resetButton,
          width: 68,
          height: 68,
          borderRadius: 34,
          background: "var(--ph-end)",
          color: "var(--ph-call-ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: ended !== null ? 0.5 : 1,
        }}
      >
        <EndCallGlyph size={32} />
      </button>
      {keypad ? (
        <button
          type="button"
          data-action="call-keypad-hide"
          onClick={() => setKeypad(false)}
          style={{ ...resetButton, position: "absolute", right: "calc(50% - 150px)", fontSize: 16, fontWeight: 500, color: "var(--ph-label)" }}
        >
          Hide
        </button>
      ) : null}
    </div>
  );

  return (
    <motion.div
      data-call-screen=""
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        background: "linear-gradient(180deg, var(--ph-call-bg-top), var(--ph-call-bg-bottom) 70%)",
      }}
    >
      {inner ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: TOP,
              width: half,
              bottom: SAFE_BOTTOM,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 36,
            }}
          >
            {caller}
            {photo}
          </div>
          <div
            style={{
              position: "absolute",
              left: half,
              top: TOP,
              width: half,
              bottom: SAFE_BOTTOM + 28,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: keypad ? 18 : 44,
            }}
          >
            {controls}
            {endRow}
          </div>
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            paddingTop: TOP + 22,
            paddingBottom: SAFE_BOTTOM + 26,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height,
          }}
        >
          {caller}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, overflow: "hidden" }}>
            {keypad ? null : photo}
          </div>
          <div style={{ marginBottom: keypad ? 14 : 26 }}>{controls}</div>
          {endRow}
        </div>
      )}
    </motion.div>
  );
}

function Control({
  label,
  on,
  onPress,
  placeholder,
  children,
}: {
  label: string;
  on?: boolean;
  onPress?: () => void;
  placeholder?: string;
  children: ReactNode;
}) {
  const button = (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      data-action={onPress ? `call-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined}
      onClick={onPress}
      style={{ ...resetButton, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
    >
      <span
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: on ? "var(--ph-call-button-on)" : "var(--ph-call-button)",
          color: on ? "var(--ph-call-button-on-ink)" : "var(--ph-label)",
          transition: "background 0.15s ease-out",
        }}
      >
        {children}
      </span>
      <span style={{ fontSize: 13, color: "var(--ph-label)" }}>{label}</span>
    </button>
  );
  return placeholder ? <Placeholder id={placeholder}>{button}</Placeholder> : button;
}
