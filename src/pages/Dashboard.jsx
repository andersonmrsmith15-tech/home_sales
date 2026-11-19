import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, LabelList,
} from 'recharts';
import { Icon } from '../components/Icons.jsx';
import ListingCard from '../components/ListingCard.jsx';
import { TYPES, api, fmtUSD, fmtCompact, fmtNum, monthLabel, timeAgo } from '../utils.js';

const AXIS = { stroke: '#5a6385', fontSize: 12, tickLine: false, axisLine: false };
const GRID = <CartesianGrid stroke="rgba(148,163,255,0.08)" vertical={false} />;

function TT({ active, payload, label, fmt = fmtUSD, labelFmt = (x) => x }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tt">
      <b>{labelFmt(label)}</b>
      {payload.map((p) => (
        <div key={p.dataKey}>
          <i style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.payload.fill }} />
          {p.name}: <span>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Kpi({ icon, label, value, sub, glow }) {
  return (
    <div className="card kpi" style={{ '--glow': glow }}>
      <div className="kpi-label"><span className="kpi-icon"><Icon name={icon} size={15} /></span>{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
}

function Legend() {
  return (
    <div className="legend">
      {Object.entries(TYPES).map(([k, t]) => (
        <span key={k}><i style={{ background: t.color }} />{t.label}</span>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/api/stats').then(setData).catch((e) => setError(e.message));
  }, []);

  const trend = useMemo(() => {
    if (!data) return [];
    const map = {};
    for (const r of data.trend) {
      map[r.month] ??= { month: r.month };
      map[r.month][r.type] = r.avg_ppm2 ? Math.round(r.avg_ppm2) : null;
    }
    return Object.values(map);
  }, [data]);

  const typeMap = useMemo(() => Object.fromEntries((data?.byType ?? []).map((t) => [t.type, t])), [data]);

  if (error) {
    return (
      <div className="error-box">
        <b>Ma'lumotlarni yuklab bo'lmadi:</b> {error}
        <div style={{ marginTop: 8, fontSize: 13 }}>
          <code>DATABASE_URL</code> o'rnatilganini va <code>npm run db:setup</code> bajarilganini tekshiring.
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <>
        <div className="skeleton" style={{ height: 60, marginBottom: 24, maxWidth: 420 }} />
        <div className="grid kpis">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}</div>
        <div className="skeleton" style={{ height: 340 }} />
      </>
    );
  }

  const { kpi } = data;
  const pie = data.byType.map((t) => ({ name: TYPES[t.type]?.label, value: t.count, fill: TYPES[t.type]?.color }));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Bozor dashboardi</h1>
          <p>Toshkent shahri · kvartiralar, hovlilar va eski uylar bo'yicha real vaqt tahlili</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="chip ai"><Icon name="spark" size={13} /> AI bozor tahlili</span>
          <span className="chip">
            <Icon name="clock" size={13} />
            {data.lastUpdate ? `Yangilangan: ${timeAgo(data.lastUpdate)}` : 'Real ma\'lumot hali yuklanmagan'}
          </span>
        </div>
      </div>

      {kpi.demo_count > 0 && (
        <div className="banner">
          <span>⚠︎ Bazada {fmtNum(kpi.demo_count)} ta <b>demo</b> e'lon bor. Real e'lonlarni CSV fayldan yuklash uchun:</span>
          <code>npm run import -- fayl.csv</code>
        </div>
      )}

      <div className="grid kpis">
        <Kpi icon="layers" label="Jami e'lonlar" value={fmtNum(kpi.total)} sub={`${kpi.districts} ta tumanda`} glow="rgba(139,108,255,.3)" />
        <Kpi icon="dollar" label="O'rtacha narx" value={fmtCompact(kpi.avg_price)} sub={`Median: ${fmtUSD(kpi.median_price)}`} glow="rgba(34,211,238,.25)" />
        <Kpi icon="area" label="O'rtacha 1 m² narxi" value={fmtUSD(kpi.avg_ppm2)} sub="Barcha turlar bo'yicha" glow="rgba(244,114,182,.22)" />
        <Kpi icon="spark" label="Yangi e'lonlar" value={`+${fmtNum(kpi.new_week)}`} sub="So'nggi 7 kun" glow="rgba(52,211,153,.22)" />
      </div>

      <div className="grid types">
        {Object.entries(TYPES).map(([k, t]) => {
          const s = typeMap[k] || {};
          return (
            <Link key={k} to={`/elonlar?type=${k}`} className="card type-card" style={{ '--c': t.color }}>
              <div className="type-head">
                <span className="type-name"><Icon name={k === 'kvartira' ? 'building' : 'home'} color={t.color} /> {t.label}</span>
                <span className="type-count">{fmtNum(s.count ?? 0)}</span>
              </div>
              <div className="type-stats">
                <div><small>O'rtacha narx</small><b>{fmtCompact(s.avg_price)}</b></div>
                <div><small>1 m² narxi</small><b>{fmtUSD(s.avg_ppm2)}</b></div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid charts">
        <div className="card span-8">
          <div className="card-title"><h3>1 m² narxi dinamikasi</h3><Legend /></div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                {Object.entries(TYPES).map(([k, t]) => (
                  <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={t.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              {GRID}
              <XAxis dataKey="month" tickFormatter={monthLabel} {...AXIS} />
              <YAxis tickFormatter={(v) => `$${v}`} {...AXIS} width={60} />
              <Tooltip content={<TT labelFmt={monthLabel} />} />
              {Object.entries(TYPES).map(([k, t]) => (
                <Area key={k} type="monotone" dataKey={k} name={t.label} stroke={t.color} strokeWidth={2}
                  fill={`url(#g-${k})`} connectNulls dot={false} activeDot={{ r: 4 }} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card span-4">
          <div className="card-title"><h3>Turlar ulushi</h3><span>{fmtNum(kpi.total)} ta e'lon</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3} stroke="none">
                {pie.map((p) => <Cell key={p.name} fill={p.fill} />)}
              </Pie>
              <Tooltip content={<TT fmt={(v) => `${fmtNum(v)} ta`} labelFmt={() => 'E\'lonlar'} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend" style={{ justifyContent: 'center' }}>
            {pie.map((p) => (
              <span key={p.name}><i style={{ background: p.fill }} />{p.name} · {Math.round((p.value / kpi.total) * 100)}%</span>
            ))}
          </div>
        </div>

        <div className="card span-6">
          <div className="card-title"><h3>Tumanlar bo'yicha 1 m² narxi</h3><span>O'rtacha, USD</span></div>
          <ResponsiveContainer width="100%" height={Math.max(260, data.byDistrict.length * 28)}>
            <BarChart data={data.byDistrict.map((d) => ({ ...d, avg_ppm2: Math.round(d.avg_ppm2 || 0) }))}
              layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gbar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6d4dff" /><stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="district" {...AXIS} width={110} stroke="#8b93b3" />
              <Tooltip cursor={{ fill: 'rgba(139,108,255,0.06)' }} content={<TT />} />
              <Bar dataKey="avg_ppm2" name="1 m²" fill="url(#gbar)" radius={[0, 6, 6, 0]} barSize={16}>
                <LabelList dataKey="avg_ppm2" position="right" formatter={(v) => `$${v}`} fill="#8b93b3" fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card span-6" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="card-title"><h3>Narxlar taqsimoti</h3><span>E'lonlar soni</span></div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.histogram} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                {GRID}
                <XAxis dataKey="bucket" {...AXIS} fontSize={11} interval={0} />
                <YAxis {...AXIS} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(139,108,255,0.06)' }} content={<TT fmt={(v) => `${v} ta`} labelFmt={(l) => `$${l}`} />} />
                <Bar dataKey="count" name="E'lonlar" fill="#8b6cff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="card-title"><h3>Kvartiralar: xonalar bo'yicha</h3><span>O'rtacha narx</span></div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={data.rooms.map((r) => ({ ...r, label: r.rooms >= 5 ? '5+ xona' : `${r.rooms} xona` }))}
                margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                {GRID}
                <XAxis dataKey="label" {...AXIS} />
                <YAxis {...AXIS} tickFormatter={fmtCompact} width={50} />
                <Tooltip cursor={{ fill: 'rgba(34,211,238,0.06)' }} content={<TT />} />
                <Bar dataKey="avg_price" name="O'rtacha narx" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="page-head" style={{ marginTop: 32, marginBottom: 16 }}>
        <h2 style={{ fontSize: 22 }}>So'nggi e'lonlar</h2>
        <Link to="/elonlar" className="btn ghost">Barchasini ko'rish →</Link>
      </div>
      <div className="listings-grid">
        {data.latest.map((l) => <ListingCard key={l.id} l={l} />)}
      </div>
    </>
  );
}
