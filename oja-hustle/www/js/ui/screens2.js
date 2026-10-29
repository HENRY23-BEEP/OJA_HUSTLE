// ============================================================
//  MORE SCREENS — night, bank, grow, progress, menu, how to play
// ============================================================

import * as G from "../engine/game.js";
import { CONFIG } from "../data/config.js";
import { STAGES } from "../data/stages.js";
import { PRODUCT_BY_ID } from "../data/products.js";
import { CHAPTERS } from "../data/chapters.js";
import { OBJECTIVES } from "../data/quiz.js";
import { MESSAGES } from "../data/scams.js";
import { productIcon, productGlyph, scene, ICON, UMBRELLAS } from "./icons.js";
import { esc, naira, stars, pct, castFace } from "./util.js";
import { setAudio, music } from "./audio.js";
import * as ST from "../engine/street.js";

const amountSteps = (act, key, label) => `
  <div class="row wrap" style="gap:6px">
    <button class="btn btn-ghost btn-sm" data-act="${act}" data-k="${key}" data-v="-10000" aria-label="Less ₦10,000 ${label}">−10k</button>
    <button class="btn btn-ghost btn-sm" data-act="${act}" data-k="${key}" data-v="-1000" aria-label="Less ₦1,000 ${label}">−1k</button>
    <button class="btn btn-ghost btn-sm" data-act="${act}" data-k="${key}" data-v="1000" aria-label="More ₦1,000 ${label}">+1k</button>
    <button class="btn btn-ghost btn-sm" data-act="${act}" data-k="${key}" data-v="10000" aria-label="More ₦10,000 ${label}">+10k</button>
    <button class="btn btn-ghost btn-sm" data-act="${act}" data-k="${key}" data-v="max" aria-label="Maximum ${label}">Max</button>
  </div>`;

