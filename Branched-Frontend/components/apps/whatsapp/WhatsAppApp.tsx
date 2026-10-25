"use client";

/**
 * WhatsApp (iOS) look-alike that opens on the phone: the five-tab app (Updates, Calls, Communities,
 * Chats, Settings) with the chat list, Mom's thread (components/lookalike/whatsapp/WhatsAppThread),
 * the Calls tab and the voice/video call screen. Folded: one column with an iOS push/pop. Unfolded:
 * the iPad-style split (list left, chat right). Data: lib/mock/threads.ts via lib/store/messaging.
 */
import { useEffect, useState, type ReactNode } from "react";
import { WA } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import { WhatsAppThread } from "@/components/lookalike/whatsapp/WhatsAppThread";
import {
  CallArrow,
  CallsTabGlyph,
  CameraGlyph,
  ChatsTabGlyph,
  CommunitiesTabGlyph,
  InfoGlyph,
  LockGlyph,
  MoreGlyph,
  PhoneGlyph,
  PhotoGlyph,
  SearchGlyph,
  SettingsTabGlyph,
  Ticks,
  UpdatesTabGlyph,
  VideoGlyph,
  VoiceNoteGlyph,
} from "@/components/lookalike/whatsapp/glyphs";
import type { AppScreenProps } from "@/lib/apps/registry";
import { useMockClock } from "@/lib/mock/clock";
import { waListTime } from "@/lib/mock/format";
import { person, type PersonId } from "@/lib/mock/people";
import { WA_CALLS, type Message } from "@/lib/mock/threads";
import { useMessaging, type ThreadId } from "@/lib/store/messaging";
import { AppFrame, Avatar, Scroll, Split, StackView, TOP, Tap, ellipsis, useStack, type Stack } from "../kit";

type Tab = "updates" | "calls" | "communities" | "chats" | "settings";
type Route = { kind: "home"; tab: Tab } | { kind: "chat"; id: ThreadId } | { kind: "call"; with: PersonId; video: boolean };

/** Chat list order (Phase 2 ROUTES: Mom first, then Fam, Roommates, Marfa Trip). */
const CHATS: ThreadId[] = ["mom", "fam", "roommates", "marfa"];

export function WhatsAppApp({ display }: AppScreenProps) {
  // shared with the other display's copy, so a fold/unfold keeps the open chat, call and tab
  const stack = useStack<Route>("whatsapp", { kind: "home", tab: "chats" });
  const root = stack.routes[0] as Extract<Route, { kind: "home" }>;
  const tab = root.tab;
  const setTab = (t: Tab) => stack.reset([{ kind: "home", tab: t }, ...stack.routes.slice(1)]);
  const chat = stack.routes.find((r): r is Extract<Route, { kind: "chat" }> => r.kind === "chat");
  const selected = chat?.id ?? null;
  const call = stack.top.kind === "call" ? stack.top : null;
  // the split view always shows a chat (Mom's first); record it so folding lands in that chat
  const { reset, routes } = stack;
  useEffect(() => {
    if (display === "inner" && !selected) reset([...routes.slice(0, 1), { kind: "chat", id: "mom" }, ...routes.slice(1)]);
  }, [display, selected, reset, routes]);
  useEffect(() => {
    if (selected) useMessaging.getState().markRead(selected);
  }, [selected]);

  const open = (id: ThreadId) => {
    useMessaging.getState().markRead(id);
    if (display === "inner") stack.reset([root, { kind: "chat", id }]);
    else stack.push({ kind: "chat", id });
  };
  const startCall = (withId: PersonId, video: boolean) => stack.push({ kind: "call", with: withId, video });

  const home = <Home tab={tab} setTab={setTab} onOpen={open} onCall={startCall} selected={display === "inner" ? selected : null} />;

  if (display === "inner") {
    return (
      <AppFrame display={display} tone={call ? "light" : "dark"} background="var(--ios-bg)">
        <Split
          list={home}
          detail={
            selected ? (
              <WhatsAppThread key={selected} threadId={selected} seen={selected === "mom"} hideBack onCall={(k) => startCall(selectedContact(selected), k === "video")} />
            ) : (
              <EmptyDetail />
            )
          }
        />
        {call ? <CallScreen with={call.with} video={call.video} onEnd={stack.pop} /> : null}
      </AppFrame>
    );
  }

  return (
    <AppFrame display={display} tone={stack.top.kind === "call" ? "light" : "dark"} background="var(--ios-bg)">
      <StackView
        stack={stack}
        keyOf={(r, i) => `${r.kind}-${i}`}
        render={(r) => routeView(r, stack, home, startCall)}
      />
    </AppFrame>
  );
}

