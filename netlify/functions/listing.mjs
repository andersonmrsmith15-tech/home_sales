import { getSql, json, errorResponse } from '../../lib/db.mjs';

export default async (req, context) => {
  try {
    const id = Number(context.params?.id);
    if (!Number.isInteger(id)) return json({ error: "Noto'g'ri ID" }, 400);
    const sql = getSql();
    const [item] = await sql`SELECT * FROM listings WHERE id = ${id}`;
    if (!item) return json({ error: "E'lon topilmadi" }, 404);

    const [similar, market] = await Promise.all([
      sql`SELECT id, type, title, price_usd, rooms, area_m2, land_sotix, district, photos, photo_credit, source, posted_at
          FROM listings
          WHERE is_active AND id <> ${id} AND type = ${item.type} AND price_usd > 0
          ORDER BY (district IS NOT DISTINCT FROM ${item.district}) DESC,
                   ABS(price_usd - ${item.price_usd}) ASC
          LIMIT 4`,
      sql`SELECT AVG(price_usd / NULLIF(area_m2, 0))::float AS avg_ppm2, COUNT(*)::int AS count
          FROM listings
          WHERE is_active AND type = ${item.type} AND district IS NOT DISTINCT FROM ${item.district}
            AND area_m2 > 10 AND price_usd > 0`,
    ]);
    return json({ item, similar, market: market[0] });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config = { path: '/api/listings/:id' };
