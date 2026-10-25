"use client";

/**
 * Photos (iOS 18) look-alike that opens on the phone: the library grid under the large "Photos"
 * title (Select + search), and the full-screen viewer with the date, the favorite heart and the
 * bottom toolbar. Images are our own illustrations (scripts/make-mock-photos.py -> public/mock/photos);
 * the story photos (the 290 sunrise, Mom's dal, the kitchen, the lake) sit among Riley's camera roll.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { usePane } from "@/components/lookalike/shared/pane";
import type { AppScreenProps } from "@/lib/apps/registry";
import { AppFrame, TOP, Tap, useStack } from "../kit";

type Photo = { id: string; at: string };

/**
 * The library, oldest first (the grid shows newest at the bottom, like iOS). Dates are mock
 * wall times in Riley's zone; the story photos keep their thread dates.
 */
const LIBRARY: Photo[] = [
  ["roll-09", "2026-08-02T18:40"],
  ["roll-04", "2026-08-14T20:05"],
  ["roll-07", "2026-08-21T13:12"],
  ["roll-15", "2026-08-25T09:30"],
  ["roll-02", "2026-08-29T08:44"],
  ["roll-08", "2026-09-05T22:31"],
  ["roll-05", "2026-09-07T17:02"],
  ["roll-11", "2026-09-12T23:48"],
  ["roll-14", "2026-09-14T19:20"],
  ["roll-13", "2026-09-20T19:11"],
  ["roll-10", "2026-09-24T11:03"],
  ["roll-16", "2026-09-27T15:40"],
  ["roll-01", "2026-10-01T10:15"],
  ["roll-06", "2026-10-03T20:22"],
  ["roll-17", "2026-10-05T07:58"],
  ["sunrise-290", "2026-10-09T01:07"],
  ["lake", "2026-10-11T09:52"],
  ["roll-03", "2026-10-13T22:10"],
  ["roll-12", "2026-10-15T08:31"],
  ["roll-19", "2026-10-17T16:44"],
  ["dal", "2026-10-18T13:20"],
  ["roll-18", "2026-10-19T21:15"],
  ["roll-20", "2026-10-21T18:52"],
  ["kitchen", "2026-10-23T12:18"],
].map(([id, at]) => ({ id, at }));

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const src = (id: string) => `/mock/photos/${id}.svg`;

function dateLabel(at: string): { day: string; time: string } {
  const [d, t] = at.split("T");
  const [y, mo, da] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  const h12 = ((h + 11) % 12) + 1;
  return { day: `${MONTHS[mo - 1]} ${da}, ${y}`, time: `${h12}:${String(mi).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}` };
}

export function PhotosApp({ display }: AppScreenProps) {
  // the open photo is shared with the other display's copy, so a fold/unfold keeps it open
  const stack = useStack<{ photo: number | null }>("photos", { photo: null });
  const open = stack.top.photo;
  const setOpen = (i: number | null) => stack.reset([{ photo: i }]);
  const [liked, setLiked] = useState<Record<string, boolean>>({ "sunrise-290": true });
  return (
    <AppFrame display={display} background="var(--ui-bg)">
      <Grid onOpen={setOpen} />
      <AnimatePresence>
        {open !== null ? (
          <Viewer key="viewer" index={open} setIndex={setOpen} liked={liked} setLiked={setLiked} onClose={() => setOpen(null)} />
        ) : null}
      </AnimatePresence>
    </AppFrame>
  );
}