// ---------- Night: events, then money decisions ----------
export const NIGHT = {
  enter: c => {
    if (!c.ui.night) c.ui.night = { events: G.nightEvents(c.S), i: 0, result: null, plan: { pay: 0, save: 0 }, count: 0 };
  },
  render: c => {
    const S = c.S, n = c.ui.night;
    const header = `<div style="background:var(--indigo);color:#fff;padding:20px 16px 16px" class="row between">
      <div><p class="small" style="font-weight:600;opacity:.85">Night · Day ${S.day}</p><h1 style="font-size:24px">${n.i < n.events.length ? "Tonight at the stall" : "Money Decisions"}</h1></div>
      <svg aria-hidden="true" width="40" height="40" viewBox="0 0 44 44"><path d="M30 6a16 16 0 1 0 8 26A14 14 0 0 1 30 6z" fill="#FFC629"/></svg></div>`;
    if (n.i < n.events.length) return header + `<div class="scroll">${eventCard(c, n.events[n.i], n)}</div>`;
    return header + moneyPlan(c);
  },
  act: {
    femi: (c, el) => {
      const ev = c.ui.night.events[c.ui.night.i];
      G.femiDecision(c.S, el.dataset.v === "take", ev.amount);
      c.ui.night.result = el.dataset.v === "take"
        ? { tone: "bad", text: `You took ${naira(ev.amount)}. You must pay Femi ${naira(c.S.loans.femi.owe)} by Day ${c.S.loans.femi.due}. That's ${Math.round(CONFIG.femiLoan.interest * 100)}% interest in ${CONFIG.femiLoan.termDays} days.` }
        : { tone: "good", text: `Smart. A loan that costs ${Math.round(CONFIG.femiLoan.interest * 100)}% in ${CONFIG.femiLoan.termDays} days would eat your profit. +${CONFIG.wisdom.refuseFemi} wisdom.` };
      c.sfx(el.dataset.v === "take" ? "bad" : "coin"); c.rerender();
    },
    scam: (c, el) => {
      const ev = c.ui.night.events[c.ui.night.i];
      const r = G.answerScam(c.S, ev.msg, el.dataset.v === "scam");
      c.ui.night.result = { tone: r.right ? "good" : "bad", text: (r.right ? (r.msg.scam ? `Correct, it's a scam! +${CONFIG.wisdom.scamSpotted} wisdom. ` : "Correct, it's genuine. ") : (r.msg.scam ? `It was a scam! You lost ${naira(r.lost)}. ` : "It was actually genuine, but no harm done. ")) + r.msg.why };
      c.sfx(r.right ? "coin" : "bad"); c.rerender();
    },
    count: (c, el) => { const n = c.ui.night; n.count = Math.max(0, n.count + +el.dataset.v); c.sfx("tap"); c.rerender(); },
    countDone: c => {
      const n = c.ui.night, ev = n.events[n.i];
      const r = G.stockCountResult(c.S, ev, n.count);
      const p = PRODUCT_BY_ID[ev.item];
      n.result = r.right
        ? { tone: "good", text: r.missing ? `Correct, there are only ${ev.actual}! ${r.missing} ${p.name.toLowerCase()} went missing. You caught Chidi's apprentice and got them back. +${CONFIG.wisdom.stockCount} wisdom.` : `Correct, all ${ev.actual} are there. Good record keeping! +${CONFIG.wisdom.stockCount} wisdom.` }
        : { tone: "bad", text: r.missing ? `Wrong count. There were only ${ev.actual}, so ${r.missing} ${p.name.toLowerCase()} were stolen and you didn't notice in time.` : `Not quite: there were ${ev.actual}. Count carefully and match your records.` };
      c.sfx(r.right ? "coin" : "bad"); c.rerender();
    },
    delivery: (c, el) => {
      const n = c.ui.night, ev = n.events[n.i];
      if (el.dataset.v === "yes") { G.acceptDelivery(c.S, ev); n.result = { tone: "good", text: `Order accepted. Buy at least ${ev.qty} ${PRODUCT_BY_ID[ev.item].name.toLowerCase()} tomorrow morning so you can deliver.` }; }
      else n.result = { tone: "info", text: "Order declined. Only accept orders you can supply." };
      c.sfx("tap"); c.rerender();
    },
    nextEvent: c => { const n = c.ui.night; n.i++; n.result = null; n.count = 0; c.sfx("page"); c.rerender(); },
    plan: (c, el) => {
      const S = c.S, p = c.ui.night.plan, k = el.dataset.k, v = el.dataset.v;
      const free = S.cash - p.pay - p.save;
      if (v === "max") p[k] = k === "pay" ? Math.min(S.debt, Math.max(0, S.cash - p.save)) : Math.max(0, S.cash - p.pay);
      else { const d = +v; p[k] = Math.max(0, p[k] + (d > 0 ? Math.min(d, Math.max(0, free)) : d)); if (k === "pay") p.pay = Math.min(p.pay, S.debt); }
      p[k] = Math.floor(p[k] / 50) * 50;
      c.sfx("tap"); c.ui.keepScroll = true; c.rerender();
    },
    sleep: c => {
      const S = c.S;
      G.applyPlan(S, c.ui.night.plan);
      const notes = G.sleep(S);
      if (S.event) notes.push({ tone: "info", text: S.event.text });
      c.ui.notes = notes; c.ui.night = null; c.ui.ledger = null;
      c.sfx("page");
      c.go("home");
    },
    bank: c => c.go("bank", { backTo: "night" }),
  },
};

function resultBox(r) {
  if (!r) return "";
  return `<div class="card small" style="background:${r.tone === "good" ? "var(--green-tint)" : r.tone === "bad" ? "var(--red-tint)" : "var(--white)"}">${esc(r.text)}</div>
    <button class="btn btn-primary btn-block" data-act="nextEvent">Continue</button>`;
}

