import { useTranslation } from '../../hooks/useTranslations';
import { type LegalDocType } from '../terms-modal/TermsModal';
import { TermsAcceptanceBox } from './TermsAcceptanceBox';
import { getPlanWizardPolicy, type PlanTier } from './wizardPlanConfig';
import { type WizardStepNumber } from './WizardContainer';
import { type StudioLiteDraft } from './wizardStorage';
import styles from './WizardStep5.module.css';

interface WizardStep5Props {
  draft: StudioLiteDraft;
  presetLabel: string;
  visualFormatLabel: string;
  planTier?: PlanTier;
  isAuthenticated: boolean;
  acceptedTerms: boolean;
  showTermsError?: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
  onOpenLegalDoc: (docType: LegalDocType) => void;
  onJumpToStep: (step: WizardStepNumber) => void;
}

function WizardStep5({
  draft,
  presetLabel,
  visualFormatLabel,
  planTier = 'free_trial',
  isAuthenticated,
  acceptedTerms,
  showTermsError = false,
  onAcceptedTermsChange,
  onOpenLegalDoc,
  onJumpToStep,
}: WizardStep5Props) {
  const { t, language } = useTranslation();
  const isSpanish = language === 'es';
  const policy = getPlanWizardPolicy(planTier);

  return (
    <div className={styles.stepSection}>
      <div>
        <h3 className={styles.stepTitle}>
          {isSpanish
            ? '5. Resumen antes de generar'
            : '5. Summary before generating'}
        </h3>
        <p className={styles.stepHint}>
          {isSpanish
            ? 'Verifica tus elecciones en el Workspace. Si aún no tienes cuenta, te pediremos registrarte al generar.'
            : 'Review your Workspace choices. If you are not signed in yet, we will prompt you to register when generating.'}
        </p>
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>
            {isSpanish ? 'Modo' : 'Mode'}
          </span>
          <div className={styles.summaryRight}>
            <span className={styles.summaryValue}>
              {draft.mode === 'idea'
                ? t.studioLite.modeIdea
                : t.studioLite.modeScript}
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className={styles.editLink}
            >
              {isSpanish ? 'Editar' : 'Edit'}
            </button>
          </div>
        </div>

        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>{t.studioLite.presetLabel}</span>
          <div className={styles.summaryRight}>
            <span className={styles.summaryValue}>{presetLabel}</span>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className={styles.editLink}
            >
              {isSpanish ? 'Editar' : 'Edit'}
            </button>
          </div>
        </div>

        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>
            {isSpanish ? 'Formato Visual' : 'Visual Format'}
          </span>
          <div className={styles.summaryRight}>
            <span className={styles.summaryValue}>{visualFormatLabel}</span>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className={styles.editLink}
            >
              {isSpanish ? 'Editar' : 'Edit'}
            </button>
          </div>
        </div>

        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>
            {t.studioLite.aspectRatioLabel}
          </span>
          <div className={styles.summaryRight}>
            <span className={styles.summaryValue}>{draft.aspectRatio}</span>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className={styles.editLink}
            >
              {isSpanish ? 'Editar' : 'Edit'}
            </button>
          </div>
        </div>

        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>{t.studioLite.voiceLabel}</span>
          <div className={styles.summaryRight}>
            <span className={styles.summaryValue}>
              {draft.voice} · {draft.durationSec}s
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className={styles.editLink}
            >
              {isSpanish ? 'Editar' : 'Edit'}
            </button>
          </div>
        </div>

        {policy.videoCreditCost > 0 && (
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>
              {isSpanish ? 'Costo en créditos' : 'Credit Cost'}
            </span>
            <div className={styles.summaryRight}>
              <span className={styles.summaryValue}>
                {policy.videoCreditCost}{' '}
                {isSpanish ? 'créditos' : 'credits'}
              </span>
            </div>
          </div>
        )}

        <p className={styles.promptPreview}>
          {draft.prompt.trim() ||
            (isSpanish
              ? 'Sin prompt escrito aún; puedes añadirlo en el Paso 1.'
              : 'No prompt entered yet; you can add it in Step 1.')}
        </p>
      </div>

      <TermsAcceptanceBox
        accepted={acceptedTerms}
        showError={showTermsError}
        onChange={onAcceptedTermsChange}
        onOpenDoc={onOpenLegalDoc}
      />

      {!isAuthenticated && (
        <div className={styles.signupNotice}>
          <span className={styles.signupNoticeTitle}>
            {isSpanish
              ? 'Registro requerido para generar tu video'
              : 'Sign up required to generate your video'}
          </span>
          <p className={styles.signupNoticeText}>
            {isSpanish
              ? 'Al pulsar generar, guardaremos tu configuración y abrirá el registro/plan (free, pay-per-video, pro o unlimited por email o Google) para continuar directo en tu Dashboard.'
              : 'When you click generate, we will save your setup and open registration/plan selection (free, pay-per-video, pro, or unlimited via email or Google) to continue straight into your Dashboard.'}
          </p>
        </div>
      )}
    </div>
  );
}

export { WizardStep5, type WizardStep5Props };
export default WizardStep5;
