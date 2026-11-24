import { useTranslation } from '../../hooks/useTranslations';
import { type PlanTier } from './wizardStorage';
import styles from './WizardStep3.module.css';

export interface VisualFormatOption {
  id: string;
  label: { en: string; es: string };
  description: { en: string; es: string };
  imageUrl?: string;
  requiresPaidPlan?: boolean;
}

interface WizardStep3Props {
  selectedFormatId: string;
  planTier: PlanTier;
  formats: VisualFormatOption[];
  onSelectFormat: (id: string) => void;
  onLockedSelect?: (id: string) => void;
}

function WizardStep3({
  selectedFormatId,
  planTier,
  formats,
  onSelectFormat,
  onLockedSelect,
}: WizardStep3Props) {
  const { language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';
  const isSpanish = lang === 'es';
  const isFreeTrial = planTier === 'free_trial';

  return (
    <div className={styles.stepSection}>
      <div>
        <h3 className={styles.stepTitle}>
          {isSpanish
            ? '3. Elige el formato visual'
            : '3. Choose the visual format'}
        </h3>
        <p className={styles.stepHint}>
          {isSpanish
            ? 'Selecciona la estética visual con referencia en imagen (cómic, 3D render, etc.).'
            : 'Pick the visual look with image reference (comic, 3D render, etc.).'}
        </p>
      </div>

      <div className={styles.formatsGrid}>
        {formats.map((format) => {
          const isLocked = Boolean(format.requiresPaidPlan && isFreeTrial);
          const isSelected = format.id === selectedFormatId;

          const handleClick = () => {
            if (isLocked) {
              onLockedSelect?.(format.id);
              return;
            }
            onSelectFormat(format.id);
          };

          return (
            <button
              key={format.id}
              type="button"
              aria-disabled={isLocked}
              onClick={handleClick}
              className={`${styles.formatCard} ${
                isSelected ? styles.formatCardSelected : ''
              } ${isLocked ? styles.formatCardLocked : ''}`}
            >
              <div className={styles.visualThumb}>
                {format.imageUrl && (
                  <img
                    src={format.imageUrl}
                    alt={format.label[lang]}
                    className={styles.visualImg}
                  />
                )}
                <span className={styles.formatTag}>
                  {isSpanish ? 'Formato' : 'Format'}
                </span>
                {isLocked && (
                  <span className={styles.lockedBadge}>
                    {isSpanish ? 'Plan+' : 'Plan+'}
                  </span>
                )}
              </div>

              <span className={styles.formatTitle}>{format.label[lang]}</span>
              <span className={styles.formatDesc}>
                {format.description[lang]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { WizardStep3, type WizardStep3Props };
export default WizardStep3;