function eventCard(c, ev, n) {
  const S = c.S, done = !!n.result;
  if (ev.type === "femi") {
    const owe = G.r50(ev.amount * (1 + CONFIG.femiLoan.interest));
    return `<div class="card stack" style="border:2px solid var(--red)">
      <span class="tag" style="background:var(--red);color:#fff;align-self:flex-start">SURPRISE VISITOR</span>
      <div class="row">${castFace("femi", 52)}<h2 style="font-size:19px">"Fast Money" Femi</h2></div>
      <p>"My friend! Why struggle? Take <b>${naira(ev.amount)}</b> now. Just pay me back <b>${naira(owe)}</b> in ${CONFIG.femiLoan.termDays} days. Easy!"</p>
      <p class="small bad" style="font-weight:700">That's ${Math.round(CONFIG.femiLoan.interest * 100)}% interest in ${CONFIG.femiLoan.termDays} days. The bank charges ${Math.round(CONFIG.bankLoan.interestWeekly * 100)}% a week.</p>
      ${done ? "" : `<div class="grid2"><button class="btn btn-green" data-act="femi" data-v="no">No, thank you</button><button class="btn btn-ghost" data-act="femi" data-v="take">Take the money</button></div>`}
    </div>${resultBox(n.result)}`;
  }
  if (ev.type === "scam") {
    const m = MESSAGES[ev.msg];
    return `<p class="small muted">A message arrives on your phone. Is it a scam, or is it legit?</p>
    <div class="card stack" style="background:#F4F0FF">
      <p class="label">${esc(m.from)}</p>
      <p style="font-size:16px;line-height:1.45">${esc(m.text)}</p>
    </div>
    ${done ? "" : `<div class="grid2"><button class="btn btn-danger" style="font-weight:700" data-act="scam" data-v="scam">Scam</button><button class="btn btn-green" data-act="scam" data-v="legit">Legit</button></div>`}
    ${resultBox(n.result)}`;
  }
  if (ev.type === "stock") {
    const p = PRODUCT_BY_ID[ev.item];
    const cells = Array.from({ length: ev.actual }, () => `<span style="display:inline-flex">${productGlyph(p.id, 30)}</span>`).join("");
    return `<div class="card stack">
      <span class="tag" style="background:var(--purple-tint);color:var(--purple-deep);align-self:flex-start">STOCK COUNT</span>
      <p>Your ledger says you have <b>${ev.recorded} ${p.name.toLowerCase()}</b>. Count what's really on the shelf.</p>
      <div style="display:flex;flex-wrap:wrap;gap:4px;padding:10px;background:var(--sand);border-radius:12px">${cells}</div>
      ${done ? "" : `<div class="row between"><span class="label">I counted</span><div class="stepper"><button data-act="count" data-v="-1" aria-label="Count one less">−</button><span class="val">${n.count}</span><button class="plus" data-act="count" data-v="1" aria-label="Count one more">+</button></div></div>
      <button class="btn btn-purple" data-act="countDone">Check my count</button>`}
    </div>${resultBox(n.result)}`;
  }
  if (ev.type === "delivery") {
    const p = PRODUCT_BY_ID[ev.item], cost = G.costToday(S, ev.item);
    return `<div class="card stack" style="border:2px solid var(--teal)">
      <span class="tag" style="background:var(--teal);color:#fff;align-self:flex-start">DELIVERY ORDER</span>
      <div class="row">${productIcon(p.id, 48)}<div><h2 style="font-size:18px">${esc(ev.client)}</h2><p class="small">wants <b>${ev.qty} ${p.name.toLowerCase()}</b> tomorrow at ${naira(ev.unit)} each</p></div></div>
      <p class="small num">Order value <b>${naira(ev.qty * ev.unit)}</b> · today's cost ~${naira(cost)} each · you have ${G.stockOf(S, ev.item)}</p>
      <p class="small muted">If you can't deliver, the order is cancelled and your reputation drops.</p>
      ${done ? "" : `<div class="grid2"><button class="btn btn-ghost" data-act="delivery" data-v="no">Decline</button><button class="btn btn-green" data-act="delivery" data-v="yes">Accept order</button></div>`}
    </div>${resultBox(n.result)}`;
  }
  return "";
}

