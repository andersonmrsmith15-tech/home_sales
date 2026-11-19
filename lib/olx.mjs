/**
 * olx.uz dan Toshkent shahri bo'yicha uy-joy e'lonlarini yig'ish.
 * Sahifadagi window.__PRERENDERED_STATE__ JSON obyektidan e'lonlar o'qiladi.
 * Iltimos, olx.uz foydalanish shartlariga rioya qiling va so'rovlar orasida pauza qoldiring.
 */
import { getSql } from './db.mjs';

const BASE = 'https://www.olx.uz';
const UA = 'UySotishBot/1.0 (+https://github.com/; real-estate dashboard)';

export const SOURCES = [
  { path: '/nedvizhimost/kvartiry/prodazha/tashkent/', kind: 'apartment' },
  { path: '/nedvizhimost/doma/prodazha/tashkent/', kind: 'house' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** HTML ichidan window.__PRERENDERED_STATE__ ni ajratib olish (katta satrlar uchun regex o'rniga qo'lda skanerlash). */
export function extractAds(html) {
  const marker = 'window.__PRERENDERED_STATE__';
  const at = html.indexOf(marker);
  if (at === -1) return [];
  let i = html.indexOf('=', at) + 1;
  while (/\s/.test(html[i])) i++;
  let raw;
  if (html[i] === '"') {
    let j = i + 1;
    while (j < html.length) {
      if (html[j] === '\\') { j += 2; continue; }
      if (html[j] === '"') break;
      j++;
    }
    raw = html.slice(i, j + 1);
  } else {
    const end = html.indexOf('</script>', i);
    raw = html.slice(i, end).trim().replace(/;$/, '');
  }
  let state = JSON.parse(raw);
  if (typeof state === 'string') state = JSON.parse(state);
  return state?.listing?.listing?.ads ?? [];
}

export async function fetchAds(path, page = 1) {
  const url = new URL(path, BASE);
  if (page > 1) url.searchParams.set('page', String(page));
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'uz,ru;q=0.8', Accept: 'text/html' },
  });
  if (!res.ok) throw new Error(`OLX ${res.status}: ${url}`);
  return extractAds(await res.text());
}

const num = (v) => {
  if (v == null) return null;
  const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : null;
};

function pickParam(params, ...patterns) {
  for (const p of params) {
    const key = `${p.key ?? ''} ${p.name ?? ''}`.toLowerCase();
    if (patterns.some((re) => re.test(key))) return p.normalizedValue ?? p.value?.key ?? p.value?.label ?? p.value;
  }
  return null;
}

const OLD_RE = /eski|снос|стар(ый|ая|ой)|ветх|советск|buzil|ta'mir talab|требует ремонт/i;

const DISTRICT_MAP = [
  [/чиланз|chilonz/i, 'Chilonzor'], [/юнусаб|yunusob/i, 'Yunusobod'], [/мирзо|ulug/i, "Mirzo Ulug'bek"],
  [/яккасар|yakkasar/i, 'Yakkasaroy'], [/шайхан|shayxon/i, 'Shayxontohur'], [/алмаз|olmazor/i, 'Olmazor'],
  [/сергел|sergeli/i, 'Sergeli'], [/учтеп|uchtepa/i, 'Uchtepa'], [/яшнаб|yashnob/i, 'Yashnobod'],
  [/мирабад|mirobod/i, 'Mirobod'], [/бектем|bektemir/i, 'Bektemir'], [/янгихаёт|yangihayot/i, 'Yangihayot'],
];

function cleanDistrict(name) {
  if (!name) return null;
  for (const [re, uz] of DISTRICT_MAP) if (re.test(name)) return uz;
  return name.replace(/\s*(район|tumani|тумани|rayon)\s*/gi, '').trim() || null;
}

