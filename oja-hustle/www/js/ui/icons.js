// ============================================================
//  PICTURES — product icons, characters and the market scene.
//  Everything is drawn with SVG so the game needs no image files.
// ============================================================

import { PRODUCT_BY_ID } from "../data/products.js";

export const UMBRELLAS = [
  { name: "Market Orange", a: "#FF7A1A", b: "#FFC629", cost: 0 },
  { name: "Grape & Teal", a: "#7B3FE4", b: "#00B3A6", cost: 100 },
  { name: "Berry Pink", a: "#FF4F8B", b: "#FFF7E8", cost: 250 },
  { name: "Naira Green", a: "#12A150", b: "#FFFFFF", cost: 500 },
];

const SHAPES = {
  water: c => `<path d="M12 3C8.5 8 6.5 11 6.5 14a5.5 5.5 0 0 0 11 0c0-3-2-6-5.5-11z" fill="${c}"/><path d="M10 14.5a2 2 0 0 0 2 2" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/>`,
  bottle: c => `<rect x="9.5" y="2" width="5" height="3.5" rx="1" fill="${c}" opacity=".7"/><path d="M8.5 7.5q0-2 3.5-2t3.5 2V20a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2z" fill="${c}"/><rect x="8.5" y="11" width="7" height="4" fill="#fff" opacity=".85"/>`,
  bread: c => `<path d="M4 13a8 6 0 0 1 16 0v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="${c}"/><path d="M9 9.5v4M12 8.5v4M15 9.5v4" stroke="#8A5A34" stroke-width="1.4" stroke-linecap="round"/>`,
  bag: c => `<path d="M7 6h10l2 15H5z" fill="${c}"/><path d="M9 6V4.5h6V6" stroke="${c}" stroke-width="1.6" fill="none"/><rect x="8.5" y="11" width="7" height="5" rx="1" fill="#fff" opacity=".85"/>`,
  eggs: c => `<ellipse cx="8" cy="13.5" rx="4" ry="5.5" fill="#FFF4DA" stroke="${c}" stroke-width="1.4"/><ellipse cx="16" cy="13.5" rx="4" ry="5.5" fill="#FFF4DA" stroke="${c}" stroke-width="1.4"/><rect x="3" y="17" width="18" height="4" rx="1.5" fill="${c}"/>`,
  noodles: c => `<rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="${c}"/><path d="M6.5 11q2-2 4 0t4 0t3 0M6.5 15q2-2 4 0t4 0t3 0" stroke="#FFC629" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  tin: c => `<ellipse cx="12" cy="5.5" rx="6" ry="2" fill="${c}" opacity=".7"/><path d="M6 5.5v13a6 2 0 0 0 12 0v-13a6 2 0 0 1-12 0z" fill="${c}"/><rect x="6" y="10" width="12" height="4" fill="#fff" opacity=".85"/>`,
  oil: c => `<rect x="10" y="2" width="4" height="3" rx="1" fill="#12A150"/><path d="M8 7q0-2 4-2t4 2v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" fill="${c}"/><path d="M10 13h4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`,
  tomato: c => `<circle cx="8" cy="14" r="4.5" fill="${c}"/><circle cx="16" cy="14" r="4.5" fill="${c}"/><circle cx="12" cy="9.5" r="4.5" fill="${c}"/><path d="M11 5.5l1 1.5 1-1.5" stroke="#12A150" stroke-width="1.6" fill="none"/>`,
  box: c => `<rect x="4" y="6" width="16" height="15" rx="2" fill="${c}"/><circle cx="12" cy="13" r="3.5" fill="#fff"/><circle cx="12" cy="13" r="1.6" fill="${c}"/><rect x="4" y="4" width="16" height="3" rx="1" fill="${c}" opacity=".7"/>`,
  sack: c => `<path d="M7 5h10l-1 3q4 4 4 9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4q0-5 4-9z" fill="${c}"/><path d="M8 5l1.5-2h5L16 5" stroke="${c}" stroke-width="1.6" fill="none"/><text x="12" y="17" font-size="5.5" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="#FFF7E8">RICE</text>`,
  diaper: c => `<path d="M3 7h18l-2 7q-3 6-7 6t-7-6z" fill="${c}"/><path d="M8 7q4 6 8 0" stroke="#fff" stroke-width="1.6" fill="none"/>`,
  chicken: c => `<path d="M14 4a6 6 0 0 1 4 10l-5 1-3 3a2 2 0 1 1-3-2 2 2 0 1 1-1-3l3-3 1-5a6 6 0 0 1 4-1z" fill="${c}"/>`,
  soapbar: c => `<rect x="3.5" y="8" width="17" height="10" rx="4" fill="${c}"/><circle cx="17" cy="5.5" r="1.8" fill="${c}" opacity=".5"/><circle cx="13.5" cy="4.5" r="1.2" fill="${c}" opacity=".5"/>`,
  yam: c => `<path d="M5 15q-2-6 4-9t11 2q2 6-4 9t-11-2z" fill="${c}"/><circle cx="10" cy="11" r=".9" fill="#5A3A22"/><circle cx="14" cy="13" r=".9" fill="#5A3A22"/>`,
};

