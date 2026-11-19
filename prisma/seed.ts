/**
 * Demo ma'lumotlar: 12 tuman, metro va obyektlar, 11 foydalanuvchi, 40 e'lon.
 * DIQQAT: ishga tushirilganda uybor bazasidagi barcha jadvallar tozalanadi.
 *
 *   npx prisma db seed
 */
import { PrismaClient, PropertyType, Condition, ListingStatus, Role, Currency, PoiType } from '@prisma/client';
import { DISTRICTS, METRO, OTHER_POIS, STREETS, DEVELOPERS, type DistrictSlug } from './seed-data';
import { nearest } from '../src/lib/geo';
import { slugify } from '../src/lib/format';

const prisma = new PrismaClient();
const USD_UZS = 12_750; // boshlang'ich kurs; ilova ishlaganda cbu.uz dan yangilanadi

// Deterministik tasodifiy sonlar — har safar bir xil natija
let seedState = 20261119;
const rnd = () => ((seedState = (seedState * 1664525 + 1013904223) % 4294967296) / 4294967296);
const between = (a: number, b: number) => a + rnd() * (b - a);
const int = (a: number, b: number) => Math.floor(between(a, b + 1));
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
const roundTo = (n: number, step: number) => Math.round(n / step) * step;
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);

const { APARTMENT, HOUSE, DUPLEX, NEW_BUILD } = PropertyType;
const PLAN: Record<DistrictSlug, PropertyType[]> = {
  bektemir: [HOUSE, HOUSE, APARTMENT],
  chilonzor: [APARTMENT, APARTMENT, NEW_BUILD, HOUSE],
  mirobod: [NEW_BUILD, APARTMENT, DUPLEX, APARTMENT],
  'mirzo-ulugbek': [APARTMENT, NEW_BUILD, HOUSE, APARTMENT],
  olmazor: [APARTMENT, HOUSE, NEW_BUILD],
  sergeli: [NEW_BUILD, APARTMENT, HOUSE],
  shayxontohur: [HOUSE, APARTMENT, NEW_BUILD],
  uchtepa: [APARTMENT, HOUSE, APARTMENT],
  yakkasaroy: [NEW_BUILD, DUPLEX, APARTMENT, HOUSE],
  yangihayot: [HOUSE, NEW_BUILD, HOUSE],
  yashnobod: [APARTMENT, HOUSE, NEW_BUILD],
  yunusobod: [APARTMENT, NEW_BUILD, DUPLEX],
};

const CONDITION_K: Record<Condition, number> = { EURO: 1.12, RENOVATED: 1, NO_RENOVATION: 0.9, SHELL: 0.85 };
const CONDITION_UZ: Record<Condition, string> = {
  EURO: 'Evroremont qilingan', RENOVATED: "Ta'mirli, yashashga tayyor", NO_RENOVATION: "Ta'mir talab", SHELL: 'Qora suvoq (korobka)',
};

// Demo telefonlar ataylab +998 90 000 xx xx oralig'ida
const USERS = [
  { phone: '+998900000001', name: 'Admin UyBor', role: Role.ADMIN },
  { phone: '+998900000101', name: 'Dilshod Karimov', role: Role.AGENT, agencyName: 'Toshkent Realty', telegramUser: 'toshkent_realty', bio: "12 yillik tajriba. Chilonzor va Yunusobod bo'yicha mutaxassis." },
  { phone: '+998900000102', name: 'Malika Yusupova', role: Role.AGENT, agencyName: 'Uy Invest', telegramUser: 'uyinvest_uz', bio: 'Yangi qurilishlar va ipoteka bo\'yicha maslahat.' },
  { phone: '+998900000103', name: 'Sardor Rahimov', role: Role.AGENT, agencyName: 'Capital Estate', telegramUser: 'capital_estate', bio: 'Mirobod, Yakkasaroy — premium segment.' },
  { phone: '+998900000201', name: 'Aziz Toshmatov', role: Role.OWNER },
  { phone: '+998900000202', name: 'Nodira Saidova', role: Role.OWNER },
  { phone: '+998900000203', name: 'Bekzod Ergashev', role: Role.OWNER, telegramUser: 'bekzod_e' },
  { phone: '+998900000204', name: 'Gulnora Xasanova', role: Role.OWNER },
  { phone: '+998900000205', name: 'Jasur Abdullayev', role: Role.OWNER },
  { phone: '+998900000301', name: 'Kamola Nazarova', role: Role.BUYER },
  { phone: '+998900000302', name: 'Otabek Qodirov', role: Role.BUYER },
];

