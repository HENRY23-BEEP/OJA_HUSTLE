// ============================================================
//  MARKET DAY — the real-time part of the game.
//  Customers arrive, you tap them to serve, staff help,
//  haggles and give-change mini-games pause the clock.
// ============================================================

import * as G from "../engine/game.js";
import { CONFIG } from "../data/config.js";
import { PRODUCT_BY_ID } from "../data/products.js";
import { productGlyph, productIcon, person, scene, ICON } from "./icons.js";
import { esc, naira } from "./util.js";
import * as ST from "../engine/street.js";
import { mashGame } from "./street.js";

let timer = null, lastFrame = 0;

function clockText(t, L = CONFIG.dayLengthSeconds) {
  const frac = Math.min(1, t / L);
  const start = L < CONFIG.dayLengthSeconds ? 12 * 60 : 8 * 60;
  const mins = start + Math.floor(frac * (18 * 60 - start));
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
}

function shelfHTML(S) {
  return G.available(S).map(p => { const n = G.stockOf(S, p.id); return `<div class="slot ${n ? (n < 3 ? "low" : "") : "out"}">${productGlyph(p.id, 18)}<b>${n}</b>${naira(S.prices[p.id])}</div>`; }).join("");
}

function queueHTML(c) {
  const mk = c.ui.mk;
  return mk.queue.map(q => {
    const p = PRODUCT_BY_ID[q.item];
    if (q.thief) return `<button type="button" class="cust thief ${q.busy ? "busy" : ""}" data-act="serve" data-id="${q.id}" aria-label="A stranger in a hoodie">
      <span class="bubble">"Abeg, how much be…?"</span><span class="pat"><i style="width:100%;background:var(--muted)"></i></span>
      ${person({ skin: q.skin, shirt: "#2B1D14", hat: "#2B1D14", shades: true, bg: false }, 58)}</button>`;
    return `<button type="button" class="cust ${q.busy ? "busy" : ""}" data-act="serve" data-id="${q.id}" aria-label="${esc(q.name)} wants ${q.qty} ${p.name}">
      <span class="bubble" style="${G.stockOf(c.S, q.item) < q.qty ? "box-shadow:0 0 0 2px var(--red);color:var(--red-ink)" : ""}">${productGlyph(q.item, 18)}<span>${q.qty}× ${p.name.split(" ")[0]}</span></span>
      <span class="pat"><i id="pat-${q.id}" style="width:${(q.left / q.patience) * 100}%"></i></span>
      ${person({ skin: q.skin, shirt: q.shirt, bg: false }, 58)}
    </button>`;
  }).join("");
}

function floatText(c, text, color, cid) {
  const area = document.getElementById("stage-area"); if (!area) return;
  const idx = Math.max(0, c.ui.mk.queue.findIndex(q => q.id === cid));
  const cols = G.stageOf(c.S).queue > 4 ? 3 : 4;
  const el = document.createElement("div");
  el.className = "float"; el.textContent = text; el.style.color = color;
  el.style.left = `${6 + (idx % cols) * (90 / cols)}%`;
  el.style.bottom = `${130 + Math.floor(idx / cols) * 110}px`;
  area.appendChild(el); setTimeout(() => el.remove(), 1100);
}

function refresh(c) {
  const q = document.getElementById("queue"); if (q) q.innerHTML = queueHTML(c);
  const sh = document.getElementById("mshelf"); if (sh) sh.innerHTML = shelfHTML(c.S);
  const cash = document.getElementById("mcash"); if (cash) cash.textContent = naira(c.S.cash);
  const sales = document.getElementById("msales"); if (sales) sales.textContent = "+" + naira(c.ui.day.sales);
}

function removeCust(c, id) { c.ui.mk.queue = c.ui.mk.queue.filter(q => q.id !== id); }

function doSell(c, cust, unit, who) {
  const amt = G.sell(c.S, c.ui.day, cust, unit);
  floatText(c, "+" + naira(amt), who === "staff" ? "var(--teal-ink)" : "var(--green-ink)", cust.id);
  c.sfx(who === "staff" ? "coin" : "sale");
  if (navigator.vibrate && who !== "staff") try { navigator.vibrate(15); } catch (e) {}
  removeCust(c, cust.id);
  refresh(c);
}

