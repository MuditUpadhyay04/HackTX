// Un-Said, the student's side (web). Plain modules, no build step; served by the backend at /app/.
// Styled with Gurneal's design (design/). Every API call, its order and its payload are unchanged.
import { holdToTalk, startPcm, wavBlob } from "/app/audio.js";
import {
  APP_GLYPH, CHECK_SVG, CHEVRON_LEFT, CHEVRON_RIGHT, MIC_SVG, MOON_SVG, PAUSE_SVG, PLAY_SVG, PLUS_SVG,
  QUOTE_SVG, STOP_SVG, SUN_SVG, TAB_ICONS, VIDEO_SVG, appIcon, esc, fitHero, toast, wave, waveFeeder,
} from "/app/ui.js";

// ------------------------------------------------------------------ key + api

const params = new URLSearchParams(location.search);
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
if (params.get("key")) store.set("unsaid_key", params.get("key"));
if (params.has("demo")) store.set("unsaid_demo", "1");
let KEY = store.get("unsaid_key") || params.get("key") || "";
const DEMO = store.get("unsaid_demo") === "1";
const IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

class Unauthorized extends Error {}

async function api(path, { method = "GET", json, form } = {}) {
  const headers = KEY ? { "X-App-Key": KEY } : {};
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  }
  const res = await fetch(path, { method, headers, body });
  if (res.status === 401) throw new Unauthorized();
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch { /* not json */ }
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return res.json();
}

function wsUrl(path) {
  const url = new URL(path, location.href);
  url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
  if (KEY) url.searchParams.set("key", KEY);
  return url.toString();
}

// ------------------------------------------------------------------ state + routing

const S = { home: null, view: "home", params: {}, seen: new Set(), sort: null, rec: null, cleanup: null, shown: null, pile: null, picked: new Set(), talk: null };
const main = document.getElementById("view");
const $ = (sel) => main.querySelector(sel);
const TABS = ["home", "letters", "you"];

function go(view, p = {}) {
  if (S.cleanup) { S.cleanup(); S.cleanup = null; }
  closeSheet();
  // A nudge never follows you to another screen, and never sits over the safety resources.
  document.getElementById("sheet").classList.remove("show");
  S.view = view;
  S.params = p;
  window.scrollTo(0, 0);
  render();
}

function render() {
  const views = {
    home: renderHome, letters: renderLetters, letter: renderLetter, you: renderYou,
    memory: renderMemory, sorted: renderSorted, hold: renderHold, stack: renderStack, preview: renderPreview,
    safety: renderSafety, note: renderNote, demo: renderDemo, key: renderKey,
  };
  (views[S.view] || renderHome)();
  renderTabs();
  S.shown = S.view;
}

// Entrance motion only when a screen first appears, not on the 4-second refresh.
const fx = (delay = "") => (S.shown === S.view ? "" : `fade-in ${delay}`);

async function refresh() {
  try {
    S.home = await api("/api/home");
  } catch (err) {
    if (err instanceof Unauthorized) return go("key");
    throw err;
  }
  showNudge();
  if (TABS.includes(S.view)) render();
}

setInterval(() => {
  if (!document.hidden && !S.rec && S.view !== "key") refresh().catch(() => {});
}, 4000);

main.addEventListener("click", (e) => {
  const target = e.target.closest("[data-go]");
  if (target) go(target.dataset.go, { ...target.dataset });
});

// ------------------------------------------------------------------ tab bar (Home · Letters · You)

function renderTabs() {
  const bar = document.getElementById("tabbar");
  const on = TABS.includes(S.view);
  bar.classList.toggle("hidden", !on);
  main.classList.toggle("with-tabs", on);
  document.body.classList.toggle("tabs", on);
  if (!on) return;
  const label = { home: "Home", letters: "Letters", you: "You" };
  bar.innerHTML = `<div class="inner">${TABS.map((t) => `
    <button class="tab ${S.view === t ? "active" : ""}" data-tab="${t}">${TAB_ICONS[t][S.view === t ? 0 : 1]}<span>${label[t]}</span></button>`).join("")}</div>`;
}

document.getElementById("tabbar").addEventListener("click", (e) => {
  const tab = e.target.closest("[data-tab]");
  if (tab && tab.dataset.tab !== S.view) go(tab.dataset.tab);
});

// ------------------------------------------------------------------ helpers

const person = (id) => S.home.people.find((p) => p.id === id) || (S.home.me.id === id ? S.home.me : null);
const SUBJECT = { her: "she", him: "he", them: "they" };
const POSSESSIVE = { her: "her", him: "his", them: "their" };
const CHANNEL = { whatsapp: "WhatsApp", imessage: "Messages", instagram: "Instagram" };
const OPEN_IN = { whatsapp: "Open WhatsApp", imessage: "Open Messages", instagram: "Open Instagram" };
const GLYPH_FOR = { whatsapp: APP_GLYPH.whatsapp, imessage: APP_GLYPH.messages, instagram: APP_GLYPH.instagram };
const HANDOFF_ID = { whatsapp: "handoff-whatsapp", imessage: "unsend-share-sms", instagram: "handoff-instagram" };

const initial = (name) => esc((name || "?").trim().charAt(0).toUpperCase());
function avatar(name, size = "", ring = false) {
  const a = `<span class="avatar ${size}">${initial(name)}</span>`;
  return ring ? `<span class="ring"><span class="gap">${a}</span></span>` : a;
}
function nav(title = "", back = "home", { label = "", trail = "", data = "" } = {}) {
  return `<nav class="nav">
    <button class="back" data-go="${back}" ${data} aria-label="back">${CHEVRON_LEFT}${label ? `<span>${esc(label)}</span>` : ""}</button>
    <span class="title t-nav">${esc(title)}</span>
    <span class="trail">${trail}</span>
  </nav>`;
}
const timeChip = (p) =>
  `<span class="chip time-chip" data-feature-id="recipient-timezone-set">${p.is_asleep ? MOON_SVG : SUN_SVG}${esc(p.local_time)} for ${esc(p.name)}</span>`;

function morningLabel(p) {
  const [h, m] = p.morning.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

// When a letter came: "6:40 PM" today, else the server's own day phrase ("yesterday", "on tuesday").
function arrivedLabel(r) {
  if (r.day !== "today") return r.day;
  return new Date(r.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: S.home.me.timezone });
}

