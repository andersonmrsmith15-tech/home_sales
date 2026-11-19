/** Raqamni guruhlash: 1090000000 → "1 090 000 000" (oddiy bo'shliq bilan) */
export function groupDigits(n: number | string): string {
  const [int, frac] = String(Math.round(Number(n) * 100) / 100).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return frac ? `${grouped},${frac}` : grouped;
}

export type DisplayCurrency = 'USD' | 'UZS';

/** Narx formati: "85 000 $" yoki "1 090 000 000 so'm" */
export function formatPrice(priceUsd: number | string, currency: DisplayCurrency, usdRate: number): string {
  const usd = Number(priceUsd);
  if (currency === 'USD') return `${groupDigits(Math.round(usd))} $`;
  // so'mda 1 000 gacha yaxlitlash
  return `${groupDigits(Math.round((usd * usdRate) / 1000) * 1000)} so'm`;
}

/** Telefonni normallashtirish: "90 123-45-67", "+998901234567" → "+998901234567". Noto'g'ri bo'lsa null. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  const local = digits.startsWith('998') ? digits.slice(3) : digits;
  if (local.length !== 9) return null;
  // Operator kodlari: 33, 50, 55, 77, 88, 90, 91, 93, 94, 95, 97, 98, 99, 20
  if (!/^(20|33|50|55|77|88|9[0-9])/.test(local)) return null;
  return `+998${local}`;
}

/** Telefon formati: "+998901234567" → "+998 90 123 45 67" */
export function formatPhone(e164: string): string {
  const m = e164.replace(/\D/g, '').match(/^998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164;
}

/** m² narxi (USD) */
export function pricePerM2(priceUsd: number, area: number): number | null {
  return area > 0 ? Math.round(priceUsd / area) : null;
}

export function slugify(text: string): string {
  const map: Record<string, string> = { "o'": 'o', "g'": 'g', 'ʻ': '', 'ʼ': '', "'": '', '’': '' };
  return text
    .toLowerCase()
    .replace(/o'|g'|ʻ|ʼ|'|’/g, (m) => map[m] ?? '')
    .replace(/²/g, '2')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
