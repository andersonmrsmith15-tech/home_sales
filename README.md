# UyBor Toshkent

Toshkentda uy-joy (kvartira, hovli, dupleks, yangi qurilish) sotib olish va sotish platformasi.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · PostgreSQL (Neon) + Prisma · Leaflet + OpenStreetMap

## Ishga tushirish

```bash
npm install
cp .env.example .env        # DATABASE_URL va DIRECT_URL
npm run db:migrate          # sxemani bazaga qo'llash
npm run db:seed             # 40 ta demo e'lon (bazani tozalaydi!)
npm run dev                 # http://localhost:3000
```

`npm run db:studio` — bazani brauzerda ko'rish (Prisma Studio).

## Loyiha tuzilmasi

```
prisma/
  schema.prisma          # ma'lumotlar modeli
  migrations/            # SQL migratsiyalar
  seed.ts, seed-data.ts  # tumanlar, metro, obyektlar, demo e'lonlar
src/
  app/
    [locale]/            # uz (asosiy), ru, en
      page.tsx           # bosh sahifa                         — 2-bosqich
      search/            # qidiruv: filtrlar + ro'yxat / xarita — 2-bosqich
      listing/[slug]/    # e'lon sahifasi                       — 2-bosqich
      compare/           # solishtirish (3 tagacha)             — 2-bosqich
      mortgage/          # ipoteka kalkulyatori                 — 2-bosqich
      login/             # telefon + SMS kod                    — 3-bosqich
      post/              # e'lon joylash (4 qadam)              — 3-bosqich
      cabinet/           # e'lonlarim, sevimlilar, qidiruvlar, xabarlar — 3-bosqich
      agent/[id]/        # agent profili va reytingi            — 3-bosqich
      admin/             # moderatsiya, shikoyatlar, statistika — 4-bosqich
    api/                 # auth, upload, payments (Click/Payme), cron, rates
  components/            # ui/ (shadcn), listing/, search/, map/
  lib/
    prisma.ts            # Prisma klienti
    format.ts            # narx, telefon (+998), slug formatlash
    geo.ts               # masofa, eng yaqin obyekt
  server/                # ma'lumot so'rovlari va server actions
  i18n/                  # uz.json, ru.json, en.json
```

## Ma'lumotlar modeli

| Model | Vazifasi |
|---|---|
| `User` | Xaridor, sotuvchi, agent, admin. Telefon — asosiy identifikator. Agent uchun agentlik, reyting |
| `OtpCode`, `Session` | SMS kod bilan kirish (kod hash ko'rinishida), sessiyalar |
| `District` | 12 tuman (uz/ru/en nomlar), markaz koordinatasi, o'rtacha m² narxi |
| `Poi` | Metro, maktab, bog'cha, bozor, bog', savdo markazi — "yaqin atrofda" va metro filtri uchun |
| `Listing` | E'lon: tur, holat, narx (asl valyuta + USD), xususiyatlar, manzil, metro masofasi, TOP/premium, statistika, moderatsiya |
| `ListingImage` | Rasmlar (WebP, S3), tartib, blur placeholder |
| `ListingStatDaily` | Sotuvchi uchun kunlik ko'rishlar, telefon ko'rishlar, xabarlar |
| `Favorite`, `CompareItem` | Sevimlilar, solishtirish ro'yxati |
| `SavedSearch` | Saqlangan filtrlar (JSON) + Telegram/SMS xabarnoma |
| `Conversation`, `Message` | Xaridor ↔ sotuvchi ichki chati (e'lon bo'yicha) |
| `Payment` | Click / Payme orqali TOP, premium, ko'tarish to'lovlari |
| `Report` | "Shikoyat qilish" — admin moderatsiyasi uchun |
| `AgentReview` | Agent reytingi (1–5) |
| `ExchangeRate` | cbu.uz dan olingan USD→UZS kursi keshi |

Narx ikki xil saqlanadi: `price` + `currency` — sotuvchi kiritgan asl qiymat; `priceUsd` — filtr va saralash uchun.
`pricePerM2` avtomatik hisoblanadi va `District.avgPriceM2` bilan solishtiriladi.

## Demo ma'lumotlar

- 40 e'lon: har tumanda 3–4 ta, haqiqiy ko'cha va mahalla nomlari, real narx oralig'i, rasm o'rniga placeholder.
- 37 tasi faol, 2 tasi moderatsiyada, 1 tasi sotilgan; 4 tasi TOP.
- Demo telefonlar: `+998 90 000 xx xx` (admin: `+998 90 000 00 01`, agentlar: `…01 01–01 03`, egalari: `…02 01–02 05`, xaridorlar: `…03 01–03 02`).
- Maktab va bog'chalarning raqami va joylashuvi demo uchun to'qilgan, metro bekatlari va bozorlar haqiqiy (taxminiy koordinatalar).
