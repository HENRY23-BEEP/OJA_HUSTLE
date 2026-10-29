// ============================================================
//  OJA HUSTLE — GAME RULES (no screen code in this file)
//  Every function takes the game state and changes it.
//  `rng` is a random-number function (Math.random by default),
//  so the balancing simulation can replay games exactly.
// ============================================================

import { CONFIG } from "../data/config.js";
import { STAGES } from "../data/stages.js";
import { PRODUCTS, PRODUCT_BY_ID } from "../data/products.js";
import { CHAPTERS } from "../data/chapters.js";
import { EVENTS, CUSTOMER_NAMES, SKINS, SHIRTS, DELIVERY_CLIENTS } from "../data/events.js";
import { MESSAGES } from "../data/scams.js";
import { planThief, planTaskForce, resetStreetDay, streetTotal } from "./street.js";

// ---------- small helpers ----------
export const r50 = n => Math.round(n / 50) * 50;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const between = (rng, a, b) => a + rng() * (b - a);
const pickFrom = (rng, arr) => arr[Math.floor(rng() * arr.length)];
export const naira = n => (n < 0 ? "−₦" : "₦") + Math.abs(Math.round(n)).toLocaleString("en-NG");

export const stageOf = s => STAGES[s.stage];
export const chapterOf = s => CHAPTERS[Math.min(s.chapter, CHAPTERS.length) - 1];
export const hasFeature = (s, f) => s.chapter >= CONFIG.features[f];

// ---------- new game ----------
export function newGame(name = "Tobi", look = 0) {
  const s = {
    v: 1, name, look, umbrella: 0,
    chapter: 1, chapterStartDay: 1, chapterProfit: 0, introSeen: 0, finished: false,
    day: 1, stage: 0, staff: 0,
    cash: CONFIG.startCash, debt: CONFIG.startDebt, savings: 0, savingsSince: null,
    rep: CONFIG.rep.start, wisdom: 0,
    inv: {}, prices: {}, wave: {}, rival: null, event: null,
    loans: { bank: null, femi: null },
    order: null, femiOfferedDay: -99, scamsSpotted: 0, scamsFell: 0, femiRefused: 0, msgCursor: 0,
    history: [], notes: [],
    stats: { sales: 0, profit: 0, served: 0, lost: 0, haggles: 0, haggleWins: 0, spoiled: 0, best: 0, quickChange: 0, days: 0 },
    mastery: { 1: [0, 0], 2: [0, 0], 3: [0, 0], 4: [0, 0], 5: [0, 0], 6: [0, 0] },
    settings: { sound: true, music: true, large: false, street: true },
    respect: CONFIG.street.respect.start, heat: 0, unionUntil: 0, unionPaid: 0, injured: false, walkway: false,
    street: { extortion: 0, hospital: 0, stolen: 0, seized: 0, scattered: 0 },
  };
  for (const p of PRODUCTS) { s.inv[p.id] = []; s.prices[p.id] = p.sug; s.wave[p.id] = 1; }
  return s;
}

// Fill in anything missing from an older save file.
export function upgradeSave(s) {
  const base = newGame(s.name, s.look);
  for (const k of Object.keys(base)) if (s[k] === undefined) s[k] = base[k];
  for (const p of PRODUCTS) {
    if (!s.inv[p.id]) s.inv[p.id] = [];
    if (s.prices[p.id] === undefined) s.prices[p.id] = p.sug;
    if (s.wave[p.id] === undefined) s.wave[p.id] = 1;
  }
  s.settings = Object.assign({}, base.settings, s.settings);
  s.street = Object.assign({}, base.street, s.street);
  s.stats = Object.assign({}, base.stats, s.stats);
  return s;
}

