import { startTransition, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LEVEL_BY_ID } from '../data/levels';

export interface BreathingRouteState {
  /** Nivel de respiración que se está jugando (si viene del mapa). */
  levelId?: string;
}

/** Abre un nivel desbloqueado: actividad de preguntas o respiración guiada. */
export function usePlayLevel() {
  const navigate = useNavigate();
  const { progress } = useApp();
  const { startLevel, isLevelUnlocked } = progress;

  return useCallback(
    (levelId: string) => {
      const level = LEVEL_BY_ID[levelId];
      if (!level || !isLevelUnlocked(levelId)) return;
      if (level.kind === 'breathing') {
        navigate('/actividad/respirar', { state: { levelId } satisfies BreathingRouteState });
        return;
      }
      startTransition(() => {
        startLevel(levelId);
        navigate('/actividad/identificar');
      });
    },
    [navigate, startLevel, isLevelUnlocked],
  );
}
