import type { CSSProperties } from 'react';

const COLORS = ['#4fbf86', '#5b6ee1', '#f6b829', '#f07c95', '#6fa8f5'];

/**
 * Confeti decorativo con posiciones fijas (deterministas, sin azar).
 * Se oculta a lectores de pantalla y se detiene sin animaciones.
 */
const PIECES = Array.from({ length: 34 }, (_, i) => {
  const left = (i * 37 + 11) % 100;
  const top = (i * 53 + 7) % 92;
  return {
    left,
    top,
    color: COLORS[i % COLORS.length],
    rotate: (i * 47) % 180,
    delay: (i % 9) * 0.55,
    duration: 7 + (i % 5),
    wide: i % 3 === 0,
  };
});

export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className={`confetti__piece ${p.wide ? 'confetti__piece--wide' : ''}`}
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: p.color,
              '--rot': `${p.rotate}deg`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
