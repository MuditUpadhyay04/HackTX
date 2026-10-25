// Small shared pieces: escaping, glyphs, the app icon, toast, the waveform.
// Glyphs are drawn here (no emoji as icons, no official logos), all in currentColor.

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

// Gurneal's icon (design/assets/brand). The mark is the white quote on the blue-violet blur.
export const ICON_SRC = "/app/icon-192.png";
export const appIcon = (size = 38) => `<img class="app-icon" src="${ICON_SRC}" width="${size}" height="${size}" alt="" />`;

const svg = (body, size = 24, extra = "") => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" ${extra}>${body}</svg>`;
const stroke = (d, w = 2) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

export const MIC_SVG = svg(`<path fill="currentColor" d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V5.5a3.5 3.5 0 1 0-7 0V11a3.5 3.5 0 0 0 3.5 3.5Zm6-3.5a1 1 0 1 0-2 0 4 4 0 0 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.91V19H8.5a1 1 0 1 0 0 2h7a1 1 0 1 0 0-2H13v-2.09A6 6 0 0 0 18 11Z"/>`, 32);
export const PLAY_SVG = svg(`<path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/>`, 20);
export const PAUSE_SVG = svg(`<path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>`, 20);
export const STOP_SVG = svg(`<rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor"/>`, 32);
export const CHECK_SVG = svg(stroke("m5 12.5 4.5 4.5L19 7.5", 2.4), 16);
export const CHEVRON_LEFT = svg(stroke("M15 5l-7 7 7 7", 2.4), 24);
export const CHEVRON_RIGHT = svg(stroke("M9 5l7 7-7 7", 2.2), 16, 'class="chev"');
export const PLUS_SVG = svg(stroke("M12 5v14M5 12h14", 2.6), 24);
export const MOON_SVG = svg(`<path fill="currentColor" d="M20 14.6A8.2 8.2 0 0 1 9.4 4a.6.6 0 0 0-.8-.7A9 9 0 1 0 20.7 15.4a.6.6 0 0 0-.7-.8Z"/>`, 14);
export const SUN_SVG = svg(`<circle cx="12" cy="12" r="4.2" fill="currentColor"/>${stroke("M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4", 1.8)}`, 14);
// The mark: a heavy, rounded opening quote, drawn so it looks the same on every device.
export const QUOTE_SVG = `<svg class="quote-mark" viewBox="0 -2 44 34" width="44" height="34" aria-hidden="true"><circle cx="9" cy="22" r="9" fill="currentColor"/><circle cx="31" cy="22" r="9" fill="currentColor"/><path d="M3.2 18.5C2 10.5 6 4.2 14.5 2.2M25.2 18.5C24 10.5 28 4.2 36.5 2.2" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>`;
export const VIDEO_SVG = svg(`<rect x="3" y="6.5" width="12.5" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>${stroke("M15.5 10.5 21 7.5v9l-5.5-3", 2)}`, 22);

// Look-alike glyphs for the apps we hand off to (generic shapes, never their logos).
export const APP_GLYPH = {
  messages: svg(stroke("M4 11.5C4 7.4 7.6 4.5 12 4.5s8 2.9 8 7-3.6 7-8 7c-1 0-2-.1-2.9-.4L5 19.5l1.2-3.4A6.5 6.5 0 0 1 4 11.5Z", 1.8), 20),
  whatsapp: svg(`${stroke("M4.5 19.5 5.6 16A7.7 7.7 0 1 1 8.4 18.6Z", 1.8)}${stroke("M9.3 9.2c.3 1.8 1.7 3.5 3.6 4.3l1-1.1 1.6.8-.4 1.4c-2.7.2-6-2.9-6.2-5.7l1.3-.6.9 1.5Z", 1.4)}`, 20),
  instagram: svg(`<rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="16.6" cy="7.4" r="1.1" fill="currentColor"/>`, 20),
};

// Tab bar: filled when active, outline when not (DESIGN_SPEC 3.2).
export const TAB_ICONS = {
  home: [
    svg(`<path fill="currentColor" d="M11.3 3.5a1.1 1.1 0 0 1 1.4 0l7.9 6.6c.25.21.4.52.4.85V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.05c0-.33.15-.64.4-.85Z"/>`),
    svg(stroke("M3.9 10.6 12 3.9l8.1 6.7V20.1H15v-6H9v6H3.9Z", 1.8)),
  ],
  letters: [
    svg(`<path fill="currentColor" d="M7 2.5h7.2L19.5 8v12.5A1.5 1.5 0 0 1 18 22H7a1.5 1.5 0 0 1-1.5-1.5v-16A1.5 1.5 0 0 1 7 2.5Z"/><path d="M9 13h6.5M9 17h6.5" stroke="#0F0D15" stroke-width="1.8" stroke-linecap="round"/>`),
    svg(`${stroke("M7 3.2h7l4.8 5.1v12.2a.8.8 0 0 1-.8.8H7a.8.8 0 0 1-.8-.8V4a.8.8 0 0 1 .8-.8Z", 1.8)}${stroke("M13.8 3.4v5h5M9 13h6.5M9 17h6.5", 1.8)}`),
  ],
  you: [
    svg(`<circle cx="12" cy="7.8" r="4.3" fill="currentColor"/><path fill="currentColor" d="M3.8 20.2c0-4.3 3.7-7 8.2-7s8.2 2.7 8.2 7a1 1 0 0 1-1 1H4.8a1 1 0 0 1-1-1Z"/>`),
    svg(`<circle cx="12" cy="7.8" r="3.8" fill="none" stroke="currentColor" stroke-width="1.8"/>${stroke("M4.6 20.4c0-3.9 3.3-6.4 7.4-6.4s7.4 2.5 7.4 6.4Z", 1.8)}`),
  ],
};

/** A letter's first line is the hero: 64 pt, stepping down to 48 and 36 so it fits. */
export function fitHero(el) {
  if (!el) return;
  const steps = [["", 72, 3], ["s48", 56, 4], ["s36", 42, Infinity]];
  for (const [size, lineHeight, maxLines] of steps) {
    el.classList.remove("s48", "s36");
    if (size) el.classList.add(size);
    if (Math.round(el.getBoundingClientRect().height / lineHeight) <= maxLines) return;
  }
}

export function wave(id, bars = 24) {
  return `<div class="wave" id="${id}">${"<i></i>".repeat(bars)}</div>`;
}

/** Feeds 0..1 levels into a waveform's bars, newest at the right. */
export function waveFeeder(el) {
  const bars = el ? [...el.querySelectorAll("i")] : [];
  const levels = bars.map(() => 0);
  return (level) => {
    levels.shift();
    levels.push(Math.min(1, Math.max(0, level * 3)));
    bars.forEach((b, i) => (b.style.height = `${Math.max(3, Math.round(levels[i] * 32))}px`));
  };
}

let toastTimer = 0;
export function toast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2400);
}
