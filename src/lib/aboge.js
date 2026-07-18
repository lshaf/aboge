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

// The Javanese & Islamic day begins at maghrib (~17:30 local), not midnight —
// the weton (hari + pasaran) and tanggal all advance one at sunset. So after
// maghrib, a moment's Javanese day is dateToDayNum(date) + 1.
export const MAGHRIB_HOUR = 17.5; // 17:30
export function afterMaghrib(date) {
  return date.getHours() + date.getMinutes() / 60 >= MAGHRIB_HOUR;
}

// ─── ASAPON (Alip Selasa Pon) ─────────────────────────────────────────────────
// The newer reckoning runs one day ahead of Aboge (Alip Rebo Wage): its epoch
// "1 Sura Alip" falls a day earlier, so its tanggal/bulan/tahun for a real day
// equals the Aboge conversion of (dayNum + 1). Hari & pasaran are the same real
// values as Aboge — only the date labelling differs.
export function dayNumToAsapon(dayNum) {
  return dayNumToAboge(dayNum + 1);
}

// ─── HIJRIAH (Islamic calendar via Intl) ──────────────────────────────────────
export const HIJRI_MONTHS = [
  "Muharram","Safar","Rabiul Awal","Rabiul Akhir","Jumadil Awal","Jumadil Akhir",
  "Rajab","Sya'ban","Ramadan","Syawal","Zulkaidah","Zulhijah",
];

export function hijriDate(date) {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric", month: "numeric", year: "numeric",
    }).formatToParts(date);
    const g = (t) => parts.find((p) => p.type === t)?.value;
    const m = parseInt(g("month"), 10);
    return { d: parseInt(g("day"), 10), monthIdx: m - 1, month: HIJRI_MONTHS[m - 1], year: parseInt(g("year"), 10) };
  } catch {
    return null;
  }
}

// ─── MOON PHASE ───────────────────────────────────────────────────────────────
const SYNODIC = 29.530588853;
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0); // 2000-01-06 18:14 UTC
const MOON_PHASES = [
  { name: "Bulan Baru",  emoji: "🌑" },
  { name: "Sabit Muda",  emoji: "🌒" },
  { name: "Paruh Awal",  emoji: "🌓" },
  { name: "Benjol Muda", emoji: "🌔" },
  { name: "Purnama",     emoji: "🌕" },
  { name: "Benjol Tua",  emoji: "🌖" },
  { name: "Paruh Akhir", emoji: "🌗" },
  { name: "Sabit Tua",   emoji: "🌘" },
];

export function moonPhase(date) {
  const t = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  let age = ((t - REF_NEW_MOON) / 86400000) % SYNODIC;
  if (age < 0) age += SYNODIC;
  const frac = age / SYNODIC; // 0=new, .5=full
  const illum = Math.round(((1 - Math.cos(2 * Math.PI * frac)) / 2) * 100);
  const idx = Math.floor(frac * 8 + 0.5) % 8;
  return { age: Math.round(age * 10) / 10, illum, frac, waxing: frac < 0.5, ...MOON_PHASES[idx] };
}

// ─── PRANATA MANGSA (Javanese solar season) ──────────────────────────────────
// Start dates in calendar order; Jan 1 – Feb 2 belongs to Kapitu (from 22 Dec).
const MANGSA_STARTS = [
  [2, 3, "Kawolu", 8], [3, 1, "Kasanga", 9], [3, 26, "Kadasa", 10],
  [4, 19, "Desta", 11], [5, 12, "Sada", 12], [6, 22, "Kasa", 1],
  [8, 2, "Karo", 2], [8, 25, "Katelu", 3], [9, 18, "Kapat", 4],
  [10, 13, "Kalima", 5], [11, 9, "Kanem", 6], [12, 22, "Kapitu", 7],
];
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function pranataMangsa(date) {
  const m = date.getMonth() + 1, d = date.getDate();
  let cur = { name: "Kapitu", no: 7 };
  for (const [mm, dd, name, no] of MANGSA_STARTS) {
    if (m > mm || (m === mm && d >= dd)) cur = { name, no };
    else break;
  }
  return { ...cur, roman: ROMAN[cur.no] };
}

// ─── GOOD HOURS (Jam becik) ───────────────────────────────────────────────────
// Distribute 24 into the day's neptu boxes (dakon), then lay the settled row
// across the 24 hours starting at 00:00; the highest-value hours are best.
export function goodHours(neptu) {
  const row = dakon(24, neptu).at(-1).row;
  const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, val: row[i % row.length] }));
  const max = Math.max(...hours.map((h) => h.val));
  const min = Math.min(...hours.map((h) => h.val));
  return {
    max, min,
    hours: hours.map((h) => ({ ...h, best: h.val === max, worst: h.val === min })),
  };
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
