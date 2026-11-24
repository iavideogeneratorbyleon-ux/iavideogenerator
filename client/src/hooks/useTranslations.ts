import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getTranslations } from '../i18n';

export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguage();
  const t = useMemo(() => getTranslations(language), [language]);

  return { t, language, setLanguage, toggleLanguage };
}

export default useTranslation