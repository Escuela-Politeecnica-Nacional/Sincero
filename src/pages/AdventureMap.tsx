import { useState, type CSSProperties } from 'react';
import { Check, Lock, Map as MapIcon, Play, Star, Wind } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { StarCoin } from '../components/StarCoin';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/mockData';
import { ISLANDS, ISLAND_BY_ID, theIsland } from '../data/levels';
import type { LevelStatus } from '../hooks/useProgress';
import { usePlayLevel } from '../hooks/usePlayLevel';
import type { Island, Level } from '../types';

function statusText(status: LevelStatus, level: Level) {
  if (status === 'completed') return 'Completado · puedes repetirlo';
  if (status === 'current') return level.kind === 'breathing' ? 'Aquí estás · respiración' : 'Aquí estás';
  return level.number === 1 ? 'Se abre al terminar la isla anterior' : `Se abre después del nivel ${level.number - 1}`;
}

export default function AdventureMap() {
  const { progress } = useApp();
  const playLevel = usePlayLevel();
  const { levelStatus, completedInIsland, isIslandUnlocked, isIslandCompleted, currentIsland, currentLevel } = progress;

  const [selectedIslandId, setSelectedIslandId] = useState(currentIsland.id);
  const selectedIsland = ISLAND_BY_ID[selectedIslandId] ?? currentIsland;
  const islandOpen = isIslandUnlocked(selectedIsland.id);

  // Nivel elegido en el panel: por defecto, el actual de esa isla o el último completado.
  const defaultLevelFor = (island: Island) =>
    island.levels.find((l) => levelStatus(l.id) === 'current') ??
    [...island.levels].reverse().find((l) => levelStatus(l.id) === 'completed') ??
    island.levels[0];
  const [pickedLevelId, setPickedLevelId] = useState<string | null>(null);
  const pickedLevel =
    selectedIsland.levels.find((l) => l.id === pickedLevelId && levelStatus(l.id) !== 'locked') ??
    defaultLevelFor(selectedIsland);
  const pickedStatus = levelStatus(pickedLevel.id);

  const selectIsland = (id: number) => {
    setSelectedIslandId(id);
    setPickedLevelId(null);
  };

  const totalLevels = selectedIsland.levels.length;
  const done = completedInIsland(selectedIsland.id);
  const previousIsland = ISLAND_BY_ID[selectedIsland.id - 1];

  const ctaLabel =
    pickedStatus === 'completed'
      ? `Repetir nivel ${pickedLevel.number}`
      : pickedLevel.kind === 'breathing'
        ? `¡Respirar en el nivel ${pickedLevel.number}!`
        : `¡Jugar nivel ${pickedLevel.number}!`;

  return (
    <PageShell>
      <div className="map-layout">
        <section className="map-board anim-pop" aria-labelledby="map-title">
          <div className="map-board__head">
            <h1 id="map-title" className="map-board__title">
              <MapIcon size={26} fill="#ffd75a" color="#ffd75a" aria-hidden="true" />
              Mapa de la aventura
            </h1>
            <span className="chip chip--yellow">
              <Star size={14} fill="#f4a90f" color="#f4a90f" aria-hidden="true" />
              {progress.allCompleted
                ? '¡Todas las islas completadas!'
                : `Mundo ${currentIsland.id} · ${completedInIsland(currentIsland.id)} de ${currentIsland.levels.length} niveles`}
            </span>
          </div>

          <div className="map-canvas">
            <img
              className="map-canvas__img"
              src={ASSETS.maps.islas}
              alt="Mapa ilustrado con cinco islas unidas por un camino de piedras sobre el mar."
            />

            {ISLANDS.map((island) => {
              const unlocked = isIslandUnlocked(island.id);
              const completed = isIslandCompleted(island.id);
              const pressed = island.id === selectedIsland.id;
              const sub = completed ? 'Completada' : unlocked ? island.tagline : 'Bloqueado';
              return (
                <button
                  key={island.id}
                  type="button"
                  className={[
                    'island-marker',
                    unlocked ? 'island-marker--open' : 'island-marker--locked',
                    completed && 'island-marker--done',
                    pressed && 'island-marker--selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ left: `${island.marker.x}%`, top: `${island.marker.y}%` } as CSSProperties}
                  aria-pressed={pressed}
                  aria-label={`${island.id}. ${island.name}. ${sub}`}
                  onClick={() => selectIsland(island.id)}
                >
                  <span className="island-marker__pin" aria-hidden="true">
                    {unlocked ? island.id : <Lock size={20} strokeWidth={2.6} />}
                    {completed && (
                      <span className="island-marker__check">
                        <Check size={14} strokeWidth={3.4} />
                      </span>
                    )}
                  </span>
                  <span className="island-marker__label" aria-hidden="true">
                    <strong>
                      {island.id}. {island.name}
                    </strong>
                    <span>{sub}</span>
                  </span>
                </button>
              );
            })}

            <div
              className={`map-here ${currentIsland.marker.y < 30 ? 'map-here--below' : ''}`}
              style={{ left: `${currentIsland.marker.x}%`, top: `${currentIsland.marker.y}%` }}
              aria-hidden="true"
            >
              <span className="map-here__flag">
                <Play size={12} fill="currentColor" /> ¡Estás aquí!
              </span>
              <img className="map-here__tico" src={ASSETS.tico.logo} alt="" />
            </div>
          </div>

          <ul className="map-legend" aria-label="Significado de los íconos">
            <li>
              <Play size={16} fill="#ffd75a" color="#ffd75a" aria-hidden="true" /> Disponible
            </li>
            <li>
              <Lock size={16} aria-hidden="true" /> Bloqueado (se abre al avanzar)
            </li>
            <li>
              <Check size={18} color="#5fd39a" strokeWidth={3} aria-hidden="true" /> Completado
            </li>
          </ul>
        </section>

        <aside className="island-panel card anim-pop" aria-labelledby="island-name" aria-live="polite">
          <div className="island-panel__thumb">
            <img
              src={ASSETS.maps.islasMini}
              alt=""
              style={{ objectPosition: selectedIsland.thumbPosition, transformOrigin: selectedIsland.thumbPosition }}
            />
          </div>
          <span className="chip chip--green">
            <MapIcon size={14} aria-hidden="true" /> Mundo {selectedIsland.id}
          </span>
          <h2 id="island-name" className="island-panel__name">
            {selectedIsland.name}
          </h2>

          {islandOpen ? (
            <>
              <ProgressBar value={done} max={totalLevels} label={`Niveles completados en ${selectedIsland.name}`} />
              <p className="island-panel__count">
                {done} de {totalLevels} niveles completados
              </p>

              <ol className="level-list">
                {selectedIsland.levels.map((level) => {
                  const status = levelStatus(level.id);
                  const picked = level.id === pickedLevel.id;
                  return (
                    <li key={level.id}>
                      <button
                        type="button"
                        className={`level-item level-item--${status} ${picked ? 'level-item--picked' : ''}`}
                        disabled={status === 'locked'}
                        aria-pressed={picked}
                        aria-current={status === 'current' ? 'step' : undefined}
                        onClick={() => setPickedLevelId(level.id)}
                      >
                        <LevelIcon status={status} level={level} />
                        <span>
                          <strong>
                            {level.number}. {level.title}
                          </strong>
                          <span className="level-item__status">{statusText(status, level)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <Button variant="primary" size="lg" block onClick={() => playLevel(pickedLevel.id)}>
                {ctaLabel}
              </Button>
            </>
          ) : (
            <>
              <p className="island-panel__tagline">{selectedIsland.tagline}</p>
              <div className="island-panel__locked">
                <Lock size={22} aria-hidden="true" />
                <p>
                  Esta isla está bloqueada. Se abre cuando termines{' '}
                  <strong>{previousIsland ? theIsland(previousIsland) : 'la isla anterior'}</strong>.
                </p>
              </div>
              {currentLevel && (
                <Button variant="accent" size="lg" block onClick={() => selectIsland(currentIsland.id)}>
                  Ver {theIsland(currentIsland)}
                </Button>
              )}
            </>
          )}
        </aside>
      </div>
    </PageShell>
  );
}

function LevelIcon({ status, level }: { status: LevelStatus; level: Level }) {
  if (status === 'completed') return <StarCoin size={40} />;
  return (
    <span className={`level-icon level-icon--${status}`} aria-hidden="true">
      {status === 'locked' ? (
        <Lock size={18} strokeWidth={2.6} />
      ) : level.kind === 'breathing' ? (
        <Wind size={18} />
      ) : (
        <Play size={18} fill="currentColor" />
      )}
    </span>
  );
}
