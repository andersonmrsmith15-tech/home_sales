# UyAI — Toshkent ko'chmas mulk platformasi

Toshkent shahridagi **ko'p qavatli uylar (kvartiralar)**, **hovlilar** va **eski uylar** e'lonlarini olx.uz dan yig'ib,
Postgres bazasida saqlaydigan va Dashboard orqali tahlil qiladigan fullstack web ilova.

**Stack:** React 18 + Vite · Recharts · Netlify Functions (API) · Neon Postgres (Netlify DB)

## Tuzilma

```
├── src/                     # Frontend (React)
│   ├── pages/Dashboard.jsx  # Asosiy oyna — KPI, grafiklar, so'nggi e'lonlar
│   ├── pages/Listings.jsx   # E'lonlar ro'yxati + filtrlar
│   └── pages/ListingDetail.jsx  # E'lon sahifasi + AI narx bahosi
├── netlify/functions/       # Backend API (serverless)
│   ├── stats.mjs            # GET /api/stats
│   ├── listings.mjs         # GET /api/listings?type=&district=&rooms=&minPrice=&maxPrice=&q=&sort=&page=
│   ├── listing.mjs          # GET /api/listings/:id
│   ├── meta.mjs             # GET /api/meta
│   └── scrape-scheduled.mjs # Har kuni 02:00 UTC da OLX dan yangilash
├── lib/                     # Umumiy kod: DB ulanish, sxema, OLX scraper
└── scripts/                 # db:setup, db:seed, scrape
```

## Ishga tushirish

```bash
npm install
npm install -g netlify-cli

# 1. Baza: Neon.tech da bepul loyiha oching yoki Netlify DB ishlating
cp .env.example .env         # DATABASE_URL ni kiriting

# 2. Jadvallarni yaratish
npm run db:setup

# 3a. olx.uz dan real e'lonlarni yuklash
npm run scrape

# 3b. (ixtiyoriy) demo ma'lumotlar — interfeysda "Demo" belgisi bilan ko'rinadi
npm run db:seed              # o'chirish: npm run db:clear-demo

# 4. Lokal ishga tushirish (frontend + functions)
npm run dev                  # http://localhost:8888
```

## Netlify'ga deploy

1. Loyihani GitHub'ga yuklang va Netlify'da **Add new site → Import from Git** ni tanlang
   (yoki terminaldan: `netlify init` / `netlify deploy --prod`).
2. Build sozlamalari `netlify.toml` da tayyor: `npm run build`, publish `dist`.
3. **Site settings → Environment variables** ga `DATABASE_URL` qo'shing
   (Netlify DB ishlatsangiz `NETLIFY_DATABASE_URL` avtomatik qo'shiladi — kod ikkalasini ham qo'llaydi).
4. Deploydan keyin bir marta lokal kompyuterdan `npm run db:setup` va `npm run scrape` ni bajaring.
   Keyin `scrape-scheduled` funksiyasi bazani har kuni yangilab turadi.

## Vercel'ga deploy

`api/` papkasi va `vercel.json` Vercel uchun tayyor (`netlify/functions` dagi kod qayta ishlatiladi).

1. Vercel → Project → **Settings → Environment Variables** ga `DATABASE_URL` qo'shing
   (Production, Preview, Development uchun belgilang).
2. **Deployments → ⋯ → Redeploy** — o'zgaruvchi faqat yangi deploydan keyin ishlaydi.
3. `vercel.json` dagi cron har kuni 02:00 UTC da `/api/cron-scrape` ni chaqiradi.
   Himoya uchun ixtiyoriy `CRON_SECRET` o'zgaruvchisini qo'shing.

## E'lonlarni CSV fayldan yuklash (asosiy usul)

```bash
npm run import -- data/elonlar.csv --dry-run            # avval tekshirish
npm run import -- data/elonlar.csv --source=agentlik1   # bazaga yozish
```

Namuna: [data/elonlar-namuna.csv](data/elonlar-namuna.csv). Excel'da to'ldirib **CSV (UTF-8)** formatida saqlang.
Ajratgich `,` yoki `;` bo'lishi mumkin, ustun nomlari o'zbekcha, ruscha yoki inglizcha bo'lishi mumkin.

| Ustun | Majburiy | Izoh |
|---|---|---|
| `tur` | ✓ | `kvartira`, `hovli`, `eski uy` |
| `narx` | ✓ | `78500`, `85 000`, `1.650.000.000` |
| `valyuta` | | `USD` (standart) yoki `UZS` — UZS `USD_UZS_RATE` bo'yicha o'giriladi |
| `kod` | | Manbadagi e'lon ID si. Bo'lsa, qayta yuklaganda e'lon yangilanadi |
| `sarlavha`, `tavsif` | | Sarlavha bo'lmasa avtomatik tuziladi |
| `xonalar`, `maydon`, `sotix`, `qavat`, `qavatlar` | | Sonlar, `4,5` ham bo'ladi |
| `tuman`, `manzil` | | Ruscha nomlar ham o'zbekchaga o'giriladi |
| `rasmlar` | | URL'lar, `\|` bilan ajratilgan |
| `havola`, `sana`, `manba` | | Sana: `2026-11-15` yoki `15.11.2026` |

Xato qatorlar o'tkazib yuboriladi va qator raqami bilan ko'rsatiladi. Bir faylni qayta yuklasangiz, dublikat yaratilmaydi.

## OLX scraper haqida

> ⚠ olx.uz avtomatik so'rovlarni 403 bilan rad etadi, shuning uchun kunlik avtomatik yangilash o'chirilgan.
> Kod (`npm run scrape`) faqat OLX ruxsat bergan holat uchun saqlab qo'yilgan.


- Manbalar: `olx.uz/nedvizhimost/kvartiry/prodazha/tashkent/` va `olx.uz/nedvizhimost/doma/prodazha/tashkent/`.
- E'lonlar sahifadagi `window.__PRERENDERED_STATE__` JSON'idan o'qiladi.
- Uylar matni va qurilgan yili bo'yicha **hovli** yoki **eski uy** ga ajratiladi (`lib/olx.mjs` → `OLD_RE`).
- UZS narxlar `USD_UZS_RATE` kursi bo'yicha dollarga o'giriladi.
- So'rovlar orasida pauza bor (`SCRAPE_DELAY_MS`). olx.uz foydalanish shartlariga rioya qiling;
  sayt tuzilmasi o'zgarsa, `extractAds` / `normalizeAd` ni yangilash kerak bo'ladi.
