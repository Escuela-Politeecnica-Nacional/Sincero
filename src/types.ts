export type EmotionId = 'alegria' | 'tristeza' | 'enojo' | 'miedo' | 'calma' | 'sorpresa';

/** Emociones que el niño puede elegir en las actividades. */
export type PlayableEmotionId = Extract<EmotionId, 'alegria' | 'tristeza' | 'enojo' | 'miedo'>;

export interface Emotion {
  id: EmotionId;
  name: string;
  /** Ruta de la carita ilustrada (solo las emociones jugables la tienen). */
  image?: string;
  /** Color de acento de la tarjeta. */
  color: string;
}

export interface Hint {
  kind: 'ojos' | 'boca' | 'cejas' | 'idea' | 'corazon';
  text: string;
}

interface BaseQuestion {
  id: string;
  /** Texto que narra la situación. */
  situation: string;
  sceneImage: string;
  sceneAlt: string;
  /** "scene" = ilustración completa; "portrait" = imagen en círculo sobre fondo suave. */
  sceneKind: 'scene' | 'portrait';
  explanation: string;
  hints: Hint[];
}

/** Elegir la carita que corresponde a la situación. */
export interface EmotionQuestion extends BaseQuestion {
  kind: 'emotion';
  character: string;
  correct: PlayableEmotionId;
  /** Pregunta personalizada (por defecto: «¿Cómo crees que se siente…?»). */
  prompt?: string;
}

/** Elegir una respuesta de texto entre tres. */
export interface ChoiceQuestion extends BaseQuestion {
  kind: 'choice';
  prompt: string;
  /** Opciones en el orden en que se muestran. */
  options: string[];
  /** Índice de la opción correcta dentro de `options`. */
  correct: number;
}

export type Question = EmotionQuestion | ChoiceQuestion;

export interface Level {
  /** Identificador «isla-nivel», por ejemplo «1-3». */
  id: string;
  island: number;
  number: number;
  title: string;
  kind: 'questions' | 'breathing';
  questions: Question[];
}

export interface Island {
  id: number;
  name: string;
  /** Artículo del nombre, para escribir «el Valle», «al Bosque», «las Islas». */
  article: 'el' | 'la' | 'las';
  tagline: string;
  /** Posición del marcador sobre el mapa (porcentaje). */
  marker: { x: number; y: number };
  /** Encuadre de la miniatura en el panel lateral (object-position). */
  thumbPosition: string;
  levels: Level[];
  /** Insignia que se gana al llegar a esta isla. */
  arrivalBadge?: BadgeId;
}

export type BadgeId =
  | 'primera-estrella'
  | 'corazon-amable'
  | 'respiro-tranquilo'
  | 'detective-caritas'
  | 'ola-calma'
  | 'mano-amiga';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  lockedHint: string;
  image: string;
}

export interface ProgressState {
  stars: number;
  /** Ids de niveles completados («1-1», «1-2», …). */
  completedLevels: string[];
  unlockedBadges: BadgeId[];
  knownEmotions: EmotionId[];
  /** Preguntas resueltas al menos una vez (para no duplicar estrellas). */
  solvedQuestions: string[];
  activity: {
    levelId: string;
    questionIndex: number;
    /** Respuesta elegida: id de emoción u «opt-N» para preguntas de texto. */
    selected: string | null;
    /** Estrella ganada en la última respuesta correcta. */
    lastAward: 'new' | 'repeat' | null;
  };
  /** Último nivel completado (habilita la pantalla de celebración). */
  lastCompletedLevel: string | null;
  /** Insignia ganada al completar el último nivel. */
  lastBadge: BadgeId | null;
  /** Isla que se desbloqueó al completar el último nivel. */
  lastUnlockedIsland: number | null;
}

export type TextSize = 'pequeno' | 'mediano' | 'grande';

export interface AccessibilitySettings {
  textSize: TextSize;
  narration: boolean;
  sounds: boolean;
  subtitles: boolean;
  calmMode: boolean;
  animations: boolean;
  highContrast: boolean;
}
