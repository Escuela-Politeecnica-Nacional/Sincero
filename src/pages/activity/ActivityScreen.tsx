import { startTransition, useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, Heart, Lightbulb, ScanFace, Smile, Star } from 'lucide-react';
import { PageShell } from '../../components/PageShell';
import { ActivityHeader } from '../../components/ActivityHeader';
import { Button, ButtonLink } from '../../components/Button';
import { Caption } from '../../components/Caption';
import { ChoiceCard } from '../../components/ChoiceCard';
import { EmotionCard, type EmotionCardState } from '../../components/EmotionCard';
import { FeedbackPanel } from '../../components/FeedbackPanel';
import { ListenButton } from '../../components/ListenButton';
import { Mascot } from '../../components/Mascot';
import { Modal } from '../../components/Modal';
import { useApp, useAutoNarration } from '../../context/AppContext';
import { EMOTIONS, PLAYABLE_EMOTIONS } from '../../data/mockData';
import { ISLAND_BY_ID } from '../../data/levels';
import { answerKey } from '../../hooks/useProgress';
import type { Hint, Question } from '../../types';

export type ActivityMode = 'identify' | 'correct' | 'hint';

const HINT_ICON: Record<Hint['kind'], JSX.Element> = {
  ojos: <Eye size={16} aria-hidden="true" />,
  boca: <Smile size={16} aria-hidden="true" />,
  cejas: <ScanFace size={16} aria-hidden="true" />,
  idea: <Lightbulb size={16} aria-hidden="true" />,
  corazon: <Heart size={16} aria-hidden="true" />,
};

const promptOf = (q: Question) =>
  q.kind === 'choice' ? q.prompt : q.prompt ?? `¿Cómo crees que se siente ${q.character}?`;

const instructionOf = (q: Question) =>
  q.kind === 'emotion'
    ? 'Elige una carita. Tómate todo el tiempo que necesites.'
    : 'Elige una respuesta. Tómate todo el tiempo que necesites.';

/**
 * Pantalla de actividad de cualquier nivel con preguntas. La misma
 * estructura se usa en tres rutas:
 *  - /actividad/identificar → elegir una respuesta
 *  - /actividad/correcta    → retroalimentación positiva
 *  - /actividad/pista       → respuesta no esperada o pista pedida
 */
