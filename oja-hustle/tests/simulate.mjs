// Plays the whole game with a simple "sensible player" bot and reports
// how many days each chapter takes. Run:  node tests/simulate.mjs [games] [skill]
import * as G from "../www/js/engine/game.js";
import { CONFIG } from "../www/js/data/config.js";
import { STAGES } from "../www/js/data/stages.js";
import { PRODUCT_BY_ID } from "../www/js/data/products.js";
import * as ST from "../www/js/engine/street.js";

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function playGame(seed, skill = 0.8, maxDays = 400, log = false, smart = true, street = !process.env.NOSTREET) {
  const rng = mulberry32(seed);
  const s = G.newGame("Bot", 0);
  const chapterDays = [];
  const stageProfit = {};
  let chStart = 1;
  while (s.day <= maxDays && !s.finished) {
    // ---- morning: street life ----
    if (street) {
      if (!ST.isUnion(s) && s.chapter >= 2 && s.cash > ST.unionDues(s) * 4) ST.joinUnion(s);
      const ag = ST.agberoVisit(s, rng);
      if (ag) {
        if (ST.isUnion(s)) ST.agberoChoice(s, ag, "union", rng);
        else if (rng() < 0.25) ST.fightResult(s, ag, rng() < skill * 0.8 ? 3 : 1);
        else ST.agberoChoice(s, ag, s.respect > 50 ? "refuse" : "pay", rng);
      }
      s.walkway = s.chapter >= 2;
    }
    // ---- morning: buy ----
    const demand = G.expectedDemand(s);
    const need0 = Object.entries(demand).reduce((t, [id, q]) => t + q * G.costToday(s, id) * 1.15, 0) + (s.order ? s.order.qty * G.costToday(s, s.order.item) : 0);
    if (s.cash < need0 && s.savings > 0 && smart) G.applyPlan(s, { withdraw: Math.min(s.savings, need0 - s.cash) });
    const cart = {};
    const list = G.available(s).sort((a, b) => (b.sug - b.cost) / b.cost - (a.sug - a.cost) / a.cost);
    let budget = s.cash;
    for (const p of list) {
      let want = Math.ceil(demand[p.id] * (p.life ? 0.95 : 1.15));
      if (s.order && s.order.item === p.id) want += s.order.qty;
      let q = Math.max(0, want - G.stockOf(s, p.id));
      const c = G.costToday(s, p.id);
      q = Math.min(q, Math.floor(budget / c));
      if (q > 0) { cart[p.id] = q; budget -= q * c; }
    }
    const day = G.startDay(s, rng);
    G.buyStock(s, cart, day);
    for (const p of G.available(s)) s.prices[p.id] = G.r50(G.marketPrice(s, p.id) * (smart ? STAGES[s.stage].willingness * 1.03 : 1.05));
    G.fulfilOrder(s, day);
    // ---- market ----
    const why = {};
    const serveP = Math.min(0.97, 0.72 + 0.2 * skill + 0.05 * s.staff);
    let salesSoFar = 0;
    if (day.taskForce && rng() > Math.min(0.95, skill + 0.25)) ST.taskForceSeize(s);
    for (const c of day.customers) {
      if (c.thief) { const caught = rng() < Math.min(0.95, 0.4 + skill * 0.6); ST.thiefOutcome(s, caught, ST.thiefSnatch(s, day.sales)); continue; }
      if (rng() > serveP) { G.lose(s, day, "wait"); why.wait=(why.wait||0)+1; continue; }
      const d = G.decide(s, c);
      if (d === "buy") G.sell(s, day, c, s.prices[c.item]);
      else if (d === "haggle") { if (rng() < skill) G.sell(s, day, c, c.max); else G.lose(s, day, "price"); }
      else { G.lose(s, day, d === "nostock" ? "nostock" : "price"); why[d]=(why[d]||0)+1; }
    }
    const rec = G.endDay(s, day);
    const sid = STAGES[s.stage].id;
    (stageProfit[sid] ||= []).push(rec.profit);
    if (log) console.log(`D${s.day} ch${s.chapter} ${sid} st${s.staff} cust ${day.customers.length} sales ${rec.sales} cogs ${rec.cogs} spoil ${rec.spoiled} wage ${rec.wages} profit ${rec.profit} served ${rec.served} lost ${rec.lost} [${Object.entries(why).map(([k,v])=>k+':'+v).join(' ')}] cash ${Math.round(s.cash)} sav ${s.savings} debt ${s.debt}`);
    // ---- night ----
    for (const ev of G.nightEvents(s, rng)) {
      if (ev.type === "femi") G.femiDecision(s, false, ev.amount);
      if (ev.type === "scam") G.answerScam(s, ev.msg, rng() < skill ? MESSAGES_SCAM[ev.msg] : !MESSAGES_SCAM[ev.msg]);
      if (ev.type === "stock") G.stockCountResult(s, ev, rng() < skill ? ev.actual : ev.recorded);
      if (ev.type === "delivery") { if (G.costToday(s, ev.item) * ev.qty < s.cash + s.savings * 0.5) G.acceptDelivery(s, ev); }
    }
    const d2 = G.expectedDemand(s);
    const reserve = Object.entries(d2).reduce((t, [id, q]) => t + q * PRODUCT_BY_ID[id].cost * 1.15, 0);
    const keep = smart ? Math.min(reserve, CONFIG.robbery.cashThreshold[s.stage] * 0.9) : reserve;
    const spare = Math.max(0, s.cash - keep);
    if (s.debt > 0) G.applyPlan(s, { pay: spare });
    else G.applyPlan(s, { save: spare });
    if (s.cash < reserve * 0.6 && s.savings > 0) G.applyPlan(s, { withdraw: Math.min(s.savings, reserve * 0.6 - s.cash) });
    // ---- grow ----
    if (G.canHire(s)) G.hire(s);
    G.buyUpgrade(s);
    if (G.canHire(s)) G.hire(s);
    G.sleep(s, rng);
    const gs = G.goalStatus(s);
    if (gs.done) { chapterDays.push(s.day - chStart); chStart = s.day; G.completeChapter(s); }
  }
  const avg = {};
  for (const [k, v] of Object.entries(stageProfit)) avg[k] = Math.round(v.reduce((a, b) => a + b, 0) / v.length);
  return { chapterDays, totalDays: s.day, avg, finished: s.finished, rep: s.rep.toFixed(2), wisdom: s.wisdom };
}

