import type { AccessibilitySettings, Badge, Emotion, EmotionId, PlayableEmotionId, ProgressState } from '../types';

/* ------------------------------------------------------------------ */
/* Recursos gráficos                                                   */
/* ------------------------------------------------------------------ */

export const ASSETS = {
  tico: {
    logo: '/assets/tico/tico-logo.png',
    saludando: '/assets/tico/tico-saludando.jpg',
    celebrando: '/assets/tico/tico-celebrando.jpg',
    respirando: '/assets/tico/tico-respirando.jpg',
    lupa: '/assets/tico/tico-lupa.jpg',
  },
  maps: {
    islas: '/assets/maps/mapa-islas.jpg',
    islasMini: '/assets/maps/mapa-islas-mini.jpg',
  },
  characters: {
    lucas: '/assets/characters/lucas-parque.jpg',
  },
  backgrounds: {
    laguna: '/assets/backgrounds/laguna-calma.jpg',
  },
} as const;

/* ------------------------------------------------------------------ */
/* Personaje y textos generales                                        */
/* ------------------------------------------------------------------ */

export const PLAYER = {
  name: 'Sofía',
  initial: 'S',
  title: 'Detective de emociones',
};

export const TICO_GREETING =
  'Soy Tico. Hoy vamos a descubrir cómo se sienten nuestros amigos. ¿Me acompañas?';

/* ------------------------------------------------------------------ */
/* Emociones                                                           */
/* ------------------------------------------------------------------ */

export const EMOTIONS: Record<EmotionId, Emotion> = {
  alegria: { id: 'alegria', name: 'Alegría', image: '/assets/emotions/alegria.png', color: '#d4a017' },
  tristeza: { id: 'tristeza', name: 'Tristeza', image: '/assets/emotions/tristeza.png', color: '#3566d6' },
  enojo: { id: 'enojo', name: 'Enojo', image: '/assets/emotions/enojo.png', color: '#c63c35' },
  miedo: { id: 'miedo', name: 'Miedo', image: '/assets/emotions/miedo.png', color: '#7a4cc8' },
  calma: { id: 'calma', name: 'Calma', color: '#3fb07a' },
  sorpresa: { id: 'sorpresa', name: 'Sorpresa', color: '#f08a24' },
};

/** Orden de las caritas en las actividades (igual que en el mockup). */
export const PLAYABLE_EMOTIONS: PlayableEmotionId[] = ['alegria', 'tristeza', 'enojo', 'miedo'];

/** Orden de las caritas en «Mis logros». */
export const ALL_EMOTIONS: EmotionId[] = ['alegria', 'tristeza', 'enojo', 'miedo', 'calma', 'sorpresa'];

/* ------------------------------------------------------------------ */
/* Insignias                                                           */
/* ------------------------------------------------------------------ */

export const BADGES: Badge[] = [
  {
    id: 'primera-estrella',
    name: 'Primera estrella',
    description: 'Completaste tu primer nivel.',
    lockedHint: 'Completa tu primer nivel.',
    image: '/assets/badges/primera-estrella.png',
  },
  {
    id: 'corazon-amable',
    name: 'Corazón amable',
    description: 'Ayudaste a Tico a entender a un amigo.',
    lockedHint: 'Ayuda a Tico a entender a un amigo.',
    image: '/assets/badges/corazon-amable.png',
  },
  {
    id: 'respiro-tranquilo',
    name: 'Respiro tranquilo',
    description: 'Respiraste con Tico 1 minuto.',
    lockedHint: 'Respira con Tico 1 minuto.',
    image: '/assets/badges/respiro-tranquilo.png',
  },
  {
    id: 'detective-caritas',
    name: 'Detective de caritas',
    description: 'Reconociste 4 emociones.',
    lockedHint: 'Por descubrir: completa el nivel 3.',
    image: '/assets/badges/detective-caritas.png',
  },
  {
    id: 'ola-calma',
    name: 'Ola de calma',
    description: 'Llegaste a la Laguna de la Calma.',
    lockedHint: 'Por descubrir: llega a la Laguna de la Calma.',
    image: '/assets/badges/ola-calma.png',
  },
  {
    id: 'mano-amiga',
    name: 'Mano amiga',
    description: 'Visitaste las Islas de los Amigos.',
    lockedHint: 'Por descubrir: visita las Islas de los Amigos.',
    image: '/assets/badges/mano-amiga.png',
  },
];

/* ------------------------------------------------------------------ */
/* Respiración guiada                                                  */
/* ------------------------------------------------------------------ */

/** 6 respiraciones × (4 s + 6 s) = 1 minuto. */
export const BREATHING = {
  totalBreaths: 6,
  inhaleMs: 4000,
  exhaleMs: 6000,
  inhale: {
    title: 'Inhala lentamente...',
    subtitle: 'Llena tu pancita como un globo, igual que Tico.',
    narration: 'Inhala lentamente... uno, dos, tres, cuatro.',
  },
  exhale: {
    title: 'Ahora suelta el aire...',
    subtitle: 'Despacito, como si soplaras una vela sin apagarla.',
    narration: 'Ahora suelta el aire... Muy bien, vamos poco a poco.',
  },
};

/* ------------------------------------------------------------------ */
/* Estado inicial                                                      */
/* ------------------------------------------------------------------ */

/**
 * Estado de partida de Sofía, tomado de los mockups: niveles 1 y 2 de la
 * Isla de los Rostros completados, 7 estrellas y la primera situación del
 * nivel 3 resuelta (la actividad continúa en «2 de 4», con Lucas).
 */
export const INITIAL_PROGRESS: ProgressState = {
  stars: 7,
  completedLevels: ['1-1', '1-2'],
  unlockedBadges: ['primera-estrella', 'corazon-amable', 'respiro-tranquilo'],
  knownEmotions: ['alegria', 'tristeza', 'enojo', 'miedo'],
  solvedQuestions: ['n3-valentina'],
  activity: { levelId: '1-3', questionIndex: 1, selected: null, lastAward: null },
  lastCompletedLevel: null,
  lastBadge: null,
  lastUnlockedIsland: null,
};

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: 'pequeno',
  narration: true,
  sounds: true,
  subtitles: true,
  calmMode: false,
  animations: true,
  highContrast: false,
};

export const STORAGE_KEYS = {
  progress: 'sincero:progreso:v2',
  /** Formato anterior (niveles numéricos de la isla 1); se migra al cargar. */
  legacyProgress: 'sincero:progreso:v1',
  settings: 'sincero:accesibilidad:v1',
} as const;
