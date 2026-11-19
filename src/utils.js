export const TYPES = {
  kvartira: { label: "Ko'p qavatli", short: 'Kvartira', color: '#8B6CFF' },
  hovli: { label: 'Hovli', short: 'Hovli', color: '#22D3EE' },
  eski_uy: { label: 'Eski uy', short: 'Eski uy', color: '#F5B942' },
};

export const fmtUSD = (v) =>
  v == null || Number.isNaN(Number(v)) ? '—' : '$' + Math.round(Number(v)).toLocaleString('en-US').replace(/,/g, ' ');

export const fmtCompact = (v) => {
  if (v == null) return '—';
  const n = Number(v);
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'k';
  return '$' + Math.round(n);
};

export const fmtNum = (v) => (v == null ? '—' : Number(v).toLocaleString('en-US').replace(/,/g, ' '));

export const ppm2 = (l) => (l.area_m2 > 10 ? Number(l.price_usd) / Number(l.area_m2) : null);

export function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))} daqiqa oldin`;
  if (diff < 86400) return `${Math.round(diff / 3600)} soat oldin`;
  if (diff < 86400 * 30) return `${Math.round(diff / 86400)} kun oldin`;
  return new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
export const monthLabel = (ym) => {
  const [y, m] = ym.split('-');
  return `${MONTHS[Number(m) - 1]} ${y.slice(2)}`;
};

export async function api(path) {
  const res = await fetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `So'rov xatosi (${res.status})`);
  return data;
}
