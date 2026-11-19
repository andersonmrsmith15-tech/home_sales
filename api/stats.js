import handler from '../netlify/functions/stats.mjs';

export const GET = (req) => handler(req);