function moneyPlan(c) {
  const S = c.S, p = c.ui.night.plan;
  const keep = S.cash - p.pay - p.save;
  const thr = CONFIG.robbery.cashThreshold[S.stage];
  const risky = G.hasFeature(S, "robbery") && keep > thr;
  const reserve = Object.entries(G.expectedDemand(S)).reduce((t, [id, q]) => t + q * G.costToday(S, id), 0);
  return `<div class="scroll">
    <div class="row between"><b>Cash in hand</b><b class="num good" style="font-size:22px">${naira(S.cash)}</b></div>
    <div class="split" role="img" aria-label="Debt ${naira(p.pay)}, savings ${naira(p.save)}, kept ${naira(keep)}">
      <span style="flex:${p.pay || 0.0001};background:var(--action)"></span><span style="flex:${p.save || 0.0001};background:var(--teal)"></span><span style="flex:${Math.max(keep, 0.0001)};background:var(--purple)"></span></div>
    ${S.debt > 0 ? `<div class="card stack"><div class="row between"><div><b>Pay the debt</b><p class="label">${naira(S.debt)} still owed</p></div><b class="num" style="color:var(--action)">${naira(p.pay)}</b></div>${amountSteps("plan", "pay", "debt payment")}</div>` : ""}
    <div class="card stack"><div class="row between"><div><b>Savings jar</b><p class="label">Now ${naira(S.savings)} · +${Math.round(CONFIG.savingsInterestWeekly * 100)}% every 7 days</p></div><b class="num" style="color:var(--teal-ink)">${naira(p.save)}</b></div>${amountSteps("plan", "save", "savings")}</div>
    <div class="card row between"><div><b>Keep as cash</b><p class="label">Tomorrow's stock usually costs ~${naira(reserve)}</p></div><b class="num ${keep < Math.min(reserve, 3000) ? "bad" : ""}">${naira(keep)}</b></div>
    ${keep < Math.min(reserve * 0.5, 5000) && S.savings + keep < reserve ? `<div class="card small row" style="background:#FFF3D6">${ICON.warn}<span>You're keeping very little cash. You may not be able to buy enough stock tomorrow.</span></div>` : ""}
    ${risky ? `<div class="card small row" style="background:var(--red-tint)">${ICON.warn}<span>Keeping more than ${naira(thr)} cash overnight is risky. Thieves target stalls with cash. Money in savings is safe, and you can withdraw it in the morning.</span></div>` : ""}
    ${keep < 0 ? `<p class="small bad">You can't plan more than the cash you have.</p>` : ""}
  </div>
  <div class="foot"><button class="btn btn-primary btn-block" data-act="sleep" ${keep < 0 ? "disabled" : ""}>Sleep → Day ${S.day + 1}</button></div>`;
}

// ---------- Bank ----------
export const BANK = {
  enter: c => { c.ui.bankAmt = c.ui.bankAmt || 0; },
  render: c => {
    const S = c.S, lim = G.bankLoanLimit(S), daysToInterest = 7 - ((S.day - 1) % 7);
    return `
    <div class="topbar" style="background:var(--teal);color:#fff"><div class="titlebar"><button class="iconbtn" aria-label="Back" data-act="back" style="color:var(--ink)">${ICON.back}</button><div><p class="small" style="font-weight:600">Mrs. Ada · Oja Ilu Bank</p><h1 style="font-size:22px">Bank</h1></div></div></div>
    <div class="scroll">
      <div class="grid2"><div class="card"><p class="label">Cash in hand</p><p class="big num" style="font-size:22px">${naira(S.cash)}</p></div><div class="card"><p class="label">Savings</p><p class="big num" style="font-size:22px;color:var(--teal-ink)">${naira(S.savings)}</p></div></div>
      <p class="small muted">Savings earn ${Math.round(CONFIG.savingsInterestWeekly * 100)}% interest every 7 days (next payment in ${daysToInterest} day${daysToInterest === 1 ? "" : "s"}). Savings are safe from thieves.</p>
      <div class="card stack"><div class="row between"><b>Amount</b><b class="num" style="font-size:22px">${naira(c.ui.bankAmt)}</b></div>
        ${amountSteps("amt", "amt", "amount")}
        <div class="grid2"><button class="btn btn-ghost" data-act="withdraw" ${!c.ui.bankAmt || S.savings <= 0 ? "disabled" : ""}>Withdraw</button><button class="btn btn-green" data-act="deposit" ${!c.ui.bankAmt || S.cash <= 0 ? "disabled" : ""}>Save</button></div></div>
      ${G.hasFeature(S, "bankLoans") ? `<div class="card stack"><h2 style="font-size:17px">Bank loan</h2>
        ${S.loans.bank ? `<p class="small">You owe <b>${naira(S.loans.bank.owe)}</b>, due Day ${S.loans.bank.due}.</p><button class="btn btn-ghost" data-act="repay" data-k="bank">Repay from cash</button>`
        : lim > 0 ? `<p class="small">You can borrow up to <b>${naira(lim)}</b> at ${Math.round(CONFIG.bankLoan.interestWeekly * 100)}% a week for ${CONFIG.bankLoan.termDays} days. Only borrow to buy stock you're sure you can sell.</p><button class="btn btn-ghost" data-act="loan">Borrow ${naira(Math.min(lim, Math.max(c.ui.bankAmt, 10000)))}</button>`
        : `<p class="small muted">Keep money in savings for ${CONFIG.bankLoan.minSavingsDays} days in a row to qualify for a bank loan.</p>`}</div>` : ""}
      ${S.loans.femi ? `<div class="card stack" style="border:2px solid var(--red)"><h2 style="font-size:17px">Femi's loan</h2><p class="small">You owe <b>${naira(S.loans.femi.owe)}</b>, due Day ${S.loans.femi.due}. Late payment adds ${Math.round(CONFIG.femiLoan.lateDebtPenalty * 100)}%.</p><button class="btn btn-ghost" data-act="repay" data-k="femi">Repay from cash</button></div>` : ""}
      ${S.debt > 0 && c.ui.backTo !== "night" ? `<div class="card stack"><h2 style="font-size:17px">Debt to Alhaji Musa</h2><p class="small">${naira(S.debt)} still owed. Pay it at night in Money Decisions.</p></div>` : ""}
    </div>`;
  },
  act: {
    back: c => c.go(c.ui.backTo || "home"),
    amt: (c, el) => {
      const S = c.S, v = el.dataset.v;
      if (v === "max") c.ui.bankAmt = Math.max(S.cash, S.savings);
      else c.ui.bankAmt = Math.max(0, c.ui.bankAmt + +v);
      c.sfx("tap"); c.rerender();
    },
    deposit: c => { const a = Math.min(c.ui.bankAmt, Math.max(0, c.S.cash)); G.applyPlan(c.S, { save: a }); c.toast(`Saved ${naira(Math.floor(a / 50) * 50)}.`); c.ui.bankAmt = 0; c.sfx("coin"); c.rerender(); c.save(); },
    withdraw: c => { const a = Math.min(c.ui.bankAmt, c.S.savings); G.applyPlan(c.S, { withdraw: a }); c.toast(`Withdrew ${naira(a)}.`); c.ui.bankAmt = 0; c.sfx("coin"); c.rerender(); c.save(); },
    loan: c => { const lim = G.bankLoanLimit(c.S); const a = Math.min(lim, Math.max(c.ui.bankAmt, 10000)); if (G.takeBankLoan(c.S, a)) { c.toast(`Borrowed ${naira(a)} from the bank.`); c.sfx("coin"); c.rerender(); c.save(); } },
    repay: (c, el) => { const paid = G.repayLoan(c.S, el.dataset.k); c.toast(paid ? `Repaid ${naira(paid)}.` : "You have no cash to repay with."); c.sfx(paid ? "coin" : "bad"); c.rerender(); c.save(); },
  },
  back: c => c.go(c.ui.backTo || "home"),
};

// ---------- Grow: upgrades, staff, decoration ----------
export const GROW = {
  render: c => {
    const S = c.S, nx = G.nextStage(S), st = G.stageOf(S);
    return `
    <div class="topbar plain"><div class="titlebar"><button class="iconbtn" style="background:var(--cream)" aria-label="Back" data-act="back">${ICON.back}</button><h1 style="font-size:22px">Grow your business</h1></div></div>
    <div class="scroll">
      <div class="stack">${STAGES.map((g, i) => `<div class="card row" style="${i === S.stage ? "border:2px solid var(--green)" : i < S.stage ? "opacity:.65" : ""}">
        <div class="grow"><p class="eyebrow" style="color:${i === S.stage ? "var(--green-ink)" : "var(--muted)"}">${i < S.stage ? "Done" : i === S.stage ? "You are here" : i === S.stage + 1 ? "Next" : "Later"}</p>
          <h2 style="font-size:18px">${g.name}</h2><p class="small muted">${g.cost ? naira(g.cost) + " from savings · " : ""}${g.customers}+ customers a day · levy ${naira(g.levy)}</p>
          ${i > S.stage ? `<p class="small">${g.perks.join(" · ")}</p>` : ""}</div>
      </div>`).join("")}</div>
      ${nx ? `<div class="card stack"><h2 style="font-size:18px">Upgrade to ${nx.name}</h2>
        <div class="row between small"><span>Savings</span><b class="num">${naira(Math.min(S.savings, nx.cost))} / ${naira(nx.cost)}</b></div>
        <div class="prog"><i style="width:${pct(S.savings, nx.cost)}%"></i></div>
        <p class="small muted">Upgrades are paid from savings, never from loans. Keep enough cash for tomorrow's stock.</p>
        <button class="btn btn-green" data-act="upgrade" ${S.savings >= nx.cost ? "" : "disabled"}>${S.savings >= nx.cost ? `Open the ${nx.name}!` : `Need ${naira(nx.cost - S.savings)} more`}</button></div>` : ""}
      <div class="card stack"><div class="row between"><h2 style="font-size:18px">Staff</h2><span class="label">${S.staff} / ${st.maxStaff}</span></div>
        ${G.hasFeature(S, "staff") ? (st.maxStaff ? `<p class="small">Each staff member serves a waiting customer about every ${CONFIG.staffServeSeconds} seconds at your set price. Wage: <b>${naira(st.wage)}</b> per day each.</p>
          <div class="grid2"><button class="btn btn-ghost" data-act="fire" ${S.staff ? "" : "disabled"}>Let one go</button><button class="btn btn-green" data-act="hire" ${G.canHire(S) ? "" : "disabled"}>Hire</button></div>` : `<p class="small muted">Upgrade to a Shop to make room for staff.</p>`)
        : `<p class="small muted">You can hire staff from Chapter ${CONFIG.features.staff}.</p>`}</div>
      ${ST.streetOn(S) ? `<div class="card stack" style="border:2px solid ${ST.isUnion(S) ? "var(--green)" : "var(--line)"}"><div class="row between"><h2 style="font-size:18px">Market Union</h2><span class="tag" style="background:${ST.isUnion(S) ? "var(--green-tint)" : "var(--cream)"};color:${ST.isUnion(S) ? "var(--green-ink)" : "var(--muted)"}">${ST.isUnion(S) ? `Member until Day ${S.unionUntil}` : "Not a member"}</span></div>
        <p class="small">Dues: <b>${naira(ST.unionDues(S))}</b> for ${CONFIG.street.union.days} days. Members can call the chairman when agberos come (works ${Math.round(CONFIG.street.agbero.unionProtect * 100)}% of the time), get fewer agbero visits, and get an early warning before Task Force raids.</p>
        <p class="small muted">Like insurance: a small, planned cost that protects you from big, surprise losses.</p>
        <button class="btn btn-green" data-act="union" ${S.cash >= ST.unionDues(S) ? "" : "disabled"}>${ST.isUnion(S) ? "Renew for 7 more days" : "Join the Union"} (${naira(ST.unionDues(S))} cash)</button></div>` : ""}
      <div class="card stack"><h2 style="font-size:18px">Decorate your umbrella</h2><p class="small muted">Unlock colours with Wisdom Points (you have ${S.wisdom}).</p>
        <div class="grid2" style="grid-template-columns:repeat(4,minmax(0,1fr))">${UMBRELLAS.map((u, i) => { const ok = S.wisdom >= u.cost; return `<button type="button" class="swatch ${S.umbrella === i ? "on" : ""}" style="background:linear-gradient(135deg, ${u.a} 50%, ${u.b} 50%);${ok ? "" : "opacity:.35"}" data-act="umbrella" data-v="${i}" aria-label="${u.name}${ok ? "" : ", needs " + u.cost + " wisdom"}" ${ok ? "" : "disabled"}></button>`; }).join("")}</div>
        <div class="row" style="justify-content:space-around">${UMBRELLAS.map(u => `<span class="label">${u.cost ? u.cost : "Free"}</span>`).join("")}</div>
        <div style="border-radius:14px;overflow:hidden">${scene(S.stage, S.umbrella, { height: 120 })}</div></div>
    </div>`;
  },
  act: {
    back: c => c.go("home"),
    upgrade: c => {
      const nx = G.nextStage(c.S);
      if (G.buyUpgrade(c.S)) {
        c.sfx("win"); c.save();
        c.sheet(`${scene(c.S.stage, c.S.umbrella, { height: 150 })}<h2 style="font-size:24px">Welcome to your ${nx.name}!</h2><p>${nx.perks.join(". ")}.</p><button class="btn btn-primary" data-act="close">Wonderful!</button>`, { close: c => { c.closeSheet(); c.go("home"); } }, { center: true });
      }
    },
    hire: c => { if (G.hire(c.S)) { c.sfx("coin"); c.toast("You hired a new staff member."); c.rerender(); c.save(); } },
    union: c => { if (ST.joinUnion(c.S)) { c.sfx("coin"); c.toast(`You're a Market Union member until Day ${c.S.unionUntil}.`); c.ui.keepScroll = true; c.rerender(); c.save(); } },
    fire: c => { if (G.fire(c.S)) { c.sfx("tap"); c.rerender(); c.save(); } },
    umbrella: (c, el) => { c.S.umbrella = +el.dataset.v; c.sfx("tap"); c.ui.keepScroll = true; c.rerender(); c.save(); },
  },
  back: c => c.go("home"),
};

