"use client";

/**
 * WhatsApp for Android look-alike that opens on the phone: the four-tab app (Chats, Updates,
 * Communities, Calls) on a Material bottom navigation bar, Settings from the overflow menu, Mom's
 * thread (components/lookalike/whatsapp/WhatsAppThread), the Calls tab and the voice/video call
 * screen. Cover display: one column with a push/pop stack. Inner display: the split view (list
 * pane left, chat right). Data: lib/mock/threads.ts via lib/store/messaging.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { SAFE_BOTTOM } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import { WAA } from "@/components/lookalike/whatsapp/android";
import { WhatsAppThread } from "@/components/lookalike/whatsapp/WhatsAppThread";
import {
  AddCallGlyph,
  ArchiveGlyph,
  ArrowBack,
  AvatarFaceGlyph,
  BellGlyph,
  CallArrow,
  CallsNavGlyph,
  CameraGlyph,
  ChatOutlineGlyph,
  ChatsNavGlyph,
  ChevronDown,
  CommunitiesNavGlyph,
  EndCallGlyph,
  GlobeGlyph,
  HelpGlyph,
  KeyGlyph,
  LinkGlyph,
  LockGlyph,
  MoreVert,
  MuteGlyph,
  NewChatGlyph,
  PencilGlyph,
  PeopleGlyph,
  PersonAddGlyph,
  PhoneGlyph,
  PhotoGlyph,
  PlusGlyph,
  PrivacyGlyph,
  QrGlyph,
  SearchGlyph,
  SpeakerGlyph,
  StorageGlyph,
  Ticks,
  UpdatesNavGlyph,
  VideoGlyph,
  VoiceNoteGlyph,
} from "@/components/lookalike/whatsapp/glyphs";
import { Placeholder } from "@/components/Placeholder";
import type { AppScreenProps } from "@/lib/apps/registry";
import { useMockClock, type MockTime } from "@/lib/mock/clock";
import { daysAgo, waListTime, waTime } from "@/lib/mock/format";
import { person, type PersonId } from "@/lib/mock/people";
import { WA_CALLS, type Message } from "@/lib/mock/threads";
import { useMessaging, type ThreadId } from "@/lib/store/messaging";
import { AppFrame, Avatar, Scroll, Split, StackView, TOP, Tap, ellipsis, resetButton, useStack, type Stack } from "../kit";

type Tab = "chats" | "updates" | "communities" | "calls" | "settings";
type Route = { kind: "home"; tab: Tab } | { kind: "chat"; id: ThreadId } | { kind: "call"; with: PersonId; video: boolean };

/** Chat list order (Phase 2 ROUTES: Mom first, then the unread background chats, then Fam, Roommates, Marfa Trip). */
const CHATS: ThreadId[] = ["mom", "studygroup", "priya", "nani", "soccer", "masi", "fam", "roommates", "marfa"];

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
      <AppFrame display={display} tone={call ? "light" : "dark"} background="var(--wa-android-surface)">
        <Split
          list={home}
          divider="var(--wa-android-divider)"
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
    <AppFrame display={display} tone={stack.top.kind === "call" ? "light" : "dark"} background="var(--wa-android-surface)">
      <StackView stack={stack} keyOf={(r, i) => `${r.kind}-${i}`} render={(r) => routeView(r, stack, home, startCall)} />
    </AppFrame>
  );
}

/** How many OTHER chats are unread (the count beside the thread's back arrow). */
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
// Shared Android chrome: app bar, icon buttons, FAB, overflow menu, bottom navigation
// ---------------------------------------------------------------------------

const NAV_H = WAA.nav.height + SAFE_BOTTOM;
const ink = "var(--wa-android-on-surface)";
const inkVariant = "var(--wa-android-on-surface-variant)";

/** A control that is concept-only in the demo: a reset button wrapped in Placeholder. */
function PButton({ id, label, style, children, press = "scale" }: { id: string; label?: string; style?: CSSProperties; children: ReactNode; press?: "scale" | "darken" }) {
  return (
    <Placeholder id={id} press={press}>
      <button type="button" aria-label={label} style={{ ...resetButton, ...style }}>
        {children}
      </button>
    </Placeholder>
  );
}