// ---------- products and prices ----------
export function available(s) {
  return PRODUCTS.filter(p => s.chapter >= p.unlockChapter && s.stage >= p.unlockStage);
}
export function costToday(s, id) {
  const p = PRODUCT_BY_ID[id];
  let c = p.cost * (s.wave[id] || 1);
  if (s.event && s.event.hike && s.event.item === id) c *= s.event.hike;
  return r50(c);
}
export function marketPrice(s, id) {
  return r50(PRODUCT_BY_ID[id].sug * (s.wave[id] || 1));
}
export const stockOf = (s, id) => s.inv[id].reduce((t, b) => t + b.qty, 0);
export const stockValue = s => PRODUCTS.reduce((t, p) => t + s.inv[p.id].reduce((u, b) => u + b.qty * b.cost, 0), 0);

function addStock(s, id, qty, unitCost) {
  if (qty > 0) s.inv[id].push({ qty, age: 0, cost: unitCost });
}
// Removes oldest stock first. Returns the cost of what was removed.
function takeStock(s, id, qty) {
  let need = qty, cost = 0;
  const arr = s.inv[id].sort((a, b) => b.age - a.age);
  for (const b of arr) {
    const t = Math.min(b.qty, need);
    b.qty -= t; need -= t; cost += t * b.cost;
    if (!need) break;
  }
  s.inv[id] = arr.filter(b => b.qty > 0);
  return cost;
}

// Buy a cart { productId: qty }. Returns { ok, total, error }.
export function buyStock(s, cart, day) {
  let total = 0;
  for (const [id, q] of Object.entries(cart)) if (q > 0) total += q * costToday(s, id);
  if (total > s.cash) return { ok: false, total, error: "Not enough cash for this order." };
  for (const [id, q] of Object.entries(cart)) if (q > 0) addStock(s, id, q, costToday(s, id));
  s.cash -= total;
  if (day) day.bought += total;
  return { ok: true, total };
}

// Emergency restock during the market day: costs 10% more (the warehouse boy charges a rush fee).
export const RUSH_FEE = 1.1;
export function rushBuy(s, id, qty, day) {
  const unit = r50(costToday(s, id) * RUSH_FEE), total = unit * qty;
  if (total > s.cash) return { ok: false, total };
  addStock(s, id, qty, unit);
  s.cash -= total;
  if (day) day.bought += total;
  return { ok: true, total, unit };
}

// Rough number of units customers will want today (shown as a hint and used by the simulation).
export function expectedDemand(s) {
  const st = stageOf(s), list = available(s);
  const weights = list.map(p => weightOf(s, p));
  const total = weights.reduce((a, b) => a + b, 0);
  const n = expectedCustomers(s);
  const out = {};
  list.forEach((p, i) => {
    const avgQty = Math.max(1, ((1 + p.maxQty) / 2) * st.qtyMult);
    out[p.id] = Math.round(n * (weights[i] / total) * avgQty);
  });
  return out;
}
function weightOf(s, p) {
  let w = p.weight;
  if (p.chilled && stageOf(s).freezer) w *= 1.4;
  return w;
}
export function repFactor(s) { return 0.8 + 0.1 * s.rep; }
export function expectedCustomers(s) {
  let n = stageOf(s).customers * repFactor(s);
  if (s.event && s.event.customers) n *= s.event.customers;
  return n;
}

