// Har kuni OLX dan yangi e'lonlarni yig'adi (Netlify Scheduled Function, ~30s limit).
import { runScrape } from '../../lib/olx.mjs';

export default async () => {
  try {
    const res = await runScrape({ maxPages: 2, delayMs: 1200 });
    console.log('Scrape OK', res);
  } catch (err) {
    console.error('Scrape xato:', err.message);
  }
};

// O'chirilgan: olx.uz avtomatik so'rovlarni 403 bilan rad etadi. Ruxsat olinsa, qatorni qayta yoqing.
// export const config = { schedule: '0 2 * * *' };
