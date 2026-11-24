import { useTranslation } from '../../hooks/useTranslations';
import { type PlanTier, type WizardAspectRatio } from './wizardStorage';
import styles from './WizardStep4.module.css';

interface WizardStep4Props {
  aspectRatio: WizardAspectRatio;
  voice: string;
  durationSec: number;
  planTier: PlanTier;
  onAspectRatioChange: (ratio: WizardAspectRatio) => void;
  onVoiceChange: (voice: string) => void;
  onDurationChange: (duration: number) => void;
}

function WizardStep4({
  aspectRatio,
  voice,
  durationSec,
  planTier,
  onAspectRatioChange,
  onVoiceChange,
  onDurationChange,
}: WizardStep4Props) {
  const { t, language } = useTranslation();
  const isSpanish = language === 'es';
  const isFreeTrial = planTier === 'free_trial';

  return (
    <div className={styles.stepSection}>
      <div>
        <h3 className={styles.stepTitle}>
          {isSpanish
            ? '4. Define encuadre, voz y duración'
            : '4. Set framing, voice, and duration'}
        </h3>
        <p className={styles.stepHint}>
          {isSpanish
            ? 'Ajusta la proporción visual y la narración antes de revisar el resumen.'
            : 'Adjust visual aspect ratio and narration before reviewing the summary.'}
        </p>
      </div>

      <div>
        <span className={styles.groupLabel}>{t.studioLite.aspectRatioLabel}</span>
        <div className={styles.ratioGrid}>
          <button
            type="button"
            onClick={() => onAspectRatioChange('16:9')}
            className={`${styles.ratioCard} ${
              aspectRatio === '16:9' ? styles.ratioCardSelected : ''
            }`}
          >
            <span className={styles.frameLandscape} />
            <span className={styles.ratioText}>16:9</span>
          </button>

          <button
            type="button"
            onClick={() => onAspectRatioChange('9:16')}
            className={`${styles.ratioCard} ${
              aspectRatio === '9:16' ? styles.ratioCardSelected : ''
            }`}
          >
            <span className={styles.frameVertical} />
            <span className={styles.ratioText}>9:16</span>
          </button>

          <button
            type="button"
            onClick={() => onAspectRatioChange('1:1')}
            className={`${styles.ratioCard} ${
              aspectRatio === '1:1' ? styles.ratioCardSelected : ''
            }`}
          >
            <span className={styles.frameSquare} />
            <span className={styles.ratioText}>1:1</span>
          </button>
        </div>
      </div>

      <div className={styles.controlsGrid}>
        <div>
          <label htmlFor="wizard-step4-voice" className={styles.groupLabel}>
            {t.studioLite.voiceLabel}
          </label>
          <select
            id="wizard-step4-voice"
            value={voice}
            onChange={(e) => onVoiceChange(e.target.value)}
            className={styles.selectField}
          >
            <option value="Warm Narrator">Warm Narrator</option>
            <option value="Dynamic Host">Dynamic Host</option>
            <option value="Calm Storyteller">Calm Storyteller</option>
          </select>
        </div>

        <div>
          <label htmlFor="wizard-step4-duration" className={styles.groupLabel}>
            {t.studioLite.durationLabel}
          </label>
          <select
            id="wizard-step4-duration"
            value={durationSec}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            className={styles.selectField}
          >
            <option value={15}>15s</option>
            <option value={30}>30s</option>
            <option value={60} disabled={isFreeTrial}>
              {isFreeTrial
                ? isSpanish
                  ? '60s (Plan+)'
                  : '60s (Plan+)'
                : '60s'}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}

export { WizardStep4, type WizardStep4Props };
export default WizardStep4;
