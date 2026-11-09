import { useState } from 'react';
import { useLanguage } from '../landing/LanguageContext';
import WizardStep1, { type WizardData } from './WizardStep1';
import WizardStep2 from './WizardStep2';
import WizardStep3 from './WizardStep3';
import WizardStep4 from './WizardStep4'; // Nuevo paso de música
import WizardStep5 from './WizardStep5'; // Antiguo WizardStep4 renombrado a Step5 (Resumen)
import styles from './WizardContainer.module.css';

interface WizardContainerProps {
  onClose?: () => void;
  onComplete?: () => void;
}

export default function WizardContainer({ onClose }: WizardContainerProps) {
  const { t, lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<WizardData>({
    mode: 'idea',
    scriptIdea: '',
    tone: 'professional',
    voiceId: '',
    aspectRatio: '9:16',
    visualStyle: 'cinematic',
    musicStyle: 'none',
  });

  const updateFormData = (fields: Partial<WizardData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5)); // Ahora son 5 pasos
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleCloseAttempt = () => {
    if (currentStep > 1 || formData.scriptIdea.trim().length > 0) {
      setShowExitConfirm(true);
    } else {
      if (onClose) onClose();
      else window.location.reload();
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    if (onClose) onClose();
    else window.location.reload();
  };

  // Diccionarios traducibles
  const modeLabels: Record<string, string> = {
    idea: lang === 'en' ? 'AI Idea Generator' : 'Generador de Idea por IA',
    script: lang === 'en' ? 'Direct Script / Dialogue' : 'Guion / Diálogo Directo',
  };

  const toneLabels: Record<string, string> = {
    professional: lang === 'en' ? 'Professional' : 'Profesional',
    dynamic: lang === 'en' ? 'Dynamic' : 'Dinámico',
    casual: lang === 'en' ? 'Casual' : 'Casual',
  };

  const voiceLabels: Record<string, string> = {
    carlos: lang === 'en' ? 'Carlos (Narrative)' : 'Carlos (Narrativo)',
    sofia: lang === 'en' ? 'Sofia (Commercial)' : 'Sofía (Comercial)',
    alex: lang === 'en' ? 'Alex (Young / Casual)' : 'Alex (Joven / Casual)',
  };

  const styleLabels: Record<string, string> = {
    cinematic: lang === 'en' ? 'Cinematic' : 'Cinematográfico',
    '3d-render': lang === 'en' ? '3D Render' : 'Render 3D',
    vector: lang === 'en' ? 'Minimalist Vector' : 'Vector Minimalista',
  };

  const musicLabels: Record<string, string> = {
    none: lang === 'en' ? 'No background music' : 'Sin música de fondo',
    lofi: lang === 'en' ? 'Lo-Fi / Relaxing' : 'Lo-Fi / Relajante',
    epic: lang === 'en' ? 'Epic / Cinematic' : 'Épico / Cinematográfico',
    upbeat: lang === 'en' ? 'Upbeat / Corporate' : 'Animado / Corporativo',
    tech: lang === 'en' ? 'Cyberpunk / Tech' : 'Cyberpunk / Tecnológico',
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardContainer}>
        
        <button
          type="button"
          onClick={handleCloseAttempt}
          aria-label={t('wizard_close_aria') || 'Close wizard'}
          className={styles.closeBtn}
        >
          ✕
        </button>

        {/* COLUMNA IZQUIERDA: Wizard Steps */}
        <div className={styles.leftColumn}>
          <div className={styles.progressHeader}>
            <div className={styles.progressTopRow}>
              <div className={styles.stepInfoGroup}>
                {currentStep > 1 && currentStep < 5 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className={styles.backBtn}
                  >
                    {t('wizard_back_btn')}
                  </button>
                )}
                <span className={styles.stepBadge}>
                  {t('wizard_step')} {currentStep} {t('wizard_of')} 5
                </span>
              </div>
              <span className={styles.progressPercent}>
                {currentStep * 20}% {t('wizard_completed')}
              </span>
            </div>

            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${currentStep * 20}%` }}
              />
            </div>
          </div>

          {currentStep === 1 && (
            <WizardStep1
              data={formData}
              onUpdate={updateFormData}
              onNext={nextStep}
            />
          )}

          {currentStep === 2 && (
            <WizardStep2
              data={formData}
              onUpdate={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {currentStep === 3 && (
            <WizardStep3
              data={formData}
              onUpdate={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {currentStep === 4 && (
            <WizardStep4
              data={formData}
              onUpdate={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {currentStep === 5 && (
            <WizardStep5
              data={formData}
              onPrev={prevStep}
              toneLabels={toneLabels}
              voiceLabels={voiceLabels}
              styleLabels={styleLabels}
            />
          )}

          <div className={styles.mobileExitContainer}>
            <button
              type="button"
              onClick={handleCloseAttempt}
              className={styles.mobileExitBtn}
            >
              {t('wizard_exit_mobile_btn') || 'Salir del asistente'}
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: Resumen en Vivo Actualizado */}
        <div className={styles.rightColumn}>
          <div className={styles.summaryContent}>
            <div>
              <span className={styles.summaryBadge}>
                {t('summary_live_preview')}
              </span>
              <h2 className={styles.summaryTitle}>{t('summary_project_title')}</h2>
              <p className={styles.summarySub}>{t('summary_project_sub')}</p>
            </div>

            <div className={styles.summaryCard}>
              <span className={styles.summaryCardLabel}>{lang === 'en' ? 'Creation Mode' : 'Modo de Creación'}</span>
              <p className={styles.highlightValue}>
                {modeLabels[formData.mode || 'idea']}
              </p>
            </div>

            <div className={styles.summaryCard}>
              <span className={styles.summaryCardLabel}>
                {formData.mode === 'script' ? (lang === 'en' ? 'Your Script' : 'Tu Guion') : t('summary_concept_label')}
              </span>
              <p className={styles.summaryCardValue}>
                {formData.scriptIdea ? formData.scriptIdea : <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>{t('summary_undefined')}</span>}
              </p>
            </div>

            <div className={styles.summaryGrid}>
              <div className={styles.summarySubCard}>
                <span className={styles.summaryCardLabel}>{t('summary_tone_label')}</span>
                <p className={styles.highlightValue}>
                  {toneLabels[formData.tone] || formData.tone}
                </p>
              </div>
              <div className={styles.summarySubCard}>
                <span className={styles.summaryCardLabel}>{t('summary_format_label')}</span>
                <p className={styles.highlightValue}>
                  {formData.aspectRatio || '9:16'}
                </p>
              </div>
            </div>

            <div className={styles.summaryGrid}>
              <div className={styles.summarySubCard}>
                <span className={styles.summaryCardLabel}>{t('summary_voice_label')}</span>
                <p className={styles.highlightValue} style={{ fontSize: '0.7rem' }}>
                  {formData.voiceId ? voiceLabels[formData.voiceId] : <span style={{ fontStyle: 'italic', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>{t('summary_unselected')}</span>}
                </p>
              </div>
              <div className={styles.summarySubCard}>
                <span className={styles.summaryCardLabel}>{lang === 'en' ? 'Music' : 'Música'}</span>
                <p className={styles.highlightValue} style={{ fontSize: '0.7rem' }}>
                  {musicLabels[formData.musicStyle || 'none']}
                </p>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <span className={styles.summaryCardLabel}>{t('summary_style_label')}</span>
              <p className={styles.highlightValue}>
                {formData.visualStyle ? styleLabels[formData.visualStyle] : <span style={{ fontStyle: 'italic', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>{t('summary_undefined')}</span>}
              </p>
            </div>
          </div>

          <div className={styles.summaryFooter}>
            <p className={styles.footerText}>
              {t('summary_engine_label')} • {t('wizard_step')} {currentStep} {t('wizard_of')} 5
            </p>
          </div>
        </div>

      </div>

      {showExitConfirm && (
        <div className={styles.confirmModalBackdrop}>
          <div className={styles.confirmModalBox}>
            <h3 className={styles.confirmTitle}>
              {t('wizard_exit_title')}
            </h3>
            <p className={styles.confirmSub}>
              {t('wizard_exit_sub')}
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className={styles.cancelExitBtn}
              >
                {t('wizard_exit_keep_editing')}
              </button>
              <button
                type="button"
                onClick={confirmExit}
                className={styles.confirmExitBtn}
              >
                {t('wizard_exit_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
