"use client";

/**
 * Instagram look-alike that opens on the phone at the Direct inbox (where Michael's notification
 * lands): the inbox, Michael's DM thread (shared reels, the 290 sunrise photo, gradient outgoing
 * bubbles, the Message… composer on the shared iOS keyboard) and the Reels viewer a shared reel opens.
 * Folded: one column with push/pop. Unfolded: inbox left, thread right. Copy: lib/mock/threads.ts
 * (MICHAEL_SEED) and lib/mock/reels.ts. No Instagram logo files: glyphs are our own drawings.
 */
import { motion } from "framer-motion";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { IG, STATUS } from "@/components/lookalike/metrics";
import { usePane } from "@/components/lookalike/shared/pane";
import { ThreadFrame } from "@/components/lookalike/shared/ThreadFrame";
import { Caret, CaretKeyframes } from "@/components/ios/Caret";
import { Keyboard } from "@/components/ios/Keyboard";
import type { AppScreenProps } from "@/lib/apps/registry";
import { useMockClock } from "@/lib/mock/clock";
import { igStamp, minutesBetween } from "@/lib/mock/format";
import { person } from "@/lib/mock/people";
import { reelOrder, reels, type ReelId } from "@/lib/mock/reels";
import { COMPOSER_PLACEHOLDER, PRESENCE_LABEL, type Message } from "@/lib/mock/threads";
import { springSend, usePrefersReducedMotion } from "@/lib/motion";
import { useMessaging, type ThreadId } from "@/lib/store/messaging";
import { AppFrame, Avatar, Scroll, Split, StackView, TOP, Tap, ellipsis, useStack } from "../kit";

type Route = { kind: "inbox" } | { kind: "thread"; id: ThreadId } | { kind: "reels"; start: ReelId };

const INBOX: ThreadId[] = ["michael", "jess", "marcus", "ava", "outdoors", "dani"];
/** Instagram groups messages under one centered time stamp unless an hour passes. */
const STAMP_GAP_MIN = 60;
/** Riley's own handle (inbox header). COPY NEEDED: no handle is given for Riley in the spec. */
const MY_HANDLE = "riley";

export function InstagramApp({ display }: AppScreenProps) {
  // shared with the other display's copy, so a fold/unfold keeps the open thread or reel
  const stack = useStack<Route>("instagram", { kind: "inbox" });
  const thread = stack.routes.find((r): r is Extract<Route, { kind: "thread" }> => r.kind === "thread");
  const selected = thread?.id ?? null;
  const reel = stack.top.kind === "reels" ? stack.top.start : null;
  // the split view always shows a thread; record it so folding lands in that thread
  const { reset, routes } = stack;
  useEffect(() => {
    if (display === "inner" && !selected) reset([{ kind: "inbox" }, { kind: "thread", id: INBOX[0] }, ...routes.slice(1)]);
  }, [display, selected, reset, routes]);
  useEffect(() => {
    if (selected) useMessaging.getState().markRead(selected);
  }, [selected]);

  const open = (id: ThreadId) => {
    useMessaging.getState().markRead(id);
    if (display === "inner") stack.reset([{ kind: "inbox" }, { kind: "thread", id }]);
    else stack.push({ kind: "thread", id });
  };
  const openReel = (id: ReelId) => stack.push({ kind: "reels", start: id });
  const dark = reel !== null;

  if (display === "inner") {
    return (
      <AppFrame display={display} tone={dark ? "light" : "dark"} background="var(--ios-bg)">
        <Split
          divider="var(--ig-hairline)"
          list={<Inbox onOpen={open} selected={selected} />}
          detail={selected ? <Thread key={selected} id={selected} onReel={openReel} /> : <div />}
        />
        {reel ? (
          <div style={{ position: "absolute", inset: 0, zIndex: 30 }}>
            <Reels start={reel} onBack={stack.pop} />
          </div>
        ) : null}
      </AppFrame>
    );
  }
  return (
    <AppFrame display={display} tone={dark ? "light" : "dark"} background="var(--ios-bg)">
      <StackView
        stack={stack}
        keyOf={(r, i) => `${r.kind}-${i}`}
        render={(r) =>
          r.kind === "inbox" ? (
            <Inbox onOpen={open} selected={null} />
          ) : r.kind === "thread" ? (
            <Thread id={r.id} onBack={stack.pop} onReel={openReel} />
          ) : (
            <Reels start={r.start} onBack={stack.pop} />
          )
        }
      />
    </AppFrame>
  );
}