function loseCust(c, cust, why, msg) {
  G.lose(c.S, c.ui.day, why);
  if (msg) c.toast(msg);
  floatText(c, "Left", "var(--red-ink)", cust.id);
  c.sfx("bad");
  removeCust(c, cust.id);
  refresh(c);
}

function tick(c) {
  const mk = c.ui.mk; if (!mk) return;
  const now = performance.now(), dt = Math.min(0.25, (now - lastFrame) / 1000); lastFrame = now;
  if (mk.paused || mk.busy) return;
  const S = c.S, day = c.ui.day, st = G.stageOf(S), L = day.length || CONFIG.dayLengthSeconds;
  mk.t += dt;
  const tb = document.getElementById("tbar"); if (tb) tb.style.width = Math.max(0, 100 - (mk.t / L) * 100) + "%";
  const ck = document.getElementById("clock"); if (ck) ck.textContent = clockText(mk.t, L);
  let changed = false;
  // arrivals
  while (mk.next < day.customers.length && day.customers[mk.next].t <= mk.t) {
    const cu = day.customers[mk.next++];
    if (mk.queue.length < st.queue) { mk.queue.push({ ...cu, left: cu.patience, busy: false }); changed = true; }
    else { G.lose(S, day, "wait"); mk.turnedAway++; if (mk.turnedAway === 1 || mk.turnedAway % 4 === 0) c.toast("Your queue is full, so new customers are walking past."); }
  }
  // patience
  for (const q of mk.queue) {
    if (q.busy) continue;
    if (q.thief) { q.snatch = (q.snatch ?? q.snatchAfter) - dt; if (q.snatch <= 0) return thiefStrikes(c, q); continue; }
    // Customers who see their item is out of stock give up three times faster.
    q.left -= dt * (G.stockOf(S, q.item) < q.qty ? 3 : 1);
    const bar = document.getElementById("pat-" + q.id);
    if (bar) { bar.style.width = Math.max(0, (q.left / q.patience) * 100) + "%"; bar.style.background = q.left / q.patience < 0.35 ? "var(--red)" : "var(--green)"; }
  }
  if (day.taskForce && !mk.tfDone && mk.t >= day.taskForce.t) { mk.tfDone = true; return taskForceRaid(c); }
  const gone = mk.queue.filter(q => !q.busy && !q.thief && q.left <= 0);
  for (const q of gone) { G.lose(S, day, "wait"); floatText(c, "Left", "var(--red-ink)", q.id); changed = true; }
  if (gone.length) { mk.queue = mk.queue.filter(q => !gone.includes(q)); c.sfx("bad"); }
  // staff
  for (let i = 0; i < S.staff; i++) {
    mk.staffT[i] = (mk.staffT[i] ?? CONFIG.staffServeSeconds * (0.5 + i * 0.3)) - dt;
    if (mk.staffT[i] > 0) continue;
    const target = mk.queue.find(q => !q.busy && G.decide(S, q) === "buy");
    if (target) { doSell(c, target, S.prices[target.item], "staff"); mk.staffT[i] = CONFIG.staffServeSeconds; changed = false; }
    else mk.staffT[i] = 0.4;
  }
  if (changed) refresh(c);
  if (mk.t >= L) finish(c);
}

function finish(c) {
  clearInterval(timer); timer = null;
  const mk = c.ui.mk, S = c.S, day = c.ui.day;
  // Customers still waiting at closing time go home without buying.
  day.lost += mk.queue.filter(q => !q.thief).length;
  c.closeSheet();
  c.ui.ledger = G.endDay(S, day);
  c.ui.mk = null;
  c.sfx("win");
  c.go("ledger");
}