export function ActivityScreen({ mode }: { mode: ActivityMode }) {
  const navigate = useNavigate();
  const { progress, a11y } = useApp();
  const { question, questionIndex, totalQuestions, activityLevel, selectAnswer, clearSelection, nextQuestion } =
    progress;
  const { selected, lastAward } = progress.progress.activity;
  const [paused, setPaused] = useState(false);
  const closePause = useCallback(() => setPaused(false), []);

  const questionText = question ? promptOf(question) : '';
  const narration =
    question && mode === 'identify' ? `${question.situation} ${questionText} ${instructionOf(question)}` : null;
  useAutoNarration(narration, question ? `actividad-${question.id}` : undefined);

  // Protección de rutas: cada estado solo se ve si corresponde.
  if (!question || !progress.isLevelUnlocked(activityLevel.id)) return <Navigate to="/mapa" replace />;
  const correctKey = answerKey(question);
  const isCorrectSelection = selected === correctKey;
  if (mode === 'correct' && !isCorrectSelection) return <Navigate to="/actividad/identificar" replace />;
  if (mode === 'hint' && isCorrectSelection) return <Navigate to="/actividad/correcta" replace />;

  const island = ISLAND_BY_ID[activityLevel.island];

  /**
   * El cambio de estado y el de ruta van en la misma transición para que
   * React los aplique juntos (React Router navega dentro de startTransition).
   */
  const choose = (answer: string) => {
    startTransition(() => {
      const result = selectAnswer(answer);
      a11y.sound(result === 'correct' ? 'correct' : 'incorrect');
      navigate(result === 'correct' ? '/actividad/correcta' : '/actividad/pista');
    });
  };

  const cardState = (key: string): EmotionCardState => {
    if (mode === 'correct') return key === correctKey ? 'correct' : 'idle';
    if (mode === 'hint' && key === selected) return 'chosen';
    return 'idle';
  };

  const goNext = () => {
    startTransition(() => {
      const result = nextQuestion();
      navigate(result === 'level-complete' ? '/nivel-completado' : '/actividad/identificar');
    });
  };

  const tryAgain = () => {
    startTransition(() => {
      clearSelection();
      navigate('/actividad/identificar');
    });
  };

  const askHint = () => {
    startTransition(() => {
      clearSelection();
      navigate('/actividad/pista');
    });
  };

  const isEmotion = question.kind === 'emotion';
  const hintTitle = selected
    ? isEmotion
      ? '¡Vamos a observar otra vez! ¿Qué nos dice su carita?'
      : '¡Vamos a pensarlo otra vez!'
    : isEmotion
      ? 'Una pista de Tico: ¿qué nos dice su carita?'
      : 'Una pista de Tico';
  const hintSpeech = `${hintTitle} ${question.hints.map((h) => h.text).join(' ')}`;

  return (
    <PageShell
      withNav={false}
      overlay={
        paused && (
          <Modal
            title="Pausa"
            onClose={closePause}
            media={<Mascot pose="respirando" size={120} edgeColor="#b9c6f2" />}
            actions={
              <>
                <Button variant="primary" size="lg" onClick={closePause}>
                  Seguir jugando
                </Button>
                <ButtonLink to="/actividad/respirar" variant="secondary">
                  Respirar con Tico
                </ButtonLink>
                <ButtonLink to="/mapa" variant="secondary">
                  Volver al mapa
                </ButtonLink>
              </>
            }
          >
            <p>Tómate tu tiempo. Tu avance está guardado y te espera aquí.</p>
          </Modal>
        )
      }
    >
      <ActivityHeader
        title={`${island.name} · Nivel ${activityLevel.number}`}
        current={questionIndex + 1}
        total={totalQuestions}
        onPause={() => setPaused(true)}
      />

      <div className="activity">
        <section className="scene card" aria-label="Situación">
          <div className={`scene__media scene__media--${question.sceneKind}`}>
            <img src={question.sceneImage} alt={question.sceneAlt} />
          </div>
          <Caption speaker="Narradora" text={question.situation} />
          {!a11y.settings.subtitles && <p className="scene__text">{question.situation}</p>}
          <ListenButton text={question.situation} id={`situacion-${question.id}`} label="Escuchar otra vez" />
        </section>

        <section className="question" aria-labelledby="question-title">
          <div className="question__ask">
            <Mascot pose="lupa" size={96} ring={4} edgeColor="#c4c9e8" imagePosition="40% 30%" />
            <div className="question__bubble card">
              <span className="question__who">Tico pregunta:</span>
              <h1 id="question-title" className="question__title">
                {questionText}
              </h1>
            </div>
          </div>
          <p className="question__instruction" id="question-instruction">
            {instructionOf(question)}
          </p>

          {question.kind === 'emotion' ? (
            <div className="emotion-grid" role="group" aria-labelledby="question-title" aria-describedby="question-instruction">
              {PLAYABLE_EMOTIONS.map((id) => (
                <EmotionCard
                  key={id}
                  emotion={EMOTIONS[id]}
                  state={cardState(id)}
                  disabled={mode === 'correct'}
                  onSelect={() => choose(id)}
                />
              ))}
            </div>
          ) : (
            <div className="choice-list" role="group" aria-labelledby="question-title" aria-describedby="question-instruction">
              {question.options.map((text, i) => (
                <ChoiceCard
                  key={text}
                  index={i}
                  text={text}
                  state={cardState(`opt-${i}`)}
                  disabled={mode === 'correct'}
                  onSelect={() => choose(`opt-${i}`)}
                />
              ))}
            </div>
          )}

          {mode === 'identify' && (
            <div className="question__hint-row">
              <Button variant="secondary" onClick={askHint}>
                Pedir una pista
              </Button>
              <span className="question__hint-note">Las pistas no quitan estrellas.</span>
            </div>
          )}
        </section>
      </div>

      {mode === 'correct' && (
        <FeedbackPanel
          tone="success"
          pose="celebrando"
          title={isEmotion ? '¡Muy bien! Has descubierto cómo se siente.' : '¡Muy bien! Esa es una gran respuesta.'}
          message={question.explanation}
          extra={
            <span className="chip chip--yellow">
              <Star size={14} fill="#f4a90f" color="#f4a90f" aria-hidden="true" />
              {lastAward === 'repeat' ? 'Esta estrella ya está en tu colección' : '+1 estrella para tu colección'}
            </span>
          }
          actions={
            <>
              <Button variant="primary" size="lg" onClick={goNext}>
                {questionIndex + 1 >= totalQuestions ? 'Terminar nivel' : 'Siguiente pregunta'}
              </Button>
              <ListenButton text={question.explanation} id={`explicacion-${question.id}`} label="Escuchar explicación" />
            </>
          }
        />
      )}

      {mode === 'hint' && (
        <FeedbackPanel
          tone="hint"
          pose="lupa"
          title={hintTitle}
          message="Mira con calma estas pistas y vuelve a elegir:"
          extra={
            <ul className="hint-chips">
              {question.hints.map((hint) => (
                <li key={hint.text} className="chip">
                  {HINT_ICON[hint.kind]} {hint.text}
                </li>
              ))}
            </ul>
          }
          actions={
            <>
              <Button variant="accent" size="lg" onClick={tryAgain}>
                {selected ? 'Intentar otra vez' : isEmotion ? 'Elegir una carita' : 'Elegir una respuesta'}
              </Button>
              <ListenButton text={hintSpeech} id={`pista-${question.id}`} label="Escuchar la pista" />
            </>
          }
        />
      )}
    </PageShell>
  );
}
