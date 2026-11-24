import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import { type StudioLiteDraft } from './wizardStorage';
import styles from './WizardProcessingStep.module.css';

interface WizardProcessingStepProps {
  draft: StudioLiteDraft;
  onCancel: () => void;
  onComplete?: () => void;
}

function WizardProcessingStep({
  draft,
  onCancel,
  onComplete,
}: WizardProcessingStepProps) {
  const { language } = useTranslation();
  const isSpanish = language === 'es';
  const [stageIndex, setStageIndex] = useState(0);

  const stages = isSpanish
    ? [
        'Preparando estructura y guion base...',
        'Aplicando preset narrativo y formato visual...',
        'Sincronizando voz, encuadre y render final...',
      ]
    : [
        'Preparing story structure and base script...',
        'Applying narrative preset and visual format...',
        'Syncing voice, framing, and final render...',
      ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStageIndex((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        window.clearInterval(interval);
        onComplete?.();
        return prev;
      });
    }, 1500);

    return () => window.clearInterval(interval);
  }, [onComplete, stages.length]);

  return (
    <div className={styles.processingWrap} role="status" aria-live="polite">
      <div className={styles.spinnerRing} aria-hidden="true" />

      <span className={styles.stageTag}>
        {isSpanish ? 'GENERANDO EN STUDIO LITE' : 'GENERATING IN STUDIO LITE'}
      </span>

      <h3 className={styles.heading}>{stages[stageIndex]}</h3>

      <p className={styles.description}>
        {isSpanish
          ? 'Tu configuración quedó guardada en tu cuenta. Estamos ensamblando tu pieza dentro del Workspace.'
          : 'Your configuration is saved to your account. We are assembling your piece inside the Workspace.'}
      </p>

      <div className={styles.metaPillRow}>
        <span className={styles.metaPill}>{draft.presetId}</span>
        <span className={styles.metaPill}>{draft.visualFormatId}</span>
        <span className={styles.metaPill}>{draft.aspectRatio}</span>
        <span className={styles.metaPill}>{draft.durationSec}s</span>
      </div>

      <div className={styles.actionsRow}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelBtn}
        >
          {isSpanish ? 'Volver al resumen' : 'Back to summary'}
        </button>
      </div>
    </div>
  );
}

export { WizardProcessingStep, type WizardProcessingStepProps };
export default WizardProcessingStep;
