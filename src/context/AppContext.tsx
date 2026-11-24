import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAccessibility, type AccessibilityApi } from '../hooks/useAccessibility';
import { useProgress, type ProgressApi } from '../hooks/useProgress';
import { useSpeech, type SpeechApi } from '../hooks/useSpeech';

interface AppContextValue {
  progress: ProgressApi;
  a11y: AccessibilityApi;
  speech: SpeechApi;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const progress = useProgress();
  const a11y = useAccessibility();
  const speech = useSpeech();

  return <AppContext.Provider value={{ progress, a11y, speech }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>.');
  return ctx;
}

/**
 * Lee un texto automáticamente al entrar en una pantalla si la narración
 * de Tico está activada, y lo detiene al salir.
 */
export function useAutoNarration(text: string | null, id?: string) {
  const { a11y, speech } = useApp();
  const { narration } = a11y.settings;
  const { speak, stop } = speech;

  useEffect(() => {
    if (!text || !narration) return;
    speak(text, id ?? text);
    return () => stop();
  }, [text, id, narration, speak, stop]);
}
