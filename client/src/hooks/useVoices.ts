import { useMemo } from 'react';
import { STUDIO_LITE_VOICES, type VoiceOption } from '../config/voices';

export type VoiceLang = 'en' | 'es';

export interface UseVoicesOptions {
  language?: VoiceLang;
  allowProVoices?: boolean;
}

export function useVoices(options: UseVoicesOptions = {}) {
  const { language = 'en', allowProVoices = false } = options;

  const voicesByLanguage = useMemo(
    () =>
      STUDIO_LITE_VOICES.filter(
        (voice) => voice.language === language || voice.language === 'multilingual'
      ),
    [language]
  );

  const availableVoices = useMemo(
    () =>
      voicesByLanguage.map((voice) => ({
        ...voice,
        isLocked: voice.isProOnly && !allowProVoices
      })),
    [voicesByLanguage, allowProVoices]
  );

  const findVoiceById = (id?: string): VoiceOption | undefined =>
    STUDIO_LITE_VOICES.find((voice) => voice.id === id);

  return {
    allVoices: STUDIO_LITE_VOICES,
    voicesByLanguage,
    availableVoices,
    findVoiceById
  };
}
