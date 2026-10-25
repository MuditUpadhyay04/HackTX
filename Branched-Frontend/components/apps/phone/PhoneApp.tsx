"use client";

/**
 * components/apps/phone/PhoneApp.tsx: the Samsung Phone app (One UI 9 dialer).
 *
 *   Keypad    a working dial pad: digits into the number field (US formatting), letters under the
 *             digits, a contact suggestion while dialing, the green call button, backspace (hold
 *             clears)
 *   Recents   the call log grouped by day: Mom's missed calls (lib/mock/threads.ts WA_CALLS) and the
 *             rest of the cast, red bent arrows for missed calls
 *   Contacts  everyone with a number, A-Z under letter headers, Riley's own profile card on top
 *
 * One UI 9 puts the tabs in a floating bar at the bottom and a large title in the empty upper area.
 * Cover: one column; a row tap calls. Inner (unfolded): list left, details (or the keypad) right.
 * Calling opens the in-call screen (CallScreen) over everything; ending returns here and adds the
 * call to Recents. All state lives in the app's route stack, so it survives a fold or unfold.
 */
import { AnimatePresence } from "framer-motion";
import { type CSSProperties, type ReactNode } from "react";
import { SAFE_BOTTOM } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import { Placeholder } from "@/components/Placeholder";
import type { AppScreenProps } from "@/lib/apps/registry";
import { mockNowISO } from "@/lib/mock/clock";
import { time12 } from "@/lib/mock/format";
import { people, type PersonId } from "@/lib/mock/people";
import { AppFrame, Avatar, Scroll, Split, TOP, Tap, ellipsis, resetButton, useStack } from "../kit";
import { useAppStore } from "@/lib/apps/store";
import { CallScreen, RING_MS, type CallRoute } from "./CallScreen";
import { IncomingCall, type IncomingRoute } from "./IncomingCall";
import {
  CONTACTS,
  KEYPAD,
  MY_NUMBER,
  NUMBERS,
  RECENTS,
  contactFor,
  dayLabel,
  formatDial,
  matchContact,
  missedToday,
  nameOf,
  type Recent,
} from "./data";
import {
  BackspaceGlyph,
  ContactsGlyph,
  DirectionGlyph,
  InfoGlyph,
  KeypadGlyph,
  LetterAvatar,
  MessageGlyph,
  MoreGlyph,
  PhoneGlyph,
  PlusGlyph,
  RecentsGlyph,
  SearchGlyph,
  VideoGlyph,
  VoicemailGlyph,
} from "./glyphs";

type Tab = "keypad" | "recents" | "contacts";
/** A person or number; `id` is the Recents row it was picked from (for the selection highlight). */
type Who = { who: PersonId | null; number: string; id?: string };
type HomeRoute = { kind: "home"; tab: Tab; dial: string; sel: Who | null; added: Recent[] };
type Route = HomeRoute | CallRoute | IncomingRoute;

const ROOT: HomeRoute = { kind: "home", tab: "recents", dial: "", sel: null, added: [] };

/** The floating tab bar (dp). */
const TABBAR = { height: 62, side: 14, gap: 8 };
const TABBAR_SPACE = TABBAR.height + TABBAR.gap + SAFE_BOTTOM;

/** Monotonic ms, the call timer's clock (the in-call screen reads the same one). */
const clock = () => performance.now();