/** WhatsApp's back count: how many OTHER chats are unread. */
function otherUnread(id: ThreadId): number {
  const t = useMessaging.getState().threads;
  return CHATS.filter((c) => c !== id && t[c].unread > 0).length;
}

function selectedContact(id: ThreadId): PersonId {
  return useMessaging.getState().threads[id].contactId;
}

function routeView(r: Route, stack: Stack<Route>, home: ReactNode, startCall: (p: PersonId, video: boolean) => void): ReactNode {
  if (r.kind === "home") return home;
  if (r.kind === "chat")
    return (
      <WhatsAppThread
        threadId={r.id}
        seen={r.id === "mom"}
        backCount={otherUnread(r.id)}
        onBack={stack.pop}
        onCall={(k) => startCall(selectedContact(r.id), k === "video")}
      />
    );
  return <CallScreen with={r.with} video={r.video} onEnd={stack.pop} />;
}

// ---------------------------------------------------------------------------
// Home: the tab bar and its five tabs
// ---------------------------------------------------------------------------

function Home({
  tab,
  setTab,
  onOpen,
  onCall,
  selected,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onOpen: (id: ThreadId) => void;
  onCall: (p: PersonId, video: boolean) => void;
  selected: ThreadId | null;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--ios-bg)" }}>
      {tab === "chats" ? <ChatsTab onOpen={onOpen} selected={selected} /> : null}
      {tab === "calls" ? <CallsTab onCall={onCall} /> : null}
      {tab === "updates" ? <UpdatesTab /> : null}
      {tab === "communities" ? <CommunitiesTab /> : null}
      {tab === "settings" ? <SettingsTab /> : null}
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}

const TAB_BAR_H = WA.tabBar.height + 26;

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const unreadChats = useMessaging((s) => CHATS.filter((id) => s.threads[id].unread > 0).length);
  const missedCalls = WA_CALLS.filter((c) => c.direction === "missed").length;
  const items: { id: Tab; label: string; glyph: (a: boolean) => ReactNode; badge?: number }[] = [
    { id: "updates", label: "Updates", glyph: (a) => <UpdatesTabGlyph size={WA.tabBar.glyph} active={a} /> },
    { id: "calls", label: "Calls", glyph: (a) => <CallsTabGlyph size={WA.tabBar.glyph - 2} active={a} />, badge: missedCalls },
    { id: "communities", label: "Communities", glyph: (a) => <CommunitiesTabGlyph size={WA.tabBar.glyph} active={a} /> },
    { id: "chats", label: "Chats", glyph: (a) => <ChatsTabGlyph size={WA.tabBar.glyph} active={a} />, badge: unreadChats },
    { id: "settings", label: "Settings", glyph: (a) => <SettingsTabGlyph size={WA.tabBar.glyph} active={a} /> },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: TAB_BAR_H,
        background: "var(--wa-nav-material)",
        backdropFilter: "var(--material-light-filter)",
        WebkitBackdropFilter: "var(--material-light-filter)",
        boxShadow: "inset 0 var(--hairline) 0 var(--ios-separator)",
        display: "flex",
        zIndex: 5,
      }}
    >
      {items.map((it) => {
        const active = it.id === tab;
        return (
          <Tap
            key={it.id}
            label={it.label}
            onPress={() => setTab(it.id)}
            style={{ flex: 1, height: WA.tabBar.height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: active ? "var(--ios-label)" : "var(--wa-meta)" }}
          >
            <span style={{ position: "relative", display: "flex" }}>
              {it.glyph(active)}
              {it.badge ? (
                <span
                  style={{
                    position: "absolute",
                    left: "62%",
                    top: -4,
                    minWidth: WA.tabBar.badge,
                    height: WA.tabBar.badge,
                    paddingInline: 5,
                    borderRadius: WA.tabBar.badge / 2,
                    background: "var(--wa-green)",
                    color: "var(--on-accent)",
                    fontSize: 12,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 0 2px var(--wa-nav)",
                  }}
                >
                  {it.badge}
                </span>
              ) : null}
            </span>
            <span style={{ fontSize: WA.tabBar.labelSize, fontWeight: active ? 600 : 500, letterSpacing: 0.1 }}>{it.label}</span>
          </Tap>
        );
      })}
    </div>
  );
}

