import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Listings from './pages/Listings.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import { Icon } from './components/Icons.jsx';
import { TYPES } from './utils.js';

function Brand() {
  return (
    <div className="brand">
      <div className="brand-logo"><Icon name="home" size={20} color="#fff" /></div>
      <div>
        <div className="brand-name">Uy<span>AI</span></div>
        <div className="brand-sub">Toshkent ko'chmas mulk</div>
      </div>
    </div>
  );
}

export default function App() {
  const { search, pathname } = useLocation();
  const currentType = new URLSearchParams(search).get('type');
  const typeActive = (t) => () => pathname === '/elonlar' && currentType === t ? 'active' : '';

  return (
    <div className="app">
      <aside className="sidebar">
        <Brand />
        <nav className="nav">
          <NavLink to="/" end><Icon name="grid" /> Dashboard</NavLink>
          <NavLink to="/elonlar" className={() => (pathname === '/elonlar' && !currentType ? 'active' : '')}>
            <Icon name="list" /> Barcha e'lonlar
          </NavLink>
          <div className="nav-label">Turlar</div>
          {Object.entries(TYPES).map(([k, t]) => (
            <NavLink key={k} to={`/elonlar?type=${k}`} className={typeActive(k)}>
              <span className="dot" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} /> {t.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="live">Ma'lumotlar bazasi ulangan</div>
          <div style={{ marginTop: 6 }}>Manba: olx.uz · Toshkent sh.</div>
        </div>
      </aside>

      <header className="topbar">
        <Brand />
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/elonlar">E'lonlar</NavLink>
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/elonlar" element={<Listings />} />
          <Route path="/elonlar/:id" element={<ListingDetail />} />
          <Route path="*" element={<div className="empty">Sahifa topilmadi</div>} />
        </Routes>
      </main>
    </div>
  );
}
