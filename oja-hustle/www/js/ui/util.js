// Small helpers shared by the screens.
import { naira } from "../engine/game.js";
import { CAST } from "../data/events.js";
import { person } from "./icons.js";

export { naira };
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const signed = n => (n > 0 ? "+" : "") + naira(n);
export const stars = r => { const n = Math.round(r); return "★".repeat(n) + "☆".repeat(5 - n); };
export const pct = (a, b) => Math.max(0, Math.min(100, (a / b) * 100));

export function castFace(who, size = 46) {
  const c = CAST[who];
  return person({ skin: c.skin, shirt: c.shirt, hat: c.hat, glasses: c.glasses, shades: c.shades, bg: who === "mama" ? "#12A150" : who === "femi" ? "#2B1D14" : who === "ada" ? "#00B3A6" : who === "musa" ? "#FFC629" : who === "chidi" ? "#FF4F8B" : "#FFC629" }, size);
}

export function stepper(act, key, value, label, opts = {}) {
  const fmt = opts.money ? naira(value) : value;
  return `<div class="stepper">
    <button type="button" aria-label="Less ${esc(label)}" data-act="${act}" data-k="${key}" data-v="${-(opts.step || 1)}">−</button>
    <span class="val" style="${opts.money ? "min-width:74px" : ""}">${fmt}</span>
    <button type="button" class="plus" aria-label="More ${esc(label)}" data-act="${act}" data-k="${key}" data-v="${opts.step || 1}">+</button>
    ${opts.big ? `<button type="button" class="five" aria-label="${opts.bigLabel || "Add more"} ${esc(label)}" data-act="${act}" data-k="${key}" data-v="${opts.big}">${opts.bigText || "+" + opts.big}</button>` : ""}
  </div>`;
}

export function confetti(n = 60) {
  const colors = ["#FF7A1A", "#FFC629", "#12A150", "#00B3A6", "#7B3FE4", "#FF4F8B"];
  let h = "";
  for (let i = 0; i < n; i++) h += `<i style="left:${Math.random() * 100}%;background:${colors[i % 6]};animation-delay:${(Math.random() * 0.8).toFixed(2)}s;transform:rotate(${Math.random() * 360}deg)"></i>`;
  return `<div class="confetti" aria-hidden="true">${h}</div>`;
}
