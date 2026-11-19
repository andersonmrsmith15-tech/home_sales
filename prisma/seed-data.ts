// Boshlang'ich ma'lumotlar. Koordinatalar taxminiy (demo uchun yetarli aniqlikda).

export const DISTRICTS = [
  { slug: 'bektemir', nameUz: 'Bektemir', nameRu: 'Бектемир', nameEn: 'Bektemir', lat: 41.209, lng: 69.334, ppm2: 800 },
  { slug: 'chilonzor', nameUz: 'Chilonzor', nameRu: 'Чиланзар', nameEn: 'Chilanzar', lat: 41.2756, lng: 69.2034, ppm2: 1150 },
  { slug: 'mirobod', nameUz: 'Mirobod', nameRu: 'Мирабад', nameEn: 'Mirabad', lat: 41.293, lng: 69.283, ppm2: 1700 },
  { slug: 'mirzo-ulugbek', nameUz: "Mirzo Ulug'bek", nameRu: 'Мирзо-Улугбек', nameEn: 'Mirzo Ulugbek', lat: 41.338, lng: 69.335, ppm2: 1350 },
  { slug: 'olmazor', nameUz: 'Olmazor', nameRu: 'Алмазар', nameEn: 'Olmazor', lat: 41.348, lng: 69.21, ppm2: 1050 },
  { slug: 'sergeli', nameUz: 'Sergeli', nameRu: 'Сергели', nameEn: 'Sergeli', lat: 41.227, lng: 69.219, ppm2: 850 },
  { slug: 'shayxontohur', nameUz: 'Shayxontohur', nameRu: 'Шайхантахур', nameEn: 'Shaykhantakhur', lat: 41.326, lng: 69.24, ppm2: 1300 },
  { slug: 'uchtepa', nameUz: 'Uchtepa', nameRu: 'Учтепа', nameEn: 'Uchtepa', lat: 41.29, lng: 69.17, ppm2: 950 },
  { slug: 'yakkasaroy', nameUz: 'Yakkasaroy', nameRu: 'Яккасарай', nameEn: 'Yakkasaray', lat: 41.286, lng: 69.256, ppm2: 1650 },
  { slug: 'yangihayot', nameUz: 'Yangihayot', nameRu: 'Янгихаёт', nameEn: 'Yangihayot', lat: 41.203, lng: 69.212, ppm2: 750 },
  { slug: 'yashnobod', nameUz: 'Yashnobod', nameRu: 'Яшнабад', nameEn: 'Yashnobod', lat: 41.3, lng: 69.34, ppm2: 1050 },
  { slug: 'yunusobod', nameUz: 'Yunusobod', nameRu: 'Юнусабад', nameEn: 'Yunusabad', lat: 41.364, lng: 69.287, ppm2: 1300 },
] as const;

export type DistrictSlug = (typeof DISTRICTS)[number]['slug'];