import { MESSAGES } from "../www/js/data/scams.js";
const MESSAGES_SCAM = MESSAGES.map(m => m.scam);

if (import.meta.url === `file://${process.argv[1]}`) {
  const games = +(process.argv[2] || 30), skill = +(process.argv[3] || 0.8);
  const all = [];
  for (let i = 1; i <= games; i++) all.push(playGame(i * 7919, skill, 400, games === 1));
  const n = all[0].chapterDays.length;
  const meanCh = [0, 1, 2, 3, 4, 5].map(k => { const v = all.map(r => r.chapterDays[k]).filter(x => x !== undefined); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) + ` (${Math.min(...v)}–${Math.max(...v)})` : "—"; });
  console.log("skill", skill, "games", games, "finished", all.filter(r => r.finished).length);
  console.log("days per chapter:", meanCh.join(" | "));
  console.log("total days avg:", (all.reduce((a, r) => a + r.totalDays, 0) / games).toFixed(1));
  const st = {}; for (const r of all) for (const [k, v] of Object.entries(r.avg)) (st[k] ||= []).push(v);
  console.log("avg daily profit by stage:", Object.fromEntries(Object.entries(st).map(([k, v]) => [k, Math.round(v.reduce((a, b) => a + b, 0) / v.length)])));
}
