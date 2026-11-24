import { Lock } from 'lucide-react';
import type { Badge } from '../types';

interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
}

export function BadgeCard({ badge, unlocked }: BadgeCardProps) {
  return (
    <li className={`badge-card ${unlocked ? 'badge-card--unlocked' : 'badge-card--locked'}`}>
      <img className="badge-card__image" src={badge.image} alt="" draggable={false} />
      {!unlocked && (
        <span className="chip chip--muted badge-card__lock">
          <Lock size={14} aria-hidden="true" /> Por descubrir
        </span>
      )}
      <h3 className="badge-card__name">{badge.name}</h3>
      <p className="badge-card__desc">
        {unlocked ? badge.description : badge.lockedHint}
      </p>
      <span className="visually-hidden">{unlocked ? 'Insignia ganada.' : 'Insignia bloqueada.'}</span>
    </li>
  );
}
