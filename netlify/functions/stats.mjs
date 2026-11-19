import { getSql, json, errorResponse } from '../../lib/db.mjs';

const PPM2 = `CASE WHEN area_m2 > 10 THEN price_usd / area_m2 END`;

export default async () => {
  try {
    const sql = getSql();
    const [kpi, byType, byDistrict, trend, histogram, rooms, latest, lastRun] = await Promise.all([
      sql.query(`SELECT COUNT(*)::int AS total,
          AVG(price_usd)::float AS avg_price,
          AVG(${PPM2})::float AS avg_ppm2,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_usd)::float AS median_price,
          COUNT(*) FILTER (WHERE posted_at > now() - interval '7 days')::int AS new_week,
          COUNT(*) FILTER (WHERE source = 'demo')::int AS demo_count,
          COUNT(DISTINCT district)::int AS districts
        FROM listings WHERE is_active AND price_usd > 0`),
      sql.query(`SELECT type, COUNT(*)::int AS count, AVG(price_usd)::float AS avg_price,
          AVG(${PPM2})::float AS avg_ppm2, MIN(price_usd)::float AS min_price
        FROM listings WHERE is_active AND price_usd > 0 GROUP BY type`),
      sql.query(`SELECT district, COUNT(*)::int AS count, AVG(${PPM2})::float AS avg_ppm2,
          AVG(price_usd)::float AS avg_price
        FROM listings WHERE is_active AND price_usd > 0 AND district IS NOT NULL
        GROUP BY district HAVING COUNT(*) >= 2 ORDER BY avg_ppm2 DESC NULLS LAST LIMIT 15`),
      sql.query(`SELECT to_char(date_trunc('month', posted_at), 'YYYY-MM') AS month, type,
          AVG(${PPM2})::float AS avg_ppm2, COUNT(*)::int AS count
        FROM listings WHERE is_active AND price_usd > 0 AND posted_at > now() - interval '12 months'
        GROUP BY 1, 2 ORDER BY 1`),
      sql.query(`SELECT bucket, ord, COUNT(*)::int AS count FROM (
          SELECT CASE
            WHEN price_usd < 30000 THEN '<30k' WHEN price_usd < 50000 THEN '30–50k'
            WHEN price_usd < 75000 THEN '50–75k' WHEN price_usd < 100000 THEN '75–100k'
            WHEN price_usd < 150000 THEN '100–150k' WHEN price_usd < 250000 THEN '150–250k'
            WHEN price_usd < 500000 THEN '250–500k' ELSE '500k+' END AS bucket,
          CASE
            WHEN price_usd < 30000 THEN 1 WHEN price_usd < 50000 THEN 2 WHEN price_usd < 75000 THEN 3
            WHEN price_usd < 100000 THEN 4 WHEN price_usd < 150000 THEN 5 WHEN price_usd < 250000 THEN 6
            WHEN price_usd < 500000 THEN 7 ELSE 8 END AS ord
          FROM listings WHERE is_active AND price_usd > 0) t
        GROUP BY bucket, ord ORDER BY ord`),
      sql.query(`SELECT LEAST(rooms, 5) AS rooms, COUNT(*)::int AS count, AVG(price_usd)::float AS avg_price
        FROM listings WHERE is_active AND type = 'kvartira' AND rooms > 0 AND price_usd > 0
        GROUP BY 1 ORDER BY 1`),
      sql.query(`SELECT id, type, title, price_usd, rooms, area_m2, land_sotix, district, photos, photo_credit, source, posted_at
        FROM listings WHERE is_active AND price_usd > 0 ORDER BY posted_at DESC LIMIT 8`),
      sql.query(`SELECT MAX(scraped_at) AS last_update,
          ARRAY_REMOVE(ARRAY_AGG(DISTINCT source), NULL) AS sources
        FROM listings WHERE source <> 'demo'`),
    ]);
    return json({
      kpi: kpi[0],
      byType,
      byDistrict,
      trend,
      histogram,
      rooms,
      latest,
      lastUpdate: lastRun[0]?.last_update ?? null,
      sources: lastRun[0]?.sources ?? [],
    });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config = { path: '/api/stats' };
