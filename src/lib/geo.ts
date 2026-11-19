/** Ikki nuqta orasidagi masofa (metr), haversine formulasi */
export function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export function nearest<T extends { lat: number; lng: number }>(lat: number, lng: number, points: T[]) {
  let best: { point: T; distance: number } | null = null;
  for (const p of points) {
    const d = distanceM(lat, lng, p.lat, p.lng);
    if (!best || d < best.distance) best = { point: p, distance: d };
  }
  return best;
}

/** Toshkent markazi — xarita boshlang'ich nuqtasi */
export const TASHKENT_CENTER = { lat: 41.3111, lng: 69.2797 } as const;