// ---------- Haggle Duel ----------
function openHaggle(c, cust) {
  const S = c.S, ask = S.prices[cust.item];
  cust.busy = true; c.ui.mk.busy = true; refresh(c);
  S.stats.haggles++;
  const h = G.haggleStart(cust, ask);
  let counter = G.r50((ask + h.offer) / 2);
  const draw = msg => {
    const p = PRODUCT_BY_ID[cust.item], cost = G.costToday(S, cust.item);
    const lo = Math.min(h.offer, cost) - 100, hi = ask;
    counter = Math.max(lo, Math.min(hi, counter));
    c.sheet(`
      <p style="font-weight:800;font-size:26px;color:var(--purple);letter-spacing:.5px">HAGGLE DUEL</p>
      <div class="row">${person({ skin: cust.skin, shirt: cust.shirt }, 56)}<div class="grow"><h2 style="font-size:19px">${esc(cust.name)} wants ${cust.qty} ${p.name.toLowerCase()}</h2>
        <p class="small">${msg || `"${naira(ask)}? Too much! I go pay <b>${naira(h.offer)}</b>."`} <span class="label">(per ${p.unit})</span></p></div></div>
      <div class="row"><span class="label" style="width:64px">Patience</span><div class="dots grow" style="grid-template-columns:repeat(${CONFIG.haggleRounds},1fr)">${Array.from({ length: CONFIG.haggleRounds }, (_, i) => `<span class="${i < h.patience ? "on" : ""}"></span>`).join("")}</div></div>
      <div class="card stack">
        <div class="row between"><label for="counter" style="font-weight:700">Your counter-offer</label><b id="cval" class="num" style="font-size:26px;color:var(--action)">${naira(counter)}</b></div>
        <input id="counter" type="range" min="${lo}" max="${hi}" step="50" value="${counter}">
        <div class="row between label num"><span>${naira(lo)}</span><span class="bad">Cost ${naira(cost)}</span><span>${naira(hi)}</span></div>
        <p id="cprof" class="small num" style="font-weight:700"></p>
      </div>
      <div class="grid2"><button class="btn btn-ghost" data-act="accept">Accept ${naira(h.offer)}</button><button class="btn btn-primary" data-act="counter">Counter</button></div>
      <button class="btn btn-ghost" data-act="refuse">Refuse, let them go</button>
      ${h.offer < cost ? `<p class="small bad" style="font-weight:700">Careful: their offer is below your cost price.</p>` : ""}`, actions, { focus: false });
    updateProfit();
  };
  const updateProfit = () => {
    const el = document.getElementById("cprof"); if (!el) return;
    const m = (counter - G.costToday(S, cust.item)) * cust.qty;
    el.textContent = (m >= 0 ? "Profit if they agree: +" : "Loss if they agree: ") + naira(Math.abs(m));
    el.className = "small num " + (m >= 0 ? "good" : "bad");
  };
  const done = () => { c.closeSheet(); c.ui.mk.busy = false; cust.busy = false; };
  const actions = {
    counter: () => {
      const r = G.haggleCounter(h, cust, counter);
      if (r.deal) {
        done(); S.stats.haggleWins++;
        if (counter >= G.costToday(S, cust.item)) S.wisdom += CONFIG.wisdom.haggleWin;
        c.toast(`Deal! ${esc(cust.name)} agreed to ${naira(counter)}.`);
        doSell(c, cust, counter);
      } else if (r.gone) { done(); loseCust(c, cust, "price", `${esc(cust.name)} got tired of haggling and left.`); }
      else { c.sfx("haggle"); draw(`"Hmm… no. Okay, my last price is <b>${naira(r.offer)}</b>."`); }
    },
    accept: () => { done(); doSell(c, cust, h.offer); },
    refuse: () => { done(); loseCust(c, cust, "price"); },
    close: () => actions.refuse(),
  };
  // The slider (id="counter") is handled by the document listener at the bottom of this file.
  sheetInput = el => { counter = +el.value; const v = document.getElementById("cval"); if (v) v.textContent = naira(counter); updateProfit(); };
  c.sfx("haggle");
  draw();
}
let sheetInput = null;