export function productIcon(id, size = 44) {
  const p = PRODUCT_BY_ID[id];
  const shape = (SHAPES[p.icon] || SHAPES.box)(p.color);
  return `<span class="picon" aria-hidden="true" style="width:${size}px;height:${size}px;background:${p.bg}"><svg viewBox="0 0 24 24" width="${size * 0.68}" height="${size * 0.68}">${shape}</svg></span>`;
}
export function productGlyph(id, size = 22) {
  const p = PRODUCT_BY_ID[id];
  return `<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}">${(SHAPES[p.icon] || SHAPES.box)(p.color)}</svg>`;
}

// A person. opts: skin, shirt, hat (colour or null), glasses, shades, bg, size
export function person(o = {}, size = 56) {
  const skin = o.skin || "#6B4224", shirt = o.shirt || "#12A150";
  const hair = o.hat ? (o.hat === "#2B1D14" ? `<path d="M16 21Q28 5 40 21" fill="#2B1D14"/>` : `<path d="M13 22Q28 1 43 22L41 12Q28 1 15 12Z" fill="${o.hat}"/>`) : "";
  const glasses = o.glasses ? `<circle cx="23" cy="25" r="4" fill="none" stroke="#FFF7E8" stroke-width="1.5"/><circle cx="33" cy="25" r="4" fill="none" stroke="#FFF7E8" stroke-width="1.5"/>` : "";
  const shades = o.shades ? `<rect x="17" y="21" width="22" height="6" rx="3" fill="#2B1D14"/>` : "";
  const bg = o.bg === false ? "" : `<circle cx="28" cy="28" r="28" fill="${o.bg || "#FFC629"}"/>`;
  const cap = o.cap ? `<path d="M15 20Q16 9 28 9t13 11z" fill="${o.cap}"/><path d="M38 19h10q1 3-3 3h-7z" fill="${o.cap}"/><rect x="15" y="18" width="26" height="3" fill="#2B1D14" opacity=".35"/>` : "";
  const beard = o.beard ? `<path d="M18 27q10 14 20 0q-2 8-10 9q-8-1-10-9z" fill="#1E1208"/>` : "";
  const body = o.singlet
    ? `<path d="M9 56Q28 32 47 56" fill="${skin}"/><path d="M18 56l2-17q8-4 16 0l2 17z" fill="${shirt}"/><path d="M14 47l5-4" stroke="#1E1208" stroke-width="1.5"/>`
    : `<path d="M9 56Q28 32 47 56" fill="${shirt}"/>`;
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 56 56">${bg}<circle cx="28" cy="24" r="12" fill="${skin}"/>${hair}${cap}${beard}${glasses}${shades}${body}</svg>`;
}

export function tobi(look, size = 56, bg) {
  return person({ skin: "#6B4224", shirt: look ? "#E5383B" : "#12A150", hat: look ? "#FF7A1A" : "#2B1D14", bg }, size);
}

