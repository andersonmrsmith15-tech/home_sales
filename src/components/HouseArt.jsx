import { memo } from 'react';

/**
 * Rasmi yo'q e'lonlar uchun generativ tasvir: e'lon turi va ID siga qarab
 * har safar bir xil, lekin har bir e'lon uchun boshqacha manzara chiziladi.
 */

function rng(seed) {
  let a = (Number(seed) || 1) * 2654435761 >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SKIES = [
  { top: '#120d2e', mid: '#2e2160', glow: '#8b6cff', night: true },
  { top: '#07152b', mid: '#123a5c', glow: '#22d3ee', night: true },
  { top: '#1d0f2c', mid: '#53254f', glow: '#f472b6', night: false },
  { top: '#0c1430', mid: '#22336b', glow: '#5b7cff', night: false },
  { top: '#1a1030', mid: '#4a2d3a', glow: '#f5b942', night: false },
];
const LIT = ['#f5c46b', '#ffd98a', '#9be7ff', '#c9bcff'];

function Windows({ x, y, w, h, cols, rows, r, pad = 6, lit = 0.45 }) {
  const out = [];
  const cw = (w - pad * 2) / cols;
  const rh = (h - pad * 2) / rows;
  const ww = Math.max(3, cw * 0.55);
  const wh = Math.max(3, rh * 0.5);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const on = r() < lit;
      out.push(
        <rect key={`${i}-${j}`} x={x + pad + j * cw + (cw - ww) / 2} y={y + pad + i * rh + (rh - wh) / 2}
          width={ww} height={wh} rx={1} fill={on ? LIT[Math.floor(r() * LIT.length)] : '#0a0e1f'}
          opacity={on ? 0.75 + r() * 0.25 : 0.9} />,
      );
    }
  }
  return out;
}

function Tree({ x, base, s, r, color }) {
  return (
    <g>
      <rect x={x - 2.5 * s} y={base - 22 * s} width={5 * s} height={22 * s} fill="#2a1f2e" />
      <circle cx={x} cy={base - 32 * s} r={16 * s} fill={color} />
      <circle cx={x - 10 * s} cy={base - 24 * s} r={11 * s} fill={color} opacity={0.9} />
      <circle cx={x + 11 * s} cy={base - 26 * s} r={12 * s} fill={color} opacity={0.85} />
      {r() > 0.5 && <circle cx={x + 4 * s} cy={base - 38 * s} r={4 * s} fill="#ffffff" opacity={0.06} />}
    </g>
  );
}

function Apartment({ r }) {
  const blocks = r() > 0.45 ? 2 : 1;
  const out = [];
  const totalW = blocks === 2 ? 270 : 160;
  let x = 200 - totalW / 2;
  for (let b = 0; b < blocks; b++) {
    const w = blocks === 2 ? 120 + r() * 20 : 150 + r() * 20;
    const floors = 5 + Math.floor(r() * 9);
    const fh = Math.min(17, 190 / floors);
    const h = floors * fh + 10;
    const y = 250 - h;
    const cols = Math.max(4, Math.round(w / 20));
    out.push(
      <g key={b}>
        <rect x={x} y={y} width={w} height={h} fill={`url(#bld-${b})`} stroke="rgba(160,170,255,0.18)" />
        <rect x={x - 3} y={y - 4} width={w + 6} height={5} fill="#262d52" />
        {r() > 0.4 && <rect x={x + w * 0.62} y={y - 14} width={14} height={10} fill="#1b2142" />}
        <Windows x={x} y={y + 4} w={w} h={h - 22} cols={cols} rows={floors} r={r} lit={0.35 + r() * 0.25} />
        <rect x={x + w / 2 - 9} y={236} width={18} height={14} fill="#0a0e1f" stroke="rgba(34,211,238,0.5)" />
      </g>,
    );
    x += w + (blocks === 2 ? 14 : 0);
  }
  return out;
}

function House({ r, color }) {
  const two = r() > 0.4;
  const w = 150 + r() * 30;
  const x = 200 - w / 2 + (r() - 0.5) * 30;
  const wallH = two ? 105 : 62;
  const y = 250 - wallH;
  const roofH = 30 + r() * 12;
  const wall = ['#2b2f55', '#33294f', '#25385a'][Math.floor(r() * 3)];
  return (
    <g>
      {/* devor (to'siq) */}
      <rect x={20} y={226} width={360} height={24} fill="#161a33" />
      {Array.from({ length: 18 }).map((_, i) => (
        <rect key={i} x={22 + i * 20} y={222} width={16} height={4} fill="#1f2446" />
      ))}
      <rect x={x} y={y} width={w} height={wallH} fill={wall} stroke="rgba(160,170,255,0.2)" />
      <polygon points={`${x - 12},${y} ${x + w / 2},${y - roofH} ${x + w + 12},${y}`} fill="#3a2550" stroke="rgba(244,114,182,0.35)" />
      <Windows x={x + 8} y={y + 4} w={w - 16} h={wallH - 24} cols={4} rows={two ? 2 : 1} r={r} pad={4} lit={0.6} />
      <rect x={x + w / 2 - 11} y={226} width={22} height={24} rx={2} fill="#4a3324" />
      <Tree x={x - 40} base={250} s={1.1 + r() * 0.3} r={r} color={color} />
      {r() > 0.3 && <Tree x={x + w + 42} base={250} s={0.9 + r() * 0.3} r={r} color={color} />}
    </g>
  );
}