function dateLabel(iso) {
  const tz = S.home.me.timezone;
  const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tz });
  return fmt(iso) === fmt(S.home.clock.now) ? "tonight" : fmt(iso).toLowerCase();
}

/** The lavender letter card (letters only): his words, verbatim, and a signature. */
function letterHTML(lines, signature, { extra = "", compact = false, underline = false, cls = "", meta = "" } = {}) {
  const [first, ...rest] = lines;
  let hero = esc(first || "");
  const words = (first || "").split(" ");
  if (underline && words.length > 2) {
    hero = `${esc(words.slice(0, -2).join(" "))} <span class="uline">${esc(words.slice(-2).join(" "))}</span>`;
  }
  return `<article class="letter pad-card ${compact ? "compact" : ""} ${cls}">
    <span class="quote">${QUOTE_SVG}</span>
    <p class="t-overline">For you</p>
    ${first ? `<p class="hero-line">${hero}</p>` : ""}
    ${rest.map((text) => `<p class="body-line">${esc(text)}</p>`).join("")}
    ${extra}
    <p class="sig">${esc(signature)}${meta ? ` <span class="t-meta">· ${esc(meta)}</span>` : ""}</p>
  </article>`;
}
const fitHeroes = () => main.querySelectorAll(".hero-line").forEach(fitHero);

const listenRow = (url, id) => `
  <div class="listen" data-feature-id="unsend-play">
    <button class="play" aria-label="listen">${PLAY_SVG}</button>
    <span class="t-name">listen</span>
    ${wave(id, 20)}
    <audio src="${esc(url)}" preload="auto"></audio>
  </div>`;

const RESTING = [6, 10, 14, 8, 18, 12, 20, 10, 16, 8, 12, 18, 10, 14, 6, 10, 16, 8, 12, 6];

function wirePlayer(root, onFirstPlay) {
  const audio = root.querySelector("audio");
  const btn = root.querySelector(".play");
  const waveEl = root.querySelector(".wave");
  if (!audio || !btn) return null;
  let timer = 0;
  let played = false;
  const bars = waveEl ? [...waveEl.querySelectorAll("i")] : [];
  const rest = () => bars.forEach((b, i) => (b.style.height = `${RESTING[i % RESTING.length]}px`));
  const animate = () => {
    bars.forEach((b) => (b.style.height = `${4 + Math.round(Math.random() * 20)}px`));
    timer = setTimeout(animate, 120);
  };
  rest();
  btn.onclick = () => (audio.paused ? audio.play() : audio.pause());
  audio.onplay = () => {
    btn.innerHTML = PAUSE_SVG;
    waveEl && waveEl.classList.add("on");
    animate();
    if (!played) { played = true; onFirstPlay && onFirstPlay(); }
  };
  audio.onpause = audio.onended = () => {
    btn.innerHTML = PLAY_SVG;
    waveEl && waveEl.classList.remove("on");
    clearTimeout(timer);
    rest();
  };
  return audio;
}

async function shareCard(card) {
  const s = card.share || {};
  const link = s.whatsapp || (IS_IOS ? s.sms_ios : s.sms_android) || s.instagram || s.url;
  await api(`/api/cards/${card.id}/shared`, { method: "POST" });
  location.href = link;
}

// ------------------------------------------------------------------ sheets (bottom sheet, action sheet)

function openSheet(html, onMount) {
  closeSheet();
  const backdrop = document.createElement("div");
  backdrop.className = "backdrop";
  backdrop.id = "backdrop";
  const sheet = document.createElement("div");
  sheet.className = "bottom-sheet";
  sheet.id = "bottomSheet";
  sheet.innerHTML = `<div class="grabber"></div>${html}`;
  document.body.append(backdrop, sheet);
  requestAnimationFrame(() => {
    backdrop.classList.add("show");
    sheet.classList.add("show");
  });
  backdrop.onclick = closeSheet;
  if (onMount) onMount(sheet);
}

function closeSheet() {
  document.getElementById("backdrop")?.remove();
  document.getElementById("bottomSheet")?.remove();
}

// ------------------------------------------------------------------ the knock (notification banner)

function showNudge() {
  const sheet = document.getElementById("sheet");
  if (!S.home || S.rec || ["note", "key", "safety"].includes(S.view) || sheet.classList.contains("show")) return;
  const n = S.home.nudges.find((x) => !S.seen.has(x.kind + x.id));
  if (!n) return;
  S.seen.add(n.kind + n.id);
  sheet.innerHTML = `${appIcon(38)}<div class="grow">
      <p class="t-meta">Un-Said</p>
      <p class="t-name mt-4">${esc(n.title)}</p>
      <p class="t-preview">${esc(n.body)}</p>
    </div>`;
  requestAnimationFrame(() => sheet.classList.add("show"));
  const hide = setTimeout(() => sheet.classList.remove("show"), 9000);
  sheet.onclick = () => {
    clearTimeout(hide);
    sheet.classList.remove("show");
    if (n.kind === "reply") {
      const photo = S.home.photos.find((ph) => ph.person_id === n.person_id);
      go("memory", { photo: photo ? photo.id : "", person: n.person_id, autoplay: n.reply.id });
    } else if (n.kind === "ready") {
      shareCard(n.card).catch((e) => toast(e.message));
    }
  };
}

// ------------------------------------------------------------------ Home (tab)

