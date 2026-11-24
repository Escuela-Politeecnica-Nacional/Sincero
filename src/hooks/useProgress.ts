import { useCallback, useMemo } from 'react';
import { INITIAL_PROGRESS, STORAGE_KEYS } from '../data/mockData';
import { ALL_LEVELS, ISLANDS, ISLAND_BY_ID, LEVEL_BADGES, LEVEL_BY_ID } from '../data/levels';
import type { BadgeId, Island, Level, ProgressState, Question } from '../types';
import { useLocalStorage } from './useLocalStorage';

export type AnswerResult = 'correct' | 'incorrect';
export type NextResult = 'next' | 'level-complete';
export type LevelStatus = 'completed' | 'current' | 'locked';

const unique = <T,>(list: T[]) => Array.from(new Set(list));

/** Respuesta correcta de una pregunta, en el mismo formato que `selected`. */
export const answerKey = (q: Question) => (q.kind === 'emotion' ? q.correct : `opt-${q.correct}`);

function mergeProgress(stored: unknown): ProgressState {
  if (!stored || typeof stored !== 'object') return INITIAL_PROGRESS;
  const s = stored as Partial<ProgressState>;
  const merged: ProgressState = {
    ...INITIAL_PROGRESS,
    ...s,
    activity: { ...INITIAL_PROGRESS.activity, ...(s.activity ?? {}) },
  };
  // Datos inconsistentes (por ejemplo, un nivel que ya no existe): se corrigen.
  if (!LEVEL_BY_ID[merged.activity.levelId]) merged.activity = INITIAL_PROGRESS.activity;
  merged.completedLevels = merged.completedLevels.filter((id) => LEVEL_BY_ID[id]);
  return merged;
}

/** Convierte el progreso de la versión anterior (niveles 1..5 de la isla 1). */
function readLegacy(): ProgressState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.legacyProgress);
    if (!raw) return null;
    const old = JSON.parse(raw) as {
      stars?: number;
      completedLevels?: number[];
      unlockedBadges?: BadgeId[];
      solvedQuestions?: string[];
    };
    return mergeProgress({
      stars: old.stars,
      completedLevels: (old.completedLevels ?? []).map((n) => `1-${n}`),
      unlockedBadges: old.unlockedBadges,
      solvedQuestions: old.solvedQuestions,
    });
  } catch {
    return null;
  }
}

const initialProgress = () => readLegacy() ?? INITIAL_PROGRESS;

