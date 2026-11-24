import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { EmotionCardState } from './EmotionCard';

const COLORS = ['#3566d6', '#7a4cc8', '#1f9a8a'];
const LETTERS = ['A', 'B', 'C', 'D'];

interface ChoiceCardProps {
  index: number;
  text: string;
  state?: EmotionCardState;
  onSelect: () => void;
  disabled?: boolean;
}

/**
 * Opción de texto de las actividades. Igual que las caritas, el estado se
 * comunica con texto e ícono, no solo con color.
 */
export function ChoiceCard({ index, text, state = 'idle', onSelect, disabled }: ChoiceCardProps) {
  const statusText = state === 'correct' ? '¡Correcto!' : state === 'chosen' ? 'Tu elección' : null;
  return (
    <button
      type="button"
      className={`emotion-card choice-card emotion-card--${state}`}
      style={{ '--emotion-color': COLORS[index % COLORS.length] } as CSSProperties}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={state === 'correct' || state === 'chosen'}
      aria-label={statusText ? `${text}, ${statusText}` : text}
    >
      <span className="choice-card__letter" aria-hidden="true">
        {LETTERS[index]}
      </span>
      <span className="emotion-card__text">
        <span className="choice-card__text">{text}</span>
        {statusText && (
          <span className={`emotion-card__status emotion-card__status--${state}`}>
            {state === 'correct' && <Check size={14} strokeWidth={3} aria-hidden="true" />}
            {statusText}
          </span>
        )}
      </span>
    </button>
  );
}