function renderHome() {
  const h = S.home;
  if (!h) return;
  const order = Object.fromEntries(h.people.map((p, i) => [p.id, i]));
  const photos = [...h.photos].sort((a, b) => (order[a.person_id] ?? 9) - (order[b.person_id] ?? 9));
  const held = h.cards.filter((c) => c.status === "held");
  const mock = Object.values(h.providers).includes("mock");
  main.innerHTML = `
    <header class="header">
      <span class="t-wordmark">Un-Said</span>
      <div class="flex">
        ${mock ? `<span class="chip" title="no MODEL_API_KEY: transcripts and sorting are mocked">mock ai</span>` : ""}
        ${DEMO ? `<button class="text-btn" data-go="demo">demo</button>` : ""}
        <button data-go="you" aria-label="You">${avatar(h.me.name)}</button>
      </div>
    </header>
    <h1 class="t-display pad-text mt-16 ${fx()}">Some words take a little longer.</h1>
    <button class="hero pad-card mt-24 ${fx("d1")}" data-go="memory" data-feature-id="draft-new">
      <span class="quote">${QUOTE_SVG}</span>
      <span class="t-card-title">What have you been meaning to say?</span>
      <span class="plus">${PLUS_SVG}</span>
    </button>

    <h2 class="t-section pad-text mt-24">Your people</h2>
    <div class="pad-card stack-8 mt-8 ${fx("d2")}">
      ${h.people.map((p) => `
        <button class="row" data-go="stack" data-person="${p.id}" data-feature-id="pile-open">
          ${avatar(p.name)}
          <div class="grow"><p class="t-name">${esc(p.name)}</p><p class="t-preview">${esc(p.time_label)}</p></div>
          ${CHEVRON_RIGHT}
        </button>`).join("")}
    </div>

    ${photos.length ? `
      <h2 class="t-section pad-text mt-24">your lane</h2>
      <div class="lane mt-8">
        ${photos.map((ph) => `
          <button class="tile" data-go="memory" data-photo="${ph.id}" data-person="${ph.person_id}">
            <img src="${esc(ph.url)}" alt="" loading="lazy" />
            <p class="t-caption">${esc(ph.caption)}</p>
          </button>`).join("")}
      </div>` : ""}
    <div class="pad-text"><button class="text-btn" id="addPhotoOpen">+ add a photo</button></div>

    <div class="pad-card stack-8 mt-16">
      <button class="row" data-go="memory">
        <span class="mic-dot">${MIC_SVG}</span>
        <div class="grow"><p class="t-name">Say it out loud</p><p class="t-preview">Only you can hear this.</p></div>
      </button>
      ${held.map((c) => `
        <div class="strip">
          ${avatar(c.recipient_name, "s32")}
          <div class="grow"><p class="t-name">${esc(c.recipient_name)}</p><p class="t-meta c-violet">arrives ${esc(c.release_label || "")}</p></div>
          <button class="text-btn quiet" data-revoke="${c.id}" data-feature-id="pending-unsend-cancel">Cancel</button>
          <span class="progress"></span>
        </div>`).join("")}
      ${h.reminders.map((r) => `
        <div class="card">
          <div class="flex">
            ${avatar(r.person_name)}
            <div class="grow"><p class="t-name">${esc(r.person_name)} · waiting on you</p><p class="t-preview">${esc(r.text)}</p></div>
          </div>
          ${r.handoff ? `<button class="outline-pill mt-16" data-handoff="${r.id}" data-feature-id="${HANDOFF_ID[r.channel] || "handoff-instagram"}">${GLYPH_FOR[r.channel] || ""}${esc(OPEN_IN[r.channel] || "Open")}</button>` : ""}
        </div>`).join("")}
      <button class="row slim" data-go="note">
        <span class="glyph-dot">${VIDEO_SVG}</span>
        <div class="grow"><p class="t-name">for the next hard day</p><p class="t-preview">${h.self_notes.length ? `${h.self_notes.length} note${h.self_notes.length > 1 ? "s" : ""} to yourself` : "leave yourself a note"}</p></div>
        ${CHEVRON_RIGHT}
      </button>
    </div>`;

  main.querySelectorAll("[data-revoke]").forEach((b) => (b.onclick = async () => {
    await api(`/api/cards/${b.dataset.revoke}/revoke`, { method: "POST" });
    toast("Kept as a draft.");
    refresh();
  }));
  main.querySelectorAll("[data-handoff]").forEach((b) => (b.onclick = async () => {
    const r = h.reminders.find((x) => x.id === b.dataset.handoff);
    await api(`/api/reminders/${r.id}/done`, { method: "POST" });
    location.href = r.handoff;
  }));
  $("#addPhotoOpen").onclick = () => openAddPhoto(h);
}

function openAddPhoto(h) {
  openSheet(`
    <form id="addPhoto">
      <p class="t-section">+ add a photo</p>
      <div class="field"><label>who's in it</label><select class="input" name="person_id">${h.people.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div>
      <div class="field"><label>caption</label><input class="input" name="caption" placeholder="kitchen, with mom" maxlength="120" /></div>
      <div class="field"><input class="input" name="file" type="file" accept="image/jpeg,image/png,image/webp" required /></div>
      <button class="pill mt-24">add to the lane</button>
    </form>`, (sheet) => {
    const form = sheet.querySelector("#addPhoto");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      try {
        await api("/api/photos", { method: "POST", form: data });
        toast("added to your lane");
        closeSheet();
        refresh();
      } catch (err) {
        toast(err.message);
      }
    };
  });
}

// ------------------------------------------------------------------ Letters (tab) and a received letter

function renderLetters() {
  const replies = S.home ? S.home.replies : [];
  const senders = replies.filter((r, i) => replies.findIndex((x) => x.from_person_id === r.from_person_id) === i); // newest per sender
  main.innerHTML = `
    <h1 class="t-display pad-text mt-16">Letters</h1>
    ${senders.length ? `
      <div class="rings mt-24">
        ${senders.map((r) => `
          <button class="who" data-go="letter" data-id="${r.id}">${avatar(r.from_name, "s56", !r.heard_at)}<span class="t-meta">${esc(r.from_name)}</span></button>`).join("")}
      </div>` : ""}
    <div class="pad-card stack-8 mt-24 ${fx()}">
      ${replies.map((r) => `
        <button class="row" data-go="letter" data-id="${r.id}" data-feature-id="letter-open">
          ${avatar(r.from_name, "", !r.heard_at)}
          <div class="grow"><p class="t-name">${esc(r.from_name)}</p><p class="t-preview">${r.audio_url ? "voice reply" : esc(r.transcript)}</p></div>
          <span class="t-meta">${esc(arrivedLabel(r))}</span>
        </button>`).join("")}
    </div>`;
}

function renderLetter() {
  const reply = S.home.replies.find((r) => r.id === S.params.id);
  if (!reply) return go("letters");
  main.innerHTML = `
    ${nav(`From ${reply.from_name}`, "letters")}
    <div class="mt-16 ${fx()}">
      ${letterHTML(reply.audio_url ? [] : [reply.transcript], reply.from_name, {
        extra: reply.audio_url ? listenRow(reply.audio_url, "lw") : "",
        underline: !reply.audio_url,
        cls: "letter-received",
      })}
    </div>
    <p class="t-caption center mt-16">Take your time.</p>
    <div class="pad-card mt-16"><button class="outline-pill" data-go="memory" data-person="${reply.from_person_id}" data-feature-id="letter-write-back">Write back</button></div>
    <p class="t-caption center mt-24 c-text-4">about this letter · arrived ${esc(arrivedLabel(reply))}</p>`;
  fitHeroes();
  // Mark replies heard exactly as the Talk screen does.
  wirePlayer(main, () => {
    if (!reply.heard_at) api(`/api/replies/${reply.id}/heard`, { method: "POST" }).catch(() => {});
  });
  if (!reply.audio_url && !reply.heard_at) api(`/api/replies/${reply.id}/heard`, { method: "POST" }).catch(() => {});
}

