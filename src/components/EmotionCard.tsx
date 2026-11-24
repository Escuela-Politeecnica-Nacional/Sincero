import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Emotion } from '../types';

export type EmotionCardState = 'idle' | 'correct' | 'chosen' | 'dimmed';

interface EmotionCardProps {
  emotion: Emotion;
  state?: EmotionCardState;
  onSelect?: () => void;
  disabled?: boolean;
  size?: 'md' | 'sm';
}

/**
 * Tarjeta de carita. El estado nunca se comunica solo con color:
 * «¡Correcto!» lleva ícono y texto; «Tu elección» lleva borde punteado y texto.
 */
export function EmotionCard({ emotion, state = 'idle', onSelect, disabled, size = 'md' }: EmotionCardProps) {
  const style = { '--emotion-color': emotion.color } as CSSProperties;
  const statusText = state === 'correct' ? '¡Correcto!' : state === 'chosen' ? 'Tu elección' : null;

  const content = (
    <>
      <span className="emotion-card__face">
        {emotion.image && <img src={emotion.image} alt="" draggable={false} />}
      </span>
      <span className="emotion-card__text">
        <span className="emotion-card__name">{emotion.name}</span>
        {statusText ? (
          <span className={`emotion-card__status emotion-card__status--${state}`}>
            {state === 'correct' && <Check size={14} strokeWidth={3} aria-hidden="true" />}
            {statusText}
          </span>
        ) : (
          <span className="emotion-card__line" aria-hidden="true" />
        )}
      </span>
    </>
  );

  const className = ['emotion-card', `emotion-card--${state}`, size === 'sm' && 'emotion-card--sm']
    .filter(Boolean)
    .join(' ');

  if (!onSelect) {
    return (
      <div className={className} style={style}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={state === 'correct' || state === 'chosen'}
      aria-label={statusText ? `${emotion.name}, ${statusText}` : emotion.name}
    >
      {content}
    </button>
  );
}
