import { type SupportedLanguage } from '../types/common';
import { en, type TranslationDictionary } from './en';
import { es } from './es';

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  es
};

export function getTranslations(language: SupportedLanguage = 'en'): TranslationDictionary {
  return TRANSLATIONS[language] || en;
}

export { useTranslation } from '../hooks/useTranslations';
export { en, es, type TranslationDictionary };
