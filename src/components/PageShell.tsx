import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface PageShellProps {
  children: ReactNode;
  /** Mostrar la barra de navegación principal. */
  withNav?: boolean;
  className?: string;
  /** Contenido fuera del contenedor (modales, superposiciones). */
  overlay?: ReactNode;
}

/** Fondo de cielo con nubes y colina verde, común a todas las pantallas. */
export function PageShell({ children, withNav = true, className, overlay }: PageShellProps) {
  return (
    <div className={['page', className].filter(Boolean).join(' ')}>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <span className="cloud cloud--1" aria-hidden="true" />
      <span className="cloud cloud--2" aria-hidden="true" />
      <span className="cloud cloud--3" aria-hidden="true" />
      <span className="cloud cloud--4" aria-hidden="true" />
      <span className="page__hill" aria-hidden="true" />

      <div className="page__inner">
        {withNav && <Navbar />}
        <main id="contenido" className="page__main" tabIndex={-1}>
          {children}
        </main>
      </div>
      {overlay}
    </div>
  );
}
