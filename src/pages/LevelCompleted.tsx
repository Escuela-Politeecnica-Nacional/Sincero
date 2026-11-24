import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { Button, ButtonLink } from '../components/Button';
import { Confetti } from '../components/Confetti';
import { Mascot } from '../components/Mascot';
import { StarCoin } from '../components/StarCoin';
import { useApp, useAutoNarration } from '../context/AppContext';
import { ASSETS, BADGES, PLAYER } from '../data/mockData';
import { ISLAND_BY_ID, LEVEL_BY_ID, theIsland, toIsland } from '../data/levels';
import { usePlayLevel } from '../hooks/usePlayLevel';

const BADGE_REASON: Record<string, string> = {
  'detective-caritas': 'Reconociste emociones mirando ojos y boca.',
  'ola-calma': 'Llegaste a la Laguna de la Calma.',
  'mano-amiga': 'Llegaste a las Islas de los Amigos.',
};

/** Pantalla 7 · Nivel superado (/nivel-completado). */
export default function LevelCompleted() {
  const { progress, a11y } = useApp();
  const playLevel = usePlayLevel();
  const { lastCompletedLevel, lastBadge, lastUnlockedIsland } = progress.progress;
  const level = lastCompletedLevel ? LEVEL_BY_ID[lastCompletedLevel] : undefined;
  const island = level ? ISLAND_BY_ID[level.island] : undefined;
  const badge = BADGES.find((b) => b.id === lastBadge);
  const newIsland = lastUnlockedIsland ? ISLAND_BY_ID[lastUnlockedIsland] : undefined;
  const next = progress.currentLevel;

  const title = `¡Nivel superado, ${PLAYER.name}!`;
  const text = !level
    ? ''
    : level.id === '1-3'
      ? `Descubriste cómo se sentían ${level.questions.length} amigos, con calma y atención.`
      : level.kind === 'breathing'
        ? `Respiraste con Tico en «${level.title}». ¡Tu cuerpo está más tranquilo!`
        : `Completaste «${level.title}» en ${island ? theIsland(island) : ''}.`;
  const islandText =
    newIsland && island ? `¡Terminaste ${theIsland(island)}! Se abrió ${theIsland(newIsland)}.` : '';

  useAutoNarration(level ? `${title} ${text} ${islandText}` : null, `nivel-completado-${lastCompletedLevel}`);

  // Fanfarria de celebración (una sola vez por visita).
  const played = useRef(false);
  const { sound } = a11y;
  useEffect(() => {
    if (!level || played.current) return;
    played.current = true;
    sound('levelUp');
  }, [level, sound]);

  // Solo se llega aquí después de completar un nivel.
  if (!level || !island) return <Navigate to="/mapa" replace />;

  return (
    <div className="celebration">
      <div className="celebration__rays" aria-hidden="true" />
      {!a11y.settings.calmMode && <Confetti />}

      <main id="contenido" className="celebration__content" tabIndex={-1}>
        <Mascot pose="celebrando" size={230} ring={9} edgeColor="#b8902f" className="anim-bounce" />

        <div className="celebration__stars" role="img" aria-label="Tres estrellas">
          <StarCoin size={52} />
          <StarCoin size={70} className="celebration__star-main" />
          <StarCoin size={52} />
        </div>

        <h1 className="celebration__title">{title}</h1>
        <p className="celebration__text">{text}</p>

        {newIsland && (
          <section className="celebration__badge celebration__island card anim-pop" aria-label="Nueva isla">
            <span className="celebration__thumb" aria-hidden="true">
              <img
                src={ASSETS.maps.islasMini}
                alt=""
                style={{ objectPosition: newIsland.thumbPosition, transformOrigin: newIsland.thumbPosition }}
              />
            </span>
            <div>
              <span className="chip chip--green">
                <MapPin size={14} aria-hidden="true" /> ¡Nueva isla desbloqueada!
              </span>
              <h2>
                Mundo {newIsland.id} · {newIsland.name}
              </h2>
              <p>{newIsland.tagline}.</p>
            </div>
          </section>
        )}

        {badge && (
          <section className="celebration__badge card anim-pop" aria-label="Insignia obtenida">
            <img src={badge.image} alt="" />
            <div>
              <span className="chip chip--yellow">
                <Star size={14} fill="#f4a90f" color="#f4a90f" aria-hidden="true" /> ¡Nueva insignia!
              </span>
              <h2>{badge.name}</h2>
              <p>{BADGE_REASON[badge.id] ?? badge.description}</p>
            </div>
          </section>
        )}

        <div className="celebration__actions">
          {next ? (
            <Button variant="primary" size="lg" onClick={() => playLevel(next.id)}>
              {next.island !== level.island ? `¡Ir ${toIsland(ISLAND_BY_ID[next.island])}!` : `Siguiente nivel: ${next.title}`}
            </Button>
          ) : (
            <p className="celebration__text">¡Completaste todas las islas de Sincero!</p>
          )}
          <ButtonLink to="/mapa" variant={next ? 'secondary' : 'primary'} size="lg">
            Continuar en el mapa
          </ButtonLink>
          <ButtonLink to="/logros" variant="secondary" size="lg">
            Ver mis logros
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}
