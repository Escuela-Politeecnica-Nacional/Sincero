import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps {
  title: string;
  children?: ReactNode;
  actions: ReactNode;
  onClose: () => void;
  media?: ReactNode;
}

/** Ventana modal accesible: foco inicial, Esc para cerrar y foco atrapado. */
export function Modal({ title, children, actions, onClose, media }: ModalProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusables = () =>
      Array.from(node?.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])') ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="modal anim-pop" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        {media}
        <h2 id={titleId}>{title}</h2>
        {children}
        <div className="modal__actions">{actions}</div>
      </div>
    </div>
  );
}
