import { type ReactNode } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import styles from './WizardContainer.module.css';

export type WizardStepNumber = 1 | 2 | 3 | 4 | 5;

interface WizardContainerProps {
  currentStep: WizardStepNumber;
  planLabel: string;
  isProcessing?: boolean;
  onSelectStep: (step: WizardStepNumber) => void;
  onBack: () => void;
  onNextOrGenerate: () => void;
  children: ReactNode;
}

const STEP_LABELS: Record<WizardStepNumber, { en: string; es: string }> = {
  1: { en: 'Prompt', es: 'Prompt' },
  2: { en: 'Preset', es: 'Preset' },
  3: { en: 'Format', es: 'Formato' },
  4: { en: 'Voice & Frame', es: 'Voz y Marco' },
  5: { en: 'Summary', es: 'Resumen' },
};

function WizardContainer({
  currentStep,
  planLabel,
  isProcessing = false,
  onSelectStep,
  onBack,
  onNextOrGenerate,
  children,
}: WizardContainerProps) {
  const { t, language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';

  return (
    <section
      className={styles.workspaceShell}
      aria-label={t.studioLite.title}
    >
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>STUDIO LITE · WORKSPACE</span>
          <h2 className={styles.title}>{t.studioLite.title}</h2>
          <p className={styles.subtitle}>{t.studioLite.subtitle}</p>
        </div>

        <span className={styles.planBadge}>{planLabel}</span>
      </header>

      {!isProcessing && (
        <nav className={styles.stepper} aria-label="Wizard steps">
          {([1, 2, 3, 4, 5] as WizardStepNumber[]).map((stepNum) => {
            const isActive = currentStep === stepNum;
            const isDone = currentStep > stepNum;

            return (
              <button
                key={stepNum}
                type="button"
                onClick={() => onSelectStep(stepNum)}
                className={`${styles.stepBtn} ${
                  isActive
                    ? styles.stepBtnActive
                    : isDone
                    ? styles.stepBtnDone
                    : ''
                }`}
              >
                <span className={styles.stepIndex}>0{stepNum}</span>
                <span className={styles.stepName}>
                  {STEP_LABELS[stepNum][lang]}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      <div className={styles.contentArea}>{children}</div>

      {!isProcessing && (
        <footer className={styles.footerBar}>
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={onBack}
            className={styles.backBtn}
          >
            {t.common.back}
          </button>

          <button
            type="button"
            onClick={onNextOrGenerate}
            className={styles.nextBtn}
          >
            {currentStep < 5
              ? t.common.continue
              : t.studioLite.generateButton}
          </button>
        </footer>
      )}
    </section>
  );
}

export { WizardContainer, type WizardContainerProps };
export default WizardContainer;
