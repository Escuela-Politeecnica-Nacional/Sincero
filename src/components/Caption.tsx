import { Captions } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CaptionProps {
  speaker: string;
  text: string;
  className?: string;
  /** Mostrar aunque los subtítulos estén desactivados (vista previa). */
  force?: boolean;
}

/** Subtítulo de lo que narra Tico o la narradora. */
export function Caption({ speaker, text, className, force = false }: CaptionProps) {
  const { a11y } = useApp();
  if (!a11y.settings.subtitles && !force) return null;
  return (
    <p className={['caption', className].filter(Boolean).join(' ')}>
      <Captions size={20} aria-hidden="true" />
      <span>
        <span className="visually-hidden">Subtítulo. </span>
        {speaker}: «{text}»
      </span>
    </p>
  );
}
