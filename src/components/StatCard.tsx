import type { CSSProperties, ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  color: string;
  edge: string;
}

export function StatCard({ icon, value, label, color, edge }: StatCardProps) {
  return (
    <li className="stat-card card" style={{ '--stat-color': color, '--stat-edge': edge } as CSSProperties}>
      <span className="stat-card__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="stat-card__text">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
      </span>
    </li>
  );
}