/** Top bar shared by the tabs: a round "…" left, actions right, then the large title. */
function LargeTitleHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <>
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 16 }}>
        <Tap label="More" style={{ width: 30, height: 30, borderRadius: 15, background: "var(--wa-chip)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ios-label)" }}>
          <MoreGlyph size={20} />
        </Tap>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>{actions}</div>
      </div>
      <div style={{ paddingInline: 16, fontSize: WA.chatList.titleSize, fontWeight: 700, letterSpacing: 0.37, lineHeight: "41px", marginTop: 2 }}>{title}</div>
    </>
  );
}

function SearchField({ placeholder, meta }: { placeholder: string; meta?: boolean }) {
  return (
    <div style={{ paddingInline: 16, marginTop: 8 }}>
      <div
        style={{
          height: WA.chatList.searchHeight,
          borderRadius: 10,
          background: "var(--wa-chip)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingInline: 10,
          color: "var(--wa-meta)",
          fontSize: 17,
        }}
      >
        {meta ? <MetaAiRing size={18} /> : <SearchGlyph size={18} />}
        <span>{placeholder}</span>
      </div>
    </div>
  );
}

/** The Meta AI ring in WhatsApp's search field (our own drawing of a blue-violet ring). */
function MetaAiRing({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <defs>
        <linearGradient id="wa-meta-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--meta-ai-blue)" }} />
          <stop offset="0.5" style={{ stopColor: "var(--meta-ai-violet)" }} />
          <stop offset="1" style={{ stopColor: "var(--meta-ai-magenta)" }} />
        </linearGradient>
      </defs>
      <circle cx="10" cy="10" r="7.2" fill="none" stroke="url(#wa-meta-ring)" strokeWidth="3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Chats
// ---------------------------------------------------------------------------