// ---------- a market day ----------
// Creates the list of customers who will arrive today (with arrival times in seconds).
export function startDay(s, rng = Math.random) {
  const injured = !!s.injured && s.settings.street !== false;
  const L = CONFIG.dayLengthSeconds * (injured ? CONFIG.street.fight.injuredDayShare : 1);
  const st = stageOf(s), list = available(s);
  const weights = list.map(p => weightOf(s, p));
  const total = weights.reduce((a, b) => a + b, 0);
  const walk = s.walkway && s.settings.street !== false ? CONFIG.street.taskForce.walkwayBonus : 1;
  const n = Math.max(4, Math.round(expectedCustomers(s) * walk * (L / CONFIG.dayLengthSeconds) * between(rng, 0.9, 1.1)));
  const willingEvent = (s.event && s.event.willingness) || 1;
  const customers = [];
  for (let i = 0; i < n; i++) {
    let r = rng() * total, p = list[0];
    for (let k = 0; k < list.length; k++) { r -= weights[k]; if (r <= 0) { p = list[k]; break; } }
    const baseQty = 1 + Math.floor(rng() * p.maxQty);
    const qty = Math.max(1, Math.round(baseQty * st.qtyMult));
    let max = marketPrice(s, p.id) * between(rng, ...CONFIG.willingnessRange) * (0.88 + 0.04 * s.rep) * st.willingness * willingEvent;
    if (s.rival && s.rival.item === p.id) max = Math.min(max, s.rival.price * 1.03);
    customers.push({
      id: i + 1, t: between(rng, 1.2, L - 6), item: p.id, qty, max: r50(max),
      patience: between(rng, ...CONFIG.patienceSeconds),
      name: pickFrom(rng, CUSTOMER_NAMES), skin: pickFrom(rng, SKINS), shirt: pickFrom(rng, SHIRTS),
    });
  }
  const thief = planThief(s, rng, L);
  if (thief) {
    const p = pickFrom(rng, list);
    customers.push({ id: n + 1, t: thief.t, item: p.id, qty: 1, max: 0, patience: 14, thief: true, snatchAfter: thief.snatchAfter,
      name: "Stranger in a hoodie", skin: pickFrom(rng, SKINS), shirt: "#2B1D14" });
  }
  customers.sort((a, b) => a.t - b.t);
  return { customers, length: L, injured, taskForce: planTaskForce(s, rng, L), sales: 0, cogs: 0, bought: 0, served: 0, lost: 0, haggles: 0, orderResult: null };
}

// Fulfil an accepted delivery order at the start of the day.
export function fulfilOrder(s, day) {
  const o = s.order; if (!o) return null;
  s.order = null;
  if (stockOf(s, o.item) >= o.qty) {
    const cogs = takeStock(s, o.item, o.qty);
    const amt = o.qty * o.unit;
    s.cash += amt; day.sales += amt; day.cogs += cogs;
    s.rep = clamp(s.rep + 0.2, CONFIG.rep.min, CONFIG.rep.max);
    return day.orderResult = { ok: true, text: `Delivered ${o.qty} ${PRODUCT_BY_ID[o.item].name.toLowerCase()} to ${o.client}: +${naira(amt)}` };
  }
  s.rep = clamp(s.rep - 0.4, CONFIG.rep.min, CONFIG.rep.max);
  return day.orderResult = { ok: false, text: `You didn't have ${o.qty} ${PRODUCT_BY_ID[o.item].name.toLowerCase()} for ${o.client}. Order cancelled and your reputation dropped.` };
}

// What happens when a customer is served at a price. Returns a result for the screen.
export function decide(s, c, price = s.prices[c.item]) {
  if (c.thief) return "thief";
  if (stockOf(s, c.item) < c.qty) return "nostock";
  if (price <= c.max) return "buy";
  if (price <= c.max * CONFIG.haggleZone) return "haggle";
  return "leave";
}
export function sell(s, day, c, unit) {
  const cogs = takeStock(s, c.item, c.qty);
  const amt = unit * c.qty;
  s.cash += amt; day.sales += amt; day.cogs += cogs; day.served++;
  if (unit <= marketPrice(s, c.item) * 1.1) s.rep = clamp(s.rep + CONFIG.rep.fairSale, CONFIG.rep.min, CONFIG.rep.max);
  return amt;
}
export function lose(s, day, why) {
  day.lost++;
  const hit = why === "nostock" ? CONFIG.rep.outOfStock : why === "price" ? CONFIG.rep.overcharge : CONFIG.rep.walkAway;
  s.rep = clamp(s.rep - hit, CONFIG.rep.min, CONFIG.rep.max);
}

// Haggle: the customer's first offer and how they move.
export function haggleStart(c, ask) {
  return { ask, offer: Math.max(50, r50(c.max * 0.88)), patience: CONFIG.haggleRounds };
}
export function haggleCounter(h, c, counter) {
  if (counter <= c.max) return { deal: true, price: counter };
  h.patience--;
  if (h.patience <= 0) return { deal: false, gone: true };
  h.offer = Math.min(r50(h.offer + (c.max - h.offer) * 0.6), c.max);
  return { deal: false, gone: false, offer: h.offer };
}

