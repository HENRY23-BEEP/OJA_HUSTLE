// ============================================================
//  STREET LIFE SCREENS — agbero encounter, street fight,
//  "Ole!" thief chase and Task Force raid.
// ============================================================

import * as G from "../engine/game.js";
import * as ST from "../engine/street.js";
import { CONFIG } from "../data/config.js";
import { person, tobi, ICON } from "./icons.js";
import { esc, naira } from "./util.js";

const T = CONFIG.street;
const agberoArt = (size = 120) => person({ skin: "#5A3A22", shirt: "#1E1E1E", cap: "#E5383B", beard: true, shades: true, singlet: true, bg: "#FF7A1A" }, size);
const LINES = [
  "Oga/Madam, drop something for the boys! Na {amt} settlement.",
  "Who give you permission to sell here? Bring {amt} make we no get problem.",
  "Today na my birthday. Wetin you go give your brother? {amt} go do.",
  "Market levy for the area boys: {amt}. No dull me.",
];

// ---------- Agbero encounter (before buying stock) ----------
export const AGBERO = {
  render: c => {
    const S = c.S, ag = c.ui.ag, r = c.ui.agResult;
    const line = LINES[ag.demand % LINES.length].replace("{amt}", naira(ag.demand));
    const union = ST.isUnion(S);
    return `
    <div style="background:linear-gradient(#E5383B,#B42318);color:#fff;padding:18px 16px 14px" class="stack">
      <p class="eyebrow" style="color:#FFE3E3">Morning · Day ${S.day}</p>
      <h1 style="font-size:26px">Agbero at your stall!</h1>
    </div>
    <div class="scroll">
      <div class="row" style="align-items:flex-end"><div class="shake-in">${agberoArt(110)}</div>
        <div class="say" style="border-radius:16px 16px 16px 4px"><b style="color:var(--red-ink)">${esc(ag.name)}</b>"${esc(line)}"</div></div>
      <div class="grid3">
        <div class="card"><p class="label">Cash</p><b class="num">${naira(S.cash)}</b></div>
        <div class="card"><p class="label">Respect</p><b class="num">${Math.round(S.respect)}</b></div>
        <div class="card"><p class="label">Union</p><b style="color:${union ? "var(--green-ink)" : "var(--muted)"}">${union ? "Member" : "No"}</b></div>
      </div>
      ${r ? `<div class="card" style="background:${r.tone === "good" ? "var(--green-tint)" : r.tone === "bad" ? "var(--red-tint)" : "var(--white)"}">${esc(r.text)}</div>
        <button class="btn btn-primary btn-block" data-act="done">Go and buy stock</button>` : `
      <p class="small muted">What will you do? Paying is safe today, but agberos come back to traders who always pay.</p>
      <button class="btn btn-ghost btn-block" data-act="choose" data-v="pay">Pay ${naira(ag.demand)}</button>
      <button class="btn btn-ghost btn-block" data-act="choose" data-v="negotiate">Beg him to reduce it</button>
      <button class="btn ${union ? "btn-green" : "btn-ghost"} btn-block" data-act="choose" data-v="union" ${union ? "" : "disabled"}>${union ? "Call the Market Union chairman" : "Call the Union (members only — join in Grow)"}</button>
      <button class="btn btn-ghost btn-block" data-act="choose" data-v="refuse">Refuse to pay</button>
      <button class="btn btn-danger btn-block" style="font-weight:700" data-act="fight">Fight him!</button>`}
    </div>`;
  },
  act: {
    choose: (c, el) => {
      c.ui.agResult = ST.agberoChoice(c.S, c.ui.ag, el.dataset.v);
      c.sfx(c.ui.agResult.tone === "good" ? "coin" : c.ui.agResult.tone === "bad" ? "bad" : "tap");
      c.save(); c.rerender();
    },
    fight: c => c.go("fight", { fight: null }),
    done: c => { c.ui.ag = null; c.ui.agResult = null; c.go("buy"); },
  },
  back: () => {},
};

// ---------- Street fight mini-game ----------
const MOVES = [
  { id: "duck", label: "DUCK", hint: "He swings high!" },
  { id: "block", label: "BLOCK", hint: "He's punching straight!" },
  { id: "push", label: "PUSH", hint: "He's grabbing your shirt!" },
];
let fightTimer = null;

function nextRound(c) {
  const f = c.ui.fight;
  f.move = MOVES[Math.floor(Math.random() * MOVES.length)];
  f.order = [...MOVES].sort(() => Math.random() - 0.5);
  const w = T.fight.windowSeconds;
  f.window = (w[Math.min(c.S.stage, w.length - 1)]) * (1.15 - c.ui.ag.toughness * 0.3);
  f.left = f.window; f.state = "go";
}