// ---------------------------------------------------------------------------
// Glyphs (our own drawings, Instagram's outline style: 1.8 pt strokes, rounded)
// ---------------------------------------------------------------------------

const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const Glyph = {
  back: (size = 24) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 4 7 12l8 8" {...s} strokeWidth={2.2} />
    </svg>
  ),
  edit: (size = 26) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V13" {...s} />
      <path d="M18.6 3.4a1.7 1.7 0 0 1 2.4 2.4L12.4 14.4 9 15l.6-3.4 9-8.2Z" {...s} />
    </svg>
  ),
  phone: (size = 26) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 3.5c.5-.2 1 0 1.3.4l2 3c.3.5.3 1-.1 1.4L8.5 9.7c.9 2.1 2.7 3.9 4.8 4.8l1.4-1.3c.4-.4 1-.4 1.4-.1l3 2c.4.3.6.8.4 1.3l-.7 1.8c-.4 1-1.4 1.6-2.4 1.5C10 19.1 4.9 14 4.4 7.6c-.1-1 .5-2 1.5-2.4l.7-1.7Z" {...s} />
    </svg>
  ),
  video: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.8" y="6" width="13" height="12" rx="3" {...s} />
      <path d="m15.8 10.4 5-3v9.2l-5-3" {...s} />
    </svg>
  ),
  camera: (size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8.6c0-1.1.9-2 2-2h1.6l1.2-1.8h6.4l1.2 1.8H18c1.1 0 2 .9 2 2v8.6c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8.6Z" fill="currentColor" />
      <circle cx="12" cy="12.8" r="3.4" fill="var(--ig-blue)" />
    </svg>
  ),
  mic: (size = 24) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3.2" width="6" height="11" rx="3" {...s} />
      <path d="M5.8 11.2a6.2 6.2 0 0 0 12.4 0M12 17.4v3.2" {...s} />
    </svg>
  ),
  gallery: (size = 24) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" {...s} />
      <circle cx="9" cy="9" r="1.7" {...s} />
      <path d="m4 17 4.6-4.4c.6-.6 1.5-.6 2.1 0L16 18M13.6 15.4l1.6-1.6c.6-.6 1.5-.6 2.1 0L20 16.4" {...s} />
    </svg>
  ),
  sticker: (size = 24) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 12.5V8a4.5 4.5 0 0 0-4.5-4.5H8A4.5 4.5 0 0 0 3.5 8v8A4.5 4.5 0 0 0 8 20.5h4.5l8-8Z" {...s} />
      <path d="M12.5 20.5v-4a4 4 0 0 1 4-4h4M8.5 10h.01M14.5 10h.01" {...s} strokeWidth={2.4} />
    </svg>
  ),
  heart: (size = 28, filled = false) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.3s-7.8-4.6-7.8-10.2A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 7.8 2.8c0 5.6-7.8 10.2-7.8 10.2Z" {...s} fill={filled ? "var(--ig-red)" : "none"} stroke={filled ? "var(--ig-red)" : "currentColor"} />
    </svg>
  ),
  comment: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.6 11.6a8.6 8.6 0 0 1-12.4 7.7L3.6 20.4l1.2-4.4a8.6 8.6 0 1 1 15.8-4.4Z" {...s} />
    </svg>
  ),
  share: (size = 28) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.2 3 10.4 13.4M21.2 3l-6.8 18.2-4-7.8-7.6-4.2L21.2 3Z" {...s} />
    </svg>
  ),
  more: (size = 24) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5.5" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="18.5" r="1.6" fill="currentColor" />
    </svg>
  ),
  reel: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" {...s} strokeWidth={2} />
      <path d="M3.5 8.5h17M9 3.5l3 5M15 3.5l3 5" {...s} strokeWidth={2} />
      <path d="M10.2 12.2v5l4.3-2.5-4.3-2.5Z" fill="currentColor" />
    </svg>
  ),
  chevronDown: (size = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 9 7 7 7-7" {...s} strokeWidth={2.6} />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Inbox
// ---------------------------------------------------------------------------

function Inbox({ onOpen, selected }: { onOpen: (id: ThreadId) => void; selected: ThreadId | null }) {
  const me = person("riley");
  return (
    <Scroll top={TOP} bottom={30} style={{ background: "var(--ios-bg)", color: "var(--ig-text)" }}>
      <div style={{ height: 44, display: "flex", alignItems: "center", gap: 10, paddingInline: 12 }}>
        <span style={{ display: "flex", width: 24 }}>{Glyph.back()}</span>
        <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>
          {MY_HANDLE} {Glyph.chevronDown()}
        </span>
        <Tap label="New message" style={{ display: "flex" }}>
          {Glyph.edit()}
        </Tap>
      </div>
      <div style={{ paddingInline: 16, marginTop: 6 }}>
        <div style={{ height: 36, borderRadius: 10, background: "var(--ig-dm-in)", display: "flex", alignItems: "center", gap: 8, paddingInline: 10, color: "var(--ig-muted)", fontSize: 16 }}>
          <svg width={18} height={18} viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id="ig-meta-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" style={{ stopColor: "var(--meta-ai-blue)" }} />
                <stop offset="0.5" style={{ stopColor: "var(--meta-ai-violet)" }} />
                <stop offset="1" style={{ stopColor: "var(--meta-ai-magenta)" }} />
              </linearGradient>
            </defs>
            <circle cx="10" cy="10" r="7.2" fill="none" stroke="url(#ig-meta-ring)" strokeWidth="3" />
          </svg>
          Ask Meta AI or Search
        </div>
      </div>
      {/* Notes row: Riley's own "Your note" bubble */}
      <div style={{ display: "flex", gap: 18, paddingInline: 16, paddingTop: 30, paddingBottom: 10 }}>
        <div style={{ position: "relative", width: 78, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ position: "absolute", top: -22, left: 4, background: "var(--ios-bg)", borderRadius: 14, padding: "5px 9px", fontSize: 11, color: "var(--ig-muted)", boxShadow: "0 1px 6px var(--ios-push-shadow)", whiteSpace: "nowrap" }}>Note…</span>
          <Avatar src={me.avatar} size={74} />
          <span style={{ fontSize: 12, color: "var(--ig-muted)" }}>Your note</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingInline: 16, marginTop: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>Messages</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ig-blue)" }}>Requests</span>
      </div>
      {INBOX.map((id) => (
        <InboxRow key={id} id={id} onOpen={onOpen} selected={selected === id} />
      ))}
    </Scroll>
  );
}

