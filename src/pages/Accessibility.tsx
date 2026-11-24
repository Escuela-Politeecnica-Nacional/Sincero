import type { ReactNode } from 'react';
import { Bell, Captions, Contrast, Eye, Leaf, Type, Volume2, Waves } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { ButtonLink } from '../components/Button';
import { Caption } from '../components/Caption';
import { EmotionCard } from '../components/EmotionCard';
import { Mascot } from '../components/Mascot';
import { Toggle } from '../components/Toggle';
import { useApp } from '../context/AppContext';
import { EMOTIONS } from '../data/mockData';
import { playSound } from '../lib/sounds';
import type { ToggleKey } from '../hooks/useAccessibility';
import type { AccessibilitySettings, TextSize } from '../types';

interface ToggleOption {
  key: ToggleKey;
  title: string;
  description: string;
  icon: ReactNode;
  tone: string;
}

const TOGGLES: ToggleOption[] = [
  {
    key: 'narration',
    title: 'Narración de Tico',
    description: 'Tico lee en voz alta las instrucciones y preguntas.',
    icon: <Volume2 size={20} />,
    tone: 'yellow',
  },
  {
    key: 'sounds',
    title: 'Sonidos',
    description: 'Campanitas suaves al acertar y un sonido amable al intentarlo otra vez.',
    icon: <Bell size={20} />,
    tone: 'orange',
  },
  {
    key: 'subtitles',
    title: 'Subtítulos y transcripción',
    description: 'Activados por defecto en todos los audios.',
    icon: <Captions size={20} />,
    tone: 'blue',
  },
  {
    key: 'calmMode',
    title: 'Modo calma',
    description: 'Colores más suaves, sin sonidos de premio ni animaciones.',
    icon: <Leaf size={20} />,
    tone: 'green',
  },
  {
    key: 'animations',
    title: 'Animaciones',
    description: 'Movimientos lentos y suaves. Nunca parpadean.',
    icon: <Waves size={20} />,
    tone: 'pink',
  },
  {
    key: 'highContrast',
    title: 'Alto contraste',
    description: 'Bordes y textos más oscuros para ver mejor.',
    icon: <Contrast size={20} />,
    tone: 'indigo',
  },
];

const SIZES: { value: TextSize; label: string }[] = [
  { value: 'pequeno', label: 'Pequeño' },
  { value: 'mediano', label: 'Mediano' },
  { value: 'grande', label: 'Grande' },
];

/** Pantalla 9 · Accesibilidad (/accesibilidad). Se guarda en LocalStorage. */
export default function Accessibility() {
  const { a11y } = useApp();
  const { settings } = a11y;

  return (
    <PageShell>
      <header className="page-head page-head--plain">
        <div>
          <h1 className="page-title">Accesibilidad</h1>
          <p className="page-subtitle">Ajusta Sincero para que te resulte cómodo. Los cambios se guardan solos.</p>
        </div>
      </header>

      <div className="a11y-layout">
        <ul className="a11y-list">
          <li className="a11y-row card">
            <span className="a11y-row__icon a11y-row__icon--indigo" aria-hidden="true">
              <Type size={20} />
            </span>
            <div className="a11y-row__text">
              <h2 id="opt-text-size">Tamaño del texto</h2>
              <p id="opt-text-size-desc">Agranda letras y botones. También funciona con zoom del navegador al 200 %.</p>
            </div>
            <div className="size-picker" role="radiogroup" aria-labelledby="opt-text-size" aria-describedby="opt-text-size-desc">
              {SIZES.map((size, i) => (
                <button
                  key={size.value}
                  type="button"
                  role="radio"
                  aria-checked={settings.textSize === size.value}
                  aria-label={size.label}
                  className={`size-picker__option size-picker__option--${i}`}
                  onClick={() => a11y.update('textSize', size.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      const next = SIZES[(i + (e.key === 'ArrowRight' ? 1 : SIZES.length - 1)) % SIZES.length];
                      a11y.update('textSize', next.value);
                      const group = e.currentTarget.parentElement;
                      (group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[SIZES.indexOf(next)])?.focus();
                    }
                  }}
                  tabIndex={settings.textSize === size.value ? 0 : -1}
                >
                  A
                </button>
              ))}
            </div>
          </li>

          {TOGGLES.map((opt) => (
            <li key={opt.key} className="a11y-row card">
              <span className={`a11y-row__icon a11y-row__icon--${opt.tone}`} aria-hidden="true">
                {opt.icon}
              </span>
              <div className="a11y-row__text">
                <h2 id={`opt-${opt.key}`}>{opt.title}</h2>
                <p id={`opt-${opt.key}-desc`}>{opt.description}</p>
              </div>
              <Toggle
                checked={settings[opt.key as keyof AccessibilitySettings] as boolean}
                onChange={() => {
                  a11y.toggle(opt.key);
                  // Al activar los sonidos se escucha una muestra.
                  if (opt.key === 'sounds' && !settings.sounds && !settings.calmMode) playSound('correct');
                }}
                labelledBy={`opt-${opt.key}`}
                describedBy={`opt-${opt.key}-desc`}
              />
            </li>
          ))}
        </ul>

        <aside className="preview card" aria-labelledby="preview-title">
          <span className="chip chip--brand" id="preview-title">
            <Eye size={16} aria-hidden="true" /> Vista previa
          </span>
          <Mascot
            pose="respirando"
            size={150}
            ring={6}
            edgeColor="#c4cbf3"
            className={settings.animations && !settings.calmMode ? 'anim-float' : undefined}
            decorative
          />
          <p className="preview__question">¿Cómo se siente Lucas?</p>
          <EmotionCard emotion={EMOTIONS.tristeza} size="sm" />
          <Caption speaker="Tico" text="¿Cómo se siente Lucas?" />
          {!settings.subtitles && <p className="preview__off">Subtítulos desactivados</p>}
          <p className="preview__summary">
            Narración: {settings.narration ? 'Sí' : 'No'} · Sonidos:{' '}
            {settings.sounds && !settings.calmMode ? 'Sí' : 'No'} · Modo calma: {settings.calmMode ? 'Sí' : 'No'}
          </p>
          <ButtonLink to="/inicio" variant="accent" size="lg" block>
            Listo, volver al inicio
          </ButtonLink>
        </aside>
      </div>
    </PageShell>
  );
}