export function PhoneApp({ display }: AppScreenProps) {
  const stack = useStack<Route>("phone", ROOT);
  const home = (stack.routes[0]?.kind === "home" ? stack.routes[0] : ROOT) as HomeRoute;
  const call = stack.routes.find((r): r is CallRoute => r.kind === "call");
  const incoming = stack.routes.find((r): r is IncomingRoute => r.kind === "incoming");
  const log = [...home.added, ...RECENTS];

  const update = (patch: Partial<HomeRoute>) => stack.reset([{ ...home, ...patch }, ...(call ? [call] : [])]);
  const startCall = (w: Who) => stack.reset([home, { kind: "call", who: w.who, number: w.number, startedAt: clock() }]);
  const endCall = (seconds: number | null) => {
    if (!call) return;
    const entry: Recent = {
      id: `call-${home.added.length + 1}`,
      who: call.who,
      number: call.number,
      direction: "outgoing",
      at: mockNowISO(),
      duration: seconds === null ? undefined : seconds < 60 ? `${seconds} sec` : `${Math.floor(seconds / 60)} min ${seconds % 60} sec`,
    };
    stack.reset([{ ...home, added: [entry, ...home.added], sel: { who: call.who, number: call.number, id: entry.id } }]);
  };

  const inner = display === "inner";
  const selected: Who = home.sel ?? (home.tab === "contacts" ? { who: CONTACTS[0], number: NUMBERS[CONTACTS[0]]! } : log[0]);

  const listFor = (tab: Tab, onPick: (w: Who) => void) =>
    tab === "contacts" ? (
      <ContactsList onPick={onPick} selected={inner ? selected : null} />
    ) : (
      <RecentsList log={log} onPick={onPick} selected={inner && home.tab === "recents" ? selected : null} />
    );

  const keypad = (
    <KeypadView
      dial={home.dial}
      setDial={(dial) => update({ dial })}
      onCall={() => {
        if (!home.dial) {
          // One UI: an empty number field fills in the last number you dialed
          const last = log.find((r) => r.direction === "outgoing");
          if (last) update({ dial: last.number.replace(/\D/g, "") });
          return;
        }
        const who = contactFor(home.dial);
        startCall({ who, number: who ? NUMBERS[who]! : formatDial(home.dial) });
      }}
    />
  );

  const tabBar = <TabBar tab={home.tab} missed={missedToday(log)} onTab={(tab) => update({ tab, sel: null })} />;

  return (
    <AppFrame display={display} background="var(--ph-bg)">
      {inner ? (
        <Split
          divider="var(--ph-divider)"
          list={
            <div style={{ position: "absolute", inset: 0, background: "var(--ph-bg)" }}>
              {listFor(home.tab === "keypad" ? "recents" : home.tab, (w) =>
                home.tab === "keypad" ? update({ dial: w.number.replace(/\D/g, "") }) : update({ sel: w }),
              )}
              {tabBar}
            </div>
          }
          detail={
            <div style={{ position: "absolute", inset: 0, background: "var(--ph-bg)" }}>
              {home.tab === "keypad" ? keypad : <Details who={selected} log={log} onCall={() => startCall(selected)} />}
            </div>
          }
        />
      ) : (
        <>
          {home.tab === "keypad" ? keypad : listFor(home.tab, startCall)}
          {tabBar}
        </>
      )}
      {/* the status bar's backing, so lists scroll under a solid band */}
      <div aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, right: 0, height: TOP, background: "var(--ph-bg)", zIndex: 5 }} />
      <AnimatePresence>
        {call ? <CallScreen key={`${call.number}-${call.startedAt}`} call={call} onEnd={endCall} /> : null}
      </AnimatePresence>
      {incoming && !call ? <IncomingCall call={incoming} onAccept={acceptIncoming} onDecline={() => stack.reset([home])} /> : null}
    </AppFrame>
  );
}

// ---------------------------------------------------------------------------
// Large title + the action row under it
// ---------------------------------------------------------------------------

function LargeTitle({ title, subtitle, subtitleColor }: { title: string; subtitle?: string; subtitleColor?: string }) {
  const { height } = usePane();
  const area = Math.round(height * 0.3);
  return (
    <>
      <div
        style={{
          height: area,
          paddingTop: TOP,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 400, color: "var(--ph-label)", letterSpacing: -0.2 }}>{title}</div>
        {subtitle ? <div style={{ marginTop: 6, fontSize: 14, color: subtitleColor ?? "var(--ph-secondary)" }}>{subtitle}</div> : null}
      </div>
      <div style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingInline: 10, color: "var(--ph-label)" }}>
        <IconButton id="phone:search" label="Search">
          <SearchGlyph />
        </IconButton>
        <IconButton id="phone:more" label="More options">
          <MoreGlyph />
        </IconButton>
      </div>
    </>
  );
}

