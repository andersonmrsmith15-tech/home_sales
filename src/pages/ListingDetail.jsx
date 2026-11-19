import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons.jsx';
import ListingCard, { SafeImg } from '../components/ListingCard.jsx';
import { TYPES, api, fmtUSD, ppm2, timeAgo } from '../utils.js';

function Spec({ label, value }) {
  if (value == null || value === '') return null;
  return <div className="spec"><small>{label}</small><b>{value}</b></div>;
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setData(null);
    setActive(0);
    api(`/api/listings/${id}`).then(setData).catch((e) => setError(e.message));
    window.scrollTo({ top: 0 });
  }, [id]);

  if (error) return <div className="error-box">{error}</div>;
  if (!data) return <div className="skeleton" style={{ height: 480 }} />;

  const { item: l, similar, market } = data;
  const t = TYPES[l.type];
  const photos = Array.isArray(l.photos) ? l.photos : [];
  const own = ppm2(l);
  const diff = own && market?.avg_ppm2 && market.count > 2 ? ((own - market.avg_ppm2) / market.avg_ppm2) * 100 : null;
  const verdict = diff == null ? null : diff < -7 ? ['Bozordan arzon', 'var(--green)'] : diff > 7 ? ['Bozordan qimmat', 'var(--red)'] : ['Bozor narxida', 'var(--accent)'];

  return (
    <>
      <button className="back btn ghost" style={{ border: 0, padding: 0, height: 'auto' }} onClick={() => navigate(-1)}>
        <Icon name="arrowLeft" size={16} /> Orqaga
      </button>

      <div className="detail">
        <div>
          <div className="gallery-main">
            <SafeImg src={photos[active]} type={l.type} alt={l.title} />
          </div>
          {photos.length > 1 && (
            <div className="thumbs">
              {photos.map((p, i) => (
                <button key={p} className={i === active ? 'active' : ''} onClick={() => setActive(i)}>
                  <img src={p} alt="" loading="lazy" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-title"><h3>Tavsif</h3></div>
            <div className="desc">{l.description || "Tavsif berilmagan."}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              <span className="badge" style={{ color: t.color }}>{t.label}</span>
              {l.source === 'demo'
                ? <span className="badge demo">Demo</span>
                : <span className="badge">Manba: {l.source === 'olx' ? 'olx.uz' : l.source}</span>}
            </div>
            <h1 style={{ fontSize: 22, lineHeight: 1.3 }}>{l.title}</h1>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span><Icon name="pin" size={13} /> {l.district || 'Toshkent'}</span>
              <span><Icon name="clock" size={13} /> {timeAgo(l.posted_at)}</span>
            </div>
            <div className="price-big" style={{ marginTop: 14 }}>{fmtUSD(l.price_usd)}</div>
            {own && <div style={{ color: 'var(--muted)' }}>{fmtUSD(own)} / m²</div>}

            <div className="specs">
              <Spec label="Xonalar" value={l.rooms} />
              <Spec label="Maydon" value={l.area_m2 && `${Math.round(l.area_m2)} m²`} />
              <Spec label="Yer maydoni" value={l.land_sotix && `${Number(l.land_sotix)} sotix`} />
              <Spec label="Qavat" value={l.floor && (l.total_floors ? `${l.floor} / ${l.total_floors}` : l.floor)} />
              {!l.floor && <Spec label="Qavatlar" value={l.total_floors} />}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {l.url && (
                <a className="btn primary" href={l.url} target="_blank" rel="noopener noreferrer">
                  Asl e'lonni ko'rish <Icon name="external" size={15} />
                </a>
              )}
              {l.lat && l.lon && (
                <a className="btn" href={`https://www.google.com/maps?q=${l.lat},${l.lon}`} target="_blank" rel="noopener noreferrer">
                  <Icon name="pin" size={15} /> Xaritada
                </a>
              )}
            </div>
          </div>

          {verdict && (
            <div className="card insight">
              <div className="card-title"><h3><Icon name="spark" size={15} /> AI narx bahosi</h3></div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 700, color: verdict[1] }}>{verdict[0]}</div>
              <div className="meter">
                <div style={{ width: `${Math.min(100, Math.max(6, 50 + diff))}%`, background: 'var(--grad)' }} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                {l.district} tumanidagi {market.count} ta o'xshash e'lonning o'rtacha 1 m² narxi — <b style={{ color: 'var(--text)' }}>{fmtUSD(market.avg_ppm2)}</b>.
                Bu e'lon {Math.abs(diff).toFixed(0)}% {diff < 0 ? 'arzonroq' : 'qimmatroq'}.
              </div>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <>
          <div className="page-head" style={{ marginTop: 32, marginBottom: 16 }}>
            <h2 style={{ fontSize: 22 }}>O'xshash e'lonlar</h2>
            <Link to={`/elonlar?type=${l.type}`} className="btn ghost">Barchasi →</Link>
          </div>
          <div className="listings-grid">{similar.map((s) => <ListingCard key={s.id} l={s} />)}</div>
        </>
      )}
    </>
  );
}