// End of the market day: spoilage, levy, wages and the ledger.
export function endDay(s, day) {
  const st = stageOf(s);
  let spoiled = 0;
  const spoiledItems = [];
  const extra = s.event && s.event.spoilFaster ? s.event.spoilFaster : 0;
  for (const p of PRODUCTS) {
    for (const b of s.inv[p.id]) b.age += 1 + (p.life ? extra : 0);
    if (p.life) {
      const bad = s.inv[p.id].filter(b => b.age >= p.life);
      let q = 0;
      for (const b of bad) { spoiled += b.qty * b.cost; q += b.qty; }
      if (q) spoiledItems.push(`${q} ${p.name.toLowerCase()}`);
      s.inv[p.id] = s.inv[p.id].filter(b => b.age < p.life);
    }
  }
  const levy = st.levy, wages = s.staff * st.wage;
  s.cash -= levy + wages;
  const street = Object.assign({}, s.street || {});
  const streetCost = streetTotal(street);
  const profit = day.sales - day.cogs - spoiled - levy - wages - streetCost;
  const rec = {
    day: s.day, chapter: s.chapter, sales: day.sales, cogs: day.cogs, bought: day.bought, spoiled, spoiledItems,
    levy, wages, street, streetCost, profit, served: day.served, lost: day.lost, orderResult: day.orderResult,
  };
  resetStreetDay(s);
  s.injured = false;
  s.chapterProfit += profit;
  s.history.push(rec);
  if (s.history.length > 14) s.history.shift();
  const S = s.stats;
  S.sales += day.sales; S.profit += profit; S.served += day.served; S.lost += day.lost; S.spoiled += spoiled; S.days++;
  S.best = Math.max(S.best, profit);
  if (profit > 0) s.wisdom += CONFIG.wisdom.profitableDay;
  return rec;
}

// ---------- night ----------
// Things that happen at night, shown one by one before money decisions.
export function nightEvents(s, rng = Math.random) {
  const ev = [];
  const st = stageOf(s);
  if (hasFeature(s, "femi") && !s.loans.femi && !s.finished) {
    const inCh4 = s.chapter === 4;
    const due = inCh4 ? s.day - s.femiOfferedDay >= 2 : rng() < CONFIG.femiChanceAfterCh4;
    if (due) { s.femiOfferedDay = s.day; ev.push({ type: "femi", amount: CONFIG.femiLoan.amountPerStage[s.stage] }); }
  }
  if (hasFeature(s, "scams")) {
    const always = s.chapter === 4 && s.scamsSpotted < CHAPTERS[3].goal.scams;
    if (always || rng() < 0.3) { ev.push({ type: "scam", msg: s.msgCursor % MESSAGES.length }); s.msgCursor++; }
  }
  if (hasFeature(s, "stockCount") && rng() < CONFIG.stockCountChance) {
    const options = available(s).filter(p => !p.life && stockOf(s, p.id) >= 4);
    if (options.length) {
      const p = pickFrom(rng, options), rec = stockOf(s, p.id);
      const missing = rng() < 0.55 ? 1 + Math.floor(rng() * Math.min(3, rec - 1)) : 0;
      ev.push({ type: "stock", item: p.id, recorded: rec, actual: rec - missing });
    }
  }
  if (st.deliveries && hasFeature(s, "deliveries") && !s.order && rng() < CONFIG.deliveryChance) {
    const options = available(s).filter(p => ["rice", "noodles", "oil", "diapers", "soap", "sugar", "milk", "bar"].includes(p.id));
    const p = pickFrom(rng, options);
    const qty = Math.round(between(rng, 6, 14) * (p.cost > 5000 ? 1 : 2.5) * (s.stage >= 2 ? 1.6 : 1));
    ev.push({ type: "delivery", client: pickFrom(rng, DELIVERY_CLIENTS), item: p.id, qty, unit: r50(marketPrice(s, p.id) * 0.97) });
  }
  return ev;
}

