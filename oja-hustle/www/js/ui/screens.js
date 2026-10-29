// ============================================================
//  SCREENS — each screen has render(ctx) returning HTML and
//  act: { actionName(ctx, element) } for its buttons.
// ============================================================

import * as G from "../engine/game.js";
import { CONFIG } from "../data/config.js";
import { STAGES } from "../data/stages.js";
import { PRODUCTS, PRODUCT_BY_ID } from "../data/products.js";
import { CHAPTERS } from "../data/chapters.js";
import { QUIZ, OBJECTIVES } from "../data/quiz.js";
import { CAST } from "../data/events.js";
import { productIcon, scene, tobi, ICON, UMBRELLAS } from "./icons.js";
import { esc, naira, signed, stars, pct, castFace, stepper, confetti } from "./util.js";
import { MARKET } from "./market.js";
import { NIGHT, BANK, GROW, PROGRESS, MENU, HOWTO } from "./screens2.js";
import { setAudio } from "./audio.js";
import * as ST from "../engine/street.js";
import { AGBERO, FIGHT } from "./street.js";

// ---------- Title ----------
const TITLE = {
  render: c => `
    <div class="scroll" style="align-items:center;text-align:center;gap:16px;background:var(--cream)">
      <svg aria-hidden="true" viewBox="0 0 390 60" preserveAspectRatio="none" style="position:absolute;top:0;left:0;width:100%;height:56px"><path d="M0 0H390V34Q370 56 345 34T300 34T255 34T210 34T165 34T120 34T75 34T30 34T0 34Z" fill="#FF7A1A"/><path d="M0 34Q15 50 30 34T75 34T120 34T165 34T210 34T255 34T300 34T345 34T390 34V40Q370 60 345 40T300 40T255 40T210 40T165 40T120 40T75 40T30 40T0 40Z" fill="#FFC629"/></svg>
      <div style="margin-top:40px"><h1 style="font-size:50px;color:var(--action);letter-spacing:-1px">Oja Hustle</h1>
        <p style="font-weight:700;color:var(--green-ink)">Learn money. Run the market.</p></div>
      <div style="width:100%;border-radius:20px;overflow:hidden">${scene(c.S ? c.S.stage : 0, c.S ? c.S.umbrella : 0, { height: 170 })}</div>
      ${c.S ? `<div class="card" style="width:100%;text-align:left"><p class="label">Saved game</p>
        <p style="font-weight:700">${esc(c.S.name)} · Chapter ${c.S.chapter}${c.S.finished ? " (complete)" : ""} · Day ${c.S.day}</p>
        <p class="small muted">${STAGES[c.S.stage].name} · Cash ${naira(c.S.cash)} · Savings ${naira(c.S.savings)}</p></div>
        <button class="btn btn-primary btn-block" data-act="continue">${ICON.play} Continue</button>
        <button class="btn btn-ghost btn-block" data-act="new">New game</button>`
      : `<button class="btn btn-primary btn-block" data-act="new">${ICON.play} Start playing</button>`}
      <button class="btn btn-ghost btn-block" data-act="howto">How to play</button>
      <p class="label" style="margin-top:auto">Works offline · v${CONFIG.version}</p>
    </div>`,
  act: {
    continue: c => { c.sfx("tap"); setAudio(c.S.settings); c.go("home"); },
    new: c => {
      if (c.S) {
        c.sheet(`<h2>Start a new game?</h2><p>Your saved game (Chapter ${c.S.chapter}, Day ${c.S.day}) will be replaced.</p>
          <div class="grid2"><button class="btn btn-ghost" data-act="close">Keep my game</button><button class="btn btn-danger" data-act="yes">Start over</button></div>`,
          { close: c => c.closeSheet(), yes: c => { c.closeSheet(); c.go("newgame", { look: 0, name: "" }); } }, { center: true });
      } else c.go("newgame", { look: 0, name: "" });
    },
    howto: c => c.go("howto", { backTo: "title" }),
  },
};

