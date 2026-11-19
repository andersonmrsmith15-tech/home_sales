import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard.jsx';
import { TYPES, api, fmtNum } from '../utils.js';

const SORTS = [
  ['new', 'Eng yangi'],
  ['price_asc', 'Arzonroq'],
  ['price_desc', 'Qimmatroq'],
  ['ppm2_asc', 'm² narxi arzon'],
  ['area_desc', 'Kattaroq maydon'],
];

export default function Listings() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [error, setError] = useState(null);
  const [q, setQ] = useState(params.get('q') || '');

  const type = params.get('type') || '';
  const page = Number(params.get('page') || 1);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    api('/api/meta').then((d) => setDistricts(d.districts)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (q !== (params.get('q') || '')) update({ q }); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    setData(null);
    setError(null);
    api(`/api/listings?${params.toString()}`).then(setData).catch((e) => setError(e.message));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [params]);

  const title = type ? TYPES[type]?.label : "Barcha e'lonlar";

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p>Toshkent shahri bo'yicha sotuvdagi uy-joylar</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${!type ? 'active' : ''}`} onClick={() => update({ type: '' })}>Barchasi</button>
        {Object.entries(TYPES).map(([k, t]) => (
          <button key={k} className={`tab ${type === k ? 'active' : ''}`} onClick={() => update({ type: k })}>{t.label}</button>
        ))}
      </div>

      <div className="filters">
        <div className="field">
          <label>Qidiruv</label>
          <input className="input" placeholder="Masalan: evro ta'mir, metro yaqin…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="field">
          <label>Tuman</label>
          <select className="select" value={params.get('district') || ''} onChange={(e) => update({ district: e.target.value })}>
            <option value="">Hammasi</option>
            {districts.map((d) => <option key={d.district} value={d.district}>{d.district} ({d.count})</option>)}
          </select>
        </div>
        <div className="field">
          <label>Xonalar</label>
          <select className="select" value={params.get('rooms') || ''} onChange={(e) => update({ rooms: e.target.value })}>
            <option value="">Farqi yo'q</option>
            {[1, 2, 3, 4].map((r) => <option key={r} value={r}>{r} xona</option>)}
            <option value="5">5+ xona</option>
          </select>
        </div>
        <div className="field">
          <label>Narx dan ($)</label>
          <input className="input" type="number" min="0" placeholder="0" defaultValue={params.get('minPrice') || ''}
            onBlur={(e) => update({ minPrice: e.target.value })} />
        </div>
        <div className="field">
          <label>Narx gacha ($)</label>
          <input className="input" type="number" min="0" placeholder="∞" defaultValue={params.get('maxPrice') || ''}
            onBlur={(e) => update({ maxPrice: e.target.value })} />
        </div>
        <div className="field">
          <label>Saralash</label>
          <select className="select" value={params.get('sort') || 'new'} onChange={(e) => update({ sort: e.target.value })}>
            {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {!data && !error && (
        <div className="listings-grid">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 320 }} />)}
        </div>
      )}

      {data && (
        <>
          <div className="results-bar">
            <span>{fmtNum(data.total)} ta e'lon topildi</span>
            <span>Sahifa {data.page} / {data.pages}</span>
          </div>
          {data.items.length ? (
            <div className="listings-grid">
              {data.items.map((l) => <ListingCard key={l.id} l={l} />)}
            </div>
          ) : (
            <div className="card empty">Hech narsa topilmadi. Filtrlarni o'zgartirib ko'ring.</div>
          )}
          {data.pages > 1 && (
            <div className="pager">
              <button className="btn" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>← Oldingi</button>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>{page} / {data.pages}</span>
              <button className="btn" disabled={page >= data.pages} onClick={() => update({ page: String(page + 1) })}>Keyingi →</button>
            </div>
          )}
        </>
      )}
    </>
  );
}
