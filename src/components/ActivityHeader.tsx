import { SegmentedProgress } from './ProgressBar';
import { Button, ButtonLink } from './Button';

interface ActivityHeaderProps {
  title: string;
  current: number;
  total: number;
  onPause: () => void;
}

/** Barra superior de las actividades: volver, avance y pausa. */
export function ActivityHeader({ title, current, total, onPause }: ActivityHeaderProps) {
  return (
    <header className="activity-header">
      <ButtonLink to="/mapa" variant="secondary" className="activity-header__back">
        Volver al mapa
      </ButtonLink>
      <div className="activity-header__center">
        <p className="activity-header__title">{title}</p>
        <SegmentedProgress current={current} total={total} label={`Avance de ${title}`} />
      </div>
      <Button variant="secondary" onClick={onPause} className="activity-header__pause">
        Pausa
      </Button>
    </header>
  );
}
