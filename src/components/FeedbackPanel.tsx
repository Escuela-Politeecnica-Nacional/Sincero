import { useEffect, useRef, type ReactNode } from 'react';
import { Mascot, type MascotPose } from './Mascot';

interface FeedbackPanelProps {
  tone: 'success' | 'hint';
  pose: MascotPose;
  title: string;
  message: string;
  extra?: ReactNode;
  actions: ReactNode;
}

/**
 * Panel inferior de retroalimentación. Recibe el foco al aparecer para
 * que lectores de pantalla y teclado lleguen directo al mensaje.
 */
export function FeedbackPanel({ tone, pose, title, message, extra, actions }: FeedbackPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [title, message]);

  return (
    <section className={`feedback feedback--${tone} anim-pop`} aria-live="polite">
      <Mascot
        pose={pose}
        size={112}
        ring={5}
        edgeColor={tone === 'success' ? '#7fcf9f' : '#e5b94c'}
        className="feedback__mascot"
      />
      <div className="feedback__body">
        <h2 ref={headingRef} tabIndex={-1} className="feedback__title">
          {title}
        </h2>
        <p className="feedback__message">{message}</p>
        {extra && <div className="feedback__extra">{extra}</div>}
      </div>
      <div className="feedback__actions">{actions}</div>
    </section>
  );
}