export function answerScam(s, msgIdx, saidScam) {
  const m = MESSAGES[msgIdx];
  const right = m.scam === saidScam;
  addMastery(s, 5, right);
  let lost = 0;
  if (m.scam && saidScam) { s.scamsSpotted++; s.wisdom += CONFIG.wisdom.scamSpotted; }
  if (m.scam && !saidScam) { lost = Math.min(Math.max(0, s.cash), Math.max(3000, r50(s.cash * CONFIG.scamCostShare))); s.cash -= lost; s.scamsFell++; }
  if (!m.scam && !saidScam) s.wisdom += 5;
  return { right, lost, msg: m };
}
export function femiDecision(s, take, amount) {
  if (take) {
    s.cash += amount;
    s.loans.femi = { amount, owe: r50(amount * (1 + CONFIG.femiLoan.interest)), due: s.day + CONFIG.femiLoan.termDays };
    addMastery(s, 5, false);
  } else {
    s.femiRefused++; s.wisdom += CONFIG.wisdom.refuseFemi; addMastery(s, 5, true);
  }
}
export function stockCountResult(s, ev, counted) {
  const missing = ev.recorded - ev.actual;
  const right = counted === ev.actual;
  if (missing > 0 && !right) takeStock(s, ev.item, missing);
  if (right) s.wisdom += CONFIG.wisdom.stockCount;
  addMastery(s, 2, right);
  return { right, missing };
}
export function acceptDelivery(s, ev) { s.order = { client: ev.client, item: ev.item, qty: ev.qty, unit: ev.unit }; }

// Money moves at night. plan = { pay, save, withdraw }
export function applyPlan(s, plan) {
  const pay = r50(clamp(plan.pay || 0, 0, Math.min(s.debt, Math.max(0, s.cash))));
  s.debt -= pay; s.cash -= pay;
  const save = Math.floor(clamp(plan.save || 0, 0, Math.max(0, s.cash)) / 50) * 50;
  s.savings += save; s.cash -= save;
  const wd = Math.min(s.savings, Math.ceil(clamp(plan.withdraw || 0, 0, s.savings) / 50) * 50);
  s.savings -= wd; s.cash += wd;
  if (s.savings > 0 && s.savingsSince === null) s.savingsSince = s.day;
  if (s.savings === 0) s.savingsSince = null;
}

export function bankLoanLimit(s) {
  if (!hasFeature(s, "bankLoans") || s.loans.bank) return 0;
  if (s.savingsSince === null || s.day - s.savingsSince < CONFIG.bankLoan.minSavingsDays) return 0;
  return Math.min(CONFIG.bankLoan.maxPerStage[s.stage], r50(s.savings));
}
export function takeBankLoan(s, amount) {
  const lim = bankLoanLimit(s);
  amount = Math.min(amount, lim);
  if (amount <= 0) return false;
  const weeks = CONFIG.bankLoan.termDays / 7;
  s.cash += amount;
  s.loans.bank = { amount, owe: r50(amount * (1 + CONFIG.bankLoan.interestWeekly * weeks)), due: s.day + CONFIG.bankLoan.termDays };
  return true;
}
export function repayLoan(s, which) {
  const l = s.loans[which]; if (!l) return false;
  const pay = Math.min(l.owe, Math.max(0, s.cash));
  l.owe -= pay; s.cash -= pay;
  if (l.owe <= 0) s.loans[which] = null;
  return pay;
}

