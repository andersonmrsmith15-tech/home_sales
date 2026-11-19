/**
 * Demo ma'lumotlar (source='demo'). Ular interfeysda "Demo" belgisi bilan ko'rsatiladi.
 * Real e'lonlar uchun: npm run scrape
 */
import { getSql } from '../lib/db.mjs';

const sql = getSql();
await sql`DELETE FROM listings WHERE source = 'demo'`;
if (process.argv.includes('--clear')) {
  console.log("✓ Demo ma'lumotlar o'chirildi");
  process.exit(0);
}

let s = 42;
const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
const between = (a, b) => a + rnd() * (b - a);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

// Tuman bo'yicha taxminiy bazaviy narx ($/m²)
const DISTRICTS = {
  Mirobod: 1550, Yakkasaroy: 1480, "Mirzo Ulug'bek": 1320, Yunusobod: 1280,
  Shayxontohur: 1220, Chilonzor: 1080, Olmazor: 1020, Yashnobod: 960,
  Uchtepa: 920, Sergeli: 820, Bektemir: 760, Yangihayot: 720,
};
const NAMES = Object.keys(DISTRICTS);
const now = Date.now();
const MONTH = 30 * 86400e3;

function base(district) {
  const monthsAgo = Math.floor(rnd() * 12);
  const trend = 1 - monthsAgo * 0.007;
  const posted = new Date(now - monthsAgo * MONTH - rnd() * MONTH * 0.95);
  return { ppm2: DISTRICTS[district] * trend, posted };
}

const rows = [];
let n = 0;
function add(type, district, extra) {
  n++;
  rows.push({
    external_id: `demo-${n}`, source: 'demo', type, district,
    address: `Toshkent, ${district} tumani`, currency: 'USD', url: null, ...extra,
  });
}

for (let i = 0; i < 220; i++) {
  const d = pick(NAMES); const { ppm2, posted } = base(d);
  const rooms = pick([1, 2, 2, 3, 3, 3, 4, 4, 5]);
  const area = Math.round(22 + rooms * between(14, 22));
  const total = pick([4, 5, 9, 9, 12, 16]);
  const floor = 1 + Math.floor(rnd() * total);
  const price = Math.round((area * ppm2 * between(0.85, 1.2)) / 500) * 500;
  const yangi = rnd() > 0.55;
  add('kvartira', d, {
    title: `${rooms} xonali kvartira, ${area} m², ${d}${yangi ? ' (yangi bino)' : ''}`,
    description: `${d} tumanida ${rooms} xonali kvartira sotiladi. Umumiy maydon ${area} m², ${floor}/${total} qavat. ${yangi ? 'Yangi qurilgan bino. ' : ''}${pick(["Evro ta'mir.", "O'rtacha ta'mir.", 'Qora suvoq.', 'Mebel bilan.'])} Metro va maktab yaqin.`,
    rooms, area_m2: area, floor, total_floors: total, land_sotix: null,
    price_usd: price, price_original: price, posted_at: posted,
  });
}
for (let i = 0; i < 100; i++) {
  const d = pick(NAMES); const { ppm2, posted } = base(d);
  const land = Math.round(between(2, 10) * 10) / 10;
  const area = Math.round(between(90, 360));
  const rooms = Math.max(3, Math.round(area / 45));
  const price = Math.round((area * ppm2 * between(0.6, 0.85) + land * ppm2 * between(6, 9)) / 1000) * 1000;
  add('hovli', d, {
    title: `${rooms} xonali hovli, ${land} sotix, ${d}`,
    description: `${d} tumanida ${land} sotix yerda ${area} m² hovli joy sotiladi. ${rooms} xona, ${pick(['ikki qavatli', 'bir qavatli'])}, ${pick(['gaz, suv, svet bor.', 'barcha kommunikatsiyalar mavjud.', "garaj va bog' bor."])}`,
    rooms, area_m2: area, land_sotix: land, floor: null, total_floors: pick([1, 2]),
    price_usd: price, price_original: price, posted_at: posted,
  });
}
for (let i = 0; i < 60; i++) {
  const d = pick(NAMES); const { ppm2, posted } = base(d);
  const land = Math.round(between(1.5, 6) * 10) / 10;
  const area = Math.round(between(45, 140));
  const rooms = Math.max(2, Math.round(area / 30));
  const price = Math.round((land * ppm2 * between(6.5, 9.5) + area * between(120, 260)) / 1000) * 1000;
  add('eski_uy', d, {
    title: `Eski uy, ${land} sotix, ${d}`,
    description: `${d} tumanida eski hovli uy sotiladi. Yer ${land} sotix, uy ${area} m², ${rooms} xona. ${pick(['Buzib qayta qurish uchun qulay.', "Ta'mir talab.", 'Sovet davrida qurilgan.', 'Hujjatlari tayyor.'])}`,
    rooms, area_m2: area, land_sotix: land, floor: null, total_floors: 1,
    price_usd: price, price_original: price, posted_at: posted,
  });
}

const COLS = ['external_id', 'source', 'type', 'title', 'description', 'price_usd', 'price_original', 'currency',
  'rooms', 'area_m2', 'land_sotix', 'floor', 'total_floors', 'district', 'address', 'url', 'posted_at'];
for (let i = 0; i < rows.length; i += 50) {
  const chunk = rows.slice(i, i + 50);
  const params = [];
  const values = chunk.map((r) => {
    const ph = COLS.map((c) => { params.push(r[c] ?? null); return `$${params.length}`; });
    return `(${ph.join(',')})`;
  });
  await sql.query(
    `INSERT INTO listings (${COLS.join(',')}) VALUES ${values.join(',')} ON CONFLICT (external_id) DO NOTHING`,
    params,
  );
}
console.log(`✓ ${rows.length} ta demo e'lon qo'shildi`);
