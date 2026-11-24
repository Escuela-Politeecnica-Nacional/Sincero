interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

/** Barra de progreso continua (por ejemplo, niveles del mundo). */
export function ProgressBar({ value, max, label, className }: ProgressBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className={['progress', className].filter(Boolean).join(' ')}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} de ${max}`}
    >
      <div className="progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

interface SegmentedProgressProps {
  current: number;
  total: number;
  label: string;
}

/** Barra por pasos: completados en verde, actual en azul. */
export function SegmentedProgress({ current, total, label }: SegmentedProgressProps) {
  return (
    <div
      className="segments"
      role="progressbar"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-valuetext={`Actividad ${current} de ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const state = step < current ? 'done' : step === current ? 'current' : 'todo';
        return <span key={step} className={`segments__bar segments__bar--${state}`} aria-hidden="true" />;
      })}
      <span className="segments__label" aria-hidden="true">
        {current} de {total}
      </span>
    </div>
  );
}