// ------------------------------------------------------------------ You (tab)

function renderYou() {
  const me = S.home.me;
  main.innerHTML = `
    <div class="pad-text mt-24 ${fx()}">
      ${avatar(me.name, "s72")}
      <h1 class="t-display mt-12">${esc(me.name)}</h1>
    </div>
    <div class="pad-card stack-8 mt-24">
      <button class="row slim" data-go="note"><p class="t-name grow">Notes to yourself</p>${CHEVRON_RIGHT}</button>
      <button class="row slim" data-go="safety" data-from="you"><p class="t-name grow">Safety and support</p>${CHEVRON_RIGHT}</button>
      ${DEMO ? `<button class="row slim" data-go="demo"><p class="t-name grow">Settings</p>${CHEVRON_RIGHT}</button>` : ""}
    </div>
    <p class="t-caption pad-text mt-32 c-text-4">powered by Meta AI</p>`;
}

// ------------------------------------------------------------------ Talk: "Say it out loud"

function renderMemory() {
  const h = S.home;
  const photo = h.photos.find((ph) => ph.id === S.params.photo);
  const p = S.params.person || photo ? person(S.params.person || photo.person_id) : null;
  const reply = p ? h.replies.find((r) => r.from_person_id === p.id) : null;
  main.innerHTML = `
    ${nav("Say it out loud")}
    ${photo ? `<img class="photo pad-card mt-8 ${fx()}" src="${esc(photo.url)}" alt="" />` : ""}
    ${p ? `<div class="pad-card mt-16">${timeChip(p)}</div>` : ""}
    ${reply ? `<div class="mt-16 ${fx("d1")}" id="reply">
      ${letterHTML([], reply.from_name, {
        compact: true,
        meta: reply.day,
        extra: `${reply.audio_url ? listenRow(reply.audio_url, "rw") : ""}
          ${reply.transcript ? `<p class="body-line heavy">${esc(reply.transcript)}</p>` : ""}
          ${reply.translation ? `<p class="t-caption on-letter mt-8">${esc(reply.translation)}</p>` : ""}`,
      })}
    </div>` : ""}
    <section class="pad-text mt-24" id="talkText">
      <p class="t-overline">Only you can hear this</p>
      <p class="t-compose mt-16" id="transcript"><span class="caret"></span></p>
      <p class="t-caption mt-16" id="quiet">Nothing leaves without you.</p>
    </section>
    <form id="typed" class="hidden mt-24">
      <div class="pad-text"><textarea class="compose-field" name="text" rows="5" placeholder="say it here." required></textarea></div>
      <div class="pad-card mt-24"><button class="pill">done</button></div>
    </form>
    <div class="dock" id="micWrap">
      ${wave("lw", 24)}
      <button class="mic" id="mic" aria-label="Tap to talk" data-feature-id="rant-record">${MIC_SVG}</button>
      <p class="t-caption" id="micLabel">Tap to talk</p>
      <div class="flex gap-24">
        <button class="text-btn" id="typeInstead" data-feature-id="rant-type">Type instead</button>
        <button class="text-btn" id="startOver" data-feature-id="rant-discard">Start over</button>
      </div>
    </div>`;

  if (reply) {
    const audio = wirePlayer($("#reply"), () => {
      if (!reply.heard_at) api(`/api/replies/${reply.id}/heard`, { method: "POST" }).catch(() => {});
    });
    if (!reply.audio_url && !reply.heard_at) api(`/api/replies/${reply.id}/heard`, { method: "POST" }).catch(() => {});
    if (audio && S.params.autoplay === reply.id) audio.play().catch(() => {});
  }
  wireRant(p, photo);
  $("#typeInstead").onclick = () => {
    $("#typed").classList.remove("hidden");
    $("#micWrap").classList.add("hidden");
    $("#talkText").classList.add("hidden");
    main.classList.remove("has-dock");
    $("#typed textarea").focus();
  };
  $("#startOver").onclick = startOver;
  $("#typed").onsubmit = async (e) => {
    e.preventDefault();
    const text = new FormData(e.target).get("text");
    try {
      afterRant(await api("/api/rants/text", { method: "POST", json: { text } }), photo);
    } catch (err) {
      toast(err.message);
    }
  };
}

function setMic(state) {
  const mic = $("#mic");
  const label = $("#micLabel");
  const waveEl = $("#lw");
  if (!mic) return;
  const live = state === "live";
  mic.classList.toggle("live", live);
  mic.innerHTML = live ? STOP_SVG : MIC_SVG;
  mic.dataset.featureId = live ? "rant-stop" : "rant-record";
  mic.setAttribute("aria-label", live ? "Tap to stop" : "Tap to talk");
  waveEl && waveEl.classList.toggle("on", live);
  label.textContent = { live: "Tap to stop", sorting: "sorting it by person…", blocked: "the microphone isn't available here" }[state] || "Tap to talk";
}

