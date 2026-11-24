import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import { getPlanWizardPolicy, type PlanTier } from './wizardPlanConfig';
import { type WizardInputMode } from './wizardStorage';
import styles from './WizardStep1.module.css';

interface WizardStep1Props {
  mode: WizardInputMode;
  prompt: string;
  planTier?: PlanTier;
  onModeChange: (mode: WizardInputMode) => void;
  onPromptChange: (value: string) => void;
  onLockedScriptMode?: () => void;
}

interface PromptSuggestion {
  id: string;
  tag: { es: string; en: string };
  ideaText: { es: string; en: string };
  scriptText: { es: string; en: string };
}

const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 'history',
    tag: { es: 'Historia breve', en: 'Quick history' },
    ideaText: {
      es: 'Crea un video corto sobre por qué la flor de cempasúchil simboliza luz y memoria en la cultura mexicana.',
      en: 'Create a short video on why the marigold symbolizes light and memory in Mexican culture.',
    },
    scriptText: {
      es: 'Durante siglos, el tono dorado del cempasúchil ha guiado historias de memoria y luz. Hoy ese mismo contraste inspira creaciones visuales con IA en segundos.',
      en: 'For centuries, golden marigold tones have carried stories of memory and light. Today that same contrast inspires AI visual creation in seconds.',
    },
  },
  {
    id: 'tech',
    tag: { es: 'Tech en 30s', en: 'Tech in 30s' },
    ideaText: {
      es: 'Explica de forma visual y sencilla cómo funcionan los modelos de lenguaje y generación de video en el día a día.',
      en: 'Explain simply and visually how language models and video generation work in everyday workflows.',
    },
    scriptText: {
      es: 'Pasar de una idea suelta a una pieza audiovisual lista para publicar ya no requiere semanas de edición. Solo define el mensaje, el ritmo y el estilo.',
      en: 'Going from a rough idea to a ready-to-publish video no longer takes weeks of editing. Just set the message, pacing, and visual style.',
    },
  },
  {
    id: 'storytelling',
    tag: { es: 'Storytelling', en: 'Storytelling' },
    ideaText: {
      es: 'Relato motivacional sobre dar el primer paso en un proyecto creativo a pesar de la incertidumbre.',
      en: 'Motivational story about taking the first step on a creative project despite uncertainty.',
    },
    scriptText: {
      es: 'Cada gran proyecto empieza con un borrador imperfecto. No esperes a tenerlo todo resuelto: da el primer paso y refina en el camino.',
      en: 'Every major project starts with an imperfect draft. Do not wait until everything is solved—take the first step and refine along the way.',
    },
  },
];

function WizardStep1({
  mode,
  prompt,
  planTier = 'free_trial',
  onModeChange,
  onPromptChange,
  onLockedScriptMode,
}: WizardStep1Props) {
  const { t, language } = useTranslation();
  const isSpanish = language === 'es';
  const lang = isSpanish ? 'es' : 'en';
  const policy = getPlanWizardPolicy(planTier);
  const isScriptLocked = !policy.allowCustomScript;
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);

  const handleSelectScript = () => {
    if (isScriptLocked) {
      onLockedScriptMode?.();
      return;
    }
    onModeChange('script');
  };

  const handleApplySuggestion = (item: PromptSuggestion) => {
    const nextText = mode === 'script' ? item.scriptText[lang] : item.ideaText[lang];
    onPromptChange(nextText);
  };

  return (
    <div className={styles.stepLayout}>
      <div className={styles.mainColumn}>
        <div className={styles.headerBlock}>
          <h3 className={styles.stepTitle}>
            {isSpanish
              ? '1. Define tu idea o guion inicial'
              : '1. Define your starting idea or script'}
          </h3>
          <p className={styles.stepHint}>
            {isSpanish
              ? 'Empieza con una idea rápida, elige una sugerencia o pega tu guion.'
              : 'Start with a quick idea, pick a suggestion, or paste your script.'}
          </p>
        </div>

        <div className={styles.modeGroup} role="group" aria-label="Input mode">
          <button
            type="button"
            onClick={() => onModeChange('idea')}
            className={`${styles.modeButton} ${
              mode === 'idea' ? styles.modeButtonActive : ''
            }`}
          >
            {t.studioLite.modeIdea}
          </button>
          <button
            type="button"
            aria-disabled={isScriptLocked}
            onClick={handleSelectScript}
            className={`${styles.modeButton} ${
              mode === 'script' ? styles.modeButtonActive : ''
            }`}
          >
            {t.studioLite.modeScript}
            {isScriptLocked ? ' (Plan+)' : ''}
          </button>
        </div>

        <div className={styles.editorBlock}>
          <label htmlFor="wizard-step1-prompt" className={styles.fieldLabel}>
            {mode === 'idea'
              ? t.studioLite.promptPlaceholderIdea
              : t.studioLite.promptPlaceholderScript}
          </label>
          <textarea
            id="wizard-step1-prompt"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={
              mode === 'idea'
                ? t.studioLite.promptPlaceholderIdea
                : t.studioLite.promptPlaceholderScript
            }
            className={styles.promptInput}
          />
        </div>

        <div className={styles.suggestionsBlock}>
          <span className={styles.suggestionsLabel}>
            {isSpanish ? 'Ideas rápidas:' : 'Quick ideas:'}
          </span>
          <div className={styles.chipsRow}>
            {PROMPT_SUGGESTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleApplySuggestion(item)}
                className={styles.suggestionChip}
                title={mode === 'script' ? item.scriptText[lang] : item.ideaText[lang]}
              >
                + {item.tag[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside
        className={styles.showcasePanel}
        aria-label={isSpanish ? 'Muestra visual de Cempa.ai' : 'Cempa.ai visual showcase'}
      >
        <div className={styles.showcaseFrame}>
          {!videoLoadFailed ? (
            <video
              className={styles.showcaseVideo}
              src="/studio-lite-sample.mp4"
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoLoadFailed(true)}
            />
          ) : (
            <div className={styles.ambientFallback} aria-hidden="true">
              <div className={styles.ambientOrb} />
              <span className={styles.ambientTag}>CEMPA.AI · STUDIO LITE</span>
            </div>
          )}
        </div>
        <div className={styles.showcaseCaption}>
          <span className={styles.showcaseBadge}>9:16 SAMPLE</span>
          <p className={styles.showcaseText}>
            {isSpanish
              ? 'De una idea o guion a piezas verticales listas para publicar.'
              : 'From idea or script to vertical videos ready to publish.'}
          </p>
        </div>
      </aside>
    </div>
  );
}

export { WizardStep1, type WizardStep1Props };
export default WizardStep1;