// ---------- Thief snatches the money box ----------
function thiefStrikes(c, q) {
  const S = c.S, mk = c.ui.mk;
  removeCust(c, q.id); refresh(c);
  const amt = ST.thiefSnatch(S, c.ui.day.sales);
  if (amt <= 0) return;
  mk.busy = true; c.sfx("alarm");
  if (navigator.vibrate) try { navigator.vibrate([80, 60, 80]); } catch (e) {}
  mashGame(c, {
    title: "OLE! OLE! THIEF!",
    text: `The stranger in the hoodie grabbed your money box with <b>${naira(amt)}</b> and ran! Shout to get the market to chase him.`,
    button: "OLE! OLE!", taps: CONFIG.street.thief.chaseTaps, seconds: CONFIG.street.thief.chaseSeconds, color: "var(--red)",
  }, caught => {
    mk.busy = false;
    const lost = ST.thiefOutcome(S, caught, amt);
    c.sfx(caught ? "win" : "bad");
    c.toast(caught ? `The market boys caught him! You got your ${naira(amt)} back. +${CONFIG.street.respect.thiefCaught} respect.` : `He escaped into the crowd with ${naira(lost)}. Watch out for strangers who hang around without buying.`, 3500);
    refresh(c);
  });
}

// ---------- Task Force raid (only when goods are on the walkway) ----------
function taskForceRaid(c) {
  const S = c.S, mk = c.ui.mk, T = CONFIG.street.taskForce;
  mk.busy = true; c.sfx("alarm");
  if (navigator.vibrate) try { navigator.vibrate([100, 50, 100, 50, 100]); } catch (e) {}
  const union = ST.isUnion(S);
  mashGame(c, {
    title: "TASK FORCE!!!",
    text: `The Task Force van is coming to clear goods off the walkway! Pack everything back inside, fast.${union ? " (The Union warned you early, so you have more time.)" : ""}`,
    button: "PACK IT IN!", taps: T.packTaps, seconds: T.packSeconds[union ? 1 : 0], color: "var(--purple)",
  }, ok => {
    mk.busy = false;
    S.walkway = false;
    if (ok) { c.sfx("coin"); c.toast("You packed in time! The Task Force drove past. Your goods are safe inside now.", 3200); }
    else { const v = ST.taskForceSeize(S); c.sfx("bad"); c.toast(`Too slow! The Task Force seized goods worth ${naira(v)}.`, 3500); }
    refresh(c);
  });
}

// ---------- Give the right change ----------
function openChange(c, cust, unit) {
  const S = c.S, total = unit * cust.qty;
  const note = total < 500 ? (Math.random() < 0.5 ? 500 : 1000) : Math.ceil(total / 1000) * 1000 + (Math.random() < 0.4 ? 1000 : 0);
  const change = note - total;
  if (change <= 0) return doSell(c, cust, unit);
  cust.busy = true; c.ui.mk.busy = true; refresh(c);
  let given = 0, left = CONFIG.quickChange.seconds, iv = null;
  const notes = [1000, 500, 200, 100, 50].filter(n => n <= Math.max(change, 50) * 2);
  const colors = { 1000: "#C9A7F5", 500: "#9BD3F0", 200: "#F5C99B", 100: "#A9E2B9", 50: "#F5A9C5" };
  const draw = () => c.sheet(`
    <p style="font-weight:800;font-size:24px;color:var(--teal-ink)">GIVE THE RIGHT CHANGE</p>
    <p>${esc(cust.name)} bought ${cust.qty} ${PRODUCT_BY_ID[cust.item].name.toLowerCase()} for <b>${naira(total)}</b> and paid with <b>${naira(note)}</b>.</p>
    <div class="prog" aria-hidden="true"><i id="qcbar" style="width:${(left / CONFIG.quickChange.seconds) * 100}%;background:var(--teal)"></i></div>
    <div class="card row between"><span class="label">Change you're giving</span><b id="qcgiven" class="num" style="font-size:26px">${naira(given)}</b></div>
    <div class="notes">${notes.map(n => `<button class="note" style="background:${colors[n]}" data-act="note" data-v="${n}">₦${n.toLocaleString()}</button>`).join("")}</div>
    <div class="grid2"><button class="btn btn-ghost" data-act="reset">Start again</button><button class="btn btn-green" data-act="give">Give change</button></div>`, actions, { focus: false });
  const finishChange = () => {
    clearInterval(iv); c.closeSheet(); c.ui.mk.busy = false; cust.busy = false;
    if (given === change) { S.wisdom += CONFIG.wisdom.quickChange; S.stats.quickChange++; S.rep = G.clamp(S.rep + 0.05, 1, 5); c.toast("Correct change! The customer smiles."); }
    else if (given > change) { S.cash -= given - change; c.toast(`You gave ${naira(given - change)} too much change.`); }
    else { S.rep = G.clamp(S.rep - 0.15, 1, 5); c.toast(`Short change! You owed ${naira(change)}. The customer is not happy.`); }
    G.addMastery(S, 1, given === change);
    doSell(c, cust, unit);
  };
  const actions = {
    note: (_, el) => { given += +el.dataset.v; c.sfx("tap"); const g = document.getElementById("qcgiven"); if (g) g.textContent = naira(given); },
    reset: () => { given = 0; const g = document.getElementById("qcgiven"); if (g) g.textContent = naira(0); },
    give: finishChange,
    close: finishChange,
  };
  draw();
  iv = setInterval(() => {
    left -= 0.1;
    const b = document.getElementById("qcbar"); if (b) b.style.width = Math.max(0, (left / CONFIG.quickChange.seconds) * 100) + "%";
    if (left <= 0) finishChange();
  }, 100);
}

