// ============================================================
//  STREET LIFE — agberos, fights, thieves, Task Force and the
//  Market Union. Pure rules only; the screens are in ui/street.js.
// ============================================================

import { CONFIG } from "../data/config.js";
import { PRODUCTS } from "../data/products.js";
import { r50, clamp, stockOf, naira } from "./game.js";

const T = CONFIG.street;
const between = (rng, a, b) => a + rng() * (b - a);
export const AGBERO_NAMES = ["Sule Garage", "Small Doctor", "Baba Ejima", "Lion of Oja Ilu", "Taiwo Lasgidi", "Eko Boy", "Jagaban Junior", "Iron Bender"];

export const streetOn = s => s.settings.street !== false;
export const isUnion = s => s.unionUntil >= s.day;
export const unionDues = s => T.union.dues[s.stage];

// Track today's street costs so the ledger can show them.
function cost(s, key, amt) { s.street[key] = (s.street[key] || 0) + amt; }
export function resetStreetDay(s) { s.street = { extortion: 0, hospital: 0, stolen: 0, seized: 0, scattered: 0 }; }

// ---------- Agbero ----------
export function agberoVisit(s, rng = Math.random) {
  if (!streetOn(s) || s.day < T.agbero.fromDay) return null;
  let chance = T.agbero.chance * (1.3 - s.respect / 100) * (1 + Math.min(s.heat, 3) * T.agbero.payHeat);
  if (isUnion(s)) chance *= 0.5;
  if (rng() >= Math.min(0.75, chance)) return null;
  const demand = r50(T.agbero.demand[s.stage] * between(rng, 0.9, 1.3) * (1 + s.heat * 0.15));
  return { name: AGBERO_NAMES[Math.floor(rng() * AGBERO_NAMES.length)], demand, toughness: clamp(0.4 + s.stage * 0.1 + rng() * 0.2, 0.3, 0.9) };
}

function pay(s, amt) { const a = Math.min(Math.max(0, s.cash), amt); s.cash -= a; cost(s, "extortion", a); return a; }

function scatter(s, rng) {
  let units = 0, value = 0;
  for (const p of PRODUCTS) {
    for (const b of s.inv[p.id]) {
      const k = Math.floor(b.qty * T.agbero.scatterShare + (rng() < 0.5 ? 1 : 0));
      const t = Math.min(b.qty, k); b.qty -= t; units += t; value += t * b.cost;
    }
    s.inv[p.id] = s.inv[p.id].filter(b => b.qty > 0);
  }
  cost(s, "scattered", value);
  return { units, value };
}

// choice: "pay" | "negotiate" | "union" | "refuse"   (fights use fightResult)
export function agberoChoice(s, ag, choice, rng = Math.random) {
  const R = T.respect;
  if (choice === "pay") {
    const a = pay(s, ag.demand); s.heat = Math.min(4, s.heat + 1); s.respect = clamp(s.respect + R.paid, 0, R.max);
    return { tone: "info", text: `You paid ${naira(a)}. ${ag.name} counted it and left smiling. He'll remember you pay easily.` };
  }
  if (choice === "negotiate") {
    if (rng() < T.agbero.negotiateBase + s.respect / 200) {
      const a = pay(s, r50(ag.demand / 2)); s.heat = Math.min(4, s.heat + 0.5);
      return { tone: "good", text: `"Abeg, market slow today." He grumbled but took only ${naira(a)}.` };
    }
    const a = pay(s, r50(ag.demand * 1.2)); s.heat = Math.min(4, s.heat + 1);
    return { tone: "bad", text: `"You dey price me?" He got angry and took ${naira(a)}, even more than before.` };
  }
  if (choice === "union") {
    if (isUnion(s) && rng() < T.agbero.unionProtect) {
      s.heat = Math.max(0, s.heat - 1); s.respect = clamp(s.respect + 2, 0, R.max);
      return { tone: "good", text: `You called the Market Union chairman. He told ${ag.name} to leave paid-up members alone. Your union dues just paid off.` };
    }
    const a = pay(s, ag.demand);
    return { tone: "bad", text: `The chairman didn't pick up. You had to pay ${naira(a)}.` };
  }
  if (choice === "refuse") {
    if (rng() < T.agbero.refuseScatter * (1.2 - s.respect / 100)) {
      const sc = scatter(s, rng); s.respect = clamp(s.respect + 1, 0, R.max);
      s.rep = clamp(s.rep - 0.2, CONFIG.rep.min, CONFIG.rep.max);
      return { tone: "bad", text: `${ag.name} kicked your table over! ${sc.units} items rolled into the gutter (${naira(sc.value)} lost). Customers saw the wahala.` };
    }
    s.heat = Math.max(0, s.heat - 1); s.respect = clamp(s.respect + R.stoodFirm, 0, R.max);
    return { tone: "good", text: `You stood firm. ${ag.name} hissed, looked around at the watching traders and walked off. +${R.stoodFirm} respect.` };
  }
  return null;
}