export function useProgress() {
  const [progress, setProgress, resetProgress] = useLocalStorage<ProgressState>(
    STORAGE_KEYS.progress,
    useMemo(initialProgress, []),
    mergeProgress,
  );

  const { completedLevels } = progress;

  /* ---------------- Niveles e islas ---------------- */

  /** Primer nivel sin completar en el orden del juego (null si terminó todo). */
  const currentLevel: Level | null = useMemo(
    () => ALL_LEVELS.find((l) => !completedLevels.includes(l.id)) ?? null,
    [completedLevels],
  );

  const levelStatus = useCallback(
    (levelId: string): LevelStatus => {
      if (completedLevels.includes(levelId)) return 'completed';
      return currentLevel?.id === levelId ? 'current' : 'locked';
    },
    [completedLevels, currentLevel],
  );

  const isLevelUnlocked = useCallback((levelId: string) => levelStatus(levelId) !== 'locked', [levelStatus]);

  const isIslandUnlocked = useCallback(
    (islandId: number) => {
      const island = ISLAND_BY_ID[islandId];
      return Boolean(island) && island.levels.some((l) => isLevelUnlocked(l.id));
    },
    [isLevelUnlocked],
  );

  const isIslandCompleted = useCallback(
    (islandId: number) => ISLAND_BY_ID[islandId]?.levels.every((l) => completedLevels.includes(l.id)) ?? false,
    [completedLevels],
  );

  const completedInIsland = useCallback(
    (islandId: number) => ISLAND_BY_ID[islandId]?.levels.filter((l) => completedLevels.includes(l.id)).length ?? 0,
    [completedLevels],
  );

  /** Isla donde está Sofía: la del nivel actual (o la última si terminó todo). */
  const currentIsland: Island = currentLevel ? ISLAND_BY_ID[currentLevel.island] : ISLANDS[ISLANDS.length - 1];
  const allCompleted = currentLevel === null;
  const islandsExplored = ISLANDS.filter((i) => isIslandUnlocked(i.id)).length;

  /* ---------------- Actividad en curso ---------------- */

  const activityLevel: Level = LEVEL_BY_ID[progress.activity.levelId] ?? LEVEL_BY_ID['1-3'];
  const questions = activityLevel.questions;
  const questionIndex = Math.min(progress.activity.questionIndex, Math.max(questions.length - 1, 0));
  const question: Question | null = questions[questionIndex] ?? null;

  /** Prepara un nivel desbloqueado para jugarlo desde la primera pregunta. */
  const startLevel = useCallback(
    (levelId: string) => {
      setProgress((prev) => {
        // Si es el mismo nivel y está a medias, se continúa donde quedó.
        const resume = prev.activity.levelId === levelId && !prev.completedLevels.includes(levelId);
        return {
          ...prev,
          activity: {
            levelId,
            questionIndex: resume ? prev.activity.questionIndex : 0,
            selected: null,
            lastAward: null,
          },
        };
      });
    },
    [setProgress],
  );

  /** Marca un nivel como completado, desbloquea lo siguiente y entrega premios. */
  const applyLevelCompletion = (prev: ProgressState, levelId: string): ProgressState => {
    const level = LEVEL_BY_ID[levelId];
    const completed = unique([...prev.completedLevels, levelId]);
    const newBadges: BadgeId[] = [];

    const levelBadge = LEVEL_BADGES[levelId];
    if (levelBadge && !prev.unlockedBadges.includes(levelBadge)) newBadges.push(levelBadge);

    // ¿Se terminó la isla y se abre la siguiente?
    const island = ISLAND_BY_ID[level.island];
    const islandDoneNow =
      island.levels.every((l) => completed.includes(l.id)) &&
      !island.levels.every((l) => prev.completedLevels.includes(l.id));
    const nextIsland = islandDoneNow ? ISLAND_BY_ID[island.id + 1] : undefined;
    if (nextIsland?.arrivalBadge && !prev.unlockedBadges.includes(nextIsland.arrivalBadge)) {
      newBadges.push(nextIsland.arrivalBadge);
    }

    return {
      ...prev,
      completedLevels: completed,
      unlockedBadges: unique([...prev.unlockedBadges, ...newBadges]),
      lastCompletedLevel: levelId,
      lastBadge: newBadges[0] ?? null,
      lastUnlockedIsland: nextIsland?.id ?? null,
      activity: { levelId, questionIndex: 0, selected: null, lastAward: null },
    };
  };

  const selectAnswer = useCallback(
    (answer: string): AnswerResult => {
      if (!question) return 'incorrect';
      const isCorrect = answer === answerKey(question);
      setProgress((prev) => {
        if (!isCorrect) {
          return { ...prev, activity: { ...prev.activity, selected: answer, lastAward: null } };
        }
        const isNew = !prev.solvedQuestions.includes(question.id);
        return {
          ...prev,
          stars: isNew ? prev.stars + 1 : prev.stars,
          solvedQuestions: isNew ? [...prev.solvedQuestions, question.id] : prev.solvedQuestions,
          knownEmotions: question.kind === 'emotion' ? unique([...prev.knownEmotions, question.correct]) : prev.knownEmotions,
          activity: { ...prev.activity, selected: answer, lastAward: isNew ? 'new' : 'repeat' },
        };
      });
      return isCorrect ? 'correct' : 'incorrect';
    },
    [question, setProgress],
  );

  const clearSelection = useCallback(() => {
    setProgress((prev) => ({ ...prev, activity: { ...prev.activity, selected: null, lastAward: null } }));
  }, [setProgress]);

  const nextQuestion = useCallback((): NextResult => {
    const isLast = questionIndex >= questions.length - 1;
    const levelId = activityLevel.id;
    setProgress((prev) =>
      isLast
        ? applyLevelCompletion(prev, levelId)
        : { ...prev, activity: { ...prev.activity, questionIndex: questionIndex + 1, selected: null, lastAward: null } },
    );
    return isLast ? 'level-complete' : 'next';
  }, [questionIndex, questions.length, activityLevel.id, setProgress]);

  /** Completa un nivel sin preguntas (por ejemplo, de respiración). */
  const completeLevel = useCallback(
    (levelId: string) => {
      if (!LEVEL_BY_ID[levelId]) return;
      setProgress((prev) => applyLevelCompletion(prev, levelId));
    },
    [setProgress],
  );

  return {
    progress,
    // niveles e islas
    currentLevel,
    currentIsland,
    allCompleted,
    levelStatus,
    isLevelUnlocked,
    isIslandUnlocked,
    isIslandCompleted,
    completedInIsland,
    islandsExplored,
    // actividad
    activityLevel,
    question,
    questionIndex,
    totalQuestions: questions.length,
    startLevel,
    selectAnswer,
    clearSelection,
    nextQuestion,
    completeLevel,
    resetProgress,
  };
}

export type ProgressApi = ReturnType<typeof useProgress>;
