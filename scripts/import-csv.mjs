/**
 * E'lonlarni CSV fayldan bazaga yuklash.
 *
 *   npm run import -- data/elonlar.csv
 *   npm run import -- data/elonlar.csv --source=agentlik1 --dry-run
 *
 * --source=nom   manba nomi (CSV'da "manba" ustuni bo'lmasa ishlatiladi, standart: csv)
 * --dry-run      bazaga yozmasdan faqat tekshiradi
 */
import fs from 'node:fs';
import { csvToListings } from '../lib/csv.mjs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const source = args.find((a) => a.startsWith('--source='))?.split('=')[1] || 'csv';

if (!file) {
  console.error('Foydalanish: npm run import -- <fayl.csv> [--source=nom] [--dry-run]');
  console.error('Namuna fayl: data/elonlar-namuna.csv');
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`✗ Fayl topilmadi: ${file}`);
  process.exit(1);
}

const { listings, errors, unknownColumns } = csvToListings(fs.readFileSync(file, 'utf8'), {
  defaultSource: source,
  usdRate: Number(process.env.USD_UZS_RATE || 12700),
});

if (unknownColumns.length) console.warn(`⚠ E'tiborsiz qoldirilgan ustunlar: ${unknownColumns.join(', ')}`);
for (const e of errors.slice(0, 30)) console.warn(`  ${e.line}-qator: ${e.error}`);
if (errors.length > 30) console.warn(`  ... yana ${errors.length - 30} ta xato`);

const byType = listings.reduce((a, l) => ((a[l.type] = (a[l.type] || 0) + 1), a), {});
console.log(`Yaroqli: ${listings.length} ta (${Object.entries(byType).map(([k, v]) => `${k}: ${v}`).join(', ') || '—'}), xato: ${errors.length} ta`);

if (dryRun || !listings.length) {
  console.log(dryRun ? 'Dry-run: bazaga hech narsa yozilmadi.' : 'Yuklash uchun yaroqli qator yo\'q.');
  process.exit(errors.length && !listings.length ? 1 : 0);
}

const { getSql } = await import('../lib/db.mjs');
const { upsertListing } = await import('../lib/olx.mjs');
const sql = getSql();

let done = 0;
const queue = [...listings];
await Promise.all(Array.from({ length: 5 }, async () => {
  while (queue.length) {
    await upsertListing(sql, queue.shift());
    done++;
    if (done % 50 === 0) console.log(`  ${done}/${listings.length}`);
  }
}));
console.log(`✓ ${done} ta e'lon bazaga yozildi (yangi yoki yangilangan).`);