// hits = how many moves the player got right in the fight mini-game
export function fightResult(s, ag, hits) {
  const F = T.fight, R = T.respect;
  if (hits >= F.toWin) {
    s.heat = 0; s.respect = clamp(s.respect + R.fightWin, 0, R.max); s.stats.fightsWon = (s.stats.fightsWon || 0) + 1;
    return { won: true, tone: "good", text: `${ag.name} ran off! The market women are clapping. +${R.fightWin} respect. But fights are risky, so next time you might not be so lucky.` };
  }
  const bill = F.hospital[s.stage];
  const hp = Math.min(Math.max(0, s.cash), bill); s.cash -= hp; cost(s, "hospital", hp);
  const a = pay(s, r50(ag.demand * 1.5));
  s.injured = true; s.respect = clamp(s.respect + R.fightLose, 0, R.max); s.stats.fightsLost = (s.stats.fightsLost || 0) + 1;
  return { won: false, tone: "bad", text: `Ouch. ${ag.name} won this one and took ${naira(a)}. The clinic charged ${naira(hp)} for your bruises, and you'll open late today.` };
}

// ---------- Thieves ("Ole!") ----------
export function planThief(s, rng, L) {
  if (!streetOn(s) || s.chapter < T.thief.fromChapter || rng() >= T.thief.chance) return null;
  return { t: between(rng, 10, L - 15), snatchAfter: between(rng, ...T.thief.snatchAfter) };
}
export function thiefSnatch(s, daySales) {
  const amt = r50(Math.min(Math.max(0, s.cash), T.thief.maxSteal[s.stage], Math.max(1000, daySales * T.thief.stealShare)));
  return amt;
}
export function thiefOutcome(s, caught, amt) {
  if (caught) { s.respect = clamp(s.respect + T.respect.thiefCaught, 0, T.respect.max); s.wisdom += 5; s.stats.thievesCaught = (s.stats.thievesCaught || 0) + 1; return 0; }
  s.cash -= amt; cost(s, "stolen", amt); return amt;
}

// ---------- Task Force ----------
export function planTaskForce(s, rng, L) {
  if (!streetOn(s) || !s.walkway || s.chapter < T.taskForce.fromChapter || rng() >= T.taskForce.chance) return null;
  return { t: between(rng, 15, L - 12) };
}
export function taskForceSeize(s) {
  let value = 0;
  for (const p of PRODUCTS) {
    for (const b of s.inv[p.id]) { const k = Math.ceil(b.qty * T.taskForce.seizeShare); b.qty -= k; value += k * b.cost; }
    s.inv[p.id] = s.inv[p.id].filter(b => b.qty > 0);
  }
  cost(s, "seized", value);
  return value;
}

// ---------- Market Union ----------
export function joinUnion(s) {
  const d = unionDues(s);
  if (s.cash < d) return false;
  s.cash -= d; cost(s, "extortion", d);
  s.unionUntil = Math.max(s.unionUntil, s.day - 1) + T.union.days;
  s.unionPaid = (s.unionPaid || 0) + d;
  return true;
}

export function streetTotal(st) { return (st.extortion || 0) + (st.hospital || 0) + (st.stolen || 0) + (st.seized || 0) + (st.scattered || 0); }