function OldHouse({ r, color }) {
  const w = 170 + r() * 30;
  const x = 200 - w / 2 + 20;
  const wallH = 52 + r() * 10;
  const y = 250 - wallH;
  return (
    <g>
      <rect x={x} y={y} width={w} height={wallH} fill="#4a3e3a" stroke="rgba(245,185,66,0.25)" />
      <rect x={x - 8} y={y - 6} width={w + 16} height={7} fill="#3a302d" />
      {/* suvoq yoriqlari */}
      <path d={`M${x + w * 0.3} ${y + 8} l6 10 l-4 8 l5 9`} stroke="#2a221f" strokeWidth={1.4} fill="none" />
      <path d={`M${x + w * 0.75} ${y + 14} l-5 8 l4 7`} stroke="#2a221f" strokeWidth={1.2} fill="none" />
      {[0.18, 0.45, 0.72].map((f, i) => {
        const on = r() > 0.35;
        return (
          <g key={i}>
            <rect x={x + w * f - 1} y={y + 13} width={24} height={20} fill="#5b4430" />
            <rect x={x + w * f + 2} y={y + 16} width={18} height={14} fill={on ? '#f5c46b' : '#0a0e1f'} opacity={on ? 0.8 : 1} />
            <line x1={x + w * f + 11} y1={y + 16} x2={x + w * f + 11} y2={y + 30} stroke="#5b4430" strokeWidth={2} />
          </g>
        );
      })}
      {/* darvoza */}
      <rect x={x - 70} y={205} width={56} height={45} fill="#3a2b22" stroke="rgba(245,185,66,0.35)" />
      <path d={`M${x - 74} 207 Q${x - 42} 186 ${x - 10} 207`} fill="none" stroke="#5b4430" strokeWidth={5} />
      <line x1={x - 42} y1={207} x2={x - 42} y2={250} stroke="#5b4430" strokeWidth={2} />
      <rect x={20} y={232} width={x - 90} height={18} fill="#3d322e" />
      <Tree x={x + w + 30} base={250} s={1.4 + r() * 0.3} r={r} color={color} />
    </g>
  );
}

function HouseArt({ type = 'kvartira', seed = 1 }) {
  const r = rng(seed);
  const sky = SKIES[Math.floor(r() * SKIES.length)];
  const treeColor = ['#1f4a4a', '#2a3f5f', '#3b2f5c'][Math.floor(r() * 3)];
  const id = `${type}-${seed}`;
  const moonX = 40 + r() * 320;
  const skyline = Array.from({ length: 14 }, (_, i) => ({ x: i * 30 - 5 + r() * 10, w: 22 + r() * 18, h: 20 + r() * 70 }));
  const stars = sky.night ? Array.from({ length: 24 }, () => [r() * 400, r() * 150, r() * 1.1 + 0.3]) : [];

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role="img" aria-label="Tasviriy rasm">
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="0.75" stopColor={sky.mid} />
          <stop offset="1" stopColor={sky.glow} stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0" stopColor={sky.glow} stopOpacity="0.9" />
          <stop offset="1" stopColor={sky.glow} stopOpacity="0" />
        </radialGradient>
        {[0, 1].map((b) => (
          <linearGradient key={b} id={`bld-${b}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={b ? '#1a2046' : '#20274f'} />
            <stop offset="1" stopColor={b ? '#11152f' : '#141a38'} />
          </linearGradient>
        ))}
      </defs>
      <rect width="400" height="300" fill={`url(#sky-${id})`} />
      {stars.map(([x, y, s], i) => <circle key={i} cx={x} cy={y} r={s} fill="#fff" opacity={0.5} />)}
      <circle cx={moonX} cy={60} r={60} fill={`url(#glow-${id})`} opacity={0.5} />
      <circle cx={moonX} cy={60} r={sky.night ? 11 : 16} fill={sky.night ? '#e7eaf6' : sky.glow} opacity={0.9} />
      {skyline.map((b, i) => (
        <rect key={i} x={b.x} y={250 - b.h} width={b.w} height={b.h} fill="#0b0f22" opacity={0.65} />
      ))}
      {type === 'kvartira' && <Apartment r={r} />}
      {type === 'hovli' && <House r={r} color={treeColor} />}
      {type === 'eski_uy' && <OldHouse r={r} color={treeColor} />}
      <rect y="250" width="400" height="50" fill="#070a16" />
      <rect y="250" width="400" height="1.5" fill={sky.glow} opacity="0.35" />
    </svg>
  );
}

export default memo(HouseArt);
