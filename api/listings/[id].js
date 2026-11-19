import handler from '../../netlify/functions/listing.mjs';

export const GET = (req) => {
  const id = new URL(req.url).pathname.split('/').filter(Boolean).pop();
  return handler(req, { params: { id } });
};
