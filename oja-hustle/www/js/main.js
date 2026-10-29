// ============================================================
//  OJA HUSTLE — APP START-UP
//  Holds the game state, saves it, switches screens and routes
//  button taps (any element with data-act="...") to screen actions.
// ============================================================

import * as G from "./engine/game.js";
import { CONFIG } from "./data/config.js";
import { SCREENS } from "./ui/screens.js";
import { sfx, music, setAudio } from "./ui/audio.js";

const app = document.getElementById("app");

const ctx = {
  S: null,          // the saved game state
  ui: {},           // temporary screen state (cart, quiz answers, ...), not saved
  screen: null,
  go, save, load, toast, sheet, closeSheet, rerender, sfx, music,
};
window.__oja = ctx; // handy for debugging in the browser console

// ---------- saving ----------
function save() {
  if (!ctx.S) return;
  try { localStorage.setItem(CONFIG.saveKey, JSON.stringify(ctx.S)); } catch (e) { /* storage may be blocked */ }
}
function load() {
  try {
    const raw = localStorage.getItem(CONFIG.saveKey);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s && s.v === 1 ? G.upgradeSave(s) : null;
  } catch (e) { return null; }
}

// ---------- screens ----------
function go(name, uiPatch) {
  const prev = SCREENS[ctx.screen];
  if (prev && prev.leave) prev.leave(ctx);
  if (uiPatch) Object.assign(ctx.ui, uiPatch);
  ctx.screen = name;
  const scr = SCREENS[name];
  if (scr.enter) { const redirect = scr.enter(ctx); if (redirect && redirect !== name) return go(redirect); }
  rerender();
  app.scrollTop = 0;
  if (name !== "market") save();
}
function rerender() {
  const scr = SCREENS[ctx.screen];
  const keepScroll = app.querySelector(".scroll") ? app.querySelector(".scroll").scrollTop : 0;
  app.innerHTML = scr.render(ctx);
  const sc = app.querySelector(".scroll");
  if (sc && ctx.ui.keepScroll) sc.scrollTop = keepScroll;
  ctx.ui.keepScroll = false;
  if (scr.after) scr.after(ctx);
  document.body.classList.toggle("large", !!(ctx.S && ctx.S.settings.large));
}

// ---------- overlays ----------
let sheetActions = null;
function sheet(html, actions = {}, opts = {}) {
  closeSheet();
  const ov = document.createElement("div");
  ov.className = "overlay" + (opts.center ? " center" : "");
  ov.id = "sheet";
  ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  app.appendChild(ov);
  sheetActions = actions;
  const first = ov.querySelector("button, input");
  if (first && opts.focus !== false) first.focus({ preventScroll: true });
  return ov;
}
function closeSheet() {
  const ov = document.getElementById("sheet");
  if (ov) ov.remove();
  sheetActions = null;
}
function toast(msg, ms = 2200) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); app.appendChild(t); }
  t.innerHTML = msg; t.hidden = false;
  clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, ms);
}

// ---------- taps ----------
app.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled) return;
  const act = el.dataset.act;
  music.start();
  const inSheet = el.closest("#sheet");
  if (inSheet && sheetActions && sheetActions[act]) { sheetActions[act](ctx, el, e); return; }
  const scr = SCREENS[ctx.screen];
  if (scr.act && scr.act[act]) { scr.act[act](ctx, el, e); return; }
  if (SCREENS.global.act[act]) SCREENS.global.act[act](ctx, el, e);
});
app.addEventListener("input", e => {
  const el = e.target.closest("[data-input]");
  if (!el) return;
  const scr = SCREENS[ctx.screen];
  const fn = (el.closest("#sheet") && sheetActions && sheetActions[el.dataset.input]) || (scr.input && scr.input[el.dataset.input]);
  if (fn) fn(ctx, el, e);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && document.getElementById("sheet") && sheetActions && sheetActions.close) sheetActions.close(ctx);
});

// Android back button (inside the app version)
document.addEventListener("backbutton", e => {
  e.preventDefault();
  const scr = SCREENS[ctx.screen];
  if (document.getElementById("sheet") && sheetActions && sheetActions.close) return sheetActions.close(ctx);
  if (scr.back) scr.back(ctx);
}, false);

// ---------- start ----------
// Testing shortcut: add ?fast to the address to make market days 15 seconds long.
if (/[?&]fast\b/.test(location.search)) CONFIG.dayLengthSeconds = 15;
ctx.S = load();
if (ctx.S) setAudio(ctx.S.settings);
go("title");

// Offline support for the web version (the Android/iOS app already works offline).
const isNativeApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
if ("serviceWorker" in navigator && !isNativeApp && !window.OJA_STANDALONE && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
