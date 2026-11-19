import { getSql, json, errorResponse } from '../../lib/db.mjs';

const SORTS = {
  new: 'posted_at DESC',
  price_asc: 'price_usd ASC',
  price_desc: 'price_usd DESC',
  ppm2_asc: '(price_usd / NULLIF(area_m2, 0)) ASC NULLS LAST',
  area_desc: 'area_m2 DESC NULLS LAST',
};

export default async (req) => {
  try {
    const sql = getSql();
    const q = new URL(req.url).searchParams;
    const where = ['is_active', 'price_usd > 0'];
    const params = [];
    const add = (cond, val) => { params.push(val); where.push(cond.replace('?', `$${params.length}`)); };

    if (['kvartira', 'hovli', 'eski_uy'].includes(q.get('type'))) add('type = ?', q.get('type'));
    if (q.get('district')) add('district = ?', q.get('district'));
    if (q.get('minPrice')) add('price_usd >= ?', Number(q.get('minPrice')));
    if (q.get('maxPrice')) add('price_usd <= ?', Number(q.get('maxPrice')));
    if (q.get('rooms')) {
      const r = Number(q.get('rooms'));
      r >= 5 ? add('rooms >= ?', 5) : add('rooms = ?', r);
    }
    if (q.get('q')) add('(title ILIKE ? OR description ILIKE $' + (params.length + 1) + ')', `%${q.get('q')}%`);

    const limit = Math.min(Number(q.get('limit')) || 24, 60);
    const page = Math.max(Number(q.get('page')) || 1, 1);
    const order = SORTS[q.get('sort')] || SORTS.new;
    const w = where.join(' AND ');

    const [items, count] = await Promise.all([
      sql.query(
        `SELECT id, type, title, price_usd, rooms, area_m2, land_sotix, floor, total_floors, district,
           photos, source, posted_at
         FROM listings WHERE ${w} ORDER BY ${order}, id DESC
         LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
        params,
      ),
      sql.query(`SELECT COUNT(*)::int AS total FROM listings WHERE ${w}`, params),
    ]);
    const total = count[0].total;
    return json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    return errorResponse(err);
  }
};

export const config = { path: '/api/listings' };
