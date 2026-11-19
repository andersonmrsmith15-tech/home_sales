import { getSql, json, errorResponse } from '../../lib/db.mjs';

export default async () => {
  try {
    const sql = getSql();
    const districts = await sql`
      SELECT district, COUNT(*)::int AS count FROM listings
      WHERE is_active AND district IS NOT NULL GROUP BY district ORDER BY district`;
    return json({ districts });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config = { path: '/api/meta' };
