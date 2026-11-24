import { useCallback, useEffect } from 'react';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../data/mockData';
import { playSound, type SoundName } from '../lib/sounds';
import type { AccessibilitySettings } from '../types';
import { useLocalStorage } from './useLocalStorage';

function mergeSettings(stored: unknown): AccessibilitySettings {
  if (!stored || typeof stored !== 'object') return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(stored as Partial<AccessibilitySettings>) };
}

export type ToggleKey = 'narration' | 'sounds' | 'subtitles' | 'calmMode' | 'animations' | 'highContrast';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Preferencias de accesibilidad. Se aplican como atributos data-* en
 * <html>, que las hojas de estilo usan para cambiar tamaño de texto,
 * contraste, animaciones y modo calma.
 */
export function useAccessibility() {
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
    mergeSettings,
  );

  const motionAllowed = settings.animations && !settings.calmMode && !prefersReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = settings.textSize;
    root.dataset.calm = String(settings.calmMode);
    root.dataset.contrast = settings.highContrast ? 'alto' : 'normal';
    root.dataset.motion = settings.animations && !settings.calmMode ? 'on' : 'off';
  }, [settings]);

  const update = useCallback(
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [setSettings],
  );

  const toggle = useCallback(
    (key: ToggleKey) => {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [setSettings],
  );

  /**
   * Reproduce un efecto si los sonidos están activados. En modo calma no
   * suenan efectos (así lo promete la opción «sin sonidos de premio»).
   */
  const sound = useCallback(
    (name: SoundName) => {
      if (settings.sounds && !settings.calmMode) playSound(name);
    },
    [settings.sounds, settings.calmMode],
  );

  return { settings, update, toggle, sound, motionAllowed };
}

export type AccessibilityApi = ReturnType<typeof useAccessibility>;
