import { useMemo } from 'react';
import { SCRIPT_TEMPLATES, type ScriptTemplateOption } from '../config/templates';

export type SupportedLang = 'en' | 'es';

export interface UseScriptTemplatesOptions {
  language?: SupportedLang;
  allowProTemplates?: boolean;
}

export function useScriptTemplates(options: UseScriptTemplatesOptions = {}) {
  const { language = 'en', allowProTemplates = false } = options;

  const hooks = useMemo(
    () => SCRIPT_TEMPLATES.filter((item) => item.type === 'hook'),
    []
  );

  const ctas = useMemo(
    () => SCRIPT_TEMPLATES.filter((item) => item.type === 'cta'),
    []
  );

  const availableHooks = useMemo(
    () => hooks.filter((item) => allowProTemplates || !item.isProOnly),
    [hooks, allowProTemplates]
  );

  const availableCtas = useMemo(
    () => ctas.filter((item) => allowProTemplates || !item.isProOnly),
    [ctas, allowProTemplates]
  );

  const getTemplateLabel = (item: ScriptTemplateOption, lang: SupportedLang = language) =>
    item.label[lang] || item.label.en;

  const getTemplateDirective = (item: ScriptTemplateOption, lang: SupportedLang = language) =>
    item.aiDirective[lang] || item.aiDirective.en;

  const getTemplateExactText = (item: ScriptTemplateOption, lang: SupportedLang = language) =>
    item.exactText[lang] || item.exactText.en;

  return {
    allTemplates: SCRIPT_TEMPLATES,
    hooks,
    ctas,
    availableHooks,
    availableCtas,
    getTemplateLabel,
    getTemplateDirective,
    getTemplateExactText
  };
}
