import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Lokal ishlab chiqish uchun: netlify/functions/*.mjs dagi funksiyalarni
 * ularning `config.path` (masalan /api/listings/:id) bo'yicha Vite serverida ishga tushiradi.
 * Shu tufayli `npm run dev` netlify-cli'siz ham to'liq ishlaydi.
 */
function netlifyFunctionsDev() {
  return {
    name: 'netlify-functions-dev',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', process.cwd(), ''));
      const dir = path.resolve('netlify/functions');

      async function loadRoutes() {
        const routes = [];
        for (const file of fs.readdirSync(dir).filter((f) => /\.(mjs|js|ts)$/.test(f))) {
          const mod = await server.ssrLoadModule(`/netlify/functions/${file}`);
          const p = mod.config?.path;
          if (!p) continue;
          const keys = [];
          const re = new RegExp('^' + p.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$');
          routes.push({ re, keys, handler: mod.default });
        }
        return routes;
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();
        try {
          const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const routes = await loadRoutes();
          for (const r of routes) {
            const m = url.pathname.match(r.re);
            if (!m) continue;
            const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
            const response = await r.handler(new Request(url, { method: req.method }), { params });
            res.statusCode = response.status;
            response.headers.forEach((v, k) => res.setHeader(k, v));
            res.end(await response.text());
            return;
          }
          res.statusCode = 404;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: `API topilmadi: ${url.pathname}` }));
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), netlifyFunctionsDev()],
});
