import { useCallback, useEffect, useRef, useState } from 'react';

const isSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

function pickSpanishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const es = voices.filter((v) => v.lang.toLowerCase().startsWith('es'));
  return (
    es.find((v) => /es-(ec|419|mx|us|co)/i.test(v.lang)) ??
    es.find((v) => v.lang.toLowerCase() === 'es-es') ??
    es[0] ??
    null
  );
}

/**
 * Narración con la API SpeechSynthesis del navegador. Si el navegador no
 * la ofrece, `supported` es false y la interfaz conserva solo el texto.
 */
export function useSpeech() {
  const supported = isSupported();
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!supported) return;
    const update = () => {
      voiceRef.current = pickSpanishVoice();
    };
    update();
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, [supported]);

  const stop = useCallback(() => {
    window.clearTimeout(timerRef.current);
    if (supported) window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, [supported]);

  const speak = useCallback(
    (text: string, id: string = text) => {
      if (!supported) return false;
      window.clearTimeout(timerRef.current);
      window.speechSynthesis.cancel();
      // Chrome descarta a veces un speak() inmediatamente posterior a cancel().
      timerRef.current = window.setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = voiceRef.current;
        utterance.lang = voice?.lang ?? 'es-ES';
        if (voice) utterance.voice = voice;
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.onstart = () => setSpeakingId(id);
        utterance.onend = () => setSpeakingId((current) => (current === id ? null : current));
        utterance.onerror = () => setSpeakingId((current) => (current === id ? null : current));
        window.speechSynthesis.speak(utterance);
        setSpeakingId(id);
      }, 60);
      return true;
    },
    [supported],
  );

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return { supported, speak, stop, speakingId };
}

export type SpeechApi = ReturnType<typeof useSpeech>;