function Grid({ onOpen }: { onOpen: (i: number) => void }) {
  const { width, display } = usePane();
  const cols = display === "inner" ? 7 : 3;
  const gap = 1.5;
  const cell = (width - gap * (cols - 1)) / cols;
  const lastDay = dateLabel(LIBRARY[LIBRARY.length - 1].at).day;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        ref={(el) => {
          // iOS opens the library scrolled to the newest photos (the bottom)
          if (el && !el.dataset.scrolled) {
            el.scrollTop = el.scrollHeight;
            el.dataset.scrolled = "1";
          }
        }}
        style={{ position: "absolute", inset: 0, overflowY: "auto", scrollbarWidth: "none", paddingTop: TOP + 96, paddingBottom: 90 }}
      >
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap }}>
          {LIBRARY.map((p, i) => (
            <Tap key={p.id} label={dateLabel(p.at).day} onPress={() => onOpen(i)} style={{ width: cell, height: cell, display: "block", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src(p.id)} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </Tap>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--ui-label-secondary)", padding: "14px 0 6px" }}>{LIBRARY.length} Photos</div>
      </div>
      {/* the frosted title area over the grid */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: TOP + 96,
          background: "var(--photos-chrome-fade)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "absolute", left: 16, right: 16, top: TOP + 6, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 0.37, lineHeight: "41px" }}>Photos</div>
          <div style={{ fontSize: 15, color: "var(--ui-label-secondary)", marginTop: 2 }}>{lastDay}</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <Tap style={{ height: 32, paddingInline: 14, borderRadius: 16, background: "var(--ui-fill-tertiary)", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center" }}>Select</Tap>
          <Tap label="Search" style={{ width: 32, height: 32, borderRadius: 16, background: "var(--ui-fill-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
              <path d="m15.5 15.5 4.5 4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </Tap>
        </div>
      </div>
      {/* Years / Months / All segmented control (iOS 18) */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", padding: 3, borderRadius: 20, background: "var(--photos-segment-bg)", backdropFilter: "var(--material-light-filter)", WebkitBackdropFilter: "var(--material-light-filter)", boxShadow: "0 2px 10px var(--ui-push-shadow)" }}>
          {["Years", "Months", "All"].map((s) => (
            <span
              key={s}
              style={{ height: 30, paddingInline: 16, borderRadius: 16, display: "flex", alignItems: "center", fontSize: 14, fontWeight: 600, background: s === "All" ? "var(--ui-bg)" : undefined, boxShadow: s === "All" ? "0 1px 4px var(--ui-push-shadow)" : undefined }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Viewer({
  index,
  setIndex,
  liked,
  setLiked,
  onClose,
}: {
  index: number;
  setIndex: (i: number) => void;
  liked: Record<string, boolean>;
  setLiked: (fn: (l: Record<string, boolean>) => Record<string, boolean>) => void;
  onClose: () => void;
}) {
  const p = LIBRARY[index];
  const d = dateLabel(p.at);
  const fav = !!liked[p.id];
  const tool = { width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ui-blue)" } as const;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ position: "absolute", inset: 0, zIndex: 20, background: "var(--ui-bg)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src(p.id)} alt="" draggable={false} style={{ position: "absolute", left: 0, right: 0, top: TOP + 44, bottom: 88, width: "100%", height: `calc(100% - ${TOP + 44 + 88}px)`, objectFit: "contain" }} />
      {/* tap the left / right third to page through, like a swipe */}
      <button type="button" aria-label="Previous photo" onClick={() => index > 0 && setIndex(index - 1)} style={{ position: "absolute", left: 0, top: TOP + 44, bottom: 88, width: "33%", background: "none", border: 0, cursor: "pointer" }} />
      <button
        type="button"
        aria-label="Next photo"
        onClick={() => index < LIBRARY.length - 1 && setIndex(index + 1)}
        style={{ position: "absolute", right: 0, top: TOP + 44, bottom: 88, width: "33%", background: "none", border: 0, cursor: "pointer" }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: TOP, height: 44, display: "flex", alignItems: "center", paddingInline: 12 }}>
        <Tap label="Back" onPress={onClose} style={{ display: "flex", color: "var(--ui-blue)", width: 60 }}>
          <svg width={12} height={21} viewBox="0 0 12 21" aria-hidden="true">
            <path d="M10 2 2 10.5 10 19" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Tap>
        <div style={{ flex: 1, textAlign: "center", lineHeight: "17px" }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{d.day}</div>
          <div style={{ fontSize: 12, color: "var(--ui-label-secondary)" }}>{d.time}</div>
        </div>
        <span style={{ width: 60, textAlign: "right", fontSize: 17, color: "var(--ui-blue)" }}>Edit</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, height: 50, display: "flex", alignItems: "center", justifyContent: "space-around", paddingInline: 10 }}>
        <Tap label="Share" style={tool}>
          <svg width={22} height={26} viewBox="0 0 22 26" aria-hidden="true">
            <path d="M11 16V2M6 6.5 11 2l5 4.5M7 10H4.5A1.5 1.5 0 0 0 3 11.5v11A1.5 1.5 0 0 0 4.5 24h13a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 17.5 10H15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Tap>
        <Tap label="Favorite" onPress={() => setLiked((l) => ({ ...l, [p.id]: !l[p.id] }))} style={tool}>
          <svg width={24} height={22} viewBox="0 0 24 22" aria-hidden="true">
            <path d="M12 20.3S2.4 14.8 2.4 7.9A5.1 5.1 0 0 1 12 5.4a5.1 5.1 0 0 1 9.6 2.5c0 6.9-9.6 12.4-9.6 12.4Z" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
          </svg>
        </Tap>
        <Tap label="Info" style={tool}>
          <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9.4" fill="none" stroke="currentColor" strokeWidth="1.9" />
            <path d="M12 10.8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="7.4" r="1.2" fill="currentColor" />
          </svg>
        </Tap>
        <Tap label="Adjust" style={tool}>
          <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            <circle cx="16" cy="7" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.9" />
            <circle cx="8" cy="17" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.9" />
          </svg>
        </Tap>
        <Tap label="Delete" style={tool}>
          <svg width={22} height={24} viewBox="0 0 22 24" aria-hidden="true">
            <path d="M2 5.5h18M8 5.5V3.4c0-.8.6-1.4 1.4-1.4h3.2c.8 0 1.4.6 1.4 1.4v2.1M4.2 5.5l1 15.2c.1 1 .9 1.8 1.9 1.8h7.8c1 0 1.8-.8 1.9-1.8l1-15.2M9 10v8M13 10v8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Tap>
      </div>
    </motion.div>
  );
}
