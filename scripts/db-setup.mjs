import { getSql } from '../lib/db.mjs';
import { SCHEMA } from '../lib/schema.mjs';

const sql = getSql();
for (const stmt of SCHEMA) await sql.query(stmt);
console.log('✓ Jadvallar tayyor: listings, scrape_runs');