// Metro bekatlari: [uz, ru, en, liniya, lat, lng]
export const METRO: [string, string, string, string, number, number][] = [
  // Chilonzor liniyasi
  ['Olmazor', 'Алмазар', 'Olmazor', 'Chilonzor', 41.2667, 69.196],
  ['Chilonzor', 'Чиланзар', 'Chilanzar', 'Chilonzor', 41.2753, 69.2047],
  ["Mirzo Ulug'bek", 'Мирзо Улугбек', 'Mirzo Ulugbek', 'Chilonzor', 41.2836, 69.2143],
  ['Novza', 'Новза', 'Novza', 'Chilonzor', 41.2925, 69.2241],
  ['Milliy bog\'', 'Миллий бог', 'Milliy Bog', 'Chilonzor', 41.3009, 69.2365],
  ['Bunyodkor', 'Бунёдкор', 'Bunyodkor', 'Chilonzor', 41.3108, 69.2484],
  ['Paxtakor', 'Пахтакор', 'Paxtakor', 'Chilonzor', 41.3089, 69.2638],
  ['Mustaqillik maydoni', 'Мустакиллик майдони', 'Mustaqillik Square', 'Chilonzor', 41.3054, 69.2711],
  ['Amir Temur xiyoboni', 'Амир Темур хиёбони', 'Amir Temur Square', 'Chilonzor', 41.3111, 69.2797],
  ['Hamid Olimjon', 'Хамид Олимжон', 'Hamid Olimjon', 'Chilonzor', 41.3157, 69.295],
  ['Pushkin', 'Пушкин', 'Pushkin', 'Chilonzor', 41.3197, 69.301],
  ["Buyuk Ipak Yo'li", 'Буюк Ипак Йули', 'Buyuk Ipak Yoli', 'Chilonzor', 41.3264, 69.3346],
  // O'zbekiston liniyasi
  ['Beruniy', 'Беруний', 'Beruniy', "O'zbekiston", 41.3446, 69.2056],
  ['Tinchlik', 'Тинчлик', 'Tinchlik', "O'zbekiston", 41.3366, 69.216],
  ['Chorsu', 'Чорсу', 'Chorsu', "O'zbekiston", 41.3264, 69.2349],
  ["G'afur G'ulom", 'Гафур Гулом', 'Gafur Gulom', "O'zbekiston", 41.3218, 69.2482],
  ['Alisher Navoiy', 'Алишер Навоий', 'Alisher Navoiy', "O'zbekiston", 41.315, 69.258],
  ['Kosmonavtlar', 'Космонавтлар', 'Kosmonavtlar', "O'zbekiston", 41.3007, 69.2815],
  ['Oybek', 'Ойбек', 'Oybek', "O'zbekiston", 41.2967, 69.2738],
  ['Toshkent', 'Ташкент', 'Tashkent', "O'zbekiston", 41.2925, 69.2885],
  ['Mashinasozlar', 'Машинасозлар', 'Mashinasozlar', "O'zbekiston", 41.2938, 69.3138],
  ["Do'stlik", 'Дустлик', 'Dostlik', "O'zbekiston", 41.29, 69.326],
  // Yunusobod liniyasi
  ['Turkiston', 'Туркистон', 'Turkiston', 'Yunusobod', 41.3667, 69.2898],
  ['Yunusobod', 'Юнусабад', 'Yunusobod', 'Yunusobod', 41.3568, 69.2877],
  ['Shahriston', 'Шахристон', 'Shahriston', 'Yunusobod', 41.3462, 69.2865],
  ['Bodomzor', 'Бодомзор', 'Bodomzor', 'Yunusobod', 41.3378, 69.2849],
  ['Minor', 'Минор', 'Minor', 'Yunusobod', 41.3253, 69.2828],
  ['Abdulla Qodiriy', 'Абдулла Кодирий', 'Abdulla Qodiriy', 'Yunusobod', 41.319, 69.281],
  ['Ming O\'rik', 'Минг Урик', 'Ming Orik', 'Yunusobod', 41.2998, 69.2791],
  // Halqa (yer usti) liniyasi — janubiy qism
  ['Qo\'yliq', 'Куйлюк', 'Qoyliq', 'Halqa', 41.2383, 69.3345],
  ['Sergeli', 'Сергели', 'Sergeli', 'Halqa', 41.2236, 69.2196],
  ['Choshtepa', 'Чоштепа', 'Choshtepa', 'Halqa', 41.2185, 69.1975],
  ['Quruvchilar', 'Курувчилар', 'Quruvchilar', 'Halqa', 41.2322, 69.2621],
];

// Boshqa obyektlar: [tur, uz, ru, en, lat, lng]
export const OTHER_POIS: [string, string, string, string, number, number][] = [
  ['BAZAAR', 'Chorsu bozori', 'Базар Чорсу', 'Chorsu Bazaar', 41.3266, 69.2365],
  ['BAZAAR', 'Farhod bozori', 'Фархадский базар', 'Farhod Bazaar', 41.284, 69.2012],
  ['BAZAAR', 'Yunusobod bozori', 'Юнусабадский базар', 'Yunusobod Bazaar', 41.3604, 69.2899],
  ['BAZAAR', "Qo'yliq bozori", 'Куйлюкский базар', 'Qoyliq Bazaar', 41.238, 69.333],
  ['BAZAAR', 'Mirobod bozori', 'Мирабадский базар', 'Mirobod Bazaar', 41.2958, 69.2876],
  ['BAZAAR', 'Oloy bozori', 'Алайский базар', 'Oloy Bazaar', 41.317, 69.283],
  ['BAZAAR', 'Parkent bozori', 'Паркентский базар', 'Parkent Bazaar', 41.3205, 69.3255],
  ['BAZAAR', 'Sergeli bozori', 'Сергелийский базар', 'Sergeli Bazaar', 41.2255, 69.2235],
  ['PARK', 'Milliy bog\'', 'Национальный парк', 'National Park', 41.302, 69.238],
  ['PARK', 'Yapon bog\'i', 'Японский сад', 'Japanese Garden', 41.342, 69.336],
  ['PARK', 'Tashkent City bog\'i', 'Парк Ташкент Сити', 'Tashkent City Park', 41.315, 69.247],
  ['PARK', 'Ekopark', 'Экопарк', 'Ecopark', 41.306, 69.296],
  ['MALL', 'Samarqand Darvoza', 'Самарканд Дарвоза', 'Samarqand Darvoza', 41.316, 69.2155],
  ['MALL', 'Mega Planet', 'Мега Планет', 'Mega Planet', 41.3665, 69.2875],
  ['MALL', 'Compass', 'Компас', 'Compass Mall', 41.239, 69.21],
  ['HOSPITAL', "Respublika shoshilinch tibbiy yordam markazi", 'РНЦЭМП', 'Republican Emergency Center', 41.333, 69.226],
];