// ---------- Progress report ----------
export const PROGRESS = {
  render: c => {
    const S = c.S, st = S.stats, res = S.chapterResults || [];
    return `
    <div class="topbar plain"><div class="titlebar"><button class="iconbtn" style="background:var(--cream)" aria-label="Back" data-act="back">${ICON.back}</button><h1 style="font-size:22px">Progress Report</h1></div></div>
    <div class="scroll">
      <div class="card stack"><h2 style="font-size:18px">What you've learned</h2><p class="small muted">Based on quiz answers, scams, stock counts, change and loan choices.</p>
        ${OBJECTIVES.map(o => { const m = G.masteryPct(S, o.id); return `<div class="stack" style="gap:3px"><div class="row between small"><span><b>${o.name}</b> · <span class="muted">${o.short}</span></span><b class="num">${m}%</b></div><div class="prog"><i style="width:${m}%;background:${m >= 75 ? "var(--green)" : m >= 40 ? "var(--yellow)" : "var(--orange)"}"></i></div></div>`; }).join("")}</div>
      <div class="card stack"><h2 style="font-size:18px">Chapters</h2>
        ${CHAPTERS.map(ch => { const r = res.find(x => x.chapter === ch.id); const cur = !S.finished && S.chapter === ch.id; return `<div class="row between small"><span>${ch.id}. ${ch.title}</span><span style="font-weight:700;color:${r ? (r.gold ? "var(--action)" : "var(--green-ink)") : "var(--muted)"}">${r ? `${r.gold ? "★ " : ""}${r.days} days` : cur ? "In progress" : "Locked"}</span></div>`; }).join("")}</div>
      <div class="card" style="padding:4px 14px"><table class="ledger"><tbody>
        <tr><td>Days played</td><td>${st.days}</td></tr><tr><td>Total sales</td><td>${naira(st.sales)}</td></tr><tr><td>Total profit</td><td>${naira(st.profit)}</td></tr>
        <tr><td>Best day</td><td>${naira(st.best)}</td></tr><tr><td>Customers served</td><td>${st.served.toLocaleString()}</td></tr><tr><td>Customers lost</td><td>${st.lost.toLocaleString()}</td></tr>
        <tr><td>Haggles won</td><td>${st.haggleWins} / ${st.haggles}</td></tr><tr><td>Goods spoiled</td><td>${naira(st.spoiled)}</td></tr>
        <tr><td>Scams spotted / fallen for</td><td>${S.scamsSpotted} / ${S.scamsFell}</td></tr><tr><td>Reputation</td><td class="stars">${stars(S.rep)}</td></tr>
        <tr><td>Wisdom points</td><td>${S.wisdom}</td></tr>
        ${ST.streetOn(S) ? `<tr><td>Street respect</td><td>${Math.round(S.respect)} / 100</td></tr><tr><td>Fights won / lost</td><td>${st.fightsWon || 0} / ${st.fightsLost || 0}</td></tr><tr><td>Thieves caught</td><td>${st.thievesCaught || 0}</td></tr><tr><td>Union dues paid</td><td>${naira(S.unionPaid || 0)}</td></tr>` : ""}
      </tbody></table></div>
    </div>`;
  },
  act: { back: c => c.go("home") },
  back: c => c.go("home"),
};