// Go to sleep: move to the next day and report what happened overnight.
export function sleep(s, rng = Math.random) {
  const notes = [];
  // Overdrawn after paying levy and wages? Cover it from savings, then from a loan from Mama.
  if (s.cash < 0) {
    const short = -s.cash, fromSav = Math.min(s.savings, short);
    s.savings -= fromSav; s.cash += fromSav;
    if (s.cash < 0) { s.debt += -s.cash; notes.push({ tone: "bad", text: `You couldn't cover today's costs. Mama paid ${naira(-s.cash)} for you (added to your debt).` }); s.cash = 0; }
    else notes.push({ tone: "bad", text: `Today's costs were more than your cash, so ${naira(fromSav)} came out of your savings.` });
  }
  // Robbery of cash kept at the stall
  if (hasFeature(s, "robbery") && s.cash > CONFIG.robbery.cashThreshold[s.stage] && rng() < CONFIG.robbery.chance) {
    const lost = r50(s.cash * CONFIG.robbery.share);
    s.cash -= lost;
    notes.push({ tone: "bad", text: `Thieves broke into the stall at night and took ${naira(lost)} in cash. Money in the bank is safe.` });
  }
  s.day++;
  // Reputation slowly recovers overnight, so one bad day doesn't ruin the business.
  if (s.rep < CONFIG.rep.start) s.rep = Math.min(CONFIG.rep.start, s.rep + CONFIG.rep.nightlyRecovery);
  // Weekly interest
  if ((s.day - 1) % 7 === 0 && s.savings > 0) {
    const i = Math.round(s.savings * CONFIG.savingsInterestWeekly);
    s.savings += i;
    notes.push({ tone: "good", text: `Your savings earned ${naira(i)} interest this week.` });
  }
  // Loans due
  for (const which of ["femi", "bank"]) {
    const l = s.loans[which];
    if (!l || s.day < l.due) continue;
    let owe = l.owe;
    const fromCash = Math.min(Math.max(0, s.cash), owe); s.cash -= fromCash; owe -= fromCash;
    const fromSav = Math.min(s.savings, owe); s.savings -= fromSav; owe -= fromSav;
    const who = which === "femi" ? "Fast Money Femi" : "The bank";
    if (owe <= 0) {
      s.loans[which] = null;
      notes.push({ tone: which === "femi" ? "bad" : "info", text: `${who} collected ${naira(l.owe)}. That loan cost you ${naira(l.owe - l.amount)} in interest.` });
    } else {
      const pen = which === "femi" ? CONFIG.femiLoan.lateDebtPenalty : CONFIG.bankLoan.interestWeekly;
      l.owe = r50(owe * (1 + pen)); l.due = s.day + 3;
      s.rep = clamp(s.rep - (which === "femi" ? 1 : 0.3), CONFIG.rep.min, CONFIG.rep.max);
      notes.push({ tone: "bad", text: `You couldn't fully repay ${who}. You still owe ${naira(l.owe)} (with a penalty), due on Day ${l.due}.` });
    }
  }
  // Can't afford anything? Mama helps.
  const cheapest = Math.min(...available(s).map(p => p.cost));
  const anyStock = available(s).some(p => stockOf(s, p.id) > 0);
  if (s.cash < cheapest && !anyStock) {
    if (s.savings >= cheapest * 4) notes.push({ tone: "info", text: "You have no cash or stock. Take some money out of your savings to restock." });
    else { s.cash += 5000; s.debt += 5000; notes.push({ tone: "bad", text: "You ran out of money. Mama lent you ₦5,000 (added to your debt). Buy carefully!" }); }
  }
  // Prices, rival and today's event
  if (hasFeature(s, "priceWave")) {
    for (const p of PRODUCTS) {
      const w = s.wave[p.id] + between(rng, -CONFIG.priceWave.step, CONFIG.priceWave.step) + (1 - s.wave[p.id]) * 0.25;
      s.wave[p.id] = Math.round(clamp(w, CONFIG.priceWave.min, CONFIG.priceWave.max) * 100) / 100;
    }
  }
  s.rival = null;
  if (hasFeature(s, "rival")) {
    const p = pickFrom(rng, available(s));
    s.rival = { item: p.id, price: r50(marketPrice(s, p.id) * 0.92) };
  }
  s.event = null;
  if (hasFeature(s, "events")) {
    for (const e of EVENTS) {
      if (e.minStage && s.stage < e.minStage) continue;
      if (rng() < e.chance) {
        s.event = Object.assign({}, e);
        if (e.hike) { const p = pickFrom(rng, available(s)); s.event.item = p.id; s.event.text = e.text.replace("{item}", p.name); }
        break;
      }
    }
  }
  return notes;
}

