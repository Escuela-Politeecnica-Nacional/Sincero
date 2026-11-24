import type { CSSProperties } from 'react';
import { Star } from 'lucide-react';

interface StarCoinProps {
  filled?: boolean;
  size?: number;
  className?: string;
}

export function StarCoin({ filled = true, size = 34, className }: StarCoinProps) {
  return (
    <span
      className={['star-coin', !filled && 'star-coin--empty', className].filter(Boolean).join(' ')}
      style={{ '--coin-size': `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      <Star size={size * 0.5} fill="currentColor" strokeWidth={0} />
    </span>
  );
}