// ---------- Menu and settings ----------
const toggle = (key, label, on) => `<div class="card row between"><span style="font-weight:600">${label}</span><button class="btn ${on ? "btn-green" : "btn-ghost"} btn-sm" data-act="toggle" data-k="${key}" aria-pressed="${on}">${on ? "On" : "Off"}</button></div>`;
export const MENU = {
  render: c => {
    const s = c.S.settings;
    return `
    <div class="topbar plain"><div class="titlebar"><button class="iconbtn" style="background:var(--cream)" aria-label="Back" data-act="back">${ICON.back}</button><h1 style="font-size:22px">Menu</h1></div></div>
    <div class="scroll">
      ${toggle("sound", "Sound effects", s.sound)}
      ${toggle("music", "Music", s.music)}
      ${toggle("large", "Larger text", s.large)}
      ${toggle("street", "Street life (agberos, fights, thieves, Task Force)", s.street !== false)}
      <button class="btn btn-ghost btn-block" data-act="howto">How to play</button>
      <button class="btn btn-ghost btn-block" data-act="title">Title screen</button>
      <div class="card stack"><h2 style="font-size:17px">About</h2><p class="small">Oja Hustle v${CONFIG.version} · An educational business game about profit, budgeting, saving and avoiding scams, set in a Nigerian market. Your progress is saved on this device and the game works offline.</p></div>
      <div class="card stack"><h2 style="font-size:17px">Start over</h2><p class="small">Erase this game and begin again from Chapter 1.</p><button class="btn btn-danger" data-act="reset">Reset game</button></div>
    </div>`;
  },
  act: {
    back: c => c.go("home"),
    toggle: (c, el) => { const k = el.dataset.k; c.S.settings[k] = c.S.settings[k] === false ? true : !c.S.settings[k]; setAudio(c.S.settings); if (k === "music" && c.S.settings.music) music.start(); c.sfx("tap"); c.rerender(); c.save(); },
    howto: c => c.go("howto", { backTo: "menu" }),
    title: c => c.go("title"),
    reset: c => c.sheet(`<h2>Reset the whole game?</h2><p>All progress for ${esc(c.S.name)} will be erased. This can't be undone.</p>
      <div class="grid2"><button class="btn btn-ghost" data-act="close">Cancel</button><button class="btn btn-danger" data-act="yes">Erase</button></div>`,
      { close: c => c.closeSheet(), yes: c => { c.closeSheet(); try { localStorage.removeItem(CONFIG.saveKey); } catch (e) {} c.S = null; c.ui = {}; c.go("title"); } }, { center: true }),
  },
  back: c => c.go("home"),
};

