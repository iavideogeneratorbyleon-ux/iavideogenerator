import { useTranslation } from '../../hooks/useTranslations';
import { type LegalDocType } from '../terms-modal/TermsModal';
import {
  SUBTITLE_STYLE_OPTIONS,
  VOICE_OPTIONS,
} from './StudioLiteWorkspaceWizard';
import { getPlanWizardPolicy, type PlanTier } from './wizardPlanConfig';
import { type WizardStepNumber } from './WizardContainer';
import { type StudioLiteDraft } from './wizardStorage';
import styles from './WizardStep5.module.css';

interface WizardStep5Props {
  draft: StudioLiteDraft;
  presetLabel: string;
  visualFormatLabel: string;
  subtitlesEnabled?: boolean;
  subtitleStyle?: string;
  canChooseSubtitleStyle?: boolean;
  planTier?: PlanTier;
  isAuthenticated: boolean;
  acceptedTerms: boolean;
  acceptedAiDisclaimer: boolean;
  showTermsError?: boolean;
  showAiDisclaimerError?: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
  onAcceptedAiDisclaimerChange: (accepted: boolean) => void;
  onOpenLegalDoc: (docType: LegalDocType) => void;
  onJumpToStep: (step: WizardStepNumber) => void;
}

function WizardStep5({
  draft,
  presetLabel,
  visualFormatLabel,
  subtitlesEnabled = true,
  subtitleStyle = 'auto',
  planTier = 'free_trial',
  canChooseSubtitleStyle = planTier !== 'free_trial',
  isAuthenticated,
  acceptedTerms,
  acceptedAiDisclaimer,
  showTermsError = false,
  showAiDisclaimerError = false,
  onAcceptedTermsChange,
  onAcceptedAiDisclaimerChange,
  onOpenLegalDoc,
  onJumpToStep,
}: WizardStep5Props) {
  const { t, language } = useTranslation();
  const isSpanish = language === 'es';
  const lang = isSpanish ? 'es' : 'en';
  const policy = getPlanWizardPolicy(planTier);

  const selectedVoiceItem = VOICE_OPTIONS.find((v) => v.id === draft.voice);
  const voiceDisplayName = selectedVoiceItem
    ? selectedVoiceItem.voiceName || selectedVoiceItem.label[lang]
    : draft.voice;

  const selectedSubtitleOption =
    SUBTITLE_STYLE_OPTIONS.find((item) => item.id === subtitleStyle) ||
    SUBTITLE_STYLE_OPTIONS[0];

  const subtitleSummaryText = !subtitlesEnabled
    ? isSpanish
      ? 'Sin subtítulos'
      : 'Without subtitles'
    : canChooseSubtitleStyle
    ? `${isSpanish ? 'Activos' : 'On'} · ${selectedSubtitleOption.label[lang]}`
    : isSpanish
    ? 'Activos'
    : 'On';

  const ratioPreviewClass =
    draft.aspectRatio === '16:9'
      ? styles.frame16x9
      : draft.aspectRatio === '9:16'
      ? styles.frame9x16
      : styles.frame1x1;

  const cleanPrompt = draft.prompt.trim();

  return (
    <div className={styles.stepSection}>
      <div className={styles.headerBlock}>
        <h3 className={styles.stepTitle}>
          {isSpanish
            ? '5. Resumen antes de generar'
            : '5. Summary before generating'}
        </h3>
        <p className={styles.stepHint}>
          {isSpanish
            ? 'Verifica tus elecciones en el Workspace antes de iniciar la generación.'
            : 'Review your Workspace choices before starting generation.'}
        </p>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.specsCard}>
          <div className={styles.specsList}>
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
              <span className={styles.summaryLabel}>
                {t.studioLite.presetLabel}
              </span>
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
              <span className={styles.summaryLabel}>
                {t.studioLite.voiceLabel}
              </span>
              <div className={styles.summaryRight}>
                <span className={styles.summaryValue}>
                  {voiceDisplayName} · {draft.durationSec}s
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

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>
                {isSpanish ? 'Subtítulos' : 'Subtitles'}
              </span>
              <div className={styles.summaryRight}>
                <span className={styles.summaryValue}>{subtitleSummaryText}</span>
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
          </div>

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

        <div className={styles.sideColumn}>
          <div className={styles.promptCard}>
            <div className={styles.promptCardHeader}>
              <span className={styles.promptCardLabel}>
                {draft.mode === 'idea'
                  ? isSpanish
                    ? 'Idea base'
                    : 'Base idea'
                  : isSpanish
                  ? 'Guion'
                  : 'Script'}
              </span>
              <button
                type="button"
                onClick={() => onJumpToStep(1)}
                className={styles.editLink}
              >
                {isSpanish ? 'Editar' : 'Edit'}
              </button>
            </div>
            <p className={styles.promptPreview}>
              {cleanPrompt ||
                (isSpanish
                  ? 'Sin prompt escrito aún; puedes añadirlo en el Paso 1.'
                  : 'No prompt entered yet; you can add it in Step 1.')}
            </p>
          </div>

          <div
            className={`${styles.aiDisclaimerBox} ${
              acceptedTerms ? styles.aiDisclaimerBoxChecked : ''
            } ${
              showTermsError && !acceptedTerms ? styles.termsBoxError : ''
            }`}
          >
            <label className={styles.aiDisclaimerLabel}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => onAcceptedTermsChange(e.target.checked)}
                className={styles.aiCheckbox}
              />
              <span className={styles.aiDisclaimerCopy}>
                {isSpanish ? (
                  <>
                    Acepto los{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegalDoc('terms')}
                      className={styles.editLink}
                    >
                      Términos de Servicio
                    </button>{' '}
                    y la{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegalDoc('terms')}
                      className={styles.editLink}
                    >
                      Política de Generación de Contenido con IA
                    </button>{' '}
                    antes de generar mi video.
                  </>
                ) : (
                  <>
                    I accept the{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegalDoc('terms')}
                      className={styles.editLink}
                    >
                      Terms of Service
                    </button>{' '}
                    and the{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegalDoc('terms')}
                      className={styles.editLink}
                    >
                      AI Content Generation Policy
                    </button>{' '}
                    before generating my video.
                  </>
                )}
              </span>
            </label>
            {showTermsError && !acceptedTerms && (
              <p className={styles.termsInlineError} role="alert">
                {isSpanish
                  ? 'Debes aceptar los Términos de Servicio y la Política de IA para continuar.'
                  : 'You must accept the Terms of Service and AI Policy to continue.'}
              </p>
            )}
          </div>

          <div
            className={`${styles.aiDisclaimerBox} ${
              acceptedAiDisclaimer ? styles.aiDisclaimerBoxChecked : ''
            } ${
              showAiDisclaimerError && !acceptedAiDisclaimer
                ? styles.aiDisclaimerBoxError
                : ''
            }`}
          >
            <label className={styles.aiDisclaimerLabel}>
              <input
                type="checkbox"
                checked={acceptedAiDisclaimer}
                onChange={(e) => onAcceptedAiDisclaimerChange(e.target.checked)}
                className={styles.aiCheckbox}
              />
              <span className={styles.aiDisclaimerCopy}>
                {isSpanish
                  ? 'Acepto que la duración seleccionada es aproximada y que tanto el tiempo final como el resultado visual y narrativo pueden variar al depender de modelos externos de IA.'
                  : 'I agree that the selected duration is approximate and that both final length and visual/narrative results may vary as they depend on external AI models.'}
              </span>
            </label>
            {showAiDisclaimerError && !acceptedAiDisclaimer && (
              <p className={styles.aiInlineError} role="alert">
                {isSpanish
                  ? 'Debes aceptar la política de variabilidad de IA y duración para continuar.'
                  : 'You must accept the AI variability and duration policy to continue.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Franja visual dinámica adaptada a tema claro/oscuro y ancho contenedor */}
      <section
        className={styles.blueprintShowcase}
        aria-label={
          isSpanish
            ? 'Vista previa del plan de producción'
            : 'Production blueprint preview'
        }
      >
        <div className={styles.blueprintVisual}>
          <div className={`${styles.miniCanvas} ${ratioPreviewClass}`}>
            <span className={styles.canvasRatioPill}>{draft.aspectRatio}</span>
            {subtitlesEnabled && (
              <span className={styles.canvasSubtitlePill}>
                {isSpanish ? 'Subtítulos IA' : 'AI Captions'}
              </span>
            )}
          </div>
          <div className={styles.blueprintInfo}>
            <span className={styles.blueprintEyebrow}>
              {isSpanish
                ? 'BLUEPRINT LISTO PARA RENDERIZAR'
                : 'READY-TO-RENDER BLUEPRINT'}
            </span>
            <strong className={styles.blueprintTitle}>
              {cleanPrompt ||
                (isSpanish ? 'Proyecto Studio Lite' : 'Studio Lite Project')}
            </strong>
            <div className={styles.tagRow}>
              <span className={styles.metaChip}>{visualFormatLabel}</span>
              <span className={styles.metaChip}>{presetLabel}</span>
              <span className={styles.metaChip}>
                {voiceDisplayName} · {draft.durationSec}s
              </span>
              <span className={styles.metaChip}>
                {policy.defaultResolution || '720p'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.pipelineTrack}>
          <div className={styles.trackStep}>
            <span className={styles.trackNum}>01</span>
            <div className={styles.trackCopy}>
              <span className={styles.trackTitle}>
                {isSpanish ? 'Estructura y escenas' : 'Script & scenes'}
              </span>
              <span className={styles.trackDesc}>
                {isSpanish
                  ? `Ritmo ${presetLabel} en formato ${visualFormatLabel}`
                  : `${presetLabel} pacing in ${visualFormatLabel} look`}
              </span>
            </div>
          </div>

          <div className={styles.trackStep}>
            <span className={styles.trackNum}>02</span>
            <div className={styles.trackCopy}>
              <span className={styles.trackTitle}>
                {isSpanish ? 'Voz y sincronización' : 'Voice & sync'}
              </span>
              <span className={styles.trackDesc}>
                {isSpanish
                  ? `Narración con ${voiceDisplayName} (${draft.durationSec}s)`
                  : `Narration by ${voiceDisplayName} (${draft.durationSec}s)`}
              </span>
            </div>
          </div>

          <div className={styles.trackStep}>
            <span className={styles.trackNum}>03</span>
            <div className={styles.trackCopy}>
              <span className={styles.trackTitle}>
                {isSpanish ? 'Entrega en Dashboard' : 'Dashboard delivery'}
              </span>
              <span className={styles.trackDesc}>
                {isSpanish
                  ? `Video ${draft.aspectRatio} listo para ver y descargar`
                  : `${draft.aspectRatio} video ready to preview & download`}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export { WizardStep5, type WizardStep5Props };
export default WizardStep5;
