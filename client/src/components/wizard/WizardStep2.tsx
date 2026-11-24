import { useTranslation } from '../../hooks/useTranslations';
import { type PlanTier } from './wizardStorage';
import styles from './WizardStep2.module.css';

export interface PresetOption {
  id: string;
  label: { en: string; es: string };
  description: { en: string; es: string };
  imageUrl?: string;
  requiresPaidPlan?: boolean;
}

interface WizardStep2Props {
  selectedPresetId: string;
  planTier: PlanTier;
  presets: PresetOption[];
  onSelectPreset: (id: string) => void;
  onLockedSelect?: (id: string) => void;
}

function WizardStep2({
  selectedPresetId,
  planTier,
  presets,
  onSelectPreset,
  onLockedSelect,
}: WizardStep2Props) {
  const { language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';
  const isSpanish = lang === 'es';
  const isFreeTrial = planTier === 'free_trial';

  return (
    <div className={styles.stepSection}>
      <div>
        <h3 className={styles.stepTitle}>
          {isSpanish
            ? '2. Elige el preset narrativo'
            : '2. Choose your narrative preset'}
        </h3>
        <p className={styles.stepHint}>
          {isSpanish
            ? 'Define el ritmo y tono de la historia (cinematográfico, documental, etc.).'
            : 'Sets the pacing and narrative tone (cinematic, documentary, etc.).'}
        </p>
      </div>

      <div className={styles.cardsGrid}>
        {presets.map((preset) => {
          const isLocked = Boolean(preset.requiresPaidPlan && isFreeTrial);
          const isSelected = preset.id === selectedPresetId;

          const handleClick = () => {
            if (isLocked) {
              onLockedSelect?.(preset.id);
              return;
            }
            onSelectPreset(preset.id);
          };

          return (
            <button
              key={preset.id}
              type="button"
              aria-disabled={isLocked}
              onClick={handleClick}
              className={`${styles.optionCard} ${
                isSelected ? styles.optionCardSelected : ''
              } ${isLocked ? styles.optionCardLocked : ''}`}
            >
              <div className={styles.previewBox}>
                {preset.imageUrl && (
                  <img
                    src={preset.imageUrl}
                    alt={preset.label[lang]}
                    className={styles.previewImage}
                  />
                )}
                <span className={styles.badgePill}>
                  {isSpanish ? 'Preset' : 'Preset'}
                </span>
                {isLocked && (
                  <span className={styles.lockedTag}>
                    {isSpanish ? 'Plan+' : 'Plan+'}
                  </span>
                )}
              </div>

              <span className={styles.cardTitle}>{preset.label[lang]}</span>
              <span className={styles.cardDesc}>
                {preset.description[lang]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { WizardStep2, type WizardStep2Props };
export default WizardStep2;
