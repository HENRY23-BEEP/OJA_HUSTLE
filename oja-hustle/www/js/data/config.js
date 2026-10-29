// ============================================================
//  OJA HUSTLE — GAME BALANCE SETTINGS
//  Change these numbers to make the game easier or harder.
//  Money values are in Naira (₦). Times are in seconds.
// ============================================================

export const CONFIG = {
  version: "1.1.0",
  saveKey: "oja-hustle-save-v1",

  // ---- A market day ----
  dayLengthSeconds: 75,          // how long one market day lasts
  patienceSeconds: [7, 10.5],    // how long a customer waits before leaving (min, max)
  playerServeCooldown: 0.25,     // small delay between your taps (stops accidental double taps)
  staffServeSeconds: 2.4,        // how often each staff member serves a customer

  // ---- Starting position (Chapter 1) ----
  startCash: 15000,
  startDebt: 50000,
  rentDeadlineDays: 30,          // Chapter 1 "par" — finish before this for a bonus

  // ---- Customers ----
  willingnessRange: [0.95, 1.22], // customer's max price = market price × a random value in this range
  haggleZone: 1.35,               // if your price is up to (max × this), the customer haggles instead of leaving
  haggleRounds: 3,                // customer patience in a Haggle Duel

  // ---- Reputation (1 to 5 stars) ----
  rep: { start: 3, min: 1, max: 5, fairSale: 0.035, walkAway: 0.05, outOfStock: 0.07, overcharge: 0.04, nightlyRecovery: 0.2 },

  // ---- Bank ----
  savingsInterestWeekly: 0.02,   // 2% added to savings every 7 days
  bankLoan: { interestWeekly: 0.05, termDays: 14, minSavingsDays: 7, maxPerStage: [30000, 80000, 200000, 400000] },

  // ---- Fast Money Femi (loan shark) ----
  femiLoan: { amountPerStage: [20000, 50000, 120000, 250000], interest: 0.30, termDays: 5, lateDebtPenalty: 0.2 },

  // ---- Night events ----
  robbery: { cashThreshold: [40000, 80000, 200000, 400000], chance: 0.3, share: 0.3 },   // cash kept overnight above this (per business size) risks theft
  scamCostShare: 0.12,           // falling for a scam loses this share of your cash (min ₦3,000)
  stockCountChance: 0.22,
  deliveryChance: 0.5,
  femiChanceAfterCh4: 0.12,

  // ---- Market-day mini-game ----
  quickChange: { chance: 0.12, seconds: 7 },

  // ---- When each feature first appears (chapter number) ----
  features: {
    events: 2,        // rain, festive rush, price hikes, power cuts
    priceWave: 2,     // warehouse prices go up and down each day
    rival: 2,         // Chidi undercuts one of your products each day
    quickChange: 2,   // give the right change mini-game
    robbery: 3,
    stockCount: 3,
    bankLoans: 4,
    scams: 4,
    femi: 4,
    staff: 5,
    deliveries: 5,
  },

  // ---- STREET LIFE (can be switched off in Menu → Street life) ----
  street: {
    agbero: {
      fromDay: 3,                               // agberos start coming on this day
      chance: 0.25,                             // base chance each morning
      demand: [500, 1500, 4000, 8000],          // "settlement" asked, per business size
      payHeat: 0.25,                            // each payment makes them come back more often
      negotiateBase: 0.35,                      // chance negotiating halves the amount (+ respect bonus)
      refuseScatter: 0.55,                      // chance he scatters your goods if you refuse
      scatterShare: 0.15,                       // share of each product knocked into the gutter
      unionProtect: 0.85,                       // chance the Market Union chairman sends him away
    },
    fight: { rounds: 5, toWin: 3, windowSeconds: [1.5, 1.1, 0.9, 0.8], hospital: [3000, 8000, 15000, 25000], injuredDayShare: 0.6 },
    thief: { fromChapter: 2, chance: 0.35, snatchAfter: [4.5, 7], stealShare: 0.25, maxSteal: [4000, 10000, 25000, 50000], chaseTaps: 12, chaseSeconds: 4 },
    taskForce: { fromChapter: 2, chance: 0.15, walkwayBonus: 1.25, packTaps: 10, packSeconds: [3.5, 5.5], seizeShare: 0.2 },
    union: { dues: [1500, 4000, 10000, 20000], days: 7 },
    respect: { start: 30, max: 100, fightWin: 15, fightLose: -5, stoodFirm: 6, paid: -3, thiefCaught: 5 },
  },

  // ---- Price wave (Chapter 2+) ----
  priceWave: { min: 0.85, max: 1.35, step: 0.12 },

  // ---- Wisdom Points ----
  wisdom: { profitableDay: 10, haggleWin: 5, refuseFemi: 20, scamSpotted: 15, quizCorrect: 20, quickChange: 3, stockCount: 10 },
};