function InboxRow({ id, onOpen, selected }: { id: ThreadId; onOpen: (id: ThreadId) => void; selected: boolean }) {
  const t = useMessaging((st) => st.threads[id]);
  const { now } = useMockClock();
  const c = person(t.contactId);
  const last = t.messages[t.messages.length - 1];
  const unread = t.unread > 0;
  const preview = last ? (last.from === "me" ? `You: ${previewText(last)}` : previewText(last)) : "";
  return (
    <Tap onPress={() => onOpen(id)} onLongPress={() => useMessaging.getState().toggleUnread(id)} highlight="var(--ig-pressed)" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", height: 72, paddingInline: 16, background: selected ? "var(--ig-dm-in)" : undefined }}>
      <span style={{ position: "relative" }}>
        <Avatar src={c.avatar} size={56} />
        {t.presence === "active" ? <span style={{ position: "absolute", right: 1, bottom: 1, width: 14, height: 14, borderRadius: 7, background: "var(--ig-active)", border: "2.5px solid var(--ios-bg)" }} /> : null}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...ellipsis, fontSize: 15, fontWeight: unread ? 700 : 400 }}>{c.name}</div>
        <div style={{ display: "flex", gap: 4, fontSize: 14, color: unread ? "var(--ig-text)" : "var(--ig-muted)", fontWeight: unread ? 600 : 400, marginTop: 2 }}>
          <span style={{ ...ellipsis }}>{preview}</span>
          <span style={{ flexShrink: 0, fontWeight: 400, color: "var(--ig-muted)" }}>· {last ? igAge(last.at, now) : ""}</span>
        </div>
      </div>
      {unread ? <span style={{ width: 9, height: 9, borderRadius: 5, background: "var(--ig-blue)", flexShrink: 0 }} /> : null}
      <span style={{ color: "var(--ig-muted)", display: "flex" }}>
        <svg width={26} height={26} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 8.6c0-1.1.9-2 2-2h1.6l1.2-1.8h6.4l1.2 1.8H18c1.1 0 2 .9 2 2v8.6c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8.6Z" {...s} />
          <circle cx="12" cy="12.8" r="3.4" {...s} />
        </svg>
      </span>
    </Tap>
  );
}