function IconButton({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <Placeholder id={id}>
      <button
        type="button"
        aria-label={label}
        style={{ ...resetButton, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "inherit" }}
      >
        {children}
      </button>
    </Placeholder>
  );
}

const card: CSSProperties = {
  background: "var(--ph-card)",
  borderRadius: 26,
  marginInline: 12,
  overflow: "hidden",
};

const groupHeader: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "var(--ph-secondary)",
  padding: "14px 28px 8px",
};

// ---------------------------------------------------------------------------
// Recents
// ---------------------------------------------------------------------------

function RecentsList({ log, onPick, selected }: { log: Recent[]; onPick: (w: Who) => void; selected: Who | null }) {
  const missed = missedToday(log);
  const groups: { label: string; rows: Recent[] }[] = [];
  for (const r of log) {
    const label = dayLabel(r.at);
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.rows.push(r);
    else groups.push({ label, rows: [r] });
  }
  return (
    <Scroll bottom={TABBAR_SPACE + 12}>
      <LargeTitle
        title="Phone"
        subtitle={missed ? `${missed} missed call${missed === 1 ? "" : "s"} today` : "Recents"}
        subtitleColor={missed ? "var(--ph-missed)" : undefined}
      />
      {groups.map((g) => (
        <div key={g.label}>
          <div style={groupHeader}>{g.label}</div>
          <div style={card}>
            {g.rows.map((r, i) => (
              <RecentRow
                key={r.id}
                r={r}
                divider={i > 0}
                selected={!!selected && selected.id === r.id}
                onPress={() => onPick({ who: r.who, number: r.number, id: r.id })}
              />
            ))}
          </div>
        </div>
      ))}
    </Scroll>
  );
}

const directionLabel = (r: Recent) =>
  r.direction === "missed" ? "Missed call" : r.direction === "incoming" ? "Incoming call" : r.duration ? "Outgoing call" : "Canceled";

function RecentRow({ r, divider, selected, onPress }: { r: Recent; divider: boolean; selected: boolean; onPress: () => void }) {
  const p = r.who ? people[r.who] : null;
  return (
    <Tap
      label={`Call ${nameOf(r)}`}
      onPress={onPress}
      highlight="var(--ph-row-pressed)"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        height: 70,
        paddingInline: 16,
        background: selected ? "var(--ph-selected)" : undefined,
      }}
    >
      {p ? <Avatar src={p.avatar} size={44} /> : <LetterAvatar size={44} />}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxShadow: divider ? "0 -1px 0 var(--ph-divider)" : undefined,
          marginTop: divider ? 0 : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              ...ellipsis,
              flex: 1,
              fontSize: 17,
              color: r.direction === "missed" ? "var(--ph-missed)" : "var(--ph-label)",
            }}
          >
            {nameOf(r)}
            {r.count ? ` (${r.count})` : ""}
          </span>
          <span style={{ fontSize: 13, color: "var(--ph-secondary)", flexShrink: 0 }}>{time12(r.at)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, fontSize: 13.5, color: "var(--ph-secondary)" }}>
          <DirectionGlyph direction={r.direction} />
          <span style={ellipsis}>{directionLabel(r)}</span>
        </div>
      </div>
    </Tap>
  );
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

