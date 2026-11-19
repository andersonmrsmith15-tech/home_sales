import { runScrape } from '../lib/olx.mjs';

const maxPages = Number(process.env.SCRAPE_MAX_PAGES || 5);
const delayMs = Number(process.env.SCRAPE_DELAY_MS || 2500);

try {
  const res = await runScrape({ maxPages, delayMs });
  console.log(`✓ Tayyor: ${res.found} ta e'lon topildi, ${res.upserted} tasi bazaga yozildi.`);
} catch (err) {
  console.error('✗ Xato:', err.message);
  if (/403|429/.test(err.message)) {
    console.error("  OLX so'rovni rad etdi. Keyinroq urinib ko'ring yoki SCRAPE_DELAY_MS ni oshiring.");
  }
  process.exit(1);
}