const NEWGAME = {
  render: c => `
    <div class="topbar plain"><div class="titlebar"><button class="iconbtn" aria-label="Back" data-act="back">${ICON.back}</button><h1 style="font-size:22px">Who are you?</h1></div></div>
    <div class="scroll">
      <p>You are Tobi, 19, and your grandmother is handing you her market stall. Choose how you look.</p>
      <div class="grid2">
        ${[0, 1].map(i => `<button type="button" data-act="look" data-v="${i}" aria-pressed="${c.ui.look === i}" class="card" style="border:3px solid ${c.ui.look === i ? "var(--action)" : "transparent"};background:${c.ui.look === i ? "#FFE7D2" : "var(--white)"};display:flex;flex-direction:column;align-items:center;gap:6px;font-weight:700">${tobi(i, 72)}Tobi (${i ? "girl" : "boy"})</button>`).join("")}
      </div>
      <label for="pname" class="label">Your name (shown on your stall)</label>
      <input id="pname" type="text" maxlength="14" placeholder="Tobi" value="${esc(c.ui.name || "")}" autocomplete="off">
      <button class="btn btn-primary btn-block" style="margin-top:auto" data-act="start">Open Mama's stall</button>
    </div>`,
  act: {
    back: c => c.go("title"),
    look: (c, el) => { c.ui.name = document.getElementById("pname").value; c.ui.look = +el.dataset.v; c.sfx("tap"); c.rerender(); },
    start: c => {
      const nm = (document.getElementById("pname").value || "Tobi").trim().slice(0, 14) || "Tobi";
      const keep = c.S ? c.S.settings : null;
      c.S = G.newGame(nm, c.ui.look);
      if (keep) c.S.settings = keep;
      c.ui = { story: 0 };
      c.sfx("win");
      c.go("story");
    },
  },
  back: c => c.go("title"),
};

// ---------- Story scenes ----------
const STORY = {
  enter: c => { if (c.ui.story === undefined) c.ui.story = 0; },
  render: c => {
    const ch = G.chapterOf(c.S), lines = ch.intro;
    const i = Math.min(c.ui.story, lines.length - 1), L = lines[i], who = CAST[L.who];
    return `<div class="story">
      <p class="eyebrow" style="color:var(--yellow)">Chapter ${ch.id} of ${CHAPTERS.length}</p>
      <h1 style="font-size:34px">${ch.title}</h1>
      <p style="opacity:.9">Lesson: ${ch.lesson}</p>
      <div style="flex:1;display:flex;align-items:center"><div style="width:100%;border-radius:20px;overflow:hidden;opacity:.95">${scene(Math.min(c.S.stage, 3), c.S.umbrella, { height: 160 })}</div></div>
      <div class="row">${castFace(L.who, 64)}<div><p class="who">${who.name}</p><p class="small" style="opacity:.85">${who.role}</p></div></div>
      <div class="line" aria-live="polite">${esc(L.text)}</div>
      <div class="dots" style="grid-template-columns:repeat(${lines.length},1fr)">${lines.map((_, k) => `<span class="${k <= i ? "on" : ""}" style="${k <= i ? "background:var(--yellow)" : "background:rgba(255,255,255,.3)"}"></span>`).join("")}</div>
      <div class="grid2"><button class="btn btn-ghost" data-act="skip">Skip</button><button class="btn btn-primary" data-act="next">${i < lines.length - 1 ? "Next" : "Let's go!"}</button></div>
    </div>`;
  },
  act: {
    next: c => {
      c.sfx("page");
      const n = G.chapterOf(c.S).intro.length;
      if (c.ui.story < n - 1) { c.ui.story++; c.rerender(); }
      else STORY.act.skip(c);
    },
    skip: c => { c.S.introSeen = c.S.chapter; c.ui.story = 0; c.go("home"); },
  },
};

// ---------- Home (the stall hub) ----------
function mamaTip(S) {
  const last = S.history[S.history.length - 1];
  if (S.loans.femi) return `Fast Money Femi wants ${naira(S.loans.femi.owe)} on Day ${S.loans.femi.due}. Keep money ready, or he'll add a penalty.`;
  if (S.order) return `Don't forget: ${S.order.client} needs ${S.order.qty} ${PRODUCT_BY_ID[S.order.item].name.toLowerCase()} today. Buy enough this morning.`;
  if (S.day === 1) return "Buy small first, my child. Water and soft drinks sell every day. Bread and eggs spoil, so be careful.";
  if (last && last.spoiled > 0) return `Yesterday ${naira(last.spoiled)} of goods spoiled. Buy only what you can sell.`;
  if (last && last.lost > last.served * 0.4) return "Many customers walked away yesterday. Check your prices and keep your shelves full.";
  if (S.event && S.event.hike) return "Prices are up today. Raise your selling price a little so you don't sell at a loss.";
  if (S.chapter >= 3 && G.hasFeature(S, "robbery") && S.cash > CONFIG.robbery.cashThreshold[S.stage]) return "You're keeping a lot of cash at the stall. Put some in the bank tonight before thieves find it.";
  if (S.savings === 0 && S.chapter >= 2) return "Small small, the savings jar grows. Even a little every night helps.";
  const tips = ["Know your cost price. Never sell below it.", "Happy customers come back. Fair prices build your stars.", "Profit is what's left after you pay for the goods you sold.", "Keep business money and pocket money separate.", "Look at yesterday's ledger before you buy today's stock."];
  return tips[S.day % tips.length];
}