async function reset() {
  const tables = ['Message', 'Conversation', 'Favorite', 'CompareItem', 'SavedSearch', 'Payment', 'Report', 'AgentReview',
    'ListingStatDaily', 'ListingImage', 'Listing', 'Poi', 'District', 'Session', 'OtpCode', 'User', 'ExchangeRate'];
  await prisma.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`);
}

async function main() {
  await reset();

  // Tumanlar
  const districts = new Map<DistrictSlug, { id: number; nameUz: string; lat: number; lng: number; ppm2: number }>();
  for (const d of DISTRICTS) {
    const { ppm2, ...data } = d;
    const row = await prisma.district.create({ data });
    districts.set(d.slug, { id: row.id, nameUz: row.nameUz, lat: row.lat, lng: row.lng, ppm2 });
  }
  const districtList = [...districts.values()];
  const districtOf = (lat: number, lng: number) => nearest(lat, lng, districtList)!.point.id;

  // Metro va boshqa obyektlar
  await prisma.poi.createMany({
    data: METRO.map(([nameUz, nameRu, nameEn, line, lat, lng]) => ({
      type: PoiType.METRO, nameUz, nameRu, nameEn, line, lat, lng, districtId: districtOf(lat, lng),
    })),
  });
  await prisma.poi.createMany({
    data: OTHER_POIS.map(([type, nameUz, nameRu, nameEn, lat, lng]) => ({
      type: type as PoiType, nameUz, nameRu, nameEn, lat, lng, districtId: districtOf(lat, lng),
    })),
  });
  // Maktab va bog'chalar: har tumanga 2 tadan (raqamlar va joylashuv demo uchun)
  let schoolNo = 17;
  for (const d of districtList) {
    for (let k = 0; k < 2; k++) {
      schoolNo += int(3, 19);
      const sLat = d.lat + between(-0.012, 0.012), sLng = d.lng + between(-0.012, 0.012);
      await prisma.poi.create({ data: { type: PoiType.SCHOOL, nameUz: `${schoolNo}-maktab`, nameRu: `Школа №${schoolNo}`, nameEn: `School No. ${schoolNo}`, lat: sLat, lng: sLng, districtId: d.id } });
      const kNo = schoolNo + 300;
      await prisma.poi.create({ data: { type: PoiType.KINDERGARTEN, nameUz: `${kNo}-bog'cha`, nameRu: `Детский сад №${kNo}`, nameEn: `Kindergarten No. ${kNo}`, lat: d.lat + between(-0.012, 0.012), lng: d.lng + between(-0.012, 0.012), districtId: d.id } });
    }
  }
  const metros = await prisma.poi.findMany({ where: { type: PoiType.METRO } });

  // Foydalanuvchilar
  const users: Record<string, string> = {};
  for (const u of USERS) {
    const row = await prisma.user.create({ data: { ...u, isVerified: u.role === Role.AGENT } });
    users[u.phone] = row.id;
  }
  const agents = USERS.filter((u) => u.role === Role.AGENT);
  const owners = USERS.filter((u) => u.role === Role.OWNER);

  // E'lonlar
  let n = 0;
  const created: { id: string; type: PropertyType; ownerPhone: string; status: ListingStatus }[] = [];
  for (const [slug, types] of Object.entries(PLAN) as [DistrictSlug, PropertyType[]][]) {
    const d = districts.get(slug)!;
    const { streets, mahallas } = STREETS[slug];
    for (const type of types) {
      n++;
      const lat = d.lat + between(-0.012, 0.012);
      const lng = d.lng + between(-0.012, 0.012);
      const metro = nearest(lat, lng, metros)!;
      const mahalla = pick(mahallas);
      const street = pick(streets);
      const seller = rnd() < 0.55 ? pick(agents) : pick(owners);

      let rooms: number, area: number, floor: number | null = null, totalFloors: number | null = null;
      let landArea: number | null = null, yearBuilt: number, condition: Condition;
      let developer: string | null = null, completionQ: string | null = null;
      let priceUsd: number;
      let title: string;

      if (type === APARTMENT) {
        rooms = int(1, 4);
        area = roundTo(28 + rooms * between(15, 21), 1);
        totalFloors = pick([4, 5, 9, 9, 12]);
        floor = int(1, totalFloors);
        yearBuilt = int(1972, 2016);
        condition = pick([Condition.RENOVATED, Condition.EURO, Condition.RENOVATED, Condition.NO_RENOVATION]);
        priceUsd = area * d.ppm2 * CONDITION_K[condition] * between(0.92, 1.08);
        title = `${rooms} xonali kvartira, ${area} m², ${mahalla}`;
      } else if (type === NEW_BUILD) {
        rooms = int(1, 4);
        area = roundTo(35 + rooms * between(17, 24), 1);
        totalFloors = pick([9, 12, 14, 16]);
        floor = int(2, totalFloors);
        yearBuilt = pick([2025, 2026, 2027]);
        condition = pick([Condition.SHELL, Condition.SHELL, Condition.EURO]);
        developer = pick(DEVELOPERS);
        if (yearBuilt > 2026) completionQ = `${yearBuilt}-Q${int(1, 4)}`;
        priceUsd = area * d.ppm2 * 1.08 * CONDITION_K[condition] * between(0.95, 1.07);
        title = `Yangi qurilish: ${rooms} xonali, ${area} m² — ${developer}`;
      } else if (type === DUPLEX) {
        rooms = int(4, 6);
        area = roundTo(between(150, 260), 1);
        totalFloors = pick([9, 12, 16]);
        floor = totalFloors - 1;
        yearBuilt = int(2016, 2025);
        condition = Condition.EURO;
        priceUsd = area * d.ppm2 * 1.15 * CONDITION_K[condition] * between(0.95, 1.05);
        title = `Dupleks ${rooms} xona, ${area} m², ${d.nameUz}`;
      } else {
        rooms = int(4, 8);
        area = roundTo(between(120, 340), 1);
        landArea = Math.round(between(3, 10) * 10) / 10;
        totalFloors = pick([1, 2, 2]);
        yearBuilt = int(1965, 2020);
        condition = pick([Condition.RENOVATED, Condition.NO_RENOVATION, Condition.EURO]);
        priceUsd = (area * d.ppm2 * 0.65 + landArea * d.ppm2 * 6) * CONDITION_K[condition] * between(0.92, 1.08);
        title = `Hovli ${landArea} sotix, ${rooms} xona, ${mahalla}`;
      }
      priceUsd = roundTo(priceUsd, 500);
      const currency = n % 4 === 0 ? Currency.UZS : Currency.USD;
      const price = currency === Currency.UZS ? roundTo(priceUsd * USD_UZS, 1_000_000) : priceUsd;
      if (currency === Currency.UZS) priceUsd = Math.round(price / USD_UZS);

      const status: ListingStatus = n === 8 || n === 23 ? ListingStatus.PENDING : n === 16 ? ListingStatus.SOLD : ListingStatus.ACTIVE;
      const published = status === ListingStatus.PENDING ? null : daysAgo(between(0.2, 45));
      const isTop = [3, 10, 19, 31].includes(n);
      const isPremium = [10, 31].includes(n);
      const metroText = metro.distance < 1500 ? `"${metro.point.nameUz}" metrosiga ${Math.round(metro.distance / 50) * 50} m. ` : '';
      const description = [
        `${d.nameUz} tumani, ${mahalla} mahallasi, ${street}.`,
        type === HOUSE ? `${landArea} sotix yer, ${area} m² uy, ${rooms} xona, ${totalFloors} qavatli.` : `${area} m², ${rooms} xona, ${floor}/${totalFloors} qavat.`,
        `${CONDITION_UZ[condition]}.`,
        developer ? `Quruvchi: ${developer}.${completionQ ? ` Topshirish: ${completionQ}.` : ''}` : '',
        metroText + pick(['Maktab va bog\'cha yaqin.', 'Atrofda bozor va do\'konlar bor.', 'Tinch hovli, bolalar maydonchasi.', 'Transport qulay.']),
        type === HOUSE ? pick(['Gaz, suv, svet, kanalizatsiya bor.', "Garaj va mevali bog' bor.", 'Hujjatlari tayyor.']) : pick(['Hujjatlari tayyor.', 'Mebel bilan sotiladi.', 'Lift ishlaydi.', 'Ikki tomonga qaragan.']),
      ].filter(Boolean).join(' ');

      const daily = status === ListingStatus.ACTIVE
        ? Array.from({ length: 14 }, (_, k) => ({ date: new Date(new Date(daysAgo(k)).toISOString().slice(0, 10)), views: int(3, isTop ? 60 : 30), phoneViews: int(0, 4), favorites: int(0, 2), messages: int(0, 1) }))
        : [];
      const viewSum = daily.reduce((s, x) => s + x.views, 0);

      const row = await prisma.listing.create({
        data: {
          slug: `${slugify(title)}-${n.toString(36)}${int(100, 999)}`,
          ownerId: users[seller.phone],
          districtId: d.id,
          type, status, title, description,
          price, currency, priceUsd, pricePerM2: Math.round(priceUsd / area),
          negotiable: rnd() < 0.4,
          rooms, area, landArea, floor, totalFloors, yearBuilt, condition,
          livingArea: type === HOUSE ? null : Math.round(area * 0.62),
          kitchenArea: type === HOUSE ? null : roundTo(between(7, 16), 1),
          hasCadastre: type !== NEW_BUILD || yearBuilt <= 2026,
          mortgageOk: type === NEW_BUILD || rnd() < 0.45,
          furnished: condition === Condition.EURO && rnd() < 0.5,
          hasBalcony: type !== HOUSE && rnd() < 0.7,
          hasParking: type !== APARTMENT || rnd() < 0.3,
          developer, completionQ,
          address: `${street}, ${int(1, 120)}-uy`,
          mahalla, landmark: metro.distance < 2000 ? `${metro.point.nameUz} metrosi` : null,
          lat, lng, nearestMetroId: metro.point.id, metroDistanceM: metro.distance,
          contactName: seller.name, contactPhone: seller.phone, telegramUser: seller.telegramUser ?? null,
          isTop, topUntil: isTop ? daysAgo(-7) : null, isPremium, premiumUntil: isPremium ? daysAgo(-7) : null,
          bumpedAt: isTop ? daysAgo(between(0, 1)) : null,
          viewCount: viewSum + int(10, 300), phoneViewCount: int(2, 40),
          publishedAt: published, createdAt: published ?? daysAgo(1),
          dailyStats: { create: daily },
        },
      });
      created.push({ id: row.id, type, ownerPhone: seller.phone, status });
    }
  }

  // Xaridor faoliyati: sevimlilar, saqlangan qidiruv, chat, shikoyat
  const active = created.filter((c) => c.status === ListingStatus.ACTIVE);
  const kamola = users['+998900000301'];
  const otabek = users['+998900000302'];
  for (const c of [active[1], active[4], active[9], active[20]]) await prisma.favorite.create({ data: { userId: kamola, listingId: c.id } });
  for (const c of [active[4], active[12]]) await prisma.favorite.create({ data: { userId: otabek, listingId: c.id } });
  for (const c of [...new Set([active[1], active[4], active[9], active[20], active[12]])]) {
    await prisma.listing.update({ where: { id: c.id }, data: { favoriteCount: await prisma.favorite.count({ where: { listingId: c.id } }) } });
  }
  await prisma.savedSearch.create({
    data: { userId: kamola, name: 'Chilonzor, 2-3 xona, 80 000 $ gacha', notifyChannel: 'TELEGRAM',
      filters: { districts: ['chilonzor'], types: ['APARTMENT', 'NEW_BUILD'], rooms: [2, 3], priceMax: 80000, currency: 'USD' } },
  });
  await prisma.savedSearch.create({
    data: { userId: otabek, name: 'Hovli, 5 sotixdan katta', notifyChannel: 'SMS', filters: { types: ['HOUSE'], landMin: 5 } },
  });

  const chatListing = active[4];
  const conv = await prisma.conversation.create({
    data: { listingId: chatListing.id, buyerId: kamola, sellerId: users[chatListing.ownerPhone], lastMessageAt: daysAgo(0.1) },
  });
  const msgs: [string, string, number][] = [
    [kamola, "Assalomu alaykum! E'lon hali dolzarbmi?", 0.3],
    [users[chatListing.ownerPhone], 'Vaalaykum assalom, ha, dolzarb. Qachon ko\'rishga kelasiz?', 0.25],
    [kamola, 'Ertaga soat 18:00 da qulaymi? Narxda kelishsa bo\'ladimi?', 0.1],
  ];
  for (const [senderId, body, ago] of msgs) {
    await prisma.message.create({ data: { conversationId: conv.id, senderId, body, createdAt: daysAgo(ago), readAt: ago > 0.2 ? daysAgo(ago - 0.01) : null } });
  }

  await prisma.report.create({ data: { listingId: active[15].id, reporterId: otabek, reason: 'WRONG_PRICE', comment: "Narx bozordan juda past, shubhali ko'rinadi" } });
  await prisma.report.create({ data: { listingId: active[22].id, reason: 'ALREADY_SOLD', comment: "Qo'ng'iroq qildim, sotilgan ekan" } });

  // To'lov: TOP e'lonlardan biri uchun
  const top = await prisma.listing.findFirst({ where: { isTop: true }, select: { id: true, ownerId: true } });
  if (top) {
    await prisma.payment.create({
      data: { userId: top.ownerId, listingId: top.id, provider: 'CLICK', promotion: 'TOP', days: 7, amountUzs: 49_000,
        status: 'PAID', providerTxnId: 'demo-click-0001', paidAt: daysAgo(1) },
    });
  }

  // Agent reytinglari
  const reviews: [string, string, number, string][] = [
    ['+998900000101', '+998900000301', 5, 'Juda tez va halol ishladi, rahmat!'],
    ['+998900000101', '+998900000302', 4, 'Yaxshi variantlar taklif qildi.'],
    ['+998900000102', '+998900000301', 5, "Ipoteka bo'yicha hammasini tushuntirib berdi."],
    ['+998900000103', '+998900000302', 4, 'Professional yondashuv.'],
  ];
  for (const [agent, author, rating, comment] of reviews) {
    await prisma.agentReview.create({ data: { agentId: users[agent], authorId: users[author], rating, comment } });
  }
  for (const a of agents) {
    const agg = await prisma.agentReview.aggregate({ where: { agentId: users[a.phone] }, _avg: { rating: true }, _count: true });
    await prisma.user.update({ where: { id: users[a.phone] }, data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count } });
  }

  // Tuman statistikasi (faol e'lonlar bo'yicha)
  for (const d of districtList) {
    const agg = await prisma.listing.aggregate({ where: { districtId: d.id, status: 'ACTIVE' }, _avg: { pricePerM2: true }, _count: true });
    await prisma.district.update({ where: { id: d.id }, data: { avgPriceM2: agg._avg.pricePerM2 ? Number(agg._avg.pricePerM2) : null, listingCount: agg._count } });
  }

  await prisma.exchangeRate.create({ data: { currency: 'USD', rate: USD_UZS, date: new Date(new Date().toISOString().slice(0, 10)) } });

  const counts = await Promise.all([
    prisma.district.count(), prisma.poi.count(), prisma.user.count(), prisma.listing.count(),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
  ]);
  console.log(`✓ Seed tayyor: ${counts[0]} tuman, ${counts[1]} obyekt, ${counts[2]} foydalanuvchi, ${counts[3]} e'lon (${counts[4]} faol)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