const iconBtn: CSSProperties = {
  width: WAA.iconButton + 4,
  height: WAA.iconButton + 4,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--wa-android-icon)",
  flexShrink: 0,
};

/** Top app bar: the title on the left (the green "WhatsApp" wordmark on Chats), icons on the right. */
function AppBar({ title, brand, actions, onBack }: { title: string; brand?: boolean; actions?: ReactNode; onBack?: () => void }) {
  return (
    <div style={{ height: WAA.appBar, display: "flex", alignItems: "center", paddingLeft: onBack ? 4 : 16, paddingRight: 4, gap: onBack ? 8 : 0 }}>
      {onBack ? (
        <Tap label="Navigate up" onPress={onBack} style={iconBtn}>
          <ArrowBack size={WAA.icon} />
        </Tap>
      ) : null}
      <div
        style={{
          ...ellipsis,
          flex: 1,
          fontSize: brand ? WAA.brandSize : WAA.titleSize,
          fontWeight: brand ? 700 : 500,
          color: brand ? "var(--wa-android-brand)" : ink,
          letterSpacing: brand ? -0.2 : 0,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>{actions}</div>
    </div>
  );
}

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Tap label="More options" onPress={onPress} style={iconBtn}>
      <MoreVert size={WAA.icon} />
    </Tap>
  );
}

