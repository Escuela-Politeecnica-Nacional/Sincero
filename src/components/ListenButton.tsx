import { Square, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './Button';

interface ListenButtonProps {
  /** Texto que Tico leerá en voz alta. */
  text: string;
  /** Identificador estable para saber si este botón está sonando. */
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  className?: string;
  showIcon?: boolean;
}

/**
 * Botón «Escuchar…». Alterna entre reproducir y detener. Si el navegador
 * no tiene síntesis de voz, avisa y el texto sigue visible en pantalla.
 */
export function ListenButton({
  text,
  id,
  label,
  variant = 'secondary',
  size,
  block,
  className,
  showIcon = false,
}: ListenButtonProps) {
  const { speech } = useApp();
  const active = speech.speakingId === id;

  if (!speech.supported) {
    return (
      <Button
        variant={variant}
        size={size}
        block={block}
        className={className}
        aria-disabled="true"
        title="Tu navegador no puede leer en voz alta. El texto está en pantalla."
        onClick={(e) => e.preventDefault()}
      >
        {label} (sin voz)
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      block={block}
      className={className}
      aria-pressed={active}
      icon={showIcon ? active ? <Square size={18} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" /> : undefined}
      onClick={() => (active ? speech.stop() : speech.speak(text, id))}
    >
      {active ? 'Detener' : label}
    </Button>
  );
}