// ---------- Emergency restock ----------
function openRestock(c) {
  const S = c.S;
  const draw = () => c.sheet(`
    <h2>Rush restock</h2>
    <p class="small">The warehouse boy runs to Alhaji Musa for you. It costs ${Math.round((G.RUSH_FEE - 1) * 100)}% extra, and the market keeps going while you order.</p>
    <p class="small">Cash: <b class="num">${naira(S.cash)}</b></p>
    <div class="stack">${G.available(S).map(p => { const u = G.r50(G.costToday(S, p.id) * G.RUSH_FEE); return `<div class="row">${productIcon(p.id, 36)}<div class="grow"><b>${p.name}</b><p class="label">Have ${G.stockOf(S, p.id)} · ${naira(u)} each</p></div><button class="btn btn-ghost btn-sm" data-act="rush" data-id="${p.id}" data-q="1" ${S.cash < u ? "disabled" : ""}>+1</button><button class="btn btn-ghost btn-sm" data-act="rush" data-id="${p.id}" data-q="5" ${S.cash < u * 5 ? "disabled" : ""}>+5</button></div>`; }).join("")}</div>
    <button class="btn btn-primary" data-act="close">Back to customers</button>`, actions, { focus: false });
  const actions = {
    rush: (_, el) => { const r = G.rushBuy(S, el.dataset.id, +el.dataset.q, c.ui.day); if (r.ok) { c.sfx("coin"); draw(); refresh(c); } else c.toast("Not enough cash."); },
    close: () => c.closeSheet(),
  };
  draw();
}

function pause(c) {
  const mk = c.ui.mk; if (!mk || mk.paused || mk.busy) return;
  mk.paused = true;
  c.sheet(`<h2>Paused</h2><p>The market waits for you.</p>
    <button class="btn btn-primary" data-act="resume">Resume</button>
    <button class="btn btn-ghost" data-act="end">Close the stall early</button>`, {
    resume: () => { c.closeSheet(); mk.paused = false; lastFrame = performance.now(); },
    close: () => { c.closeSheet(); mk.paused = false; lastFrame = performance.now(); },
    end: () => { c.closeSheet(); mk.paused = false; finish(c); },
  });
}

function onVisibility(c) { if (document.hidden && c.ui.mk) pause(c); }
let visHandler = null;