function ChatsTab({ onOpen, selected }: { onOpen: (id: ThreadId) => void; selected: ThreadId | null }) {
  const [filter, setFilter] = useState<"all" | "unread" | "favorites" | "groups">("all");
  const threads = useMessaging((s) => s.threads);
  const rows = CHATS.filter((id) => {
    const t = threads[id];
    if (filter === "unread") return t.unread > 0;
    if (filter === "groups") return person(t.contactId).group;
    if (filter === "favorites") return id === "mom";
    return true;
  });
  const unreadCount = CHATS.filter((id) => threads[id].unread > 0).length;
  return (
    <Scroll top={TOP} bottom={TAB_BAR_H}>
      <LargeTitleHeader
        title="Chats"
        actions={
          <>
            <Tap label="Camera" style={{ color: "var(--ios-label)", display: "flex" }}>
              <CameraGlyph size={26} />
            </Tap>
            <Tap label="New chat" style={{ width: 30, height: 30, borderRadius: 15, background: "var(--wa-green)", color: "var(--on-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </Tap>
          </>
        }
      />
      <SearchField placeholder="Ask Meta AI or Search" meta />
      <div style={{ display: "flex", gap: 8, paddingInline: 16, marginTop: 12, overflow: "hidden" }}>
        {(
          [
            ["all", "All"],
            ["unread", unreadCount ? `Unread ${unreadCount}` : "Unread"],
            ["favorites", "Favorites"],
            ["groups", "Groups"],
          ] as const
        ).map(([id, label]) => {
          const on = filter === id;
          return (
            <Tap
              key={id}
              onPress={() => setFilter(id)}
              style={{
                height: WA.chatList.chipHeight,
                paddingInline: 14,
                borderRadius: WA.chatList.chipHeight / 2,
                background: on ? "var(--wa-bubble-out)" : "var(--wa-chip)",
                color: on ? "var(--wa-chip-active-text)" : "var(--wa-meta)",
                fontSize: WA.chatList.chipSize,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {label}
            </Tap>
          );
        })}
        <Tap label="New list" style={{ width: WA.chatList.chipHeight, height: WA.chatList.chipHeight, borderRadius: WA.chatList.chipHeight / 2, background: "var(--wa-chip)", color: "var(--wa-meta)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width={14} height={14} viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </Tap>
      </div>
      <Tap highlight="var(--ios-gray5)" style={{ display: "flex", alignItems: "center", gap: 18, height: 50, paddingInline: 30, width: "100%", marginTop: 6, color: "var(--wa-meta)" }}>
        <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7.5h16v11.2c0 .9-.7 1.6-1.6 1.6H5.6c-.9 0-1.6-.7-1.6-1.6V7.5ZM3 4h18v3.5H3zM9.5 11.5h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 17, color: "var(--ios-label)", fontWeight: 500 }}>Archived</span>
      </Tap>
      {rows.map((id) => (
        <ChatRow key={id} id={id} onOpen={onOpen} selected={selected === id} />
      ))}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "18px 24px 24px", color: "var(--wa-meta)", fontSize: 12.5 }}>
        <LockGlyph size={12} />
        <span>
          Your personal messages are <span style={{ color: "var(--wa-accent)" }}>end-to-end encrypted</span>
        </span>
      </div>
    </Scroll>
  );
}

function ChatRow({ id, onOpen, selected }: { id: ThreadId; onOpen: (id: ThreadId) => void; selected: boolean }) {
  const t = useMessaging((s) => s.threads[id]);
  const { now } = useMockClock();
  const c = person(t.contactId);
  const last = [...t.messages].reverse().find((m) => m.kind !== "encryption");
  const unread = t.unread > 0;
  return (
    <Tap
      onPress={() => onOpen(id)}
      highlight="var(--ios-gray5)"
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", height: WA.chatList.rowHeight, paddingLeft: 16, background: selected ? "var(--wa-chip)" : undefined }}
    >
      <Avatar src={c.avatar} size={WA.chatList.avatar} />
      <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "inset 0 calc(-1 * var(--hairline)) 0 var(--ios-separator)", paddingRight: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ ...ellipsis, flex: 1, fontSize: WA.chatList.nameSize, fontWeight: 600, letterSpacing: -0.4 }}>{c.name}</span>
          <span style={{ fontSize: WA.chatList.timeSize, color: unread ? "var(--wa-accent)" : "var(--wa-meta)", fontWeight: unread ? 500 : 400 }}>{last ? waListTime(last.at, now) : ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
          <span style={{ ...ellipsis, flex: 1, fontSize: WA.chatList.previewSize, color: "var(--wa-meta)", display: "flex", alignItems: "center", gap: 3 }}>
            {last ? <Preview m={last} group={!!c.group} /> : null}
          </span>
          {unread ? (
            <span style={{ minWidth: WA.chatList.badge, height: WA.chatList.badge, borderRadius: WA.chatList.badge / 2, paddingInline: 6, background: "var(--wa-green)", color: "var(--on-accent)", fontSize: WA.chatList.badgeSize, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {t.unread}
            </span>
          ) : null}
        </div>
      </div>
    </Tap>
  );
}

/** The chat-list preview line: ticks on mine, the sender in groups, media labels with glyphs. */
function Preview({ m, group }: { m: Message; group: boolean }) {
  const ticks =
    m.from === "me" ? (
      <span style={{ color: m.receipt === "read" ? "var(--wa-tick-read)" : "var(--wa-tick-sent)", display: "flex", flexShrink: 0 }}>
        <Ticks double={m.receipt !== "sent" && m.receipt !== "sending"} width={16} height={11} />
      </span>
    ) : null;
  const sender = group && m.sender ? <span style={{ flexShrink: 0 }}>{person(m.sender).name}:</span> : null;
  if (m.kind === "photo")
    return (
      <>
        {ticks}
        {sender}
        <PhotoGlyph size={16} style={{ flexShrink: 0 }} />
        <span>Photo</span>
      </>
    );
  if (m.kind === "voice")
    return (
      <>
        {ticks}
        {sender}
        <VoiceNoteGlyph size={16} style={{ flexShrink: 0, color: "var(--wa-accent)" }} />
        <span>{m.duration}</span>
      </>
    );
  if (m.kind === "missed-call")
    return (
      <>
        <PhoneGlyph size={14} style={{ flexShrink: 0, color: "var(--wa-missed)" }} />
        <span>Missed voice call</span>
      </>
    );
  return (
    <>
      {ticks}
      {sender}
      <span style={ellipsis}>{m.text}</span>
    </>
  );
}

function EmptyDetail() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--wa-wallpaper)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--wa-meta)", textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: "var(--ios-label)" }}>WhatsApp</div>
      <div style={{ fontSize: 14, lineHeight: "20px", maxWidth: 300 }}>Send and receive messages without keeping your phone online.</div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, marginTop: 18 }}>
        <LockGlyph size={12} /> Your personal messages are end-to-end encrypted
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

