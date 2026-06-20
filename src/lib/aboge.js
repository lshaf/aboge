// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const WINDU     = ["Alif","Ehe","Jimawal","Je","Dal","Be","Wawu","Jimakir","Alif"];
export const WUNTU     = ["Ehe","Dal","Jimakir"]; // 355 hari, Besar=30
export const HARI_JAWA = ["Ahad","Senen","Seloso","Rebo","Kemis","Jemuwah","Setu"];
export const HARI_INDO = ["Ahad","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
export const PASARAN   = ["Legi","Pahing","Pon","Wage","Kliwon"];
export const NEPTU_H   = [5,4,3,7,8,6,9];
export const NEPTU_P   = [5,9,7,4,8];
export const BULAN     = [
  "Suro","Sapar","Mulud","Bakdo Mulud",
  "Jumadilawal","Jumadilakir","Rejeb","Ruah",
  "Poso","Sawal","Selo","Besar",
];

const EPOCH_HARI    = 3; // Rebo
const EPOCH_PASARAN = 3; // Wage

function monthDays(bIdx, isWuntu) {
  if (bIdx === 11) return isWuntu ? 30 : 29;
  return bIdx % 2 === 0 ? 30 : 29;
}

function buildWindu() {
  let h = EPOCH_HARI, p = EPOCH_PASARAN;
  return WINDU.map((tahun) => {
    const isWuntu = WUNTU.includes(tahun);
    const months = [];
    let mh = h, mp = p;
    for (let b = 0; b < 12; b++) {
      const days = monthDays(b, isWuntu);
      months.push({ name: BULAN[b], days, startH: mh, startP: mp });
      mh = (mh + days) % 7;
      mp = (mp + days) % 5;
    }
    const total = isWuntu ? 355 : 354;
    h = (h + total) % 7;
    p = (p + total) % 5;
    return { tahun, isWuntu, months };
  });
}

export const WINDU_DATA = buildWindu();

// Combos that never appear as the 1st day of any month across the whole cycle
const USED_COMBOS = new Set();
WINDU_DATA.forEach(yr =>
  yr.months.forEach(m => USED_COMBOS.add(`${m.startH}-${m.startP}`))
);
export const NEVER_1ST = [];
for (let h = 0; h < 7; h++)
  for (let p = 0; p < 5; p++)
    if (!USED_COMBOS.has(`${h}-${p}`))
      NEVER_1ST.push({ h, p });

// ─── DAKON ────────────────────────────────────────────────────────────────────
export function dakon(seeds, numBoxes, verbose = false) {
  const boxes = new Array(numBoxes).fill(0);
  let hand = seeds, pos = -1;
  while (hand > 0) { pos = (pos + 1) % numBoxes; boxes[pos]++; hand--; }
  const sequences = verbose ? [{ row: boxes.slice(), start: 0, end: pos }] : [];
  while (true) {
    const startPos = pos;
    hand = boxes[pos]; boxes[pos] = 0;
    while (hand > 0) { pos = (pos + 1) % numBoxes; boxes[pos]++; hand--; }
    const next = (pos + 1) % numBoxes;
    if (boxes[pos] === 1 && boxes[next] === 0) { sequences.push({ row: boxes.slice(), start: startPos, end: pos }); break; }
    if (verbose) sequences.push({ row: boxes.slice(), start: startPos, end: pos });
  }
  return sequences;
}

// Precompute all unique neptu sums and their dakon results
export const ALL_SUMS = [...new Set(
  NEPTU_H.flatMap(nh => NEPTU_P.map(np => nh + np))
)].sort((a, b) => a - b);

// For each sum, which hari+pasaran combos produce it
function combosForSum(sum) {
  const out = [];
  NEPTU_H.forEach((nh, hi) =>
    NEPTU_P.forEach((np, pi) => { if (nh + np === sum) out.push({ hi, pi, nh, np }); })
  );
  return out;
}

export const DAKON_DATA = ALL_SUMS.map(sum => ({
  sum,
  combos: combosForSum(sum),
}));

// ─── MASEHI ↔ ABOGE ──────────────────────────────────────────────────────────
// Anchor: 18 June 2026 = 1 Suro Be = Kemis Legi
// 1 Suro Alif of this windu = 11 Aug 2021
const ANCHOR_DAYS  = Date.UTC(2026, 5, 18); // months are 0-indexed
const ANCHOR_H     = 4; // Kemis
const ANCHOR_P     = 0; // Legi
// Days from 1 Suro Alif to 1 Suro Be = sum of first 5 year lengths
const DAYS_TO_BE   = 1772;
const ALIF_MS      = ANCHOR_DAYS - DAYS_TO_BE * 86400000;

export function dateToDayNum(d) {
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - ALIF_MS) / 86400000);
}