export const MARKET = {
  enter: c => {
    const S = c.S;
    c.ui.day = G.startDay(S);
    c.ui.day.bought = c.ui.bought || 0;
    c.ui.orderMsg = G.fulfilOrder(S, c.ui.day);
    c.ui.mk = { t: 0, next: 0, queue: [], staffT: [], paused: false, busy: false, lastTap: 0, turnedAway: 0 };
  },
  render: c => {
    const S = c.S, st = G.stageOf(S);
    return `
    <div class="mkt-top">
      <div><p style="font-size:11px;font-weight:600">Day ${S.day}${c.ui.day.injured ? " · opened late" : ""}</p><b id="clock" class="num" style="font-size:19px;line-height:1">${clockText(0, c.ui.day.length)}</b></div>
      <div class="timebar"><i id="tbar"></i></div>
      <span class="pill" id="mcash">${naira(S.cash)}</span>
      <button class="iconbtn" style="background:var(--purple-deep);color:#fff" aria-label="Pause" data-act="pause">${ICON.pause}</button>
    </div>
    <div class="stage-area" id="stage-area">
      ${scene(S.stage, S.umbrella, { height: 300 })}
      <div class="queue ${st.queue > 4 ? "c3" : "c4"}" id="queue"></div>
    </div>
    <div class="foot" style="gap:8px;padding-top:8px">
      <div class="row between"><span class="label">${S.staff ? `<span class="staffbar">${Array.from({ length: S.staff }, () => "<i></i>").join("")} ${S.staff} staff serving</span>` : "Tap a customer to serve them"}</span><b class="num good" style="font-size:19px" id="msales">+₦0</b></div>
      <div class="mshelf" id="mshelf">${shelfHTML(S)}</div>
      <button class="btn btn-ghost btn-sm" data-act="restock">Rush restock (+10%)</button>
    </div>`;
  },
  after: c => {
    clearInterval(timer);
    lastFrame = performance.now();
    timer = setInterval(() => tick(c), 100);
    if (c.ui.orderMsg) { c.toast(esc(c.ui.orderMsg.text), 3500); c.ui.orderMsg = null; refresh(c); }
    visHandler = () => onVisibility(c);
    document.addEventListener("visibilitychange", visHandler);
  },
  leave: c => {
    clearInterval(timer); timer = null;
    if (visHandler) document.removeEventListener("visibilitychange", visHandler);
  },
  act: {
    serve: (c, el) => {
      const mk = c.ui.mk; if (!mk || mk.paused || mk.busy) return;
      const now = performance.now();
      if (now - mk.lastTap < CONFIG.playerServeCooldown * 1000) return;
      mk.lastTap = now;
      const cust = mk.queue.find(q => q.id === +el.dataset.id); if (!cust) return;
      const S = c.S, d = G.decide(S, cust), p = PRODUCT_BY_ID[cust.item];
      if (d === "thief") {
        ST.thiefOutcome(S, true, 0); removeCust(c, cust.id); refresh(c); c.sfx("coin");
        return c.toast(`You caught the stranger eyeing your money box. "Ole!" The market boys chased him away. +${CONFIG.street.respect.thiefCaught} respect.`, 3200);
      }
      if (d === "nostock") return loseCust(c, cust, "nostock", `Out of ${p.name.toLowerCase()}! ${esc(cust.name)} walked away.`);
      if (d === "leave") return loseCust(c, cust, "price", `${esc(cust.name)}: "${naira(S.prices[cust.item])} for ${p.name.toLowerCase()}? Too cost! I'll buy from Chidi."`);
      if (d === "haggle") return openHaggle(c, cust);
      const unit = S.prices[cust.item];
      if (G.hasFeature(S, "quickChange") && S.stage < 2 && unit * cust.qty < 20000 && Math.random() < CONFIG.quickChange.chance) return openChange(c, cust, unit);
      doSell(c, cust, unit);
    },
    pause: c => pause(c),
    restock: c => openRestock(c),
  },
  input: {},
  back: c => pause(c),
};

// The haggle slider uses data-input="counter" inside the sheet.
document.addEventListener("input", e => {
  if (e.target && e.target.id === "counter" && sheetInput) sheetInput(e.target);
});
