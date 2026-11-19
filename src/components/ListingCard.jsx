import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icons.jsx';
import HouseArt from './HouseArt.jsx';
import { TYPES, fmtUSD, ppm2, timeAgo } from '../utils.js';

export function Placeholder({ type, seed }) {
  return <div className="placeholder"><HouseArt type={type} seed={seed} /></div>;
}

/** Rasm bo'lmasa yoki yuklanmasa (singan havola) generativ tasvir ko'rsatadi */
export function SafeImg({ src, type, seed, ...props }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <Placeholder type={type} seed={seed} />;
  return <img src={src} referrerPolicy="no-referrer" onError={() => setFailed(true)} {...props} />;
}

export default function ListingCard({ l }) {
  const t = TYPES[l.type] || TYPES.kvartira;
  const photo = Array.isArray(l.photos) ? l.photos[0] : null;
  const p = ppm2(l);
  return (
    <Link to={`/elonlar/${l.id}`} className="card lcard">
      <div className="lcard-img">
        <SafeImg src={photo} type={l.type} seed={l.id} alt={l.title} loading="lazy"
          title={l.photo_credit ? `Foto: ${l.photo_credit}` : undefined} />
        <div className="badges">
          <span className="badge" style={{ color: t.color }}>{t.label}</span>
          {l.source === 'demo' && <span className="badge demo">Demo</span>}
        </div>
      </div>
      <div className="lcard-body">
        <div className="lcard-price">
          {fmtUSD(l.price_usd)}
          {p && <small>{fmtUSD(p)}/m²</small>}
        </div>
        <div className="lcard-title">{l.title}</div>
        <div className="lcard-meta">
          {l.district && <span><Icon name="pin" size={13} /> {l.district}</span>}
          {l.rooms && <span><Icon name="bed" size={13} /> {l.rooms} xona</span>}
          {l.area_m2 && <span><Icon name="area" size={13} /> {Math.round(l.area_m2)} m²</span>}
          {l.land_sotix && <span><Icon name="tree" size={13} /> {Number(l.land_sotix)} sotix</span>}
          <span><Icon name="clock" size={13} /> {timeAgo(l.posted_at)}</span>
        </div>
      </div>
    </Link>
  );
}