// ---------- growing the business ----------
export function nextStage(s) { return STAGES[s.stage + 1] || null; }
export function buyUpgrade(s) {
  const n = nextStage(s);
  if (!n || s.savings < n.cost) return false;
  s.savings -= n.cost; s.stage++;
  if (s.savings === 0) s.savingsSince = null;
  return true;
}
export function canHire(s) { return hasFeature(s, "staff") && s.staff < stageOf(s).maxStaff; }
export function hire(s) { if (canHire(s)) { s.staff++; return true; } return false; }
export function fire(s) { if (s.staff > 0) { s.staff--; return true; } return false; }

// ---------- chapters ----------
export function goalStatus(s) {
  const ch = chapterOf(s), g = ch.goal;
  let lines = [];
  if (g.type === "debt") lines = [{ label: "Debt paid", have: CONFIG.startDebt - Math.min(s.debt, CONFIG.startDebt), need: CONFIG.startDebt, money: true }];
  if (g.type === "profit") lines = [{ label: "Chapter profit", have: Math.max(0, s.chapterProfit), need: g.target, money: true }];
  if (g.type === "stage") {
    const cost = STAGES[g.target].cost;
    lines = s.stage >= g.target ? [{ label: STAGES[g.target].name + " opened", have: 1, need: 1 }] : [{ label: "Savings for " + STAGES[g.target].name, have: Math.min(s.savings, cost), need: cost, money: true }];
  }
  if (g.type === "savingsScams") lines = [
    { label: "Savings", have: Math.min(s.savings, g.savings), need: g.savings, money: true },
    { label: "Scams spotted", have: Math.min(s.scamsSpotted, g.scams), need: g.scams },
    { label: "Owe Femi nothing", have: s.loans.femi ? 0 : 1, need: 1 },
  ];
  if (g.type === "stageStaff") {
    const cost = STAGES[g.target].cost;
    lines = [
      { label: "Staff hired", have: Math.min(s.staff, g.staff), need: g.staff },
      s.stage >= g.target ? { label: STAGES[g.target].name + " opened", have: 1, need: 1 } : { label: "Savings for " + STAGES[g.target].name, have: Math.min(s.savings, cost), need: cost, money: true },
    ];
  }
  // A "stage" goal is only done once the upgrade is bought
  let done = lines.every(l => l.have >= l.need);
  if ((g.type === "stage" || g.type === "stageStaff") && s.stage < g.target) done = false;
  if (g.type === "debt") done = s.debt <= 0;
  const progress = lines.reduce((t, l) => t + Math.min(1, l.have / l.need), 0) / lines.length;
  return { done: done && !s.finished, progress, lines, canUpgradeNow: (g.type === "stage" || g.type === "stageStaff") && s.stage < g.target && s.savings >= STAGES[g.target].cost };
}
export function completeChapter(s) {
  const ch = chapterOf(s);
  const days = s.day - s.chapterStartDay + 1;
  const gold = days <= ch.parDays;
  const bonus = 50 + (gold ? 50 : 0);
  s.wisdom += bonus;
  const result = { chapter: ch.id, title: ch.title, days, gold, bonus };
  if (s.chapter >= CHAPTERS.length) { s.finished = true; }
  else { s.chapter++; s.chapterStartDay = s.day; s.chapterProfit = 0; }
  return result;
}

export function addMastery(s, obj, right) {
  const m = s.mastery[obj];
  m[1]++; if (right) m[0]++;
}
export function masteryPct(s, obj) {
  const [r, t] = s.mastery[obj];
  if (!t) return 0;
  return Math.round((r / t) * 100 * Math.min(1, t / 4));
}
