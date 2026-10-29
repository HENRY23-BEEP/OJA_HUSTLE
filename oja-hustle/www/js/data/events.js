// ============================================================
//  DAILY MARKET EVENTS (from Chapter 2, see CONFIG.features.events)
//  chance        = probability each day (checked in order)
//  customers     = multiplies the number of customers
//  willingness   = multiplies how much customers will pay
//  hike          = one random product costs this much more at the warehouse
//  spoilFaster   = perishable goods lose an extra day (power cut, needs freezer)
//  minStage      = only happens at this business size or bigger
// ============================================================

export const EVENTS = [
  { id: "rain",   chance: 0.14, color: "#00B3A6", text: "Heavy rain today. Fewer customers will come out.", customers: 0.65 },
  { id: "rush",   chance: 0.14, color: "#FF4F8B", text: "Festive rush! Lots of customers, and they're ready to spend.", customers: 1.45, willingness: 1.08 },
  { id: "hike",   chance: 0.14, color: "#E5383B", text: "{item} costs 20% more at the warehouse today.", hike: 1.2 },
  { id: "payday", chance: 0.10, color: "#12A150", text: "It's payday for civil servants. Customers have more money.", customers: 1.15, willingness: 1.05 },
  { id: "power",  chance: 0.10, color: "#7B3FE4", text: "Power cut (NEPA took light)! Perishable goods will spoil faster tonight.", spoilFaster: 1, minStage: 1 },
];

// Characters used in the story and the market.
export const CAST = {
  mama:  { name: "Mama Ronke",        role: "Your grandmother",   skin: "#6B4224", shirt: "#7B3FE4", hat: "#7B3FE4", glasses: true },
  tobi:  { name: "Tobi",              role: "You",                skin: "#6B4224", shirt: "#12A150", hat: "#2B1D14" },
  musa:  { name: "Alhaji Musa",       role: "Wholesaler",         skin: "#8A5A34", shirt: "#FFFFFF", hat: "#FFFFFF" },
  ada:   { name: "Mrs. Ada",          role: "Bank officer",       skin: "#5A3A22", shirt: "#00B3A6", hat: "#2B1D14" },
  femi:  { name: "\"Fast Money\" Femi", role: "Loan shark",       skin: "#8A5A34", shirt: "#E5383B", hat: "#2B1D14", shades: true },
  chidi: { name: "Chidi",             role: "Rival trader",       skin: "#9C6A40", shirt: "#FF7A1A", hat: "#2B1D14" },
};

export const CUSTOMER_NAMES = ["Mrs. Bisi", "Uncle Tunde", "Aisha", "Chinedu", "Mama Ngozi", "Emeka", "Halima", "Kunle", "Blessing", "Musa Jr.", "Funke", "Ifeanyi", "Zainab", "Segun", "Amaka", "Yusuf", "Precious", "Dayo", "Hauwa", "Obinna"];
export const SKINS = ["#8A5A34", "#5A3A22", "#9C6A40", "#6B4224", "#B57A4A", "#7A4B2A"];
export const SHIRTS = ["#7B3FE4", "#00B3A6", "#E5383B", "#FF4F8B", "#12A150", "#2F8FD8", "#FFC629", "#FF7A1A"];
export const DELIVERY_CLIENTS = ["St. Mary's School", "Unity Hospital canteen", "Federal Secretariat staff club", "Grace Chapel", "Abuja Tech Hub office", "Wuse Hotel kitchen"];