export const HOWTO = {
  render: c => `
    <div class="topbar plain"><div class="titlebar"><button class="iconbtn" style="background:var(--cream)" aria-label="Back" data-act="back">${ICON.back}</button><h1 style="font-size:22px">How to play</h1></div></div>
    <div class="scroll">
      <div class="card stack"><h2 style="font-size:17px">Every market day</h2><ol class="small" style="margin:0;padding-left:20px;line-height:1.6">
        <li><b>Buy stock</b> in the morning with your cash. Watch out: bread, eggs, tomatoes and chicken spoil.</li>
        <li><b>Set prices.</b> Above the market price, customers haggle or walk away. Below your cost, you lose money.</li>
        <li><b>Serve customers</b> by tapping them before their patience bar runs out.</li>
        <li><b>Haggle</b> when customers bargain. Counter-offer, but never go below your cost price.</li>
        <li><b>Read the ledger.</b> Profit = sales − cost of goods − levy, wages and waste.</li>
        <li><b>At night,</b> pay debts, put money in savings and handle surprises.</li></ol></div>
      <div class="card stack"><h2 style="font-size:17px">Growing</h2><p class="small">Finish each chapter's goal to move the story on. Save up to upgrade from a stall to a Shop, Mini-Mart and finally a Supermarket. From Chapter 5 you can hire staff who serve customers for you.</p></div>
      <div class="card stack"><h2 style="font-size:17px">Watch out for</h2><p class="small"><b>Fast Money Femi</b>'s expensive loans, <b>scam messages</b>, <b>thieves</b> who steal cash kept at the stall overnight, and <b>Chidi</b> the rival trader who undercuts your prices.</p></div>
      <div class="card stack"><h2 style="font-size:17px">Street life</h2><p class="small"><b>Agberos</b> may block your stall and demand "settlement": pay, beg, refuse, call the Market Union, or fight. <b>Thieves</b> in hoodies hang around without buying, so tap them before they grab your money box, or shout "OLE!" to chase them. Spread goods on the <b>walkway</b> for more customers, but pack fast when the <b>Task Force</b> comes. Switch all of this off in Menu if you prefer.</p></div>
      <div class="card stack"><h2 style="font-size:17px">Mini-games</h2><p class="small"><b>Haggle Duel</b> when customers bargain · <b>Give the right change</b> when customers pay with big notes · <b>Stock count</b> to catch thieves · <b>Scam or legit?</b> messages · <b>Market Wisdom quiz</b> at the end of each chapter.</p></div>
    </div>`,
  act: { back: c => c.go(c.ui.backTo || "title") },
  back: c => c.go(c.ui.backTo || "title"),
};