export function dayNumToAboge(dayNum) {
  let rem = dayNum;
  let yearIdx = 0;
  if (rem >= 0) {
    while (true) {
      const nm = WINDU[yearIdx % 8];
      const yrDays = WUNTU.includes(nm) ? 355 : 354;
      if (rem < yrDays) break;
      rem -= yrDays; yearIdx++;
    }
  } else {
    while (rem < 0) {
      yearIdx--;
      const nm = WINDU[((yearIdx % 8) + 8) % 8];
      rem += WUNTU.includes(nm) ? 355 : 354;
    }
  }
  const tahun = WINDU[((yearIdx % 8) + 8) % 8];
  const isW   = WUNTU.includes(tahun);
  let bulanIdx = 0;
  while (true) {
    const md = bulanIdx === 11 ? (isW ? 30 : 29) : bulanIdx % 2 === 0 ? 30 : 29;
    if (rem < md) break;
    rem -= md; bulanIdx++;
  }
  const h = ((ANCHOR_H + (dayNum - DAYS_TO_BE)) % 7 + 7) % 7;
  const p = ((ANCHOR_P + (dayNum - DAYS_TO_BE)) % 5 + 5) % 5;
  return { tahun, yearIdx, bulanIdx, tanggal: rem + 1, h, p };
}

export function abogeToDayNum(yearIdx, bulanIdx, tanggal) {
  let days = 0;
  for (let i = 0; i < yearIdx; i++) {
    const nm = WINDU[i % 8];
    days += WUNTU.includes(nm) ? 355 : 354;
  }
  const tahun = WINDU[yearIdx % 8];
  const isW   = WUNTU.includes(tahun);
  for (let b = 0; b < bulanIdx; b++) {
    days += b === 11 ? (isW ? 30 : 29) : b % 2 === 0 ? 30 : 29;
  }
  return days + tanggal - 1;
}

export function dayNumToDate(dayNum) {
  return new Date(ALIF_MS + dayNum * 86400000);
}

// ─── THEME ──────────────────────────────────────────────────────────────────
export const C = {
  bg:    "#f4efe4",
  paper: "#fffdf8",
  stone: "#1c1a16",
  gold:  "#b07d12",
  goldt: "#d4971a",
  rust:  "#7c3020",
  mute:  "#7a7060",
  line:  "#ddd4bc",
  tag:   ["#3b5e44","#2e4d6a","#6b3a1f","#4a3760","#5a5020","#1f4f50","#6b2040","#3a4a28","#3b5e44"],
  tagT:  ["#b8dcba","#a8c8e0","#e8b898","#c8a8e0","#d8d098","#98d0d0","#e8a0c0","#b8d0a0","#b8dcba"],
};

export const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

// Traditional pasaran colours (mancapat — the five directions/colours).
// Legi=putih, Pahing=abang, Pon=kuning, Wage=ireng, Kliwon=manca (campuran/pusat).
export const PASARAN_COLOR = ["#efe6cf", "#a8392a", "#d6a221", "#2a2620", "#6b5a7a"];
// Text colour that reads on top of each pasaran colour.
export const PASARAN_TEXT  = ["#6a5a30", "#ffffff", "#3a2c00", "#e8dcc4", "#ffffff"];

// ─── STYLE HELPER ─────────────────────────────────────────────────────────────
// Vue's :style binding does not auto-append "px" to numeric values the way React
// does. This converts numbers to px strings, leaving unitless properties alone,
// so the inline style objects ported from the original JSX render identically.
const UNITLESS = new Set([
  "opacity","zIndex","fontWeight","lineHeight","flex","flexGrow","flexShrink",
  "order","zoom","gridRow","gridColumn","columnCount","fillOpacity","strokeOpacity",
]);

export function px(style) {
  const out = {};
  for (const k in style) {
    const v = style[k];
    out[k] = (typeof v === "number" && !UNITLESS.has(k)) ? `${v}px` : v;
  }
  return out;
}