function CallsTab({ onCall }: { onCall: (p: PersonId, video: boolean) => void }) {
  const { now } = useMockClock();
  return (
    <Scroll top={TOP} bottom={TAB_BAR_H}>
      <LargeTitleHeader
        title="Calls"
        actions={
          <Tap label="New call" style={{ width: 30, height: 30, borderRadius: 15, background: "var(--wa-green)", color: "var(--on-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PhoneGlyph size={16} />
          </Tap>
        }
      />
      <SearchField placeholder="Search" />
      <div style={{ paddingInline: 16, marginTop: 18, fontSize: 20, fontWeight: 700 }}>Favorites</div>
      <Tap onPress={() => onCall("mom", false)} highlight="var(--ios-gray5)" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", height: 64, paddingInline: 16 }}>
        <Avatar src={person("mom").avatar} size={44} />
        <span style={{ flex: 1, fontSize: 17, fontWeight: 600 }}>Mom</span>
        <span style={{ color: "var(--ios-label)", display: "flex", gap: 22 }}>
          <VideoGlyph size={22} />
          <PhoneGlyph size={20} />
        </span>
      </Tap>
      <div style={{ paddingInline: 16, marginTop: 14, fontSize: 20, fontWeight: 700 }}>Recent</div>
      {WA_CALLS.map((c) => {
        const p = person(c.with);
        const missed = c.direction === "missed";
        return (
          <Tap key={c.id} onPress={() => onCall(c.with, c.kind === "video")} highlight="var(--ios-gray5)" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", height: 64, paddingLeft: 16 }}>
            <Avatar src={p.avatar} size={44} />
            <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", alignItems: "center", boxShadow: "inset 0 calc(-1 * var(--hairline)) 0 var(--ios-separator)", paddingRight: 16, gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: missed ? "var(--wa-missed)" : "var(--ios-label)" }}>
                  {p.name}
                  {c.count ? ` (${c.count})` : ""}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "var(--wa-meta)", marginTop: 2 }}>
                  <PhoneGlyph size={13} />
                  <CallArrow size={12} missed={missed} />
                  <span>{missed ? "Missed" : c.direction === "incoming" ? "Incoming" : "Outgoing"}</span>
                </div>
              </div>
              <span style={{ fontSize: 14, color: "var(--wa-meta)" }}>{waListTime(c.at, now)}</span>
              <span style={{ color: "var(--ios-blue)", display: "flex" }}>
                <InfoGlyph size={22} />
              </span>
            </div>
          </Tap>
        );
      })}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "18px 24px 24px", color: "var(--wa-meta)", fontSize: 12.5 }}>
        <LockGlyph size={12} />
        <span>
          Your personal calls are <span style={{ color: "var(--wa-accent)" }}>end-to-end encrypted</span>
        </span>
      </div>
    </Scroll>
  );
}