function ContactsList({ onPick, selected }: { onPick: (w: Who) => void; selected: Who | null }) {
  const groups: { letter: string; ids: PersonId[] }[] = [];
  for (const id of CONTACTS) {
    const letter = people[id].name[0].toUpperCase();
    const g = groups[groups.length - 1];
    if (g && g.letter === letter) g.ids.push(id);
    else groups.push({ letter, ids: [id] });
  }
  return (
    <Scroll bottom={TABBAR_SPACE + 12}>
      <LargeTitle title="Contacts" subtitle={`${CONTACTS.length} contacts with phone numbers`} />
      <div style={{ ...card, marginBottom: 6 }}>
        <Placeholder id="phone:my-profile" press="darken">
          <button
            type="button"
            style={{ ...resetButton, display: "flex", alignItems: "center", gap: 14, width: "100%", height: 76, paddingInline: 16 }}
          >
            <Avatar src={people.riley.avatar} size={52} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 17, color: "var(--ph-label)" }}>Riley</div>
              <div style={{ fontSize: 13.5, color: "var(--ph-secondary)", marginTop: 2 }}>My profile · {MY_NUMBER}</div>
            </div>
          </button>
        </Placeholder>
      </div>
      {groups.map((g) => (
        <div key={g.letter}>
          <div style={groupHeader}>{g.letter}</div>
          <div style={card}>
            {g.ids.map((id, i) => {
              const w = { who: id, number: NUMBERS[id]! };
              const isSel = !!selected && selected.who === id;
              return (
                <Tap
                  key={id}
                  label={`Contact ${people[id].name}`}
                  onPress={() => onPick(w)}
                  highlight="var(--ph-row-pressed)"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    width: "100%",
                    height: 62,
                    paddingInline: 16,
                    background: isSel ? "var(--ph-selected)" : undefined,
                  }}
                >
                  <Avatar src={people[id].avatar} size={40} />
                  <div
                    style={{
                      ...ellipsis,
                      flex: 1,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 17,
                      color: "var(--ph-label)",
                      boxShadow: i > 0 ? "0 -1px 0 var(--ph-divider)" : undefined,
                    }}
                  >
                    {people[id].name}
                  </div>
                </Tap>
              );
            })}
          </div>
        </div>
      ))}
    </Scroll>
  );
}

// ---------------------------------------------------------------------------
// Keypad
// ---------------------------------------------------------------------------