// Har bir tuman uchun ko'cha va mahallalar (real nomlar)
export const STREETS: Record<DistrictSlug, { streets: string[]; mahallas: string[] }> = {
  bektemir: { streets: ["Husayn Boyqaro ko'chasi", "Bektemir ko'chasi", "Suvsoz ko'chasi", "Taraqqiyot ko'chasi"], mahallas: ['Suvsoz', 'Bektemir', 'Ishonch', 'Zilola'] },
  chilonzor: { streets: ["Bunyodkor shoh ko'chasi", "Qatortol ko'chasi", "Cho'ponota ko'chasi", "Muqimiy ko'chasi", "Gavhar ko'chasi"], mahallas: ['Chilonzor-9 kvartal', 'Katta Chilonzor', 'Novza', 'Qatortol', 'Chilonzor-19 kvartal'] },
  mirobod: { streets: ["Shahrisabz ko'chasi", "Afrosiyob ko'chasi", "Mirobod ko'chasi", "Movarounnahr ko'chasi", "Oybek ko'chasi"], mahallas: ['Oybek', 'Mirobod', 'Afrosiyob', 'Kichik Mirobod'] },
  'mirzo-ulugbek': { streets: ["Mustaqillik shoh ko'chasi", "Buyuk Ipak Yo'li ko'chasi", "Mavlono Riyoziy ko'chasi", "Qorasuv ko'chasi", "Feruza ko'chasi"], mahallas: ['Qorasuv-3', 'TTZ', 'Feruza', 'Buyuk Ipak Yoli'] },
  olmazor: { streets: ["Qorasaroy ko'chasi", "Farobiy ko'chasi", "Universitet ko'chasi", "Shifokorlar ko'chasi"], mahallas: ['Qoraqamish', 'Shifokorlar', 'Talabalar shaharchasi', 'Sag\'bon'] },
  sergeli: { streets: ["Yangi Sergeli ko'chasi", "Sergeli 6-mavze", "Qumariq ko'chasi", "Sputnik ko'chasi"], mahallas: ['Sergeli-6', 'Sergeli-8', 'Sputnik', 'Qumariq'] },
  shayxontohur: { streets: ["Navoiy ko'chasi", "Zarqaynar ko'chasi", "Labzak ko'chasi", "Beshyog'och ko'chasi", "Ko'kcha darvoza ko'chasi"], mahallas: ['Ko\'kcha', 'Labzak', 'Beshyog\'och', 'Zarqaynar'] },
  uchtepa: { streets: ["Lutfiy ko'chasi", "Foziltepa ko'chasi", "Uchtepa 22-mavze", "Qatortol ko'chasi"], mahallas: ['Foziltepa', 'Uchtepa-22', 'Uchtepa-14', 'Lutfiy'] },
  yakkasaroy: { streets: ["Bobur ko'chasi", "Shota Rustaveli ko'chasi", "Kichik halqa yo'li", "Qushbegi ko'chasi"], mahallas: ['Qushbegi', 'Bobur', 'Rustaveli', 'Yakkasaroy'] },
  yangihayot: { streets: ["Yangihayot ko'chasi", "Choshtepa ko'chasi", "Ko'kterak ko'chasi", "Navbahor ko'chasi"], mahallas: ['Choshtepa', 'Ko\'kterak', 'Navbahor', 'Yangihayot'] },
  yashnobod: { streets: ["Mahtumquli ko'chasi", "Parkent ko'chasi", "Aviasozlar ko'chasi", "Tuzel ko'chasi"], mahallas: ['Aviasozlar', 'Tuzel', 'Kadysheva', 'Parkent'] },
  yunusobod: { streets: ["Amir Temur shoh ko'chasi", "Bog'ishamol ko'chasi", "Shahriston ko'chasi", "Yunusobod 4-mavze", "Yunusobod 11-mavze"], mahallas: ['Yunusobod-4', 'Yunusobod-11', 'Yunusobod-19', 'Bog\'ishamol'] },
};

export const DEVELOPERS = ['Golden House', 'Murad Buildings', 'NRG Uzbekistan', 'Akay City', 'Tashkent City Residence'];
