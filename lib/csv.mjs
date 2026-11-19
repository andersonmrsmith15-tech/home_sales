/**
 * CSV import: fayl matnini o'qish va har bir qatorni `listings` jadvali yozuviga aylantirish.
 */
import { createHash } from 'node:crypto';
import { cleanDistrict } from './olx.mjs';

/** RFC 4180 CSV parser: qo'shtirnoq, qator ichidagi yangi qator va "" ni qo'llaydi. Ajratgich avtomatik aniqlanadi (, yoki ;). */
export function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const firstLine = text.slice(0, text.indexOf('\n') === -1 ? undefined : text.indexOf('\n'));
  const delim = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';

  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delim) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== '')) rows.push(row);
  return { rows, delim };
}

// Ustun nomlari (o'zbekcha / ruscha / inglizcha) -> jadval maydoni
const HEADER_ALIASES = {
  external_id: ['external_id', 'id', 'kod', 'код'],
  type: ['type', 'tur', 'turi', 'тип'],
  title: ['title', 'sarlavha', 'nomi', 'заголовок'],
  description: ['description', 'tavsif', 'izoh', 'описание'],
  price: ['price', 'narx', 'narxi', 'цена', 'price_usd'],
  currency: ['currency', 'valyuta', 'валюта'],
  rooms: ['rooms', 'xona', 'xonalar', 'комнат', 'комнаты'],
  area_m2: ['area_m2', 'area', 'maydon', 'maydon_m2', 'площадь'],
  land_sotix: ['land_sotix', 'sotix', 'yer', 'yer_sotix', 'участок', 'сотки'],
  floor: ['floor', 'qavat', 'этаж'],
  total_floors: ['total_floors', 'qavatlar', 'qavatlar_soni', 'этажность'],
  district: ['district', 'tuman', 'район'],
  address: ['address', 'manzil', 'адрес'],
  lat: ['lat', 'latitude', 'kenglik'],
  lon: ['lon', 'lng', 'longitude', 'uzunlik'],
  photos: ['photos', 'rasmlar', 'rasm', 'фото'],
  url: ['url', 'havola', 'link', 'ссылка'],
  posted_at: ['posted_at', 'sana', 'date', 'дата'],
  source: ['source', 'manba', 'источник'],
};
const ALIAS_LOOKUP = Object.fromEntries(
  Object.entries(HEADER_ALIASES).flatMap(([field, names]) => names.map((n) => [n, field])),
);
const normHeader = (h) => h.trim().toLowerCase().replace(/[’'`ʻʼ]/g, '').replace(/[\s-]+/g, '_');

export function mapHeaders(header) {
  return header.map((h) => ALIAS_LOOKUP[normHeader(h)] ?? ALIAS_LOOKUP[normHeader(h).replace(/_/g, '')] ?? null);
}

/** "85 000", "85,000", "4,5", "1.100.000" kabi sonlarni o'qish */
export function parseNumber(v) {
  if (v == null) return null;
  let s = String(v).trim().replace(/[\s $]/g, '').replace(/(usd|uzs|so'm|sum|y\.e\.?)$/i, '');
  if (!s) return null;
  if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
  else if (s.includes(',')) s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
  else if (/^\d{1,3}(\.\d{3}){2,}$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function parseType(v) {
  const s = String(v ?? '').toLowerCase();
  if (/kvartira|ko.?p\s*qavat|квартир|apartment|flat/.test(s)) return 'kvartira';
  if (/eski|стар|old/.test(s)) return 'eski_uy';
  if (/hovli|uy|дом|house/.test(s)) return 'hovli';
  return null;
}

function parseDate(v) {
  if (!v || !String(v).trim()) return new Date().toISOString();
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/); // 15.11.2026
  const d = m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], 9)) : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const TYPE_TITLE = { kvartira: 'kvartira', hovli: 'hovli', eski_uy: 'eski uy' };

/** Bitta CSV qatorini yozuvga aylantiradi. Xato bo'lsa { error } qaytaradi. */
export function rowToListing(obj, { defaultSource = 'csv', usdRate = 12700 } = {}) {
  const type = parseType(obj.type);
  if (!type) return { error: `"tur" noto'g'ri: "${obj.type ?? ''}" (kvartira / hovli / eski uy)` };

  const price = parseNumber(obj.price);
  if (!price || price <= 0) return { error: `"narx" noto'g'ri: "${obj.price ?? ''}"` };
  const currency = (obj.currency || 'USD').trim().toUpperCase().replace(/^(SO'?M|SUM|СУМ)$/, 'UZS');
  if (!['USD', 'UZS'].includes(currency)) return { error: `"valyuta" USD yoki UZS bo'lishi kerak: "${obj.currency}"` };
  const priceUsd = currency === 'UZS' ? price / usdRate : price;

  const posted = parseDate(obj.posted_at);
  if (!posted) return { error: `"sana" noto'g'ri: "${obj.posted_at}" (YYYY-MM-DD yoki DD.MM.YYYY)` };

  const rooms = parseNumber(obj.rooms);
  const area = parseNumber(obj.area_m2);
  const land = parseNumber(obj.land_sotix);
  const district = cleanDistrict(obj.district?.trim());
  const int = (x) => (x == null ? null : Math.round(x));

  const title = obj.title?.trim() ||
    [rooms && `${int(rooms)} xonali`, TYPE_TITLE[type], area && `${Math.round(area)} m²`, land && `${land} sotix`, district]
      .filter(Boolean).join(', ');

  const source = (obj.source?.trim() || defaultSource).toLowerCase().slice(0, 40);
  const photos = (obj.photos || '').split(/[|\n]/).map((p) => p.trim()).filter((p) => /^https?:\/\//.test(p)).slice(0, 10);
  const url = /^https?:\/\//.test(obj.url?.trim() || '') ? obj.url.trim() : null;

  const externalId = obj.external_id?.trim()
    ? `${source}-${obj.external_id.trim()}`
    : `${source}-` + createHash('sha1').update([type, title, price, district, area, land].join('|')).digest('hex').slice(0, 16);

  return {
    listing: {
      external_id: externalId,
      source,
      type,
      title: title.slice(0, 300),
      description: obj.description?.trim() || null,
      price_usd: Math.round(priceUsd * 100) / 100,
      price_original: price,
      currency,
      rooms: int(rooms),
      area_m2: area,
      land_sotix: land,
      floor: int(parseNumber(obj.floor)),
      total_floors: int(parseNumber(obj.total_floors)),
      district,
      address: obj.address?.trim() || (district ? `Toshkent, ${district} tumani` : 'Toshkent'),
      lat: parseNumber(obj.lat),
      lon: parseNumber(obj.lon),
      photos,
      url,
      posted_at: posted,
    },
  };
}

/** Butun CSV matnini qayta ishlaydi: { listings, errors, unknownColumns } */
export function csvToListings(text, opts) {
  const { rows } = parseCsv(text);
  if (rows.length < 2) return { listings: [], errors: [{ line: 1, error: "Fayl bo'sh yoki faqat sarlavha qatori bor" }], unknownColumns: [] };
  const fields = mapHeaders(rows[0]);
  const unknownColumns = rows[0].filter((_, i) => !fields[i]);
  if (!fields.includes('type') || !fields.includes('price')) {
    return { listings: [], errors: [{ line: 1, error: 'Majburiy ustunlar yo\'q: "tur" (type) va "narx" (price)' }], unknownColumns };
  }
  const listings = [];
  const errors = [];
  rows.slice(1).forEach((r, idx) => {
    const obj = {};
    fields.forEach((f, i) => { if (f) obj[f] = r[i]; });
    const res = rowToListing(obj, opts);
    if (res.error) errors.push({ line: idx + 2, error: res.error });
    else listings.push(res.listing);
  });
  return { listings, errors, unknownColumns };
}
