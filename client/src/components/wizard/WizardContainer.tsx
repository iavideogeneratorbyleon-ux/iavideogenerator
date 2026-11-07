import { useState } from 'react';
import { useLanguage } from '../landing/LanguageContext';
import WizardStep1, { type WizardData } from './WizardStep1';
import WizardStep2 from './WizardStep2';
import WizardStep3 from './WizardStep3';
import WizardStep4 from './WizardStep4';
import styles from './WizardContainer.module.css';

export default function WizardContainer() {
  const { t, lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<WizardData>({
    scriptIdea: '',
    tone: 'professional',
    voiceId: '',
    aspectRatio: '9:16',
    visualStyle: 'cinematic',
  });

  const updateFormData = (fields: Partial<WizardData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Diccionarios traducibles según el idioma actual
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardContainer}>
        
        {/* COLUMNA IZQUIERDA: Wizard Steps */}
        <div className={styles.leftColumn}>
          <div className={styles.progressHeader}>
            <div className={styles.progressTopRow}>
              <div className={styles.stepInfoGroup}>
                {currentStep > 1 && currentStep < 4 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className={styles.backBtn}
                  >
                    {t('wizard_back_btn')}
                  </button>
                )}
                <span className={styles.stepBadge}>
                  {t('wizard_step')} {currentStep} {t('wizard_of')} 4
                </span>
              </div>
              <span className={styles.progressPercent}>
                {currentStep * 25}% {t('wizard_completed')}
              </span>
            </div>

            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${currentStep * 25}%` }}
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
              onPrev={prevStep}
              toneLabels={toneLabels}
              voiceLabels={voiceLabels}
              styleLabels={styleLabels}
            />
          )}
        </div>

        {/* COLUMNA DERECHA: Resumen en Vivo */}
        <div className={styles.rightColumn}>
          <div className={styles.summaryContent}>
            <div>
              <span className={styles.summaryBadge}>
                {t('summary_live_preview')}
              </span>
              <h2 className={styles.summaryTitle}>{t('summary_project_title')}</h2>
              <p className={styles.summarySub}>{t('summary_project_sub')}</p>
            </div>

            {/* Resumen Idea */}
            <div className={styles.summaryCard}>
              <span className={styles.summaryCardLabel}>{t('summary_concept_label')}</span>
              <p className={styles.summaryCardValue}>
                {formData.scriptIdea ? formData.scriptIdea : <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>{t('summary_undefined')}</span>}
              </p>
            </div>

            {/* Resumen Tono y Formato */}
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

            {/* Resumen Voz */}
            <div className={styles.summaryCard}>
              <span className={styles.summaryCardLabel}>{t('summary_voice_label')}</span>
              <p className={styles.highlightValue}>
                {formData.voiceId ? voiceLabels[formData.voiceId] : <span style={{ fontStyle: 'italic', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>{t('summary_unselected')}</span>}
              </p>
            </div>

            {/* Resumen Estilo Visual */}
            <div className={styles.summaryCard}>
              <span className={styles.summaryCardLabel}>{t('summary_style_label')}</span>
              <p className={styles.highlightValue}>
                {formData.visualStyle ? styleLabels[formData.visualStyle] : <span style={{ fontStyle: 'italic', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>{t('summary_undefined')}</span>}
              </p>
            </div>
          </div>

          <div className={styles.summaryFooter}>
            <p className={styles.footerText}>
              {t('summary_engine_label')} • {t('wizard_step')} {currentStep} {t('wizard_of')} 4
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