function KeypadView({ dial, setDial, onCall }: { dial: string; setDial: (d: string) => void; onCall: () => void }) {
  const { height, display } = usePane();
  const bottom = display === "inner" ? SAFE_BOTTOM + 20 : TABBAR_SPACE + 10;
  const match = matchContact(dial);
  const shown = formatDial(dial);
  const keyH = Math.min(64, Math.floor((height - TOP - bottom - 130 - 80) / 4));
  return (
    <div style={{ position: "absolute", inset: 0, paddingTop: TOP, paddingBottom: bottom, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingInline: 10, height: 44, alignItems: "center", color: "var(--ph-label)" }}>
        <IconButton id="phone:keypad-more" label="More options">
          <MoreGlyph />
        </IconButton>
      </div>
      {/* number field */}
      <div style={{ flex: 1, minHeight: 86, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingInline: 24 }}>
        <div
          data-dial=""
          style={{
            ...ellipsis,
            maxWidth: "100%",
            direction: "rtl",
            fontSize: shown.length > 14 ? 28 : 36,
            letterSpacing: 0.5,
            color: "var(--ph-label)",
            height: 44,
            lineHeight: "44px",
          }}
        >
          <bdi>{shown}</bdi>
        </div>
        <div style={{ height: 24, marginTop: 4, fontSize: 14 }}>
          {match ? (
            <span style={{ color: "var(--ph-secondary)" }}>
              <span style={{ color: "var(--ph-label)" }}>{people[match].name}</span> · {NUMBERS[match]}
            </span>
          ) : dial.length >= 3 ? (
            <Placeholder id="phone:add-contact">
              <button type="button" style={{ ...resetButton, display: "inline-flex", alignItems: "center", gap: 4, color: "var(--ph-accent)", fontWeight: 500 }}>
                <PlusGlyph size={16} /> Add to contacts
              </button>
            </Placeholder>
          ) : null}
        </div>
      </div>
      {/* the pad */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", maxWidth: 330, width: "100%", marginInline: "auto", paddingInline: 12 }}>
        {KEYPAD.map((k) => (
          <button
            key={k.digit}
            type="button"
            data-action="dial-key"
            data-key={k.digit}
            onClick={() => setDial((dial + k.digit).slice(0, 20))}
            style={{
              ...resetButton,
              height: keyH,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: keyH / 2,
            }}
          >
            <span style={{ fontSize: k.digit === "*" ? 38 : 34, lineHeight: k.digit === "*" ? "30px" : "36px", height: 36, color: "var(--ph-label)" }}>
              {k.digit}
            </span>
            <span style={{ height: 14, fontSize: 11, letterSpacing: 1.2, color: "var(--ph-secondary)", display: "flex", alignItems: "center" }}>
              {k.digit === "1" ? <VoicemailGlyph size={16} /> : k.letters}
            </span>
          </button>
        ))}
      </div>
      {/* call row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", maxWidth: 330, width: "100%", marginInline: "auto", paddingInline: 12, marginTop: 10, alignItems: "center", justifyItems: "center" }}>
        <Placeholder id="phone:keypad-video">
          <button type="button" aria-label="Video call" style={{ ...resetButton, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ph-label)" }}>
            <VideoGlyph size={26} />
          </button>
        </Placeholder>
        <button
          type="button"
          aria-label="Call"
          data-action="dial-call"
          onClick={onCall}
          style={{
            ...resetButton,
            width: 66,
            height: 66,
            borderRadius: 33,
            background: "var(--ph-call)",
            color: "var(--ph-call-ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PhoneGlyph size={30} filled />
        </button>
        {dial ? (
          <Tap
            label="Backspace"
            onPress={() => setDial(dial.slice(0, -1))}
            onLongPress={() => setDial("")}
            style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ph-label)" }}
          >
            <BackspaceGlyph size={26} />
          </Tap>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Details (inner display's right pane)
// ---------------------------------------------------------------------------

function Details({ who, log, onCall }: { who: Who; log: Recent[]; onCall: () => void }) {
  const p = who.who ? people[who.who] : null;
  const history = log.filter((r) => (who.who ? r.who === who.who : r.number === who.number));
  return (
    <Scroll bottom={SAFE_BOTTOM + 24} style={{ paddingTop: TOP + 34 }}>
      <div style={{ maxWidth: 420, marginInline: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {p ? <Avatar src={p.avatar} size={104} /> : <LetterAvatar size={104} />}
          <div style={{ marginTop: 14, fontSize: 28, color: "var(--ph-label)" }}>{p ? p.name : who.number}</div>
          <div style={{ marginTop: 4, fontSize: 14, color: "var(--ph-secondary)" }}>{p ? `Mobile ${who.number}` : "Austin, TX"}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 22 }}>
          <Action label="Call" primary onPress={onCall}>
            <PhoneGlyph size={24} filled />
          </Action>
          <Action label="Message" placeholder="phone:details-message">
            <MessageGlyph size={24} />
          </Action>
          <Action label="Video call" placeholder="phone:details-video">
            <VideoGlyph size={24} />
          </Action>
          <Action label="Details" placeholder="phone:details-info">
            <InfoGlyph size={24} />
          </Action>
        </div>
        <div style={{ ...groupHeader, paddingTop: 22 }}>Phone number</div>
        <div style={{ ...card, display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, color: "var(--ph-label)" }}>{who.number}</div>
            <div style={{ fontSize: 13.5, color: "var(--ph-secondary)", marginTop: 2 }}>Mobile</div>
          </div>
          <Tap label={`Call ${who.number}`} onPress={onCall} style={{ color: "var(--ph-call)", display: "flex", padding: 6 }}>
            <PhoneGlyph size={24} />
          </Tap>
        </div>
        {history.length ? (
          <>
            <div style={groupHeader}>Call history</div>
            <div style={card}>
              {history.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 18px",
                    boxShadow: i > 0 ? "inset 0 1px 0 var(--ph-divider)" : undefined,
                  }}
                >
                  <DirectionGlyph direction={r.direction} size={16} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, color: r.direction === "missed" ? "var(--ph-missed)" : "var(--ph-label)" }}>
                      {directionLabel(r)}
                      {r.count ? ` (${r.count})` : ""}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ph-secondary)", marginTop: 2 }}>
                      {dayLabel(r.at)}, {time12(r.at)}
                    </div>
                  </div>
                  {r.duration ? <span style={{ fontSize: 13, color: "var(--ph-secondary)" }}>{r.duration}</span> : null}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </Scroll>
  );
}

function Action({
  label,
  primary,
  onPress,
  placeholder,
  children,
}: {
  label: string;
  primary?: boolean;
  onPress?: () => void;
  placeholder?: string;
  children: ReactNode;
}) {
  const button = (
    <button
      type="button"
      aria-label={label}
      data-action={onPress ? `details-${label.toLowerCase()}` : undefined}
      onClick={onPress}
      style={{ ...resetButton, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
    >
      <span
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: primary ? "var(--ph-call)" : "var(--ph-card)",
          color: primary ? "var(--ph-call-ink)" : "var(--ph-label)",
        }}
      >
        {children}
      </span>
      <span style={{ fontSize: 12.5, color: "var(--ph-label)" }}>{label}</span>
    </button>
  );
  return placeholder ? <Placeholder id={placeholder}>{button}</Placeholder> : button;
}

// ---------------------------------------------------------------------------
// Bottom tabs (One UI 9: a floating bar)
// ---------------------------------------------------------------------------

function TabBar({ tab, missed, onTab }: { tab: Tab; missed: number; onTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; glyph: (on: boolean) => ReactNode }[] = [
    { id: "keypad", label: "Keypad", glyph: () => <KeypadGlyph size={22} /> },
    { id: "recents", label: "Recents", glyph: (on) => <RecentsGlyph size={22} filled={on} /> },
    { id: "contacts", label: "Contacts", glyph: (on) => <ContactsGlyph size={22} filled={on} /> },
  ];
  return (
    <div
      role="tablist"
      style={{
        position: "absolute",
        left: TABBAR.side,
        right: TABBAR.side,
        bottom: SAFE_BOTTOM + TABBAR.gap,
        height: TABBAR.height,
        borderRadius: TABBAR.height / 2,
        background: "var(--ph-tab-bg)",
        boxShadow: "0 2px 14px var(--ph-tab-shadow)",
        display: "flex",
        padding: 5,
        zIndex: 10,
      }}
    >
      {items.map((it) => {
        const on = it.id === tab;
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={on}
            data-action={`phone-tab-${it.id}`}
            onClick={() => onTab(it.id)}
            style={{
              ...resetButton,
              position: "relative",
              flex: 1,
              borderRadius: (TABBAR.height - 10) / 2,
              background: on ? "var(--ph-tab-active)" : "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              color: "var(--ph-label)",
              transition: "background 0.18s ease-out",
            }}
          >
            {it.glyph(on)}
            <span style={{ fontSize: 12, fontWeight: on ? 600 : 400 }}>{it.label}</span>
            {it.id === "recents" && missed > 0 && !on ? (
              <span
                style={{
                  position: "absolute",
                  top: 5,
                  left: "calc(50% + 6px)",
                  minWidth: 17,
                  height: 17,
                  paddingInline: 4,
                  borderRadius: 9,
                  background: "var(--ph-missed)",
                  color: "var(--ph-call-ink)",
                  fontSize: 11,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {missed}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Answers the ringing incoming call (the green button, or the scene director). `elapsed` seconds
 * start the timer part-way (the film's 35:40: they have been talking a while).
 */
export function acceptIncoming() {
  const st = useAppStore.getState();
  const routes = (st.routes.phone as Route[] | undefined) ?? [ROOT];
  const ring = routes.find((r): r is IncomingRoute => r.kind === "incoming");
  if (!ring) return;
  const home = (routes[0]?.kind === "home" ? routes[0] : ROOT) as HomeRoute;
  const startedAt = clock() - RING_MS - (ring.elapsed ?? 0) * 1000;
  st.setRoutes("phone", [home, { kind: "call", who: ring.who, number: ring.number, startedAt }]);
}