function previewText(m: Message): string {
  if (m.kind === "reel") return "Sent a reel";
  if (m.kind === "photo") return "Sent a photo";
  return m.text ?? "";
}

/** Instagram inbox age: "now", "5m", "3h", "2d", "1w". */
function igAge(at: string, now: Parameters<typeof minutesBetween>[1]): string {
  const m = Math.max(0, minutesBetween(at, now));
  if (m < 1) return "now";
  if (m < 60) return `${Math.floor(m)}m`;
  if (m < 60 * 24) return `${Math.floor(m / 60)}h`;
  if (m < 60 * 24 * 7) return `${Math.floor(m / 1440)}d`;
  return `${Math.floor(m / 10080)}w`;
}

// ---------------------------------------------------------------------------
// Thread
// ---------------------------------------------------------------------------

/** Michael's thread on its own (the /scene/threads/michael frames). */
export function InstagramThread(props: { id: ThreadId; onBack?: () => void }) {
  return <Thread {...props} onReel={() => {}} />;
}

function Thread({ id, onBack, onReel }: { id: ThreadId; onBack?: () => void; onReel: (r: ReelId) => void }) {
  const t = useMessaging((st) => st.threads[id]);
  const fresh = useMessaging((st) => st.fresh);
  const { focus, blur, send } = useMessaging.getState();
  const { now } = useMockClock();
  const reduced = usePrefersReducedMotion();
  const pane = usePane();
  const c = person(t.contactId);
  const msgs = t.messages;
  const max = Math.min(pane.width, 560) * IG.bubbleMax;
  const lastMine = [...msgs].reverse().find((m) => m.from === "me");

  const rows: ReactNode[] = [];
  msgs.forEach((m, i) => {
    const prev = msgs[i - 1];
    const next = msgs[i + 1];
    const stamp = !prev || minutesBetween(prev.at, m.at) > STAMP_GAP_MIN;
    const nextStamp = !next || minutesBetween(m.at, next.at) > STAMP_GAP_MIN;
    const first = stamp || prev?.from !== m.from;
    const last = nextStamp || next?.from !== m.from;
    if (stamp) {
      rows.push(
        <div key={`s-${m.id}`} style={{ textAlign: "center", fontSize: IG.stampSize, color: "var(--ig-muted)", fontWeight: 600, marginTop: i === 0 ? 12 : IG.stampGap, marginBottom: 8 }}>
          {igStamp(m.at, now)}
        </div>,
      );
    }
    rows.push(
      <motion.div
        key={m.id}
        initial={fresh[m.id] && !reduced ? { y: 40, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={springSend}
        style={{ marginTop: first && !stamp ? IG.groupGap : IG.runGap }}
      >
        <Row m={m} first={first} last={last} max={max} avatar={c.avatar} onReel={onReel} />
      </motion.div>,
    );
    if (lastMine && m.id === lastMine.id && m.receipt === "seen") {
      rows.push(
        <div key="seen" style={{ textAlign: "right", paddingRight: IG.sideInset + 2, marginTop: 4, fontSize: IG.seenSize, color: "var(--ig-muted)" }}>
          Seen
        </div>,
      );
    }
  });

  return (
    <>
      <CaretKeyframes />
      <ThreadFrame
        nav={<ThreadNav name={c.name} avatar={c.avatar} active={t.presence === "active"} onBack={onBack} />}
        navHeight={STATUS.height + IG.navHeight}
        background="var(--ios-bg)"
        composer={<IgComposer draft={t.draft} focused={t.keyboard} onFocus={() => focus(id)} onSend={() => send(id)} />}
        composerHeight={IG.composer.height}
        composerBackground="var(--ios-bg)"
        keyboardOpen={t.keyboard}
        keyboard={<Keyboard threadId={id} platform="instagram" />}
        stickKey={msgs.length}
        onDismissKeyboard={() => blur(id)}
      >
        <ProfileHeader name={c.name} handle={c.handle} avatar={c.avatar} />
        <div style={{ paddingBottom: 10 }}>
          {rows.map((r, i) => (
            <Fragment key={i}>{r}</Fragment>
          ))}
        </div>
      </ThreadFrame>
    </>
  );
}

/** The profile card at the top of a DM thread (scrolls with the messages). */
function ProfileHeader({ name, handle, avatar }: { name: string; handle?: string; avatar: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 22, paddingBottom: 14 }}>
      <Avatar src={avatar} size={96} />
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{name}</div>
      {handle ? <div style={{ fontSize: 14, color: "var(--ig-muted)" }}>{handle} · Instagram</div> : null}
      <Tap style={{ marginTop: 10, height: 32, paddingInline: 16, borderRadius: 8, background: "var(--ig-dm-in)", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center" }}>View profile</Tap>
    </div>
  );
}

function ThreadNav({ name, avatar, active, onBack }: { name: string; avatar: string; active: boolean; onBack?: () => void }) {
  return (
    <div style={{ height: STATUS.height + IG.navHeight, paddingTop: STATUS.height, background: "var(--ios-bg)", boxShadow: "inset 0 calc(-1 * var(--hairline)) 0 var(--ig-hairline)", color: "var(--ig-text)" }}>
      <div style={{ height: IG.navHeight, display: "flex", alignItems: "center", gap: 10, paddingLeft: onBack ? 8 : 16, paddingRight: 16 }}>
        {onBack ? (
          <Tap label="Back" onPress={onBack} style={{ display: "flex" }}>
            {Glyph.back(26)}
          </Tap>
        ) : null}
        <span style={{ position: "relative" }}>
          <Avatar src={avatar} size={IG.avatar} />
          {active ? <span style={{ position: "absolute", right: -1, bottom: -1, width: 11, height: 11, borderRadius: 6, background: "var(--ig-active)", border: "2px solid var(--ios-bg)" }} /> : null}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...ellipsis, fontSize: IG.nameSize, fontWeight: 700 }}>{name}</div>
          {active ? <div style={{ fontSize: IG.subtitleSize, color: "var(--ig-muted)" }}>{PRESENCE_LABEL.instagram}</div> : null}
        </div>
        <span style={{ display: "flex", gap: 20 }}>
          <Tap label="Audio call" style={{ display: "flex" }}>
            {Glyph.phone()}
          </Tap>
          <Tap label="Video call" style={{ display: "flex" }}>
            {Glyph.video()}
          </Tap>
        </span>
      </div>
    </div>
  );
}

