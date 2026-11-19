import { neon } from '@neondatabase/serverless';

let _sql;

/** Neon (Netlify DB) SQL klienti. NETLIFY_DATABASE_URL yoki DATABASE_URL ishlatiladi. */
export function getSql() {
  if (_sql) return _sql;
  const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL (yoki NETLIFY_DATABASE_URL) o\'rnatilmagan. .env faylini tekshiring.');
  }
  _sql = neon(url);
  return _sql;
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60',
      ...extraHeaders,
    },
  });
}

export function errorResponse(err) {
  console.error(err);
  return json({ error: err.message || 'Server xatosi' }, 500, { 'cache-control': 'no-store' });
}
