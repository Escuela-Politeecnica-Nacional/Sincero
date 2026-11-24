import type { MouseEvent, ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Bell, Captions, Map as MapIcon, Star, Volume2 } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Button } from '../components/Button';
import { ListenButton } from '../components/ListenButton';
import { Mascot } from '../components/Mascot';
import { ProgressBar } from '../components/ProgressBar';
import { StarCoin } from '../components/StarCoin';
import { useApp } from '../context/AppContext';
import { ASSETS, BADGES, PLAYER, TICO_GREETING } from '../data/mockData';
import { usePlayLevel } from '../hooks/usePlayLevel';

export default function Dashboard() {
  const navigate = useNavigate();
  const { progress, a11y } = useApp();
  const playLevel = usePlayLevel();
  const { currentIsland, currentLevel, allCompleted, levelStatus } = progress;
  const totalLevels = currentIsland.levels.length;
  const doneInIsland = progress.completedInIsland(currentIsland.id);

  /** Continúa el nivel actual; si ya terminó todo, abre el mapa para repetir. */
  const play = () => (currentLevel ? playLevel(currentLevel.id) : navigate('/mapa'));

  const encouragement = allCompleted
    ? '¡Completaste las 5 islas! Puedes repetir cualquier nivel.'
    : doneInIsland >= 3
      ? '¡Qué gran detective eres! Sigue a tu ritmo.'
      : '¡Vas muy bien! Aquí no hay prisa.';

  return (
    <PageShell>
      <div className="dash-top">
        <section className="hero card anim-pop" aria-labelledby="hero-title">
          <div className="hero__bg" aria-hidden="true" style={{ backgroundImage: `url(${ASSETS.maps.islas})` }} />
          <div className="hero__content">
            <span className="chip chip--yellow">
              <Star size={14} fill="#f4a90f" color="#f4a90f" aria-hidden="true" /> {PLAYER.title}
            </span>
            <h1 id="hero-title" className="hero__title">
              ¡Hola, {PLAYER.name}!
            </h1>
            <p className="hero__text">{TICO_GREETING}</p>
            <div className="hero__actions">
              <Button variant="primary" size="lg" onClick={play}>
                {allCompleted ? 'Elegir un nivel' : '¡Jugar ahora!'}
              </Button>
              <ListenButton text={`¡Hola, ${PLAYER.name}! ${TICO_GREETING}`} id="saludo" label="Escuchar a Tico" size="lg" />
            </div>
          </div>
          <Mascot pose="saludando" size={230} ring={8} className="hero__mascot anim-float" />
        </section>

        <section className="journey card anim-pop" aria-labelledby="journey-title">
          <h2 id="journey-title" className="journey__title">
            <span className="journey__icon" aria-hidden="true">
              <MapIcon size={18} />
            </span>
            Tu viaje
          </h2>
          <p className="journey__world">
            Mundo {currentIsland.id} · {currentIsland.name}
          </p>
          <ProgressBar
            value={doneInIsland}
            max={totalLevels}
            label={`Niveles completados en el mundo ${currentIsland.id}`}
          />
          <p className="journey__count">
            {doneInIsland} de {totalLevels} niveles completados
          </p>
          <ul className="journey__stars" aria-label={`Niveles del mundo ${currentIsland.id}`}>
            {currentIsland.levels.map((level) => {
              const done = levelStatus(level.id) === 'completed';
              return (
                <li key={level.id}>
                  <StarCoin filled={done} size={38} />
                  <span className="visually-hidden">
                    Nivel {level.number}: {done ? 'completado' : 'pendiente'}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="journey__note">{encouragement}</p>
        </section>
      </div>

      <h2 className="section-title">¿Qué quieres hacer hoy?</h2>
      <ul className="quick-grid">
        <QuickCard
          to={currentLevel ? '/actividad/identificar' : '/mapa'}
          onClick={
            currentLevel
              ? (e) => {
                  e.preventDefault();
                  playLevel(currentLevel.id);
                }
              : undefined
          }
          title="Seguir mi aventura"
          text={currentLevel ? `Nivel ${currentLevel.number}: ${currentLevel.title}` : '¡Terminaste todas las islas!'}
          cta={currentLevel ? '¡A jugar!' : 'Elegir nivel'}
          tone="orange"
          media={<img src={ASSETS.characters.lucas} alt="" />}
        />
        <QuickCard
          to="/mapa"
          title="Mapa de islas"
          text="Explora tus 5 islas mágicas."
          cta="Ver mapa"
          tone="green"
          media={<img src={ASSETS.maps.islasMini} alt="" style={{ objectPosition: '50% 40%' }} />}
        />
        <QuickCard
          to="/actividad/respirar"
          title="Respira conmigo"
          text="1 minuto de calma con Tico."
          cta="Respirar"
          tone="blue"
          media={<img src={ASSETS.tico.respirando} alt="" style={{ objectPosition: '50% 18%' }} />}
        />
        <QuickCard
          to="/logros"
          title="Mis logros"
          text="Insignias y estrellas ganadas."
          cta="Ver logros"
          tone="gold"
          media={
            <span className="quick-card__badges">
              {BADGES.slice(0, 4).map((b) => (
                <img key={b.id} src={b.image} alt="" />
              ))}
            </span>
          }
        />
      </ul>

      <div className="dash-prefs" aria-label="Ajustes rápidos">
        <button
          type="button"
          className="chip chip-button"
          aria-pressed={a11y.settings.narration}
          onClick={() => a11y.toggle('narration')}
        >
          <Volume2 size={16} aria-hidden="true" /> Narración: {a11y.settings.narration ? 'Sí' : 'No'}
        </button>
        <button
          type="button"
          className="chip chip-button"
          aria-pressed={a11y.settings.sounds}
          onClick={() => a11y.toggle('sounds')}
        >
          <Bell size={16} aria-hidden="true" /> Sonidos: {a11y.settings.sounds ? 'Sí' : 'No'}
        </button>
        <button
          type="button"
          className="chip chip-button"
          aria-pressed={a11y.settings.subtitles}
          onClick={() => a11y.toggle('subtitles')}
        >
          <Captions size={16} aria-hidden="true" /> Subtítulos: {a11y.settings.subtitles ? 'Sí' : 'No'}
        </button>
      </div>
    </PageShell>
  );
}

interface QuickCardProps {
  to: string;
  title: string;
  text: string;
  cta: string;
  tone: 'orange' | 'green' | 'blue' | 'gold';
  media: ReactNode;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

function QuickCard({ to, title, text, cta, tone, media, onClick }: QuickCardProps) {
  return (
    <li>
      <Link to={to} className={`quick-card quick-card--${tone}`} onClick={onClick}>
        <span className="quick-card__media">{media}</span>
        <span className="quick-card__body">
          <span className="quick-card__title">{title}</span>
          <span className="quick-card__text">{text}</span>
          <span className="quick-card__cta">
            {cta} <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
          </span>
        </span>
      </Link>
    </li>
  );
}