export const FIGHT = {
  enter: c => {
    if (!c.ui.fight) { c.ui.fight = { round: 0, hits: 0, misses: 0, state: "ready" }; }
  },
  render: c => {
    const f = c.ui.fight, ag = c.ui.ag, F = T.fight;
    const youHp = Math.max(0, F.rounds - F.toWin + 1 - f.misses), agHp = Math.max(0, F.toWin - f.hits);
    const bar = (v, max, col) => `<div class="prog" style="height:12px"><i style="width:${(v / max) * 100}%;background:${col}"></i></div>`;
    let body;
    if (f.state === "ready") body = `
      <p style="text-align:center">Tap the move that matches his attack before the bar runs out. Land <b>${F.toWin} of ${F.rounds}</b> to win.</p>
      <div class="card small stack"><p><b>DUCK</b> when he swings high · <b>BLOCK</b> a straight punch · <b>PUSH</b> when he grabs you</p><p class="muted">Losing means a clinic bill, paying him more, and opening late today.</p></div>
      <div class="grid2"><button class="btn btn-ghost" data-act="chicken">Back out (pay ${naira(ag.demand)})</button><button class="btn btn-danger" style="font-weight:800" data-act="start">Start the fight</button></div>`;
    else if (f.state === "over") body = `<div class="card" style="background:${f.result.won ? "var(--green-tint)" : "var(--red-tint)"}"><p style="font-weight:800;font-size:20px">${f.result.won ? "YOU WON!" : "You lost the fight"}</p><p class="small">${esc(f.result.text)}</p></div>
      <button class="btn btn-primary btn-block" data-act="done">Go and buy stock</button>`;
    else body = `
      <p class="eyebrow" style="text-align:center;color:var(--red-ink)">Round ${f.round + 1} of ${F.rounds}</p>
      <p id="fhint" style="text-align:center;font-weight:800;font-size:28px;color:var(--ink)">${f.move.hint}</p>
      <div class="prog"><i id="fbar" style="width:100%;background:var(--red)"></i></div>
      <div class="grid3">${f.order.map(m => `<button class="btn btn-purple" style="min-height:64px;font-size:17px" data-act="move" data-v="${m.id}">${m.label}</button>`).join("")}</div>
      <p id="fflash" class="fight-flash" aria-live="assertive"></p>`;
    return `
    <div style="background:#2B1D14;color:#fff;padding:16px" class="stack">
      <div class="row between"><div class="stack" style="gap:4px;width:44%"><p class="small" style="font-weight:700">${esc(c.S.name)}</p>${bar(youHp, F.rounds - F.toWin + 1, "var(--green)")}</div>
        <b style="font-size:22px;color:var(--yellow)">VS</b>
        <div class="stack" style="gap:4px;width:44%;text-align:right"><p class="small" style="font-weight:700">${esc(ag.name)}</p>${bar(agHp, F.toWin, "var(--red)")}</div></div>
      <div class="row between" style="padding:0 8px"><div id="fyou">${tobi(c.S.look, 92, "#FFF7E8")}</div><div id="fag" style="transform:scaleX(-1)">${agberoArt(92)}</div></div>
    </div>
    <div class="scroll">${body}</div>`;
  },
  act: {
    start: c => { nextRound(c); c.sfx("alarm"); c.rerender(); FIGHT.loop(c); },
    move: (c, el) => {
      const f = c.ui.fight; if (f.state !== "go") return;
      FIGHT.resolve(c, el.dataset.v === f.move.id);
    },
    chicken: c => { c.ui.agResult = ST.agberoChoice(c.S, c.ui.ag, "pay"); c.ui.fight = null; c.go("agbero"); },
    done: c => { c.ui.ag = null; c.ui.agResult = null; c.ui.fight = null; c.go("buy"); },
  },
  loop: c => {
    clearInterval(fightTimer);
    fightTimer = setInterval(() => {
      const f = c.ui.fight; if (!f || f.state !== "go") return clearInterval(fightTimer);
      f.left -= 0.05;
      const b = document.getElementById("fbar"); if (b) b.style.width = Math.max(0, (f.left / f.window) * 100) + "%";
      if (f.left <= 0) FIGHT.resolve(c, false);
    }, 50);
  },
  resolve: (c, hit) => {
    const f = c.ui.fight, F = T.fight;
    f.state = "wait";
    if (hit) f.hits++; else f.misses++;
    c.sfx(hit ? "sale" : "bad");
    if (navigator.vibrate) try { navigator.vibrate(hit ? 20 : 80); } catch (e) {}
    const fl = document.getElementById("fflash");
    if (fl) { fl.textContent = hit ? "POW!" : "OUCH!"; fl.style.color = hit ? "var(--green-ink)" : "var(--red-ink)"; }
    const target = document.getElementById(hit ? "fag" : "fyou"); if (target) target.classList.add("hit-shake");
    const done = f.hits >= F.toWin || f.misses > F.rounds - F.toWin || f.round + 1 >= F.rounds;
    setTimeout(() => {
      f.round++;
      if (done) { clearInterval(fightTimer); f.state = "over"; f.result = ST.fightResult(c.S, c.ui.ag, f.hits); c.sfx(f.result.won ? "win" : "bad"); c.save(); c.rerender(); }
      else { nextRound(c); c.rerender(); }
    }, 550);
  },
  leave: () => clearInterval(fightTimer),
  back: () => {},
};

// ---------- Mash-the-button mini-game (thief chase, Task Force) ----------
export function mashGame(c, { title, text, button, taps, seconds, color }, onDone) {
  let count = 0, left = seconds, iv = null, over = false;
  const finish = ok => { if (over) return; over = true; clearInterval(iv); c.closeSheet(); onDone(ok); };
  c.sheet(`
    <p style="font-weight:800;font-size:26px;color:${color}">${title}</p>
    <p>${text}</p>
    <div class="prog" aria-hidden="true"><i id="mtime" style="width:100%;background:${color}"></i></div>
    <div class="row between"><span class="label">Taps</span><b id="mcount" class="num" style="font-size:22px">0 / ${taps}</b></div>
    <button class="btn btn-block mash" style="min-height:96px;font-size:28px;background:${color};color:#fff;box-shadow:0 5px 0 rgba(0,0,0,.25)" data-act="mash">${button}</button>`,
    {
      mash: () => {
        count++; c.sfx("tap");
        const el = document.getElementById("mcount"); if (el) el.textContent = `${count} / ${taps}`;
        if (count >= taps) finish(true);
      },
      close: () => {},
    }, { focus: false });
  iv = setInterval(() => {
    left -= 0.05;
    const b = document.getElementById("mtime"); if (b) b.style.width = Math.max(0, (left / seconds) * 100) + "%";
    if (left <= 0) finish(false);
  }, 50);
}