/** One message: their avatar beside the last of a run, gray in / gradient out, reels and photos. */
function Row({ m, first, last, max, avatar, onReel }: { m: Message; first: boolean; last: boolean; max: number; avatar: string; onReel: (r: ReelId) => void }) {
  const mine = m.from === "me";
  const R = IG.bubbleRadius;
  const r = IG.innerRadius;
  // runs: the sender's side gets the small inner radius between bubbles
  const radius = mine
    ? `${R}px ${first ? R : r}px ${last ? R : r}px ${R}px`
    : `${first ? R : r}px ${R}px ${R}px ${last ? R : r}px`;
  let body: ReactNode;
  if (m.kind === "reel" && m.reelId) body = <ReelCard id={m.reelId} onOpen={() => onReel(m.reelId!)} />;
  else if (m.kind === "photo" && m.imageId)
    body = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/mock/photos/${m.imageId}.svg`} alt="" width={IG.photo.width} height={IG.photo.height} style={{ display: "block", borderRadius: IG.photo.radius, objectFit: "cover" }} />
    );
  else
    body = (
      <div
        style={{
          maxWidth: max,
          padding: `${IG.bubblePadY}px ${IG.bubblePadX}px`,
          borderRadius: radius,
          background: mine ? "var(--ig-dm-out)" : "var(--ig-dm-in)",
          backgroundAttachment: "fixed",
          color: mine ? "var(--on-accent)" : "var(--ig-text)",
          fontSize: IG.bubbleText,
          lineHeight: `${IG.bubbleLine}px`,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {m.text}
      </div>
    );
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: mine ? "flex-end" : "flex-start", paddingInline: IG.sideInset, gap: IG.runAvatarGap }}>
      {!mine ? <span style={{ width: IG.runAvatar, flexShrink: 0 }}>{last ? <Avatar src={avatar} size={IG.runAvatar} /> : null}</span> : null}
      {body}
    </div>
  );
}

function ReelCard({ id, onOpen }: { id: ReelId; onOpen: () => void }) {
  const r = reels[id];
  const p = person(r.poster);
  const d = IG.reel;
  return (
    <Tap onPress={onOpen} label={`Reel by ${r.handle}`} style={{ position: "relative", width: d.width, height: d.height, borderRadius: d.radius, overflow: "hidden", background: "var(--ig-reels-bg)", color: "var(--on-accent)", display: "block" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={r.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <span style={{ position: "absolute", inset: 0, background: "var(--ig-reel-tile-scrim)" }} />
      <span style={{ position: "absolute", left: 10, top: 10, right: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <Avatar src={p.avatar} size={d.avatar} />
        <span style={{ ...ellipsis, fontSize: d.handleSize, fontWeight: 600 }}>{r.handle}</span>
      </span>
      <span style={{ position: "absolute", right: 10, bottom: 10, display: "flex" }}>{Glyph.reel(d.glyph)}</span>
      {r.caption ? <span style={{ position: "absolute", left: 10, right: 40, bottom: 10, fontSize: d.captionSize, lineHeight: "16px", ...ellipsis }}>{r.caption}</span> : null}
    </Tap>
  );
}

/** Instagram composer: blue camera circle, "Message…", mic / gallery / sticker; "Send" once typing. */
function IgComposer({ draft, focused, onFocus, onSend }: { draft: string; focused: boolean; onFocus: () => void; onSend: () => void }) {
  const c = IG.composer;
  const has = draft.length > 0;
  return (
    <div style={{ height: c.height, display: "flex", alignItems: "center", paddingInline: c.padX, background: "var(--ios-bg)" }}>
      <div
        role="textbox"
        tabIndex={-1}
        data-action="focus-composer"
        onClick={(e) => {
          e.stopPropagation();
          onFocus();
        }}
        style={{ flex: 1, minWidth: 0, height: c.field, borderRadius: c.field / 2, background: "var(--ig-dm-in)", display: "flex", alignItems: "center", gap: 10, paddingLeft: 5, paddingRight: 14, cursor: "text", color: "var(--ig-text)", outline: "none" }}
      >
        <span style={{ width: c.camera, height: c.camera, borderRadius: c.camera / 2, background: "var(--ig-blue)", color: "var(--on-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Glyph.camera(20)}</span>
        <span style={{ flex: 1, minWidth: 0, ...ellipsis, fontSize: 16, color: has ? "var(--ig-text)" : "var(--ig-muted)" }}>
          {has ? draft : null}
          {focused ? <Caret tint="var(--ig-blue)" /> : null}
          {has ? null : COMPOSER_PLACEHOLDER.instagram}
        </span>
        {has ? (
          <Tap
            label="Send"
            onPress={() => onSend()}
            style={{ color: "var(--ig-blue)", height: 32, paddingInline: 4, fontSize: c.sendSize, fontWeight: 600, display: "flex", alignItems: "center" }}
          >
            Send
          </Tap>
        ) : (
          <span style={{ display: "flex", gap: c.gap - 2 }}>
            {Glyph.mic(c.glyph)}
            {Glyph.gallery(c.glyph)}
            {Glyph.sticker(c.glyph)}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reels viewer
// ---------------------------------------------------------------------------

function Reels({ start, onBack }: { start: ReelId; onBack: () => void }) {
  const order = [start, ...reelOrder.filter((r) => r !== start)];
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--ig-reels-bg)", color: "var(--on-accent)" }}>
      <div style={{ position: "absolute", inset: 0, overflowY: "auto", scrollSnapType: "y mandatory", scrollbarWidth: "none" }}>
        {order.map((id) => {
          const r = reels[id];
          const p = person(r.poster);
          return (
            <section key={id} style={{ position: "relative", height: "100%", scrollSnapAlign: "start", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <span style={{ position: "absolute", inset: 0, background: "var(--ig-reel-viewer-scrim)" }} />
              <div style={{ position: "absolute", right: 12, bottom: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, fontSize: 13, fontWeight: 600 }}>
                <Tap label="Like" onPress={() => setLiked((l) => ({ ...l, [id]: !l[id] }))} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  {Glyph.heart(30, !!liked[id])}
                  <span>{r.likes}</span>
                </Tap>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  {Glyph.comment(30)}
                  {r.comments}
                </span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  {Glyph.share(28)}
                  {r.shares}
                </span>
                {Glyph.more(26)}
                <span style={{ width: 28, height: 28, borderRadius: 7, border: "2px solid var(--ios-bg)", overflow: "hidden", display: "flex" }}>
                  <Avatar src={p.avatar} size={24} style={{ borderRadius: 4 }} />
                </span>
              </div>
              <div style={{ position: "absolute", left: 14, right: 70, bottom: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar src={p.avatar} size={32} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{r.handle}</span>
                  <span style={{ height: 26, paddingInline: 10, borderRadius: 7, border: "1px solid var(--ig-reel-stroke)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center" }}>Follow</span>
                </div>
                {r.caption ? <div style={{ fontSize: 14, lineHeight: "18px", marginTop: 8, ...ellipsis }}>{r.caption}</div> : null}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginTop: 8, opacity: 0.9 }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="18" r="3" fill="currentColor" />
                    <circle cx="17" cy="16" r="3" fill="currentColor" />
                  </svg>
                  <span style={ellipsis}>{r.handle} · Original audio</span>
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: TOP, height: 44, display: "flex", alignItems: "center", paddingInline: 12, gap: 10, pointerEvents: "none" }}>
        <Tap label="Back" onPress={onBack} style={{ display: "flex", pointerEvents: "auto" }}>
          {Glyph.back(28)}
        </Tap>
        <span style={{ fontSize: 22, fontWeight: 700 }}>Reels</span>
      </div>
    </div>
  );
}
