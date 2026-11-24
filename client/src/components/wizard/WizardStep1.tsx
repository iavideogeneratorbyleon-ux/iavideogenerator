import { useTranslation } from '../../hooks/useTranslations';
import { type WizardInputMode } from './wizardStorage';
import styles from './WizardStep1.module.css';

interface WizardStep1Props {
  mode: WizardInputMode;
  prompt: string;
  onModeChange: (mode: WizardInputMode) => void;
  onPromptChange: (value: string) => void;
}

function WizardStep1({
  mode,
  prompt,
  onModeChange,
  onPromptChange,
}: WizardStep1Props) {
  const { t, language } = useTranslation();
  const isSpanish = language === 'es';

  return (
    <div className={styles.stepSection}>
      <div>
        <h3 className={styles.stepTitle}>
          {isSpanish
            ? '1. Define tu idea o guion inicial'
            : '1. Define your starting idea or script'}
        </h3>
        <p className={styles.stepHint}>
          {isSpanish
            ? 'Puedes partir de un concepto breve o pegar un guion ya redactado.'
            : 'Start from a short concept or paste a ready-to-use script.'}
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
          onClick={() => onModeChange('script')}
          className={`${styles.modeButton} ${
            mode === 'script' ? styles.modeButtonActive : ''
          }`}
        >
          {t.studioLite.modeScript}
        </button>
      </div>

      <div>
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
    </div>
  );
}

export { WizardStep1, type WizardStep1Props };
export default WizardStep1;