function wireRant(p, photo) {
  const mic = $("#mic");
  const box = $("#transcript");
  const quiet = $("#quiet");
  const feed = waveFeeder($("#lw"));
  let finished = [];
  let live = "";
  const paint = () => {
    box.innerHTML = `${esc(finished.join(" "))} <span class="c-text-2">${esc(live)}</span><span class="caret"></span>`;
    box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  main.classList.add("has-dock");
  S.cleanup = () => main.classList.remove("recording", "has-dock");

  S.talk = holdToTalk(mic, {
    onStart() {
      main.classList.add("recording");
      setMic("live");
      finished = [];
      live = "";
      const rec = (S.rec = { ws: null, ready: false, queue: [], pcm: null, chunks: null, stopped: false, failed: false, finished: false });
      try {
        rec.ws = new WebSocket(wsUrl("/api/rants/live"));
        rec.ws.binaryType = "arraybuffer";
        rec.ws.onopen = () => rec.ws.send(JSON.stringify({ type: "start" }));
        rec.ws.onmessage = (e) => {
          const ev = JSON.parse(e.data);
          if (ev.type === "ready") {
            rec.ready = true;
            rec.queue.forEach((b) => rec.ws.send(b));
            rec.queue = [];
          } else if (ev.type === "partial") {
            live = ev.text;
            paint();
          } else if (ev.type === "turn") {
            finished.push(ev.text);
            live = "";
            paint();
          } else if (ev.type === "done") {
            rec.finished = true;
            S.rec = null;
            afterRant(ev.rant, photo);
          } else if (ev.type === "error") {
            rec.failed = true;
            fallback(rec, photo);
          }
        };
        rec.ws.onclose = () => {
          if (!rec.finished) {
            rec.failed = true;
            fallback(rec, photo);
          }
        };
      } catch {
        rec.failed = true;
      }
      rec.starting = startPcm({
        onChunk: (bytes) => {
          if (rec.ready && rec.ws && rec.ws.readyState === WebSocket.OPEN) rec.ws.send(bytes);
          else rec.queue.push(bytes);
        },
        onLevel: feed,
      }).then((r) => (rec.pcm = r)).catch((err) => {
        setMic("blocked");
        toast(err.message || "microphone blocked");
        rec.finished = true;
        S.rec = null;
        rec.ws && rec.ws.close();
      });
    },
    async onStop() {
      const rec = S.rec;
      if (!rec) return;
      setMic("sorting");
      quiet.classList.add("hidden");
      await rec.starting;
      if (!rec.pcm) return;
      rec.chunks = await rec.pcm.stop();
      rec.stopped = true;
      if (!rec.failed && rec.ready && rec.ws.readyState === WebSocket.OPEN) {
        rec.ws.send(JSON.stringify({ type: "stop" }));
        setTimeout(() => {
          if (!rec.finished) { rec.failed = true; fallback(rec, photo); }
        }, 30000);
      } else {
        fallback(rec, photo);
      }
    },
  });
}

// "Start over": an action sheet, then the recording is gone without a trace.
function startOver() {
  openSheet(`
    <button class="sheet-action danger" id="deleteRecording">Delete recording</button>
    <button class="sheet-action" id="keepRecording">Cancel</button>`, (sheet) => {
    sheet.querySelector("#keepRecording").onclick = closeSheet;
    sheet.querySelector("#deleteRecording").onclick = async () => {
      closeSheet();
      const rec = S.rec;
      if (rec) {
        rec.finished = true; // the socket closing now must not trigger the upload fallback
        S.rec = null;
        try { rec.ws && rec.ws.close(); } catch { /* already closed */ }
        await rec.starting;
        if (rec.pcm) await rec.pcm.stop();
      }
      if (S.talk) S.talk.reset();
      main.classList.remove("recording");
      setMic("idle");
      const box = $("#transcript");
      if (box) box.innerHTML = '<span class="caret"></span>';
      $("#quiet") && $("#quiet").classList.remove("hidden");
      const field = $("#typed textarea");
      if (field) field.value = "";
    };
  });
}

// The live socket failed: upload the WAV we kept and transcribe it as a file.
async function fallback(rec, photo) {
  if (!rec.stopped || rec.finished || rec.uploading) return;
  rec.uploading = true;
  rec.finished = true;
  S.rec = null;
  try {
    const form = new FormData();
    form.append("file", wavBlob(rec.chunks), "rant.wav");
    afterRant(await api("/api/rants/audio", { method: "POST", form }), photo);
  } catch (err) {
    toast(`couldn't hear that: ${err.message}`);
    main.classList.remove("recording");
    setMic("idle");
  }
}

async function afterRant(rant, photo) {
  S.sort = null;
  S.sortPhoto = photo ? photo.id : null; // the photo he was looking at goes on the card
  go("sorted", { rant: rant.id });
  try {
    S.sort = await api(`/api/rants/${rant.id}/sort`, { method: "POST" });
  } catch (err) {
    toast(err.message);
    return;
  }
  if (S.view === "sorted") go(S.sort.safety === "ok" ? "sorted" : "safety", S.params);
}

// ------------------------------------------------------------------ Split: "Here's who that was for."

function renderSorted() {
  const r = S.sort;
  if (!r) {
    main.innerHTML = `
      ${nav("Say it out loud")}
      <div class="pad-card stack-8 mt-24">
        <div class="skeleton" style="height:148px"></div>
        <div class="skeleton" style="height:148px"></div>
        <div class="skeleton" style="height:120px"></div>
      </div>`;
    return;
  }
  if (r.safety !== "ok") return renderSafety();
  const by = r.rant.sorted_by === "meta" ? "muse spark" : "mock sorter";
  main.innerHTML = `
    ${nav("Say it out loud")}
    ${r.self_note ? `
      <div class="card big pad-card mt-8 card-in">
        <p class="t-overline">For you, later</p>
        <p class="t-preview mt-8">you left yourself this, for a night like this.</p>
        <video class="saved mt-12" src="${esc(r.self_note.url)}" playsinline controls></video>
      </div>` : ""}
    <h2 class="t-section pad-text mt-16">Here's who that was for.</h2>
    ${r.groups.length ? "" : `<p class="t-preview pad-text mt-16">nothing in that was about anyone yet. it's kept, just for you.</p>`}
    <div class="pad-card stack-8 mt-16">
      ${r.groups.map((g, i) => {
        const shown = g.pieces.slice(0, 3);
        const more = g.kept_total - shown.length;
        return `
        <button class="person-card card-in" style="animation-delay:${i * 120}ms" data-person-card="${g.person.id}" data-feature-id="pile-open">
          <div class="flex">
            ${avatar(g.person.name, "", true)}
            <p class="t-name grow">${esc(g.person.name)}</p>
            <span class="chip">${esc(g.tone)}</span>
            ${CHEVRON_RIGHT}
          </div>
          <div class="stack-8 mt-12">${shown.map((pc) => `<p class="t-words c-text-2">“${esc(pc.text)}”</p>`).join("")}</div>
          ${more > 0 ? `<p class="t-meta mt-8">+${more} more</p>` : ""}
        </button>`;
      }).join("")}
    </div>
    <div class="centered mt-24"><button class="text-btn" id="keepPrivate" data-feature-id="rant-save-private">Keep it just for me</button></div>
    <details class="pad-text mt-24">
      <summary class="t-caption">what was heard</summary>
      <p class="t-caption mt-8">${esc(r.rant.transcript)}</p>
      <p class="t-meta mt-8 flex gap-8">${CHECK_SVG}<span>safe to hold · sorted by ${by}</span></p>
    </details>`;
  main.querySelectorAll("[data-person-card]").forEach((el) => (el.onclick = () => {
    const g = r.groups.find((x) => x.person.id === el.dataset.personCard);
    go(g.person.channel === "whatsapp" ? "hold" : "stack", { person: g.person.id });
  }));
  $("#keepPrivate").onclick = () => {
    toast("Saved. Only you can see it.");
    go("home");
  };
}

// ------------------------------------------------------------------ Mom's preview: "Hold until her morning"

function renderHold() {
  const g = S.sort.groups.find((x) => x.person.id === S.params.person);
  const p = person(g.person.id);
  const pos = POSSESSIVE[p.pronoun] || "their";
  let when = p.is_asleep ? "her_morning" : "now";
  main.innerHTML = `
    ${nav(`To ${p.name}`, "sorted", { label: "Edit" })}
    <div class="mt-16 ${fx()}">${letterHTML(g.pieces.map((pc) => pc.text), S.home.me.name)}</div>
    <p class="t-caption center mt-16">This is how ${esc(p.name)} will see it.</p>
    <div class="card pad-card mt-24" id="delivery">
      <p class="t-name">${esc(p.name)}'s morning</p>
      <p class="t-preview">Arrives ${morningLabel(p)} ${pos} time</p>
      <div class="mt-8">
        <button class="choice" data-when="her_morning" data-feature-id="unsend-hold-until-morning"><span class="dot"></span>Hold until ${pos} morning</button>
        <button class="choice" data-when="now"><span class="dot"></span>Send now</button>
      </div>
    </div>
    <div class="pad-card mt-24" id="sendWrap"><button class="pill" id="send" data-feature-id="unsend-queue-send">Send when they're ready</button></div>
    <div class="centered mt-8" id="editWrap"><button class="text-btn" data-go="sorted">Keep editing</button></div>`;
  fitHeroes();
  const choices = [...main.querySelectorAll(".choice")];
  const mark = () => choices.forEach((c) => c.classList.toggle("on", c.dataset.when === when));
  choices.forEach((c) => (c.onclick = () => { when = c.dataset.when; mark(); }));
  mark();
  $("#send").onclick = async () => {
    $("#send").disabled = true;
    let card;
    try {
      card = await api("/api/cards", {
        method: "POST",
        json: { recipient_id: p.id, piece_ids: g.pieces.map((pc) => pc.id), photo_id: S.sortPhoto || null, when },
      });
    } catch (err) {
      $("#send").disabled = false;
      return toast(err.message);
    }
    if (card.status === "held") {
      $("#delivery").remove();
      $("#editWrap").remove();
      $("#sendWrap").outerHTML = `
        <div class="pad-text mt-24 plain-fade">
          <p class="t-name">Held for ${esc(p.name)}'s morning.</p>
          <span class="chip time-chip mt-8">${MOON_SVG}arrives ${esc(card.release_label || "")}</span>
        </div>`;
      setTimeout(() => { if (S.view === "hold") { refresh(); go("home"); } }, 2200);
    } else if (card.status === "released") {
      toast(`sent to ${p.name} on whatsapp`);
      refresh();
      go("home");
    } else {
      shareCard(card).catch((e) => toast(e.message));
    }
  };
}

// ------------------------------------------------------------------ Pile: "For Sarah", his own lines

async function renderStack() {
  const p = person(S.params.person);
  const backTo = S.sort ? "sorted" : "home";
  main.innerHTML = `
    ${nav(`For ${p.name}`, backTo)}
    <div class="pad-card stack-8 mt-16"><div class="skeleton" style="height:88px"></div><div class="skeleton" style="height:64px"></div></div>`;
  const pieces = await api(`/api/people/${p.id}/pieces`);
  if (S.view !== "stack") return;
  if (!S.pile || S.pile.personId !== p.id) S.picked = new Set(); // nothing is picked for you
  S.pile = { personId: p.id, pieces };
  const subj = SUBJECT[p.pronoun || "them"] || "they";
  main.innerHTML = `
    ${nav(`For ${p.name}`, backTo)}
    <div class="card pad-card mt-8">
      <div class="flex">
        ${avatar(p.name)}
        <div class="grow"><p class="t-name">${esc(p.name)}</p><p class="t-preview">Goes to ${esc(p.name)} on ${CHANNEL[p.channel] || "Messages"}</p></div>
      </div>
      ${p.is_asleep ? `<div class="mt-12">${timeChip(p)}</div>` : ""}
    </div>
    <p class="t-overline pad-text mt-24">In your words</p>
    <div class="mt-8 ${fx()}">
      ${pieces.map((pc) => `
        <button class="line ${S.picked.has(pc.id) ? "on" : ""}" data-id="${pc.id}" data-feature-id="pile-line-toggle" aria-pressed="${S.picked.has(pc.id)}">
          <div class="grow"><p class="t-words">${esc(pc.text)}</p><p class="t-meta mt-4">${esc(dateLabel(pc.created_at))} · ${esc(pc.tone)}</p></div>
          <span class="toggle">${S.picked.has(pc.id) ? CHECK_SVG : ""}</span>
        </button>`).join("")}
    </div>
    <p class="t-caption pad-text mt-16">nothing is picked for you. choose what ${esc(subj)} hears.</p>
    <div class="pad-card mt-24"><button class="pill" id="preview" data-feature-id="letter-preview" ${S.picked.size ? "" : "disabled"}>Preview letter</button></div>`;
  main.querySelectorAll(".line").forEach((row) => (row.onclick = () => {
    const id = row.dataset.id;
    if (S.picked.has(id)) S.picked.delete(id);
    else S.picked.add(id);
    const on = S.picked.has(id);
    row.classList.toggle("on", on);
    row.setAttribute("aria-pressed", String(on));
    row.querySelector(".toggle").innerHTML = on ? CHECK_SVG : "";
    $("#preview").disabled = S.picked.size === 0;
  }));
  $("#preview").onclick = () => go("preview", { person: p.id });
}

// Preview letter: exactly what she'll see, then the same send as before.
function renderPreview() {
  const p = person(S.params.person);
  const pieces = (S.pile && S.pile.personId === p.id ? S.pile.pieces : []).filter((pc) => S.picked.has(pc.id));
  if (!pieces.length) return go("stack", { person: p.id });
  const back = `data-person="${p.id}"`;
  main.innerHTML = `
    ${nav(`To ${p.name}`, "stack", { label: "Edit", data: back })}
    <div class="mt-16 ${fx()}">${letterHTML(pieces.map((pc) => pc.text), S.home.me.name)}</div>
    <p class="t-caption center mt-16">This is how ${esc(p.name)} will see it.</p>
    <div class="pad-card mt-24"><button class="pill" id="send" data-feature-id="${HANDOFF_ID[p.channel] || "unsend-queue-send"}">Send when they're ready</button></div>
    <div class="centered mt-8"><button class="text-btn" data-go="stack" ${back}>Keep editing</button></div>`;
  fitHeroes();
  $("#send").onclick = async () => {
    const ids = pieces.map((pc) => pc.id);
    try {
      const card = await api("/api/cards", { method: "POST", json: { recipient_id: p.id, piece_ids: ids, when: "now" } });
      S.picked = new Set();
      if (card.status === "released") { toast(`sent to ${p.name}`); return go("home"); }
      await shareCard(card);
    } catch (err) {
      toast(err.message);
    }
  };
}

// ------------------------------------------------------------------ Safety: calm, no gradient

const DEFAULT_RESOURCES = [
  { name: "988 Suicide & Crisis Lifeline", detail: "Call or text 988", links: [{ label: "call 988", href: "tel:988" }, { label: "text 988", href: "sms:988" }] },
  {
    name: "National Domestic Violence Hotline",
    detail: "Call 1-800-799-7233 · Text START to 88788",
    links: [{ label: "call 1-800-799-7233", href: "tel:18007997233" }, { label: "text START to 88788", href: "sms:88788?body=START" }],
  },
  { name: "Immediate danger", detail: "Call 911", links: [{ label: "call 911", href: "tel:911" }] },
];

function hotlineId(href) {
  if (href.includes("988")) return href.includes("88788") ? "hotline-ndvh-text" : "hotline-988";
  if (href.includes("18007997233")) return "hotline-ndvh-call";
  return href.includes("911") ? "emergency-911" : "";
}

function renderSafety() {
  const concern = S.params.from !== "you" && S.sort && S.sort.safety && S.sort.safety !== "ok";
  const resources = concern && S.sort.resources.length ? S.sort.resources : DEFAULT_RESOURCES;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  main.innerHTML = `
    ${nav("", S.params.from === "you" ? "you" : "home")}
    <div class="plain-fade">
      <h1 class="t-display pad-text mt-8">You deserve to feel safe. Here's real help.</h1>
      ${concern ? `<p class="t-preview pad-text mt-16">we're not going to show memories right now.</p>` : ""}
      <div class="pad-card stack-8 mt-24">
        ${resources.map((r) => `
          <div class="safety-row">
            <p class="t-name">${esc(r.name)}</p>
            <p class="t-preview">${esc(r.detail)}</p>
            <div class="stack-8 mt-12">${r.links.map((l) => `<a class="outline-pill" href="${esc(l.href)}" data-feature-id="${hotlineId(l.href)}">${esc(cap(l.label))}</a>`).join("")}</div>
          </div>`).join("")}
      </div>
      <p class="t-caption pad-text mt-24">Un-Said isn't a crisis service. These people are.</p>
      ${concern ? `<div class="centered mt-16"><button class="text-btn" data-go="home">back home</button></div>` : ""}
    </div>`;
}

// ------------------------------------------------------------------ Self note: "For you, later"

function renderNote() {
  const notes = S.home.self_notes;
  main.innerHTML = `
    ${nav("", "home")}
    <p class="t-overline pad-text mt-8">For you, later</p>
    <video class="note pad-card mt-16" id="preview" playsinline muted autoplay></video>
    <div class="flex pad-text mt-24" id="recRow">
      <button class="rec-btn" id="rec" data-feature-id="self-note-record" aria-label="record" disabled><i></i></button>
      <span class="timer" id="timer">0:00</span>
    </div>
    <div class="hidden mt-24" id="review">
      <div class="pad-card"><button class="pill" id="save" data-feature-id="self-note-save">Save for later</button></div>
      <div class="centered mt-8"><button class="text-btn" id="retake">Retake</button></div>
    </div>
    <p class="t-caption pad-text mt-16">only you see this. it comes back the next time a night sounds like tonight.</p>
    ${notes.length ? `
      <h2 class="t-section pad-text mt-32">Notes to yourself</h2>
      <div class="pad-card stack-8 mt-12">${notes.map((n) => `<video class="saved" src="${esc(n.url)}" playsinline controls></video>`).join("")}</div>` : ""}`;

  let stream = null;
  let recorder = null;
  let parts = [];
  let blob = null;
  let started = 0;
  let tick = 0;
  const btn = $("#rec");
  const preview = $("#preview");
  const live = () => {
    preview.removeAttribute("src");
    preview.controls = false;
    preview.muted = true;
    preview.srcObject = stream;
    preview.play().catch(() => {});
  };
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true }).then((s) => {
    stream = s;
    if (S.view !== "note") return s.getTracks().forEach((t) => t.stop());
    live();
    btn.disabled = false;
  }).catch((err) => toast(err.message || "camera blocked"));
  S.cleanup = () => {
    clearInterval(tick);
    if (stream) stream.getTracks().forEach((t) => t.stop());
  };

  btn.onclick = () => {
    if (recorder && recorder.state === "recording") return recorder.stop();
    const type = ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm"].find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
    recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    parts = [];
    recorder.ondataavailable = (e) => e.data.size && parts.push(e.data);
    recorder.onstop = () => {
      clearInterval(tick);
      btn.classList.remove("on");
      blob = new Blob(parts, { type: recorder.mimeType || type || "video/webm" });
      preview.srcObject = null;
      preview.src = URL.createObjectURL(blob);
      preview.muted = false;
      preview.controls = true;
      $("#recRow").classList.add("hidden");
      $("#review").classList.remove("hidden");
    };
    recorder.start();
    btn.classList.add("on");
    started = Date.now();
    tick = setInterval(() => {
      const s = Math.floor((Date.now() - started) / 1000);
      $("#timer").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    }, 250);
  };

  $("#retake").onclick = () => {
    if (preview.src) URL.revokeObjectURL(preview.src);
    blob = null;
    $("#timer").textContent = "0:00";
    $("#review").classList.add("hidden");
    $("#recRow").classList.remove("hidden");
    live();
  };

  $("#save").onclick = async () => {
    if (!blob) return;
    const save = $("#save");
    save.disabled = true;
    const form = new FormData();
    form.append("file", blob, blob.type.includes("mp4") ? "note.mp4" : "note.webm");
    form.append("label", "for the next hard day");
    try {
      await api("/api/self-notes", { method: "POST", form });
      toast("saved. to: me");
      await refresh();
      go("note");
    } catch (err) {
      toast(err.message);
      save.disabled = false;
    }
  };
}

// ------------------------------------------------------------------ demo controls (not part of the design)

async function renderDemo() {
  main.innerHTML = `${nav("demo")}<div class="pad-card stack-8 mt-16"><div class="skeleton" style="height:120px"></div></div>`;
  const st = await api("/api/demo/state");
  if (S.view !== "demo") return;
  const latestReply = S.home.replies[0];
  main.innerHTML = `
    ${nav("demo")}
    <div class="pad-card stack-8 mt-16">
      <div class="card">
        <p class="t-name">providers</p>
        <p class="t-caption mt-4">spark: ${esc(S.home.providers.spark)} · transcribe: ${esc(S.home.providers.transcribe)} · mom's 8 AM: ${esc(S.home.providers.whatsapp)}</p>
      </div>
      <div class="card">
        <p class="t-name">clock</p>
        <p class="t-caption mt-4">you: ${esc(st.me_local.replace("T", " "))} · offset ${st.offset_minutes} min</p>
        <p class="t-caption">${st.people.filter((p) => p.channel !== "self").map((p) => esc(p.time_label)).join("<br>")}</p>
        <div class="field"><label>set your time (Austin)</label><input class="input" type="datetime-local" id="setLocal" value="2026-10-24T18:32" /></div>
        <div class="flex wrap gap-8 mt-12">
          <button class="outline-pill small" id="setClock">set</button>
          <button class="outline-pill small" id="plus3">+3 hours</button>
          <button class="outline-pill small" id="realClock">real time</button>
        </div>
      </div>
      <div class="card">
        <p class="t-name">mom's voice note</p>
        <p class="t-caption mt-4">send this link to Mom. she holds to reply; it lands as "Mom left you a voice note".</p>
        <input class="input mt-12" readonly value="${esc(st.mom_voice_note_link)}" id="momLink" />
        <div class="flex wrap gap-8 mt-12">
          <button class="outline-pill small" id="copyLink">copy</button>
          <button class="outline-pill small" id="mockReply">mock reply</button>
          ${latestReply ? `<button class="outline-pill small" id="backdate">make latest reply tuesday</button>` : ""}
        </div>
      </div>
      <div class="card">
        <p class="t-name">people</p>
        ${st.people.map((p) => `
          <form class="person-edit mt-16" data-id="${p.id}">
            <p class="t-caption">${esc(p.name)} · ${esc(p.channel)}</p>
            <div class="stack-8 mt-8">
              <input class="input" name="handle" placeholder="${p.channel === "instagram" ? "instagram username" : "phone, +country code"}" />
              <input class="input" name="timezone" value="${esc(p.timezone)}" />
            </div>
            <button class="text-btn">save ${esc(p.name)}</button>
          </form>`).join("")}
        <p class="t-caption mt-8">phone numbers aren't shown back here; ${st.people.filter((p) => p.has_handle).length} of ${st.people.length} are set.</p>
      </div>
      <div class="card">
        <p class="t-name">reset</p>
        <p class="t-caption mt-4">clears rants, cards, replies, notes. keeps people, photos, and the clock.</p>
        <div class="flex mt-12"><button class="outline-pill small" id="reset">reset activity</button></div>
      </div>
    </div>`;

  const after = async (promise, message) => {
    try {
      const out = await promise;
      if (out && out.released && out.released.length) toast(`released ${out.released.length} card(s)`);
      else if (message) toast(message);
      await refresh();
      if (S.view === "demo") renderDemo();
    } catch (err) {
      toast(err.message);
    }
  };
  $("#setClock").onclick = () => after(api("/api/demo/clock", { method: "POST", json: { set_local: $("#setLocal").value } }), "clock set");
  $("#plus3").onclick = () => after(api("/api/demo/clock", { method: "POST", json: { advance_minutes: 180 } }), "3 hours later");
  $("#realClock").onclick = () => after(api("/api/demo/clock", { method: "POST", json: { reset: true } }), "real time");
  $("#copyLink").onclick = () => navigator.clipboard.writeText($("#momLink").value).then(() => toast("copied"));
  $("#mockReply").onclick = () => after(api("/api/demo/mock-reply", { method: "POST" }), "mock reply added");
  if ($("#backdate")) $("#backdate").onclick = () => after(api(`/api/demo/replies/${latestReply.id}/backdate`, { method: "POST", json: { to_local: "2026-10-20T19:10" } }), "now it says tuesday");
  $("#reset").onclick = () => confirm("reset all activity?") && after(api("/api/demo/reset", { method: "POST" }), "reset");
  main.querySelectorAll(".person-edit").forEach((form) => (form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries([...new FormData(form)].filter(([, v]) => v));
    after(api(`/api/people/${form.dataset.id}`, { method: "PATCH", json: data }), "saved");
  }));
}

// ------------------------------------------------------------------ key prompt (not part of the design)

function renderKey() {
  main.innerHTML = `
    <header class="header"><span class="t-wordmark">Un-Said</span></header>
    <form class="card pad-card mt-32" id="keyForm">
      <p class="t-name">this Un-Said needs its key.</p>
      <input name="key" type="password" autocomplete="off" class="input mt-16" placeholder="APP_KEY" />
      <button class="pill mt-16">open</button>
    </form>`;
  $("#keyForm").onsubmit = (e) => {
    e.preventDefault();
    KEY = new FormData(e.target).get("key");
    store.set("unsaid_key", KEY);
    S.view = "home";
    refresh().catch((err) => toast(err.message));
  };
}

refresh().catch((err) => toast(err.message));