/** The dark WhatsApp call screen (outgoing): Mom's avatar, "Calling…", the controls, end. */
function CallScreen({ with: withId, video, onEnd }: { with: PersonId; video: boolean; onEnd: () => void }) {
  const p = person(withId);
  const { width } = usePane();
  const control = (label: string, glyph: ReactNode, bg = "var(--wa-call-surface)", onPress?: () => void) => (
    <Tap label={label} onPress={onPress} style={{ width: 58, height: 58, borderRadius: 29, background: bg, color: "var(--on-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {glyph}
    </Tap>
  );
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 30, background: "var(--wa-call-bg)", color: "var(--wa-call-text)", overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.avatar} alt="" style={{ position: "absolute", inset: -40, width: "calc(100% + 80px)", height: "calc(100% + 80px)", objectFit: "cover", filter: "blur(40px) brightness(0.45)", opacity: 0.9 }} />
      <div style={{ position: "absolute", top: TOP + 12, left: 0, width, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 12.5, opacity: 0.8 }}>
        <LockGlyph size={11} /> End-to-end encrypted
      </div>
      <div style={{ position: "absolute", top: TOP + 60, left: 0, width, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <Avatar src={p.avatar} size={110} />
        <div style={{ fontSize: 28, fontWeight: 600, marginTop: 8 }}>{p.name}</div>
        <div style={{ fontSize: 16, opacity: 0.8 }}>{video ? "Video calling…" : "Calling…"}</div>
      </div>
      <div style={{ position: "absolute", bottom: 48, left: 0, width, display: "flex", justifyContent: "center", gap: 18 }}>
        {control(
          "Speaker",
          <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5h3.4L12 5.6v12.8L7.4 14.5H4z" fill="currentColor" />
            <path d="M15.4 9a4.2 4.2 0 0 1 0 6M17.8 6.6a7.6 7.6 0 0 1 0 10.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>,
        )}
        {control("Video", <VideoGlyph size={24} />)}
        {control(
          "Mute",
          <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
            <rect x="9" y="3.5" width="6" height="10.5" rx="3" fill="currentColor" />
            <path d="M6.2 11.5a5.8 5.8 0 0 0 11.6 0M12 17.3v3M4.5 4.5l15 15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>,
        )}
        {control(
          "End call",
          <svg width={26} height={26} viewBox="0 0 24 24" aria-hidden="true" style={{ transform: "rotate(135deg)" }}>
            <path d="M6.6 3.2c.5-.2 1.1 0 1.4.4l2 3.1c.3.5.3 1.1-.1 1.5l-1.3 1.4c.9 2 2.6 3.7 4.6 4.6l1.4-1.3c.4-.4 1-.4 1.5-.1l3.1 2c.5.3.6.9.4 1.4l-.7 1.8c-.4 1-1.4 1.6-2.5 1.5C9.9 19.2 4.8 14.1 4.2 7.6c-.1-1.1.5-2.1 1.5-2.5l.9-1.9Z" fill="currentColor" />
          </svg>,
          "var(--wa-call-end)",
          onEnd,
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Updates, Communities, Settings
// ---------------------------------------------------------------------------

function UpdatesTab() {
  const me = person("riley");
  return (
    <Scroll top={TOP} bottom={TAB_BAR_H}>
      <LargeTitleHeader
        title="Updates"
        actions={
          <Tap label="Camera" style={{ color: "var(--ios-label)", display: "flex" }}>
            <CameraGlyph size={26} />
          </Tap>
        }
      />
      <SearchField placeholder="Search" />
      <div style={{ paddingInline: 16, marginTop: 18, fontSize: 20, fontWeight: 700 }}>Status</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingInline: 16, height: 72 }}>
        <span style={{ position: "relative" }}>
          <Avatar src={me.avatar} size={54} />
          <span style={{ position: "absolute", right: -2, bottom: -2, width: 22, height: 22, borderRadius: 11, background: "var(--wa-green)", border: "2px solid var(--ios-bg)", color: "var(--on-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>+</span>
        </span>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Add status</div>
          <div style={{ fontSize: 14, color: "var(--wa-meta)" }}>Disappears after 24 hours</div>
        </div>
      </div>
      <div style={{ paddingInline: 16, marginTop: 18, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: 20, fontWeight: 700 }}>Channels</span>
        <span style={{ fontSize: 15, color: "var(--wa-accent)", fontWeight: 500 }}>Explore</span>
      </div>
      <div style={{ paddingInline: 16, marginTop: 6, fontSize: 14, lineHeight: "19px", color: "var(--wa-meta)" }}>
        Stay updated on topics that matter to you. Find channels to follow below.
      </div>
    </Scroll>
  );
}

function CommunitiesTab() {
  return (
    <Scroll top={TOP} bottom={TAB_BAR_H}>
      <LargeTitleHeader title="Communities" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 32px 0", gap: 12 }}>
        <span style={{ color: "var(--wa-accent)" }}>
          <CommunitiesTabGlyph size={84} active />
        </span>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Stay connected with a community</div>
        <div style={{ fontSize: 15, lineHeight: "21px", color: "var(--wa-meta)" }}>
          Communities bring members together in topic-based groups, and make it easy to get admin announcements.
        </div>
        <Tap style={{ marginTop: 14, height: 44, paddingInline: 28, borderRadius: 22, background: "var(--wa-green)", color: "var(--on-accent)", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center" }}>
          New community
        </Tap>
      </div>
    </Scroll>
  );
}

function SettingsTab() {
  const me = person("riley");
  const groups: [string, string, string][][] = [
    [
      ["Avatar", "var(--ios-indigo)", "☺"],
      ["Lists", "var(--ios-teal)", "≡"],
      ["Broadcast messages", "var(--ios-green)", "◉"],
      ["Starred", "var(--ios-yellow)", "★"],
      ["Linked devices", "var(--ios-teal)", "▭"],
    ],
    [
      ["Account", "var(--ios-blue)", "⚿"],
      ["Privacy", "var(--ios-teal)", "⚲"],
      ["Chats", "var(--ios-green)", "✉"],
      ["Notifications", "var(--ios-red)", "◔"],
      ["Storage and data", "var(--ios-green)", "⇅"],
    ],
    [
      ["Help", "var(--ios-blue)", "i"],
      ["Invite a friend", "var(--ios-pink)", "♥"],
    ],
  ];
  return (
    <Scroll top={TOP} bottom={TAB_BAR_H} style={{ background: "var(--ios-gray6)" }}>
      <div style={{ paddingInline: 16, fontSize: WA.chatList.titleSize, fontWeight: 700, letterSpacing: 0.37, lineHeight: "41px", marginTop: 46 }}>Settings</div>
      <SearchField placeholder="Search" />
      <div style={{ margin: "18px 16px 0", borderRadius: 12, background: "var(--ios-bg)", display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
        <Avatar src={me.avatar} size={58} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{me.name}</div>
          <div style={{ fontSize: 14, color: "var(--wa-meta)", marginTop: 2 }}>Hey there! I am using WhatsApp.</div>
        </div>
      </div>
      {groups.map((rows, gi) => (
        <div key={gi} style={{ margin: "22px 16px 0", borderRadius: 12, background: "var(--ios-bg)", overflow: "hidden" }}>
          {rows.map(([label, color, glyph], i) => (
            <Tap key={label} highlight="var(--ios-gray5)" style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", height: 46, paddingLeft: 14 }}>
              <span style={{ width: 29, height: 29, borderRadius: 7, background: color, color: "var(--on-accent)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{glyph}</span>
              <span
                style={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingRight: 14,
                  fontSize: 17,
                  boxShadow: i < rows.length - 1 ? "inset 0 calc(-1 * var(--hairline)) 0 var(--ios-separator)" : undefined,
                }}
              >
                {label}
                <svg width={8} height={14} viewBox="0 0 8 14" aria-hidden="true">
                  <path d="M1.5 1.5 6.5 7l-5 5.5" fill="none" stroke="var(--ios-gray4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Tap>
          ))}
        </div>
      ))}
    </Scroll>
  );
}
