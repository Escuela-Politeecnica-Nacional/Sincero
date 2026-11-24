import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Button } from '../components/Button';
import { Caption } from '../components/Caption';
import { Mascot } from '../components/Mascot';
import { useApp, useAutoNarration } from '../context/AppContext';
import { ASSETS, BREATHING } from '../data/mockData';
import { ISLAND_BY_ID, LEVEL_BY_ID } from '../data/levels';
import type { BreathingRouteState } from '../hooks/usePlayLevel';

type Phase = 'inhale' | 'exhale';

const INHALE_PATH = '/actividad/respirar';
const EXHALE_PATH = '/actividad/respirar/exhalar';
const TICK = 100;

/**
 * Pantallas 6 y 10 · Respira conmigo.
 * Es una ruta «padre» que se mantiene montada entre
 * /actividad/respirar (inhalar) y /actividad/respirar/exhalar,
 * así el contador de respiraciones y la pausa no se pierden.
 */
interface BreathState {
  breath: number;
  phase: Phase;
  remaining: number;
  finished: boolean;
}

type BreathAction = { type: 'tick' } | { type: 'restart' };

const phaseDuration = (phase: Phase) => (phase === 'inhale' ? BREATHING.inhaleMs : BREATHING.exhaleMs);

function initState(phase: Phase): BreathState {
  return { breath: 1, phase, remaining: phaseDuration(phase), finished: false };
}

/** Máquina de estados: inhalar → exhalar → siguiente respiración. */
function breathReducer(state: BreathState, action: BreathAction): BreathState {
  if (action.type === 'restart') return initState('inhale');
  if (state.finished) return state;
  const remaining = state.remaining - TICK;
  if (remaining > 0) return { ...state, remaining };
  if (state.phase === 'inhale') return { ...state, phase: 'exhale', remaining: phaseDuration('exhale') };
  if (state.breath < BREATHING.totalBreaths) {
    return { ...state, breath: state.breath + 1, phase: 'inhale', remaining: phaseDuration('inhale') };
  }
  return { ...state, remaining: 0, finished: true };
}

export default function BreathingExercise() {
  const navigate = useNavigate();
  const { pathname, state: routeState } = useLocation();
  const { speech, a11y, progress } = useApp();

  // Si se entró desde el mapa, esta respiración es un nivel de la aventura.
  const [levelId] = useState(() => {
    const id = (routeState as BreathingRouteState | null)?.levelId;
    return id && LEVEL_BY_ID[id]?.kind === 'breathing' && progress.isLevelUnlocked(id) ? id : null;
  });
  const level = levelId ? LEVEL_BY_ID[levelId] : null;
  const placeName = level ? ISLAND_BY_ID[level.island].name : 'Laguna de la Calma';
  const urlPhase: Phase = pathname.replace(/\/$/, '').endsWith('/exhalar') ? 'exhale' : 'inhale';

  const [state, dispatch] = useReducer(breathReducer, urlPhase, initState);
  const [paused, setPaused] = useState(false);
  const { breath, phase, finished } = state;
  const duration = phaseDuration(phase);
  const phaseKey = `${breath}-${phase}`;

  // Reloj de la respiración (respeta la pausa).
  useEffect(() => {
    if (paused || finished) return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), TICK);
    return () => window.clearInterval(id);
  }, [paused, finished]);

  // La URL refleja la fase actual: /actividad/respirar ↔ /actividad/respirar/exhalar.
  useEffect(() => {
    if (phase !== urlPhase) navigate(phase === 'inhale' ? INHALE_PATH : EXHALE_PATH, { replace: true });
  }, [phase, urlPhase, navigate]);

  // Campanita tranquila al terminar el minuto de respiración.
  const { sound } = a11y;
  useEffect(() => {
    if (finished) sound('calm');
  }, [finished, sound]);

  // Al terminar un nivel de respiración, se marca como completado (una vez).
  const { completeLevel } = progress;
  const levelDone = useRef(false);
  useEffect(() => {
    if (!finished || !levelId || levelDone.current) return;
    levelDone.current = true;
    completeLevel(levelId);
  }, [finished, levelId, completeLevel]);

  const copy = phase === 'inhale' ? BREATHING.inhale : BREATHING.exhale;
  useAutoNarration(finished ? '¡Lo lograste! Respiraste con Tico un minuto.' : copy.narration, phaseKey);

  const togglePause = () => {
    setPaused((p) => {
      if (!p) speech.stop();
      return !p;
    });
  };

  const restart = () => {
    setPaused(false);
    dispatch({ type: 'restart' });
  };

  const circleStyle = {
    '--breath-min': '0.8',
    '--breath-max': '1.08',
    animationName: phase === 'inhale' ? 'breathe-in' : 'breathe-out',
    animationDuration: `${duration}ms`,
    animationPlayState: paused ? 'paused' : 'running',
  } as CSSProperties;

  return (
    <div className="breathing" style={{ backgroundImage: `url(${ASSETS.backgrounds.laguna})` }}>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <div className="breathing__inner">
        <header className="breathing__bar">
          <span className="chip chip--green">
            <Leaf size={14} aria-hidden="true" /> {placeName}
          </span>
          <p className="breathing__name">{level ? `Nivel ${level.number} · ${level.title}` : 'Respira conmigo'}</p>
          <div className="breathing__controls">
            {!finished && (
              <Button variant="secondary" onClick={togglePause} aria-pressed={paused}>
                {paused ? 'Reanudar' : 'Pausa'}
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate(level ? '/mapa' : '/inicio')}>
              Salir
            </Button>
          </div>
        </header>

        <main id="contenido" className="breathing__main" tabIndex={-1}>
          {finished ? (
            <section className="breathing__done card anim-pop" aria-live="polite">
              <Mascot pose="celebrando" size={150} edgeColor="#e5b94c" />
              <h1>¡Lo lograste!</h1>
              <p>Respiraste con Tico 1 minuto. ¿Cómo te sientes ahora?</p>
              <div className="breathing__done-actions">
                {level ? (
                  <Button variant="primary" size="lg" onClick={() => navigate('/nivel-completado')}>
                    ¡Ver mi premio!
                  </Button>
                ) : (
                  <Button variant="primary" size="lg" onClick={() => navigate('/inicio')}>
                    Volver al inicio
                  </Button>
                )}
                <Button variant="secondary" size="lg" onClick={restart}>
                  Respirar otra vez
                </Button>
              </div>
            </section>
          ) : (
            <>
              <div className="breathing__prompt card" aria-live="polite">
                <h1>{paused ? 'Pausa' : copy.title}</h1>
                <p>{paused ? 'Cuando quieras, pulsa «Reanudar».' : copy.subtitle}</p>
              </div>

              <div className="breath-circle" aria-hidden="true">
                <div key={phaseKey} className="breath-circle__ring" style={circleStyle}>
                  <Mascot pose="respirando" size={260} ring={10} edgeColor="transparent" decorative />
                </div>
              </div>

              <div className="breathing__footer">
                <Caption speaker="Tico" text={copy.narration} />
                <div className="breath-dots chip">
                  <span className="breath-dots__list" aria-hidden="true">
                    {Array.from({ length: BREATHING.totalBreaths }, (_, i) => (
                      <span
                        key={i}
                        className={`breath-dot ${
                          i + 1 < breath ? 'breath-dot--done' : i + 1 === breath ? 'breath-dot--current' : ''
                        }`}
                      />
                    ))}
                  </span>
                  Respiración {breath} de {BREATHING.totalBreaths} · dura 1 minuto
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
