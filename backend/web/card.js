// The page Mom opens from the WhatsApp link. No app, no account; the link is the key.
import { holdToTalk, startPcm, wavBlob } from "/app/audio.js";
import { MARK_SVG, MIC_SVG, PLAY_SVG, PAUSE_SVG, esc, toast, wave } from "/app/ui.js";

const token = location.pathname.split("/").filter(Boolean).pop();
const root = document.getElementById("root");

// A few words in her language, under the English, when we know it.
const LOCAL = {
  hindi: { hold: "दबाकर रखें और बोलें", sent: "भेज दिया।", call: "कॉल करें" },
};

async function load() {
  document.querySelector(".mark").innerHTML = MARK_SVG;
  const res = await fetch(`/api/public/cards/${encodeURIComponent(token)}`);
  if (!res.ok) {
    const msg = res.status === 410 ? "this link has expired." : "this link isn't open yet.";
    root.innerHTML = `${top()}<div class="card fade-in"><p class="reflection">${msg}</p></div>`;
    return;
  }
  render(await res.json());
}

function top() {
  return `<div class="topbar"><div class="wordmark"><span class="mark">${MARK_SVG}</span>unsaid</div></div>`;
}

function render(c) {
  const local = LOCAL[(c.recipient_language || "").toLowerCase()] || null;
  const lines = c.lines.map((l) => `<p class="hand-lg" style="margin:0 0 10px">${esc(l.text)}</p>`).join("");
  root.innerHTML = `
    ${top()}
    ${c.photo_url ? `<img class="memory-photo fade-in" src="${esc(c.photo_url)}" alt="" />` : ""}
    <p class="small fade-in d1" style="margin:22px 0 6px">from ${esc(c.sender_name)}</p>
    ${c.audio_url ? `
      <div class="card voice fade-in d1">
        <button class="play" id="play" aria-label="play his voice">${PLAY_SVG}</button>
        ${wave("w")}
        <audio id="audio" src="${esc(c.audio_url)}" preload="auto"></audio>
      </div>` : ""}
    <div class="fade-in d2" style="margin-top:18px">${lines}</div>
    ${c.translation ? `<p class="hand fade-in d2 muted" style="margin-top:4px">${esc(c.translation)}</p>` : ""}
    <p class="small faint" style="text-align:center;margin-top:28px">sent with unsaid</p>
    <div class="mic-wrap mic-dock">
      <div class="row" style="gap:18px;justify-content:center">
        <button class="mic" id="mic" aria-label="hold to reply">${MIC_SVG}</button>
        ${c.call_url ? `<a class="btn dark" style="min-height:56px" href="${esc(c.call_url)}">call ${esc(c.sender_name)}${local ? ` · ${local.call}` : ""}</a>` : ""}
      </div>
      <div class="small" id="micLabel">hold to reply${local ? ` · ${local.hold}` : ""}</div>
    </div>
  `;
  root.classList.add("has-dock");
  if (c.audio_url) wirePlayer();
  wireReply(local, c.sender_name);
}

function wirePlayer() {
  const audio = document.getElementById("audio");
  const btn = document.getElementById("play");
  const bars = document.querySelectorAll("#w i");
  let raf = 0;
  const animate = () => {
    bars.forEach((b) => (b.style.height = `${20 + Math.random() * 80}%`));
    raf = setTimeout(() => requestAnimationFrame(animate), 110);
  };
  btn.onclick = () => (audio.paused ? audio.play() : audio.pause());
  audio.onplay = () => {
    btn.innerHTML = PAUSE_SVG;
    document.getElementById("w").classList.add("on");
    animate();
  };
  audio.onpause = audio.onended = () => {
    btn.innerHTML = PLAY_SVG;
    document.getElementById("w").classList.remove("on");
    clearTimeout(raf);
  };
}

function wireReply(local, senderName) {
  const mic = document.getElementById("mic");
  const label = document.getElementById("micLabel");
  let rec = null;
  let starting = null;
  holdToTalk(mic, {
    onStart: () => {
      mic.classList.add("live");
      label.textContent = "listening… let go when you're done";
      starting = startPcm().then((r) => (rec = r)).catch((err) => {
        mic.classList.remove("live");
        label.textContent = "the microphone isn't available";
        toast(err.message || "microphone blocked");
      });
    },
    onStop: async () => {
      mic.classList.remove("live");
      await starting;
      if (!rec) return;
      const chunks = await rec.stop();
      rec = null;
      label.textContent = "sending…";
      const body = new FormData();
      body.append("file", wavBlob(chunks), "reply.wav");
      const res = await fetch(`/api/public/cards/${encodeURIComponent(token)}/reply`, { method: "POST", body });
      label.textContent = res.ok
        ? `sent. ${senderName} will hear it.${local ? ` · ${local.sent}` : ""}`
        : "that didn't send. try again?";
    },
  });
}

load();