export function normalizeAd(ad, kind) {
  const params = ad.params ?? [];
  const rate = Number(process.env.USD_UZS_RATE || 12700);

  const rp = ad.price?.regularPrice ?? {};
  const priceOriginal = num(rp.value);
  const currency = (rp.currencyCode || '').toUpperCase() || null;
  let priceUsd = null;
  if (priceOriginal != null) {
    priceUsd = currency === 'UZS' || currency === 'SUM' ? priceOriginal / rate : priceOriginal;
  }

  const rooms = num(pickParam(params, /room/, /комнат/, /xona/));
  const area = num(pickParam(params, /total_area/, /общая площадь/, /umumiy maydon/, /^area|\barea/));
  const land = num(pickParam(params, /land/, /участ/, /yer maydon/, /sotix|сотк/));
  const floor = num(pickParam(params, /^floor\b|^floor /, /^этаж /, /^qavat /));
  const totalFloors = num(pickParam(params, /total_floor|floors_in/, /этажность/, /qavatlar soni/));
  const year = num(pickParam(params, /year|год постро|qurilgan yil/));

  const text = `${ad.title ?? ''} ${ad.description ?? ''}`;
  let type = 'kvartira';
  if (kind === 'house') type = OLD_RE.test(text) || (year && year < 1985) ? 'eski_uy' : 'hovli';

  const photos = (ad.photos ?? [])
    .map((p) => (typeof p === 'string' ? p : p?.link || p?.url))
    .filter(Boolean)
    .map((u) => u.replace(/;s=\{width\}x\{height\}/, ';s=1000x750'))
    .slice(0, 10);

  const loc = ad.location ?? {};
  return {
    external_id: `olx-${ad.id}`,
    source: 'olx',
    type,
    title: String(ad.title ?? 'E\'lon').slice(0, 300),
    description: ad.description ? String(ad.description).replace(/<[^>]+>/g, ' ').slice(0, 5000) : null,
    price_usd: priceUsd,
    price_original: priceOriginal,
    currency,
    rooms: rooms != null ? Math.round(rooms) : null,
    area_m2: area,
    land_sotix: land,
    floor: floor != null ? Math.round(floor) : null,
    total_floors: totalFloors != null ? Math.round(totalFloors) : null,
    district: cleanDistrict(loc.districtName),
    address: [loc.cityName, loc.districtName].filter(Boolean).join(', ') || 'Toshkent',
    lat: num(ad.map?.lat),
    lon: num(ad.map?.lon),
    photos,
    url: ad.url || null,
    posted_at: ad.createdTime || ad.lastRefreshTime || new Date().toISOString(),
  };
}

export async function upsertListing(sql, l) {
  await sql`
    INSERT INTO listings (external_id, source, type, title, description, price_usd, price_original, currency,
      rooms, area_m2, land_sotix, floor, total_floors, district, address, lat, lon, photos, url, posted_at)
    VALUES (${l.external_id}, ${l.source}, ${l.type}, ${l.title}, ${l.description}, ${l.price_usd}, ${l.price_original},
      ${l.currency}, ${l.rooms}, ${l.area_m2}, ${l.land_sotix}, ${l.floor}, ${l.total_floors}, ${l.district},
      ${l.address}, ${l.lat}, ${l.lon}, ${JSON.stringify(l.photos)}::jsonb, ${l.url}, ${l.posted_at})
    ON CONFLICT (external_id) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, price_usd = EXCLUDED.price_usd,
      price_original = EXCLUDED.price_original, currency = EXCLUDED.currency, type = EXCLUDED.type,
      rooms = EXCLUDED.rooms, area_m2 = EXCLUDED.area_m2, land_sotix = EXCLUDED.land_sotix,
      floor = EXCLUDED.floor, total_floors = EXCLUDED.total_floors, district = EXCLUDED.district,
      photos = EXCLUDED.photos, is_active = TRUE, scraped_at = now()`;
}

/** To'liq yig'ish jarayoni: barcha manbalar bo'yicha sahifalab yuradi va bazaga yozadi. */
export async function runScrape({ maxPages = 5, delayMs = 2500, log = console.log } = {}) {
  const sql = getSql();
  const [run] = await sql`INSERT INTO scrape_runs DEFAULT VALUES RETURNING id`;
  let found = 0;
  let upserted = 0;
  try {
    for (const src of SOURCES) {
      for (let page = 1; page <= maxPages; page++) {
        log(`→ ${src.path} sahifa ${page}`);
        const ads = await fetchAds(src.path, page);
        if (!ads.length) break;
        found += ads.length;
        for (const ad of ads) {
          const l = normalizeAd(ad, src.kind);
          if (!l.price_usd) continue;
          await upsertListing(sql, l);
          upserted++;
        }
        await sleep(delayMs);
      }
    }
    await sql`UPDATE scrape_runs SET finished_at = now(), found = ${found}, upserted = ${upserted}, status = 'ok' WHERE id = ${run.id}`;
  } catch (err) {
    await sql`UPDATE scrape_runs SET finished_at = now(), found = ${found}, upserted = ${upserted}, status = 'error', error = ${String(err.message)} WHERE id = ${run.id}`;
    throw err;
  }
  return { found, upserted };
}
