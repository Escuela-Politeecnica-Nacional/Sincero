import { NavLink, Link } from 'react-router-dom';
import { House, Leaf, Map, PersonStanding, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import { ASSETS, PLAYER } from '../data/mockData';

interface NavItem {
  to: string;
  label: string;
  key: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/inicio', label: 'Inicio', key: 'inicio', icon: <House size={17} strokeWidth={2.6} /> },
  { to: '/mapa', label: 'Mapa', key: 'mapa', icon: <Map size={17} strokeWidth={2.6} /> },
  { to: '/logros', label: 'Mis logros', key: 'logros', icon: <Star size={17} strokeWidth={2.6} fill="currentColor" /> },
  {
    to: '/accesibilidad',
    label: 'Accesibilidad',
    key: 'accesibilidad',
    icon: <PersonStanding size={18} strokeWidth={2.6} />,
  },
];

export function Navbar() {
  const { progress, a11y } = useApp();
  const { stars } = progress.progress;
  const { calmMode } = a11y.settings;

  return (
    <header className="navbar">
      <Link to="/inicio" className="navbar__brand" aria-label="Sincero, ir al inicio">
        <img src={ASSETS.tico.logo} alt="" />
        <span>Sincero</span>
      </Link>

      <nav aria-label="Navegación principal" style={{ display: 'contents' }}>
        <ul className="navbar__links">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <NavLink to={item.to} className={`nav-link nav-link--${item.key}`}>
                <span className="nav-link__icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="navbar__status">
        <span className="status-pill status-pill--stars" aria-label={`${stars} estrellas ganadas`}>
          <Star size={20} fill="#f4a90f" color="#f4a90f" aria-hidden="true" />
          <span aria-hidden="true">{stars}</span>
        </span>
        <button
          type="button"
          className="status-pill status-pill--calm"
          aria-pressed={calmMode}
          onClick={() => a11y.toggle('calmMode')}
          title={calmMode ? 'Desactivar modo calma' : 'Activar modo calma'}
        >
          <Leaf size={16} aria-hidden="true" />
          <span className="status-pill__text">Modo calma: {calmMode ? 'Sí' : 'No'}</span>
        </button>
        <span className="avatar" role="img" aria-label={`Perfil de ${PLAYER.name}`}>
          {PLAYER.initial}
        </span>
      </div>
    </header>
  );
}
