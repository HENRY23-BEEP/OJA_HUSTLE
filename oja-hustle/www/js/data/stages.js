// ============================================================
//  BUSINESS STAGES — the four sizes of Tobi's business.
//  cost      = savings needed to upgrade
//  customers = average customers per market day
//  queue     = how many customers can wait at once
//  qtyMult   = bigger shops get bigger orders
//  levy      = daily market levy / rent
//  maxStaff  = staff you can hire, wage = daily pay per staff
//  willingness = how much more customers will pay (POS, nicer shop)
// ============================================================

export const STAGES = [
  {
    id: "stall", name: "Wooden Stall", cost: 0,
    customers: 24, queue: 4, qtyMult: 1, levy: 300,
    maxStaff: 0, wage: 0, willingness: 1.0,
    freezer: false, deliveries: false,
    perks: ["Basic provisions", "You serve every customer yourself"],
  },
  {
    id: "shop", name: "Shop", cost: 100000,
    customers: 38, queue: 5, qtyMult: 1.6, levy: 800,
    maxStaff: 1, wage: 2500, willingness: 1.05,
    freezer: true, deliveries: false,
    perks: ["Freezer: cold drinks sell more", "Rice, tomatoes and detergent", "Room for 1 staff (from Chapter 5)"],
  },
  {
    id: "minimart", name: "Mini-Mart", cost: 400000,
    customers: 60, queue: 6, qtyMult: 3, levy: 2000,
    maxStaff: 3, wage: 3500, willingness: 1.12,
    freezer: true, deliveries: true,
    perks: ["POS payments: customers spend more", "Delivery orders from schools and offices", "Room for 3 staff"],
  },
  {
    id: "supermarket", name: "Supermarket", cost: 1500000,
    customers: 64, queue: 6, qtyMult: 3.5, levy: 5000,
    maxStaff: 5, wage: 4000, willingness: 1.15,
    freezer: true, deliveries: true,
    perks: ["Mama Ronke's Supermarket!", "Room for 5 staff", "Free play: keep growing"],
  },
];
