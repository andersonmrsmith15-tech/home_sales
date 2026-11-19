import { Link } from 'react-router-dom';
import { Icon } from './Icons.jsx';
import { TYPES, fmtUSD, ppm2, timeAgo } from '../utils.js';

export function Placeholder({ type }) {
  const t = TYPES[type] || TYPES.kvartira;
  return (
    <div className="placeholder" style={{ '--c': t.color }}>
      <Icon name={type === 'kvartira' ? 'building' : 'home'} size={56} color={t.color} strokeWidth={1.3} />
    </div>
  );
}

export default function ListingCard({ l }) {
  const t = TYPES[l.type] || TYPES.kvartira;
  const photo = Array.isArray(l.photos) ? l.photos[0] : null;
  const p = ppm2(l);
  return (
    <Link to={`/elonlar/${l.id}`} className="card lcard">
      <div className="lcard-img">
        {photo ? <img src={photo} alt={l.title} loading="lazy" referrerPolicy="no-referrer" /> : <Placeholder type={l.type} />}
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
