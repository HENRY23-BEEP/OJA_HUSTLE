// ============================================================
//  PRODUCTS — everything Tobi can sell.
//  cost   = warehouse price (what you pay)
//  sug    = normal market price (what customers expect to pay)
//  life   = days before it spoils (0 = never spoils)
//  weight = how popular it is (higher = more customers want it)
//  maxQty = most a single customer buys at once (before shop size bonus)
//  unlockChapter / unlockStage = when it appears in the warehouse
//  chilled = sells better once you have a freezer (Shop and above)
//  icon   = which picture to draw (see ui/icons.js)
// ============================================================

export const PRODUCTS = [
  // ---- Wooden Stall (Chapter 1) ----
  { id: "water",   name: "Pure water",  unit: "bag",    cost: 250,   sug: 350,   life: 0, weight: 3.0,  maxQty: 3, unlockChapter: 1, unlockStage: 0, chilled: true,  icon: "water",   color: "#2F8FD8", bg: "#DCEEF8" },
  { id: "drink",   name: "Soft drink",  unit: "bottle", cost: 300,   sug: 400,   life: 0, weight: 2.5,  maxQty: 2, unlockChapter: 1, unlockStage: 0, chilled: true,  icon: "bottle",  color: "#E5383B", bg: "#FDE2E3" },
  { id: "bread",   name: "Bread",       unit: "loaf",   cost: 900,   sug: 1200,  life: 2, weight: 2.0,  maxQty: 2, unlockChapter: 1, unlockStage: 0, chilled: false, icon: "bread",   color: "#C98A44", bg: "#FBE7C6" },
  { id: "sugar",   name: "Sugar",       unit: "pack",   cost: 1100,  sug: 1400,  life: 0, weight: 1.1,  maxQty: 1, unlockChapter: 1, unlockStage: 0, chilled: false, icon: "bag",     color: "#7B3FE4", bg: "#ECE2FF" },
  { id: "eggs",    name: "Eggs",        unit: "crate",  cost: 4000,  sug: 5000,  life: 3, weight: 0.55, maxQty: 1, unlockChapter: 1, unlockStage: 0, chilled: false, icon: "eggs",    color: "#E0A030", bg: "#FFF1D6" },
  { id: "noodles", name: "Noodles",     unit: "carton", cost: 7500,  sug: 9000,  life: 0, weight: 0.4,  maxQty: 1, unlockChapter: 1, unlockStage: 0, chilled: false, icon: "noodles", color: "#FF7A1A", bg: "#FFE4CC" },

  // ---- New product lines (Chapter 3) ----
  { id: "milk",    name: "Milk",        unit: "tin",    cost: 1800,  sug: 2300,  life: 0, weight: 1.2,  maxQty: 2, unlockChapter: 3, unlockStage: 0, chilled: false, icon: "tin",     color: "#00B3A6", bg: "#D6F5F2" },
  { id: "oil",     name: "Cooking oil", unit: "bottle", cost: 3200,  sug: 4000,  life: 0, weight: 0.8,  maxQty: 1, unlockChapter: 3, unlockStage: 0, chilled: false, icon: "oil",     color: "#E0B400", bg: "#FFF6CC" },

  // ---- Shop ----
  { id: "tomato",  name: "Tomatoes",    unit: "basket", cost: 6000,  sug: 7800,  life: 2, weight: 0.6,  maxQty: 1, unlockChapter: 1, unlockStage: 1, chilled: false, icon: "tomato",  color: "#E5383B", bg: "#FFE0DE" },
  { id: "soap",    name: "Detergent",   unit: "pack",   cost: 1500,  sug: 1900,  life: 0, weight: 1.0,  maxQty: 2, unlockChapter: 1, unlockStage: 1, chilled: false, icon: "box",     color: "#00B3A6", bg: "#DDF6F3" },
  { id: "rice",    name: "Rice",        unit: "10kg bag", cost: 18000, sug: 21500, life: 0, weight: 0.5, maxQty: 1, unlockChapter: 1, unlockStage: 1, chilled: false, icon: "sack",   color: "#8A5A34", bg: "#F3E3C7" },

  // ---- Mini-Mart ----
  { id: "diapers", name: "Diapers",     unit: "pack",   cost: 7000,  sug: 8800,  life: 0, weight: 0.5,  maxQty: 1, unlockChapter: 1, unlockStage: 2, chilled: false, icon: "diaper",  color: "#FF4F8B", bg: "#FFE0EC" },
  { id: "chicken", name: "Chicken",     unit: "kg",     cost: 5500,  sug: 7200,  life: 3, weight: 0.8,  maxQty: 2, unlockChapter: 1, unlockStage: 2, chilled: true,  icon: "chicken", color: "#D9530A", bg: "#FFE6D6" },
  { id: "bar",     name: "Bathing soap", unit: "bar",   cost: 600,   sug: 850,   life: 0, weight: 1.5,  maxQty: 3, unlockChapter: 1, unlockStage: 2, chilled: false, icon: "soapbar", color: "#7B3FE4", bg: "#ECE2FF" },

  // ---- Supermarket ----
  { id: "yam",     name: "Yam",         unit: "tuber",  cost: 2500,  sug: 3300,  life: 7, weight: 1.0,  maxQty: 2, unlockChapter: 1, unlockStage: 3, chilled: false, icon: "yam",     color: "#8A5A34", bg: "#F6E6D2" },
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