const HOME = {
  enter: c => {
    const S = c.S;
    if (!S.finished && S.introSeen < S.chapter) { c.ui.story = 0; return "story"; }
    if (G.goalStatus(S).done) return "chapterEnd";
  },
  render: c => {
    const S = c.S, ch = G.chapterOf(S), gs = G.goalStatus(S), st = G.stageOf(S);
    const ev = S.event, rv = S.rival;
    const loanDue = ["femi", "bank"].filter(k => S.loans[k]);
    return `
    <div class="topbar">
      <div class="row between">
        <div class="row" style="min-width:0">${tobi(S.look, 42, "#FFF7E8")}<div style="min-width:0"><p class="small" style="font-weight:600">${S.finished ? "Free play" : `Chapter ${ch.id}`} · Day ${S.day}</p><h1 style="font-size:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(S.name)}'s ${["Stall", "Shop", "Mini-Mart", "Supermarket"][S.stage]}</h1></div></div>
        <div class="stack" style="gap:4px;align-items:flex-end"><span class="chip" style="color:var(--purple-deep)">${S.wisdom} wisdom</span>${ST.streetOn(S) ? `<span class="chip" style="color:var(--red-ink)">${Math.round(S.respect)} respect${ST.isUnion(S) ? " · union" : ""}</span>` : ""}</div>
      </div>
      <div class="stats">
        <div class="stat"><span class="label">Cash</span><b>${naira(S.cash)}</b></div>
        <div class="stat"><span class="label">Savings</span><b style="color:var(--teal-ink)">${naira(S.savings)}</b></div>
        <div class="stat"><span class="label">Reputation</span><b class="stars">${stars(S.rep)}</b></div>
      </div>
    </div>
    <div class="scroll">
      <div class="scene-wrap">${scene(S.stage, S.umbrella, { height: 150 })}</div>
      ${S.finished ? `<div class="card stack"><h2 style="font-size:19px">Mama Ronke's Supermarket</h2><p class="small">Story complete! Keep trading in free play. Best day so far: <b>${naira(S.stats.best)}</b> profit.</p></div>` : `
      <div class="card stack">
        <div class="row between"><p class="eyebrow" style="color:var(--purple)">Chapter goal</p><span class="label">Day ${S.day - S.chapterStartDay + 1} · gold star by day ${ch.parDays}</span></div>
        <h2 style="font-size:18px">${esc(ch.goal.label)}</h2>
        ${gs.lines.map(l => `<div class="stack" style="gap:4px"><div class="row between small"><span>${l.label}</span><b class="num">${l.money ? `${naira(l.have)} / ${naira(l.need)}` : `${l.have} / ${l.need}`}</b></div><div class="prog" role="img" aria-label="${l.label}: ${Math.round(pct(l.have, l.need))}%"><i style="width:${pct(l.have, l.need)}%"></i></div></div>`).join("")}
        ${gs.canUpgradeNow ? `<button class="btn btn-green" data-act="grow">You can afford it! Upgrade now</button>` : ""}
      </div>`}
      ${S.injured && ST.streetOn(S) ? `<div class="card row" style="border:2px solid var(--red)">${ICON.warn}<p class="small grow"><b>You're bruised from the fight.</b> You'll open late today (from 12pm), so expect fewer customers.</p></div>` : ""}
      ${ST.streetOn(S) && !ST.isUnion(S) && S.heat >= 2 ? `<div class="card row" style="border:2px solid var(--red)"><p class="small grow">Agberos know you pay easily, so they'll keep coming. Join the <b>Market Union</b> for protection.</p><button class="btn btn-ghost btn-sm" data-act="grow">Join</button></div>` : ""}
      ${S.order ? `<div class="card row" style="border:2px solid var(--teal)">${productIcon(S.order.item, 40)}<div class="grow"><p class="eyebrow" style="color:var(--teal-ink)">Delivery today</p><p class="small"><b>${S.order.client}</b> needs <b>${S.order.qty} ${PRODUCT_BY_ID[S.order.item].name.toLowerCase()}</b> at ${naira(S.order.unit)} each. You have ${G.stockOf(S, S.order.item)}.</p></div></div>` : ""}
      ${ev ? `<div class="card row" style="border:2px solid ${ev.color}"><span class="tag" style="background:${ev.color};color:#fff">TODAY</span><p class="small grow" style="font-weight:600">${esc(ev.text)}</p></div>` : ""}
      ${rv ? `<div class="card row" style="border:2px solid var(--pink)">${castFace("chidi", 36)}<p class="small grow"><b>Chidi</b> is selling <b>${PRODUCT_BY_ID[rv.item].name.toLowerCase()}</b> for ${naira(rv.price)} today. Customers won't pay much more than that.</p></div>` : ""}
      ${loanDue.map(k => `<div class="card row" style="border:2px solid ${k === "femi" ? "var(--red)" : "var(--teal)"}"><p class="small grow"><b>${k === "femi" ? "Femi's loan" : "Bank loan"}:</b> ${naira(S.loans[k].owe)} due on Day ${S.loans[k].due}.</p><button class="btn btn-ghost btn-sm" data-act="bank">Repay</button></div>`).join("")}
      <div class="mama">${castFace("mama", 44)}<div class="say"><b>Mama Ronke</b>${esc(mamaTip(S))}</div></div>
      <div class="card stack"><div class="row between"><p class="label">Your stock</p><p class="label">${st.name}${S.staff ? ` · ${S.staff} staff` : ""}</p></div>
        <div class="shelf">${G.available(S).map(p => { const n = G.stockOf(S, p.id); return `<div class="slot ${n ? "" : "out"}">${productIcon(p.id, 26)}<span>${p.name.split(" ")[0]}</span><b>${n}</b></div>`; }).join("")}</div></div>
    </div>
    <div class="foot">
      <button class="btn btn-primary btn-block" data-act="startDay">${ICON.play} Start Market Day ${S.day}</button>
      <div class="navgrid">
        <button class="navbtn" data-act="bank">${ICON.bank}Bank</button>
        <button class="navbtn" data-act="grow">${ICON.grow}Grow${gs.canUpgradeNow || (G.canHire(S) && S.staff === 0) ? `<span class="dot"></span>` : ""}</button>
        <button class="navbtn" data-act="progress">${ICON.report}Progress</button>
        <button class="navbtn" data-act="menu">${ICON.menu}Menu</button>
      </div>
    </div>`;
  },
  after: c => {
    if (c.ui.notes && c.ui.notes.length) {
      const S = c.S, notes = c.ui.notes; c.ui.notes = null;
      c.sheet(`<p class="eyebrow" style="color:var(--purple)">Good morning</p><h2 style="font-size:24px">Day ${S.day}</h2>
        ${notes.map(n => `<div class="card small" style="border-left:none;background:${n.tone === "good" ? "var(--green-tint)" : n.tone === "bad" ? "var(--red-tint)" : "var(--white)"}">${esc(n.text)}</div>`).join("")}
        <button class="btn btn-primary" data-act="close">Okay</button>`, { close: c => c.closeSheet() });
    }
  },
  act: {
    startDay: c => {
      c.sfx("tap"); c.ui.cart = {}; c.ui.bought = 0;
      const S = c.S;
      if (S.agberoCheckedDay !== S.day) {
        S.agberoCheckedDay = S.day;
        const ag = ST.agberoVisit(S);
        if (ag) { c.sfx("alarm"); return c.go("agbero", { ag, agResult: null, fight: null }); }
      }
      c.go("buy");
    },
    bank: c => c.go("bank", { backTo: "home" }),
    grow: c => c.go("grow"),
    progress: c => c.go("progress"),
    menu: c => c.go("menu"),
  },
};

// ---------- Buy stock ----------
const BUY = {
  render: c => {
    const S = c.S, cart = c.ui.cart || {};
    const demand = G.expectedDemand(S);
    const total = Object.entries(cart).reduce((t, [id, q]) => t + q * G.costToday(S, id), 0);
    const left = S.cash - total;
    return `
    <div class="topbar plain"><div class="row between">
      <div class="titlebar"><button class="iconbtn" style="background:var(--cream)" aria-label="Back to stall" data-act="back">${ICON.back}</button><div><p class="label">Morning · Alhaji Musa's warehouse</p><h1 style="font-size:22px">Buy Stock</h1></div></div>
      <div style="text-align:right"><p class="label">Cash</p><b class="num">${naira(S.cash)}</b></div></div></div>
    <div class="scroll">
      ${S.order ? `<div class="card small" style="border:2px solid var(--teal)">Delivery order: <b>${S.order.qty} ${PRODUCT_BY_ID[S.order.item].name.toLowerCase()}</b> for ${S.order.client}. Make sure you have enough.</div>` : ""}
      ${G.available(S).map(p => {
        const cost = G.costToday(S, p.id), base = p.cost, have = G.stockOf(S, p.id);
        const trend = cost > base ? `<span class="bad">${ICON.up} ${naira(cost)}</span>` : cost < base ? `<span class="good">${ICON.down} ${naira(cost)}</span>` : naira(cost);
        return `<div class="card stack" style="padding:12px;gap:8px">
          <div class="row">${productIcon(p.id, 46)}
            <div class="grow"><p style="font-weight:700;line-height:1.2">${p.name} <span class="label">per ${p.unit}</span></p>
              <p class="small num">Cost ${trend} · sells ~${naira(G.marketPrice(S, p.id))}</p></div>
            <span class="tag" style="background:${p.life ? "var(--red-tint)" : "var(--green-tint)"};color:${p.life ? "var(--red-ink)" : "var(--green-ink)"}">${p.life ? `spoils in ${p.life} day${p.life > 1 ? "s" : ""}` : "keeps"}</span></div>
          <div class="row between"><p class="label">You have <b style="color:var(--ink)">${have}</b> · usually sells ~${demand[p.id]}</p>${stepper("cart", p.id, cart[p.id] || 0, p.name, { big: 5 })}</div>
        </div>`;
      }).join("")}
    </div>
    <div class="foot">
      <div class="row between small"><span class="muted">Order total</span><b class="num">${naira(total)}</b></div>
      <div class="row between small"><span class="muted">Cash left after buying</span><b class="num ${left < 0 ? "bad" : "good"}">${naira(left)}</b></div>
      <div class="row">${S.savings > 0 ? `<button class="btn btn-ghost" data-act="bank">Withdraw</button>` : ""}<button class="btn btn-primary grow" data-act="next" ${left < 0 ? "disabled" : ""}>${total ? "Buy & set prices" : "Set prices"}</button></div>
    </div>`;
  },
  act: {
    back: c => c.go("home"),
    cart: (c, el) => {
      const id = el.dataset.k, d = +el.dataset.v, S = c.S, cart = c.ui.cart;
      const cost = G.costToday(S, id);
      const total = Object.entries(cart).reduce((t, [k, q]) => t + q * G.costToday(S, k), 0);
      let q = Math.max(0, (cart[id] || 0) + d);
      if (d > 0) { const afford = Math.floor((S.cash - total) / cost); q = Math.min(q, (cart[id] || 0) + Math.max(0, afford)); if (afford < d) c.toast(afford <= 0 ? "Not enough cash for more." : `You could only afford ${afford} more.`); }
      cart[id] = q; c.sfx("tap"); c.ui.keepScroll = true; c.rerender();
    },
    bank: c => c.go("bank", { backTo: "buy" }),
    next: c => {
      const r = G.buyStock(c.S, c.ui.cart);
      if (!r.ok) { c.toast(r.error); return; }
      if (r.total) c.sfx("coin");
      c.ui.bought = (c.ui.bought || 0) + r.total; c.ui.cart = {};
      c.go("price");
    },
  },
  back: c => c.go("home"),
};

// ---------- Set prices ----------
function priceCard(S, p) {
  const cost = G.costToday(S, p.id), mkt = G.marketPrice(S, p.id), pr = S.prices[p.id];
  const m = pr - cost, rv = S.rival && S.rival.item === p.id ? S.rival.price : null;
  return `<div class="card stack" id="pc-${p.id}">
    <div class="row between"><div class="row">${productIcon(p.id, 36)}<div><b>${p.name}</b><p class="label">Have ${G.stockOf(S, p.id)}</p></div></div>
      <b class="num pv" style="font-size:22px;color:var(--action)">${naira(pr)}</b></div>
    <label class="label" for="pr-${p.id}">Price for one ${p.unit}</label>
    <input id="pr-${p.id}" type="range" min="${G.r50(cost * 0.8)}" max="${G.r50(mkt * 1.6)}" step="50" value="${pr}" data-input="price" data-id="${p.id}">
    <p class="small num pinfo">Cost ${naira(cost)} · <span class="${m >= 0 ? "good" : "bad"}" style="font-weight:700">${m >= 0 ? "profit" : "loss"} ${naira(Math.abs(m))} each</span> · market ~${naira(mkt)}${rv ? ` · <span style="color:#C2185B;font-weight:700">Chidi ${naira(rv)}</span>` : ""}</p>
  </div>`;
}
const PRICE = {
  render: c => {
    const S = c.S;
    const list = G.available(S).filter(p => G.stockOf(S, p.id) > 0);
    return `
    <div class="topbar plain"><div class="titlebar"><button class="iconbtn" style="background:var(--cream)" aria-label="Back to buying" data-act="back">${ICON.back}</button><div><p class="label">Before the market opens</p><h1 style="font-size:22px">Set Your Prices</h1></div></div></div>
    <div class="scroll">
      <p class="small muted">A higher price means more profit per sale, but more customers will haggle or walk away. Customers usually pay around the market price.</p>
      ${ST.streetOn(S) && S.chapter >= CONFIG.street.taskForce.fromChapter ? `<div class="card row" style="border:2px solid ${S.walkway ? "var(--purple)" : "var(--line)"}"><div class="grow"><b>Spread goods onto the walkway</b><p class="small muted">+${Math.round((CONFIG.street.taskForce.walkwayBonus - 1) * 100)}% customers, but the Task Force may raid and seize goods.</p></div><button class="btn ${S.walkway ? "btn-purple" : "btn-ghost"} btn-sm" data-act="walkway" aria-pressed="${!!S.walkway}">${S.walkway ? "On" : "Off"}</button></div>` : ""}
      ${list.length ? `<button class="btn btn-ghost btn-sm" data-act="market">Set all to market price</button>` + list.map(p => priceCard(S, p)).join("") : `<div class="card"><p>You have nothing to sell. Go back and buy some stock first.</p></div>`}
    </div>
    <div class="foot"><div class="row"><button class="btn btn-ghost" data-act="back">Buy more</button><button class="btn btn-primary grow" data-act="open" ${list.length ? "" : "disabled"}>Open the market</button></div></div>`;
  },
  input: {
    price: (c, el) => {
      const S = c.S, id = el.dataset.id, p = PRODUCT_BY_ID[id];
      S.prices[id] = +el.value;
      const card = document.getElementById("pc-" + id), cost = G.costToday(S, id), m = +el.value - cost, rv = S.rival && S.rival.item === id ? S.rival.price : null;
      card.querySelector(".pv").textContent = naira(+el.value);
      card.querySelector(".pinfo").innerHTML = `Cost ${naira(cost)} · <span class="${m >= 0 ? "good" : "bad"}" style="font-weight:700">${m >= 0 ? "profit" : "loss"} ${naira(Math.abs(m))} each</span> · market ~${naira(G.marketPrice(S, id))}${rv ? ` · <span style="color:#C2185B;font-weight:700">Chidi ${naira(rv)}</span>` : ""}`;
    },
  },
  act: {
    back: c => { c.ui.cart = {}; c.go("buy"); },
    market: c => { for (const p of G.available(c.S)) c.S.prices[p.id] = G.marketPrice(c.S, p.id); c.sfx("tap"); c.rerender(); },
    walkway: c => { c.S.walkway = !c.S.walkway; c.sfx("tap"); c.ui.keepScroll = true; c.rerender(); },
    open: c => {
      const S = c.S;
      const below = G.available(S).filter(p => G.stockOf(S, p.id) > 0 && S.prices[p.id] < G.costToday(S, p.id));
      if (below.length && !c.ui.warnedLoss) {
        c.ui.warnedLoss = true;
        c.sheet(`<h2>Selling at a loss?</h2><p>${below.map(p => p.name).join(", ")} ${below.length > 1 ? "are" : "is"} priced below what you paid. Every sale will lose money.</p>
          <div class="grid2"><button class="btn btn-ghost" data-act="close">Fix prices</button><button class="btn btn-primary" data-act="go">Open anyway</button></div>`,
          { close: c => c.closeSheet(), go: c => { c.closeSheet(); PRICE.act.open(c); } }, { center: true });
        return;
      }
      c.ui.warnedLoss = false;
      c.go("market");
    },
  },
  back: c => c.go("buy"),
};

// ---------- Ledger (end of day) ----------
const LEDGER = {
  render: c => {
    const S = c.S, L = c.ui.ledger || S.history[S.history.length - 1];
    const up = L.profit >= 0, hist = S.history.slice(-7);
    const maxAbs = Math.max(1, ...hist.map(h => Math.abs(h.profit)));
    return `
    <div style="background:var(--teal);color:#fff;padding:22px 16px 20px;text-align:center;border-radius:0 0 28px 28px" class="stack">
      <p class="small" style="font-weight:600">Evening · Day ${L.day} closed</p><h1 style="font-size:24px">Today's Ledger</h1>
      <p class="small" style="font-weight:600;margin-top:4px">Profit</p>
      <p class="num" style="font-weight:800;font-size:44px;line-height:1">${up ? "+" : ""}${naira(L.profit)}</p>
      <p class="small">${L.served} customers served · ${L.lost} walked away</p>
    </div>
    <div class="scroll">
      ${L.orderResult ? `<div class="card small" style="border:2px solid ${L.orderResult.ok ? "var(--green)" : "var(--red)"}">${esc(L.orderResult.text)}</div>` : ""}
      <div class="card" style="padding:4px 14px"><table class="ledger"><tbody>
        <tr><td>Sales (money in)</td><td class="good">+${naira(L.sales)}</td></tr>
        <tr><td>Cost of goods sold</td><td class="bad">${naira(-L.cogs)}</td></tr>
        ${L.spoiled ? `<tr><td>Spoiled stock</td><td class="bad">${naira(-L.spoiled)}</td></tr>` : ""}
        <tr><td>${G.stageOf(S).levy > 1000 ? "Rent and levy" : "Market levy"}</td><td class="bad">${naira(-L.levy)}</td></tr>
        ${L.wages ? `<tr><td>Staff wages</td><td class="bad">${naira(-L.wages)}</td></tr>` : ""}
        ${L.street ? [["extortion", "Agbero settlement / union"], ["hospital", "Clinic bill"], ["stolen", "Stolen by thief"], ["seized", "Seized by Task Force"], ["scattered", "Goods knocked over"]].filter(([k]) => L.street[k] > 0).map(([k, n]) => `<tr><td>${n}</td><td class="bad">${naira(-L.street[k])}</td></tr>`).join("") : ""}
        <tr><td><b>Profit</b></td><td class="${up ? "good" : "bad"}">${naira(L.profit)}</td></tr>
      </tbody></table></div>
      ${L.spoiledItems && L.spoiledItems.length ? `<div class="card small" style="border:2px solid #F2C9C9">${ICON.warn} Spoiled overnight: ${L.spoiledItems.join(", ")}.</div>` : ""}
      <p class="small muted" style="text-align:center">Profit = Sales − Cost of goods sold − Other costs<br>You also spent ${naira(L.bought)} on new stock; unsold stock stays on your shelf.</p>
      <div class="card stack"><p class="label">Profit by day</p>
        <div class="bars">${hist.map(h => `<div><i class="${h.profit < 0 ? "neg" : ""}" style="height:${Math.max(3, (Math.abs(h.profit) / maxAbs) * 70)}px"></i>D${h.day}</div>`).join("")}</div></div>
    </div>
    <div class="foot"><button class="btn btn-primary btn-block" data-act="night">Close the stall for the night</button></div>`;
  },
  act: { night: c => { c.ui.night = null; c.go("night"); } },
};

// ---------- Chapter complete + quiz ----------
const CHAPTER_END = {
  enter: c => {
    if (!c.ui.done) {
      const ch = G.chapterOf(c.S);
      const res = G.completeChapter(c.S);
      res.outro = ch.outro;
      (c.S.chapterResults ||= []).push({ chapter: res.chapter, days: res.days, gold: res.gold });
      c.ui.done = res;
      c.ui.quiz = { qs: pickQuiz(res.chapter), i: 0, picked: null, score: 0 };
      c.sfx("win");
    }
  },
  render: c => {
    const r = c.ui.done;
    return `${confetti()}
    <div class="scroll" style="text-align:center;align-items:center;background:var(--yellow)">
      <p class="eyebrow" style="margin-top:20px">Chapter ${r.chapter} complete</p>
      <h1 style="font-size:36px;color:var(--purple-deep)">${r.title}</h1>
      <div class="row" style="justify-content:center;gap:16px">
        <div class="card"><p class="label">Days taken</p><p class="big num">${r.days}</p></div>
        <div class="card"><p class="label">Gold star</p><p class="big" style="color:${r.gold ? "var(--action)" : "var(--line)"}">${ICON.star}</p></div>
        <div class="card"><p class="label">Wisdom</p><p class="big num">+${r.bonus}</p></div>
      </div>
      ${r.outro.map(l => `<div class="mama" style="text-align:left;width:100%">${castFace(l.who, 40)}<div class="say"><b>${CAST[l.who].name}</b>${esc(l.text)}</div></div>`).join("")}
    </div>
    <div class="foot"><button class="btn btn-purple btn-block" data-act="quiz">Take the Market Wisdom quiz</button></div>`;
  },
  act: { quiz: c => c.go("quiz") },
};
function pickQuiz(ch) {
  const pool = QUIZ.map((q, i) => ({ ...q, idx: i })).filter(q => q.chapter === ch);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, 4);
}
const QUIZSCR = {
  render: c => {
    const z = c.ui.quiz, total = z.qs.length;
    if (z.i >= total) {
      return `<div class="scroll" style="text-align:center;align-items:center;gap:16px">
        <p class="eyebrow" style="color:var(--purple);margin-top:30px">Market Wisdom quiz</p>
        <h1 style="font-size:34px">${z.score} / ${total} correct</h1>
        <p>${z.score === total ? "Perfect! Mama is very impressed." : z.score >= total / 2 ? "Well done. You're learning fast." : "Keep going. Every market day teaches something."}</p>
        <p class="tag" style="background:var(--purple-tint);color:var(--purple-deep);font-size:14px">+${z.score * CONFIG.wisdom.quizCorrect} wisdom</p>
      </div>
      <div class="foot"><button class="btn btn-primary btn-block" data-act="finish">${c.S.finished ? "See the ending" : "Start the next chapter"}</button></div>`;
    }
    const q = z.qs[z.i], done = z.picked !== null;
    return `<div class="scroll">
      <div class="row"><div class="dots grow" style="grid-template-columns:repeat(${total},1fr)">${z.qs.map((_, k) => `<span class="${k <= z.i ? "on" : ""}"></span>`).join("")}</div><b>${z.i + 1}/${total}</b></div>
      <p class="eyebrow" style="color:var(--purple-deep)">Market Wisdom · ${OBJECTIVES[q.objective - 1].name}</p>
      <h1 style="font-size:22px">${esc(q.q)}</h1>
      <div class="stack">${q.a.map((a, k) => `<button class="choice ${done && k === q.c ? "right" : ""} ${done && k === z.picked && k !== q.c ? "wrong" : ""}" data-act="answer" data-v="${k}" ${done ? "disabled" : ""}><span class="k">${"ABCD"[k]}</span>${esc(a)}</button>`).join("")}</div>
      ${done ? `<div class="card" style="background:${z.picked === q.c ? "var(--green-ink)" : "var(--red-ink)"};color:#fff"><p style="font-weight:700;font-size:18px">${z.picked === q.c ? "Correct! +" + CONFIG.wisdom.quizCorrect + " wisdom" : "Not quite"}</p><p class="small">${esc(q.why)}</p></div>` : ""}
    </div>
    ${done ? `<div class="foot"><button class="btn btn-primary btn-block" data-act="nextq">${z.i < total - 1 ? "Next question" : "See results"}</button></div>` : ""}`;
  },
  act: {
    answer: (c, el) => {
      const z = c.ui.quiz, q = z.qs[z.i], k = +el.dataset.v;
      z.picked = k;
      const right = k === q.c;
      G.addMastery(c.S, q.objective, right);
      if (right) { z.score++; c.S.wisdom += CONFIG.wisdom.quizCorrect; c.sfx("coin"); } else c.sfx("bad");
      c.rerender();
    },
    nextq: c => { const z = c.ui.quiz; z.i++; z.picked = null; c.sfx("page"); c.rerender(); },
    finish: c => {
      c.ui.done = null; c.ui.quiz = null; c.ui.story = 0;
      c.go(c.S.finished ? "ending" : "story");
    },
  },
};

const ENDING = {
  render: c => {
    const S = c.S, st = S.stats;
    return `${confetti(90)}
    <div class="scroll" style="text-align:center;align-items:center;background:var(--yellow)">
      <p class="eyebrow" style="margin-top:16px">The end · for now</p>
      <h1 style="font-size:32px;color:var(--purple-deep)">Mama Ronke's Supermarket is open!</h1>
      <div style="width:100%;border-radius:20px;overflow:hidden">${scene(3, S.umbrella, { height: 160 })}</div>
      <p>From an empty stall and a ₦50,000 debt to a supermarket in ${S.day} days, ${esc(S.name)}. Oja Ilu will never forget it.</p>
      <div class="card" style="width:100%;text-align:left;padding:4px 14px"><table class="ledger"><tbody>
        <tr><td>Total sales</td><td>${naira(st.sales)}</td></tr><tr><td>Total profit</td><td>${naira(st.profit)}</td></tr>
        <tr><td>Customers served</td><td>${st.served.toLocaleString()}</td></tr><tr><td>Best day</td><td>${naira(st.best)}</td></tr>
        <tr><td>Scams spotted</td><td>${S.scamsSpotted}</td></tr><tr><td>Femi refused</td><td>${S.femiRefused} time${S.femiRefused === 1 ? "" : "s"}</td></tr>
        <tr><td>Wisdom points</td><td>${S.wisdom}</td></tr><tr><td>Gold stars</td><td>${(S.chapterResults || []).filter(r => r.gold).length} / ${CHAPTERS.length}</td></tr>
      </tbody></table></div>
    </div>
    <div class="foot"><button class="btn btn-primary btn-block" data-act="free">Keep playing (free play)</button><button class="btn btn-ghost btn-block" data-act="progress">See my progress report</button></div>`;
  },
  act: { free: c => c.go("home"), progress: c => c.go("progress") },
};

// ---------- Global actions available on every screen ----------
const GLOBAL = {
  act: {
    home: c => c.go("home"),
    close: c => c.closeSheet(),
  },
};

export const SCREENS = {
  title: TITLE, newgame: NEWGAME, story: STORY, home: HOME, buy: BUY, price: PRICE,
  market: MARKET, ledger: LEDGER, night: NIGHT, bank: BANK, grow: GROW, progress: PROGRESS,
  menu: MENU, howto: HOWTO, chapterEnd: CHAPTER_END, quiz: QUIZSCR, ending: ENDING, global: GLOBAL,
  agbero: AGBERO, fight: FIGHT,
};