// The stall / shop drawing used on the home screen and in the market.
export function scene(stage, umbrellaIdx = 0, opts = {}) {
  const u = UMBRELLAS[umbrellaIdx] || UMBRELLAS[0];
  const h = opts.height || 190;
  const sign = ["MAMA RONKE'S", "MAMA RONKE'S SHOP", "RONKE MINI-MART", "RONKE SUPERMARKET"][stage];
  const ground = `<rect x="0" y="150" width="360" height="60" fill="#FFD27A"/>`;
  const sky = `<rect width="360" height="210" fill="#FFE9C7"/><circle cx="318" cy="34" r="18" fill="#FFC629"/><path d="M-10 60Q40 10 90 60Z" fill="#00B3A6" opacity=".45"/><path d="M270 70Q320 25 370 70Z" fill="#FF4F8B" opacity=".45"/>`;
  let body = "";
  if (stage === 0) {
    body = `<path d="M70 92Q180 0 290 92Z" fill="${u.a}"/><path d="M135 92Q180 14 180 92ZM225 92Q180 14 180 92Z" fill="${u.b}"/><rect x="176" y="84" width="8" height="50" fill="#2B1D14"/>
      <rect x="80" y="122" width="200" height="56" rx="8" fill="#8A5A34"/><rect x="80" y="122" width="200" height="10" rx="4" fill="#6B4224"/>
      <text x="180" y="160" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="700" font-size="13" fill="#FFF7E8">${sign}</text>`;
  } else {
    const w = [0, 210, 260, 320][stage], x = 180 - w / 2, top = [0, 52, 40, 28][stage];
    const col = [null, "#FF7A1A", "#7B3FE4", "#12A150"][stage];
    let windows = "";
    const n = [0, 2, 3, 4][stage];
    for (let i = 0; i < n; i++) { const wx = x + 18 + i * ((w - 36) / n); windows += `<rect x="${wx}" y="${top + 52}" width="${(w - 36) / n - 10}" height="40" rx="4" fill="#BDE7F5"/><rect x="${wx}" y="${top + 52}" width="${(w - 36) / n - 10}" height="8" fill="#FFF" opacity=".5"/>`; }
    body = `<rect x="${x}" y="${top}" width="${w}" height="${178 - top}" rx="6" fill="#FFF7E8" stroke="#E3CCA6" stroke-width="2"/>
      <rect x="${x - 6}" y="${top}" width="${w + 12}" height="34" rx="6" fill="${col}"/>
      <text x="180" y="${top + 23}" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="700" font-size="14" fill="#FFFFFF">${sign}</text>
      ${awning(x, top + 34, w, u)}
      ${windows}<rect x="164" y="${top + 100 > 132 ? 132 : top + 100}" width="32" height="${178 - (top + 100 > 132 ? 132 : top + 100)}" rx="3" fill="#8A5A34"/>`;
  }
  return `<svg class="scene-svg" viewBox="0 0 360 210" preserveAspectRatio="xMidYMax slice" style="height:${h}px" role="img" aria-label="${["Wooden stall", "Shop", "Mini-Mart", "Supermarket"][stage]}">${sky}${ground}${body}</svg>`;
}

function awning(x, y, w, u) {
  const n = Math.max(6, Math.round(w / 22)), sw = w / n;
  let d = `M${x} ${y}h${w}v10`;
  for (let i = 0; i < n; i++) d += `q${-sw / 2} 10 ${-sw} 0`;
  let stripes = "";
  for (let i = 0; i < n; i += 2) stripes += `<rect x="${x + i * sw}" y="${y}" width="${sw}" height="10" fill="${u.b}"/>`;
  return `<path d="${d}z" fill="${u.a}"/>${stripes}`;
}

export const ICON = {
  play: `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>`,
  bank: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 9l9-5 9 5M5 10v8M10 10v8M14 10v8M19 10v8M3 21h18"/></svg>`,
  grow: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V12M10 20V8M16 20V4M22 20H2"/></svg>`,
  report: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>`,
  menu: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  back: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,
  pause: `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/></svg>`,
  warn: `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/></svg>`,
  check: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>`,
  star: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z"/></svg>`,
  sound: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>`,
  staff: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
  up: `<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 10H4z"/></svg>`,
  down: `<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20L4 10h16z"/></svg>`,
};
