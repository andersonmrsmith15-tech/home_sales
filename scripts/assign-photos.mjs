/**
 * Demo e'lonlarga Wikimedia Commons'dagi erkin litsenziyali real fotolarni biriktiradi.
 * Muallif va litsenziya photo_credit ustuniga yoziladi (CC BY / BY-SA talabi).
 *
 *   npm run photos              # faqat rasmi yo'q demo e'lonlarga
 *   npm run photos -- --force   # barcha demo e'lonlarga qaytadan
 */
import fs from 'node:fs';
import { getSql } from '../lib/db.mjs';

const stock = JSON.parse(fs.readFileSync(new URL('../data/stock-photos.json', import.meta.url), 'utf8'));
const force = process.argv.includes('--force');
const MIN_PHOTOS = 10; // bundan kam rasm bo'lsa, takrorlanib qolmasligi uchun shu tur o'tkazib yuboriladi

const sql = getSql();
for (const [type, photos] of Object.entries(stock)) {
  if (photos.length < MIN_PHOTOS) {
    console.log(`– ${type}: ${photos.length} ta rasm — yetarli emas, o'tkazib yuborildi`);
    continue;
  }
  const rows = force
    ? await sql`SELECT id FROM listings WHERE source = 'demo' AND type = ${type} ORDER BY id`
    : await sql`SELECT id FROM listings WHERE source = 'demo' AND type = ${type} AND photos = '[]'::jsonb ORDER BY id`;
  for (let i = 0; i < rows.length; i++) {
    const p = photos[i % photos.length];
    await sql`UPDATE listings SET photos = ${JSON.stringify([p.url])}::jsonb,
      photo_credit = ${`${p.artist} · ${p.license} · Wikimedia Commons`}, photo_credit_url = ${p.page}
      WHERE id = ${rows[i].id}`;
  }
  console.log(`✓ ${type}: ${rows.length} ta e'longa ${photos.length} xil real foto biriktirildi`);
}
