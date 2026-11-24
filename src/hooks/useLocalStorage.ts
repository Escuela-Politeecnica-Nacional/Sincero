import { useCallback, useEffect, useState } from 'react';

function read<T>(key: string, fallback: T, merge: (stored: unknown) => T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return merge(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

/**
 * Estado sincronizado con LocalStorage. Si el almacenamiento no está
 * disponible (modo privado, bloqueo del navegador), la app sigue
 * funcionando en memoria.
 */
export function useLocalStorage<T>(
  key: string,
  fallback: T,
  merge: (stored: unknown) => T = (stored) => stored as T,
) {
  const [value, setValue] = useState<T>(() => read(key, fallback, merge));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* almacenamiento no disponible: se mantiene en memoria */
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(fallback), [fallback]);

  return [value, setValue, reset] as const;
}