/** Material overflow menu (top right); "Settings" works, the rest are concept-only. */
function OverflowMenu({ open, items, onClose, onSettings }: { open: boolean; items: string[]; onClose: () => void; onSettings: () => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} style={{ position: "absolute", inset: 0, zIndex: 40 }}>
          <div data-action="close-menu" onClick={onClose} style={{ position: "absolute", inset: 0 }} />
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
            style={{
              position: "absolute",
              top: TOP + 6,
              right: 8,
              minWidth: 200,
              paddingBlock: 8,
              borderRadius: 16,
              background: "var(--wa-android-surface)",
              boxShadow: "var(--wa-android-menu-shadow)",
              transformOrigin: "top right",
            }}
          >
            {items.map((label) => (
              <PButton key={label} id="whatsapp:menu" press="darken" style={menuRow}>
                {label}
              </PButton>
            ))}
            <Tap
              onPress={() => {
                onClose();
                onSettings();
              }}
              highlight="var(--wa-android-pressed)"
              style={menuRow}
            >
              Settings
            </Tap>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const menuRow: CSSProperties = { display: "flex", alignItems: "center", width: "100%", height: 48, paddingInline: 16, fontSize: 16, color: ink, textAlign: "left" };

/** Green rounded-square floating action button above the bottom navigation bar. */
function Fab({ id, label, children, small }: { id: string; label: string; children: ReactNode; small?: ReactNode }) {
  return (
    <div style={{ position: "absolute", right: WAA.fab.inset, bottom: NAV_H + WAA.fab.inset, zIndex: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {small}
      <PButton
        id={id}
        label={label}
        style={{
          width: WAA.fab.size,
          height: WAA.fab.size,
          borderRadius: WAA.fab.radius,
          background: "var(--wa-android-brand)",
          color: "var(--wa-android-on-brand)",
          boxShadow: "var(--wa-android-fab-shadow)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </PButton>
    </div>
  );
}

/** The Chats tab with its navigation bar on its own (the /scene/threads/whatsapp-chats frame). */
export function WhatsAppChats({ onOpen }: { onOpen: (id: ThreadId) => void }) {
  const [tab, setTab] = useState<Tab>("chats");
  return <Home tab={tab} setTab={setTab} onOpen={onOpen} onCall={() => {}} selected={null} />;
}

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
  const [menu, setMenu] = useState(false);
  const openMenu = () => setMenu(true);
  const menuItems: Record<Tab, string[]> = {
    chats: ["New group", "New community", "Broadcast lists", "Linked devices", "Starred", "Read all"],
    updates: ["Create channel", "Status privacy", "Starred"],
    communities: ["New community"],
    calls: ["Clear call log", "Call settings"],
    settings: [],
  };
  if (tab === "settings")
    return (
      <div style={{ position: "absolute", inset: 0, background: "var(--wa-android-surface)" }}>
        <SettingsPage onBack={() => setTab("chats")} />
      </div>
    );
  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--wa-android-surface)" }}>
      {tab === "chats" ? <ChatsTab onOpen={onOpen} selected={selected} onMenu={openMenu} /> : null}
      {tab === "updates" ? <UpdatesTab onMenu={openMenu} /> : null}
      {tab === "communities" ? <CommunitiesTab onMenu={openMenu} /> : null}
      {tab === "calls" ? <CallsTab onCall={onCall} onMenu={openMenu} /> : null}
      <BottomNav tab={tab} setTab={setTab} />
      <OverflowMenu open={menu} items={menuItems[tab]} onClose={() => setMenu(false)} onSettings={() => setTab("settings")} />
    </div>
  );
}

/** Material 3 navigation bar: pill indicator behind the active icon, labels, count badges. */
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const unreadChats = useMessaging((s) => CHATS.filter((id) => s.threads[id].unread > 0).length);
  const missedCalls = WA_CALLS.filter((c) => c.direction === "missed").length;
  const n = WAA.nav;
  const items: { id: Tab; label: string; glyph: (a: boolean) => ReactNode; badge?: number; dot?: boolean }[] = [
    { id: "chats", label: "Chats", glyph: (a) => <ChatsNavGlyph size={n.icon} active={a} />, badge: unreadChats },
    { id: "updates", label: "Updates", glyph: (a) => <UpdatesNavGlyph size={n.icon} active={a} />, dot: true },
    { id: "communities", label: "Communities", glyph: (a) => <CommunitiesNavGlyph size={n.icon} active={a} /> },
    { id: "calls", label: "Calls", glyph: (a) => <CallsNavGlyph size={n.icon} active={a} />, badge: missedCalls },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: NAV_H,
        paddingBottom: SAFE_BOTTOM,
        background: "var(--wa-android-surface)",
        boxShadow: "inset 0 1px 0 var(--wa-android-divider)",
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
            style={{ flex: 1, height: n.height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: ink }}
          >
            <span
              style={{
                position: "relative",
                width: n.indicatorW,
                height: n.indicatorH,
                borderRadius: n.indicatorH / 2,
                background: active ? "var(--wa-android-indicator)" : "transparent",
                transition: "background 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {it.glyph(active)}
              {it.badge ? (
                <span
                  style={{
                    position: "absolute",
                    left: n.indicatorW / 2 + 4,
                    top: 0,
                    minWidth: n.badge,
                    height: n.badge,
                    paddingInline: 4,
                    borderRadius: n.badge / 2,
                    background: "var(--wa-android-badge)",
                    color: "var(--wa-android-on-brand)",
                    fontSize: 11,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {it.badge}
                </span>
              ) : it.dot ? (
                <span style={{ position: "absolute", left: n.indicatorW / 2 + 7, top: 3, width: 8, height: 8, borderRadius: 4, background: "var(--wa-android-badge)" }} />
              ) : null}
            </span>
            <span style={{ fontSize: n.labelSize, fontWeight: active ? 700 : 500, letterSpacing: 0.2, lineHeight: "16px" }}>{it.label}</span>
          </Tap>
        );
      })}
    </div>
  );
}

function SearchField({ placeholder, meta }: { placeholder: string; meta?: boolean }) {
  return (
    <div style={{ paddingInline: 16, marginTop: 2 }}>
      <PButton
        id="whatsapp:search"
        press="darken"
        style={{
          width: "100%",
          height: WAA.search.height,
          borderRadius: WAA.search.radius,
          background: "var(--wa-android-field)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingInline: 16,
          color: inkVariant,
          fontSize: WAA.search.size,
        }}
      >
        {meta ? <MetaAiRing size={20} /> : <SearchGlyph size={20} />}
        <span>{placeholder}</span>
      </PButton>
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

function SectionHeader({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 16, marginTop: 16, marginBottom: 4, minHeight: 32 }}>
      <span style={{ fontSize: 18, fontWeight: 600, color: ink }}>{children}</span>
      {trailing}
    </div>
  );
}

function EncryptedFooter({ what }: { what: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "18px 24px 24px", color: inkVariant, fontSize: 12.5 }}>
      <LockGlyph size={12} />
      <span>
        Your personal {what} are <span style={{ color: "var(--wa-android-brand)" }}>end-to-end encrypted</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chats
// ---------------------------------------------------------------------------

function ChatsTab({ onOpen, selected, onMenu }: { onOpen: (id: ThreadId) => void; selected: ThreadId | null; onMenu: () => void }) {
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
  const c = WAA.chip;
  return (
    <>
      <Scroll top={TOP} bottom={NAV_H + WAA.fab.size + 24}>
        <AppBar
          title="WhatsApp"
          brand
          actions={
            <>
              <PButton id="whatsapp:camera" label="Camera" style={iconBtn}>
                <CameraGlyph size={WAA.icon} />
              </PButton>
              <MenuButton onPress={onMenu} />
            </>
          }
        />
        <SearchField placeholder="Ask Meta AI or Search" meta />
        <div style={{ display: "flex", gap: 8, paddingInline: 16, marginTop: 12, marginBottom: 6, overflowX: "auto", scrollbarWidth: "none" }}>
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
                  height: c.height,
                  paddingInline: c.padX,
                  borderRadius: c.radius,
                  background: on ? "var(--wa-android-chip-active)" : "var(--wa-android-surface)",
                  boxShadow: on ? "inset 0 0 0 1px var(--wa-android-chip-active)" : "inset 0 0 0 1px var(--wa-android-chip-outline)",
                  color: on ? "var(--wa-android-chip-active-text)" : inkVariant,
                  fontSize: c.size,
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
          <PButton
            id="whatsapp:new-list"
            label="New list"
            style={{ width: c.height, height: c.height, borderRadius: c.radius, boxShadow: "inset 0 0 0 1px var(--wa-android-chip-outline)", color: inkVariant, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <PlusGlyph size={16} />
          </PButton>
        </div>
        <PButton id="whatsapp:archived" press="darken" style={{ display: "flex", alignItems: "center", gap: 28, height: 56, paddingInline: 28, width: "100%", color: inkVariant }}>
          <ArchiveGlyph size={22} />
          <span style={{ fontSize: 16, color: ink, fontWeight: 500 }}>Archived</span>
        </PButton>
        {rows.map((id) => (
          <ChatRow key={id} id={id} onOpen={onOpen} selected={selected === id} />
        ))}
        <EncryptedFooter what="messages" />
      </Scroll>
      <Fab id="whatsapp:new-chat" label="New chat">
        <NewChatGlyph size={WAA.fab.icon} />
      </Fab>
    </>
  );
}

function ChatRow({ id, onOpen, selected }: { id: ThreadId; onOpen: (id: ThreadId) => void; selected: boolean }) {
  const t = useMessaging((s) => s.threads[id]);
  const { now } = useMockClock();
  const c = person(t.contactId);
  const last = [...t.messages].reverse().find((m) => m.kind !== "encryption");
  const unread = t.unread > 0;
  const r = WAA.row;
  return (
    <Tap
      onPress={() => onOpen(id)}
      onLongPress={() => useMessaging.getState().toggleUnread(id)}
      highlight="var(--wa-android-pressed)"
      style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", height: r.height, paddingInline: 16, background: selected ? "var(--wa-android-selected)" : undefined }}
    >
      <Avatar src={c.avatar} size={r.avatar} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ ...ellipsis, flex: 1, fontSize: r.nameSize, fontWeight: 500, color: ink }}>{c.name}</span>
          <span style={{ fontSize: r.timeSize, color: unread ? "var(--wa-android-brand)" : inkVariant, fontWeight: unread ? 600 : 400 }}>{last ? waListTime(last.at, now) : ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
          <span style={{ ...ellipsis, flex: 1, fontSize: r.previewSize, color: inkVariant, display: "flex", alignItems: "center", gap: 3 }}>{last ? <Preview m={last} group={!!c.group} /> : null}</span>
          {unread ? (
            <span style={{ minWidth: r.badge, height: r.badge, borderRadius: r.badge / 2, paddingInline: 6, background: "var(--wa-android-badge)", color: "var(--wa-android-on-brand)", fontSize: r.badgeSize, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
        <VoiceNoteGlyph size={16} style={{ flexShrink: 0, color: "var(--wa-android-brand)" }} />
        <span>{m.duration}</span>
      </>
    );
  if (m.kind === "missed-call")
    return (
      <>
        <PhoneGlyph size={14} filled style={{ flexShrink: 0, color: "var(--wa-android-missed)" }} />
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
    <div style={{ position: "absolute", inset: 0, background: "var(--wa-wallpaper)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: inkVariant, textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 22, fontWeight: 500, color: ink }}>WhatsApp</div>
      <div style={{ fontSize: 14, lineHeight: "20px", maxWidth: 300 }}>Send and receive messages on both screens of your phone.</div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, marginTop: 18 }}>
        <LockGlyph size={12} /> Your personal messages are end-to-end encrypted
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

function callStamp(at: string, now: MockTime): string {
  return daysAgo(at, now) === 0 ? waTime(at) : `${waListTime(at, now)}, ${waTime(at)}`;
}

function CallsTab({ onCall, onMenu }: { onCall: (p: PersonId, video: boolean) => void; onMenu: () => void }) {
  const { now } = useMockClock();
  const r = WAA.row;
  return (
    <>
      <Scroll top={TOP} bottom={NAV_H + WAA.fab.size + 24}>
        <AppBar
          title="Calls"
          actions={
            <>
              <PButton id="whatsapp:search" label="Search" style={iconBtn}>
                <SearchGlyph size={WAA.icon} />
              </PButton>
              <MenuButton onPress={onMenu} />
            </>
          }
        />
        <SectionHeader>Favorites</SectionHeader>
        <Tap onPress={() => onCall("mom", false)} highlight="var(--wa-android-pressed)" style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", height: r.height, paddingInline: 16 }}>
          <Avatar src={person("mom").avatar} size={r.avatar} />
          <span style={{ flex: 1, fontSize: r.nameSize, fontWeight: 500, color: ink, textAlign: "left" }}>Mom</span>
          <span style={{ color: "var(--wa-android-icon)", display: "flex", gap: 24, paddingRight: 8 }}>
            <PhoneGlyph size={22} />
            <VideoGlyph size={24} />
          </span>
        </Tap>
        <SectionHeader>Recent</SectionHeader>
        <PButton id="whatsapp:call-link" press="darken" style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", height: r.height, paddingInline: 16, textAlign: "left" }}>
          <span style={{ width: r.avatar, height: r.avatar, borderRadius: "50%", background: "var(--wa-android-brand)", color: "var(--wa-android-on-brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LinkGlyph size={22} />
          </span>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: r.nameSize, fontWeight: 500, color: ink }}>Create call link</span>
            <span style={{ fontSize: r.previewSize, color: inkVariant, marginTop: 2 }}>Share a link for your WhatsApp call</span>
          </span>
        </PButton>
        {WA_CALLS.map((c) => {
          const p = person(c.with);
          const missed = c.direction === "missed";
          return (
            <Tap key={c.id} onPress={() => onCall(c.with, c.kind === "video")} highlight="var(--wa-android-pressed)" style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", height: r.height, paddingInline: 16 }}>
              <Avatar src={p.avatar} size={r.avatar} />
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div style={{ ...ellipsis, fontSize: r.nameSize, fontWeight: 500, color: missed ? "var(--wa-android-missed)" : ink }}>
                  {p.name}
                  {c.count ? ` (${c.count})` : ""}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: r.previewSize, color: inkVariant, marginTop: 2 }}>
                  <span style={{ display: "flex", color: missed ? "var(--wa-android-missed)" : "var(--wa-android-brand)" }}>
                    <CallArrow size={14} outgoing={c.direction === "outgoing"} />
                  </span>
                  <span>{callStamp(c.at, now)}</span>
                </div>
              </div>
              <span style={{ color: "var(--wa-android-icon)", display: "flex", paddingRight: 8 }}>{c.kind === "video" ? <VideoGlyph size={24} /> : <PhoneGlyph size={22} />}</span>
            </Tap>
          );
        })}
        <EncryptedFooter what="calls" />
      </Scroll>
      <Fab id="whatsapp:new-call" label="New call">
        <AddCallGlyph size={WAA.fab.icon} />
      </Fab>
    </>
  );
}

/** The WhatsApp for Android call screen (outgoing): dark teal gradient, avatar, name, "Calling…"
 * then "Ringing…", and the round controls on a rounded panel with the red end-call button. */
function CallScreen({ with: withId, video, onEnd }: { with: PersonId; video: boolean; onEnd: () => void }) {
  const p = person(withId);
  const { width } = usePane();
  const [ringing, setRinging] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRinging(true), 1600);
    return () => clearTimeout(t);
  }, []);
  const b = WAA.call;
  const control = (id: string, label: string, glyph: ReactNode) => (
    <PButton id={id} label={label} style={{ width: b.button, height: b.button, borderRadius: "50%", background: "var(--wa-android-call-button)", color: "var(--wa-android-call-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {glyph}
    </PButton>
  );
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        background: "linear-gradient(180deg, var(--wa-android-call-top) 0%, var(--wa-android-call-bottom) 75%)",
        color: "var(--wa-android-call-text)",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: TOP + 4, left: 0, width, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 8 }}>
        <PButton id="whatsapp:call-minimize" label="Minimize" style={{ ...iconBtn, color: "inherit" }}>
          <ChevronDown size={26} />
        </PButton>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--wa-android-call-sub)" }}>
          <LockGlyph size={11} /> End-to-end encrypted
        </div>
        <PButton id="whatsapp:call-add" label="Add participant" style={{ ...iconBtn, color: "inherit" }}>
          <PersonAddGlyph size={24} />
        </PButton>
      </div>
      <div style={{ position: "absolute", top: TOP + 72, left: 0, width, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ fontSize: 28, fontWeight: 500 }}>{p.name}</div>
        <div style={{ fontSize: 16, color: "var(--wa-android-call-sub)" }}>{ringing ? "Ringing…" : video ? "Video calling…" : "Calling…"}</div>
        <div style={{ marginTop: 36 }}>
          <Avatar src={p.avatar} size={b.avatar} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: SAFE_BOTTOM + 14,
          left: "50%",
          transform: "translateX(-50%)",
          width: Math.min(width - 24, 380),
          padding: "14px 16px",
          borderRadius: 32,
          background: "var(--wa-android-call-panel)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {control("whatsapp:call-more", "More", <MoreVert size={24} />)}
        {control("whatsapp:call-video", video ? "Turn camera off" : "Turn camera on", <VideoGlyph size={24} filled={video} />)}
        {control("whatsapp:call-speaker", "Speaker", <SpeakerGlyph size={24} />)}
        {control("whatsapp:call-mute", "Mute", <MuteGlyph size={24} />)}
        <Tap
          label="End call"
          onPress={onEnd}
          style={{ width: b.end, height: b.button, borderRadius: b.button / 2, background: "var(--wa-android-call-end)", color: "var(--wa-android-call-text)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <EndCallGlyph size={26} />
        </Tap>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Updates, Communities, Settings
// ---------------------------------------------------------------------------

const STATUS_PEOPLE: PersonId[] = ["priya", "nani", "masi", "omar"];

function UpdatesTab({ onMenu }: { onMenu: () => void }) {
  const me = person("riley");
  return (
    <>
      <Scroll top={TOP} bottom={NAV_H + 2 * WAA.fab.size + 40}>
        <AppBar
          title="Updates"
          actions={
            <>
              <PButton id="whatsapp:search" label="Search" style={iconBtn}>
                <SearchGlyph size={WAA.icon} />
              </PButton>
              <MenuButton onPress={onMenu} />
            </>
          }
        />
        <SectionHeader>Status</SectionHeader>
        <div style={{ display: "flex", gap: 8, paddingInline: 16, overflow: "hidden", marginTop: 4 }}>
          <PButton id="whatsapp:status" press="darken" style={{ ...statusCard, background: "var(--wa-android-field)", boxShadow: "inset 0 0 0 1px var(--wa-android-chip-outline)" }}>
            <span style={{ position: "absolute", left: 10, top: 10 }}>
              <Avatar src={me.avatar} size={36} />
              <span style={{ position: "absolute", right: -4, bottom: -4, width: 20, height: 20, borderRadius: 10, background: "var(--wa-android-brand)", border: "2px solid var(--wa-android-field)", color: "var(--wa-android-on-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PlusGlyph size={12} />
              </span>
            </span>
            <span style={{ position: "absolute", left: 10, bottom: 10, fontSize: 13, fontWeight: 500, color: ink }}>Add status</span>
          </PButton>
          {STATUS_PEOPLE.map((id) => {
            const p = person(id);
            return (
              <PButton key={id} id="whatsapp:status" press="darken" style={{ ...statusCard, background: "var(--wa-android-call-bottom)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.avatar} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(6px) brightness(0.8)", transform: "scale(1.2)" }} />
                <span style={{ position: "absolute", left: 8, top: 8, padding: 2, borderRadius: "50%", boxShadow: "inset 0 0 0 2.5px var(--wa-android-brand)" }}>
                  <Avatar src={p.avatar} size={34} style={{ border: "2px solid var(--wa-android-surface)" }} />
                </span>
                <span style={{ ...ellipsis, position: "absolute", left: 10, right: 6, bottom: 10, fontSize: 13, fontWeight: 500, color: "var(--wa-android-on-brand)", textAlign: "left" }}>{p.name}</span>
              </PButton>
            );
          })}
        </div>
        <SectionHeader
          trailing={
            <PButton id="whatsapp:explore" style={{ height: 32, paddingInline: 14, borderRadius: 16, boxShadow: "inset 0 0 0 1px var(--wa-android-chip-outline)", fontSize: 14, fontWeight: 500, color: ink }}>
              Explore
            </PButton>
          }
        >
          Channels
        </SectionHeader>
        <div style={{ paddingInline: 16, marginTop: 4, fontSize: 14, lineHeight: "20px", color: inkVariant }}>Stay updated on topics that matter to you. Find channels to follow below.</div>
        <div style={{ paddingInline: 16, marginTop: 16 }}>
          <PButton id="whatsapp:explore" style={{ height: 40, paddingInline: 24, borderRadius: 20, background: "var(--wa-android-brand)", color: "var(--wa-android-on-brand)", fontSize: 14, fontWeight: 500 }}>
            Explore more
          </PButton>
        </div>
      </Scroll>
      <Fab
        id="whatsapp:camera"
        label="Camera"
        small={
          <PButton
            id="whatsapp:status"
            label="Text status"
            style={{ width: 44, height: 44, borderRadius: 12, background: "var(--wa-android-field)", color: ink, boxShadow: "var(--wa-android-fab-shadow)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <PencilGlyph size={20} />
          </PButton>
        }
      >
        <CameraGlyph size={WAA.fab.icon} />
      </Fab>
    </>
  );
}

const statusCard: CSSProperties = { position: "relative", width: 90, height: 150, borderRadius: 14, overflow: "hidden", flexShrink: 0 };

function CommunitiesTab({ onMenu }: { onMenu: () => void }) {
  return (
    <Scroll top={TOP} bottom={NAV_H}>
      <AppBar title="Communities" actions={<MenuButton onPress={onMenu} />} />
      <PButton id="whatsapp:new-community" press="darken" style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", height: WAA.row.height, paddingInline: 16 }}>
        <span style={{ position: "relative", width: WAA.row.avatar, height: WAA.row.avatar, borderRadius: 12, background: "var(--wa-android-field)", color: inkVariant, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CommunitiesNavGlyph size={28} />
          <span style={{ position: "absolute", right: -4, bottom: -4, width: 20, height: 20, borderRadius: 10, background: "var(--wa-android-brand)", border: "2px solid var(--wa-android-surface)", color: "var(--wa-android-on-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PlusGlyph size={12} />
          </span>
        </span>
        <span style={{ fontSize: WAA.row.nameSize, fontWeight: 500, color: ink }}>New community</span>
      </PButton>
      <div style={{ height: 8, background: "var(--wa-android-field)", marginTop: 4 }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "32px 32px 0", gap: 12 }}>
        <span style={{ width: 120, height: 120, borderRadius: 28, background: "var(--wa-android-chip-active)", color: "var(--wa-android-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CommunitiesNavGlyph size={72} active />
        </span>
        <div style={{ fontSize: 20, fontWeight: 600, color: ink, marginTop: 6 }}>Stay connected with a community</div>
        <div style={{ fontSize: 14, lineHeight: "20px", color: inkVariant }}>
          Communities bring members together in topic-based groups, and make it easy to get admin announcements. Any community you&apos;re added to will appear here.
        </div>
        <PButton id="whatsapp:new-community" style={{ marginTop: 10, height: 40, paddingInline: 24, borderRadius: 20, background: "var(--wa-android-brand)", color: "var(--wa-android-on-brand)", fontSize: 14, fontWeight: 500 }}>
          Start your community
        </PButton>
      </div>
    </Scroll>
  );
}

function SettingsPage({ onBack }: { onBack: () => void }) {
  const me = person("riley");
  const rows: [ReactNode, string, string][] = [
    [<KeyGlyph key="k" size={24} />, "Account", "Security notifications, change number"],
    [<PrivacyGlyph key="p" size={24} />, "Privacy", "Block contacts, disappearing messages"],
    [<AvatarFaceGlyph key="a" size={24} />, "Avatar", "Create, edit, profile photo"],
    [<PeopleGlyph key="l" size={24} />, "Lists", "Manage people and groups"],
    [<ChatOutlineGlyph key="c" size={24} />, "Chats", "Theme, wallpapers, chat history"],
    [<BellGlyph key="n" size={24} />, "Notifications", "Message, group & call tones"],
    [<StorageGlyph key="s" size={24} />, "Storage and data", "Network usage, auto-download"],
    [<GlobeGlyph key="g" size={24} />, "App language", "English (device's language)"],
    [<HelpGlyph key="h" size={24} />, "Help", "Help center, contact us, privacy policy"],
    [<PeopleGlyph key="i" size={24} />, "Invite a friend", "Share WhatsApp with your contacts"],
  ];
  return (
    <Scroll top={TOP} bottom={SAFE_BOTTOM}>
      <AppBar
        title="Settings"
        onBack={onBack}
        actions={
          <PButton id="whatsapp:search" label="Search" style={iconBtn}>
            <SearchGlyph size={WAA.icon} />
          </PButton>
        }
      />
      <PButton id="whatsapp:profile" press="darken" style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", padding: "12px 16px", textAlign: "left" }}>
        <Avatar src={me.avatar} size={64} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 20, fontWeight: 500, color: ink }}>{me.name}</span>
          <span style={{ display: "block", fontSize: 14, color: inkVariant, marginTop: 2 }}>Hey there! I am using WhatsApp.</span>
        </span>
        <span style={{ color: "var(--wa-android-brand)", display: "flex" }}>
          <QrGlyph size={24} />
        </span>
      </PButton>
      <div style={{ height: 1, background: "var(--wa-android-divider)", marginBlock: 4 }} />
      {rows.map(([icon, label, sub]) => (
        <PButton key={label} id="whatsapp:settings-item" press="darken" style={{ display: "flex", alignItems: "center", gap: 24, width: "100%", minHeight: 68, paddingInline: 24, textAlign: "left" }}>
          <span style={{ color: inkVariant, display: "flex", flexShrink: 0 }}>{icon}</span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 16, color: ink }}>{label}</span>
            <span style={{ ...ellipsis, display: "block", fontSize: 14, color: inkVariant, marginTop: 2 }}>{sub}</span>
          </span>
        </PButton>
      ))}
      <div style={{ textAlign: "center", padding: "24px 0 16px", color: inkVariant, fontSize: 13 }}>
        from
        <div style={{ fontSize: 15, fontWeight: 600, color: ink, letterSpacing: 0.4, marginTop: 2 }}>Meta</div>
      </div>
    </Scroll>
  );
}
