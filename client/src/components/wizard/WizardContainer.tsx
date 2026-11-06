import { useState } from 'react';
import WizardStep1, { type WizardData } from './WizardStep1';
import WizardStep2 from './WizardStep2';
import WizardStep3 from './WizardStep3';
import WizardStep4 from './WizardStep4';
import styles from './WizardContainer.module.css';

export default function WizardContainer() {
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

  const toneLabels: Record<string, string> = {
    professional: 'Profesional',
    dynamic: 'Dinámico',
    casual: 'Casual',
  };

  const voiceLabels: Record<string, string> = {
    carlos: 'Carlos (Narrativo)',
    sofia: 'Sofía (Comercial)',
    alex: 'Alex (Joven / Casual)',
  };

  const styleLabels: Record<string, string> = {
    cinematic: 'Cinematográfico',
    '3d-render': 'Render 3D',
    vector: 'Vector Minimalista',
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
                    ← Atrás
                  </button>
                )}
                <span className={styles.stepBadge}>
                  Paso {currentStep} de 4
                </span>
              </div>
              <span className={styles.progressPercent}>
                {currentStep * 25}% Completado
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
                Vista Previa en Vivo
              </span>
              <h2 className={styles.summaryTitle}>Tu Proyecto</h2>
              <p className={styles.summarySub}>Resumen de los parámetros de tu video.</p>
            </div>

            {/* Resumen Idea */}
            <div className={styles.summaryCard}>
              <span className={styles.summaryCardLabel}>Concepto</span>
              <p className={styles.summaryCardValue}>
                {formData.scriptIdea ? formData.scriptIdea : <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Sin definir...</span>}
              </p>
            </div>

            {/* Resumen Tono y Formato */}
            <div className={styles.summaryGrid}>
              <div className={styles.summarySubCard}>
                <span className={styles.summaryCardLabel}>Tono</span>
                <p className={styles.highlightValue}>
                  {toneLabels[formData.tone] || formData.tone}
                </p>
              </div>
              <div className={styles.summarySubCard}>
                <span className={styles.summaryCardLabel}>Formato</span>
                <p className={styles.highlightValue}>
                  {formData.aspectRatio || '9:16'}
                </p>
              </div>
            </div>

            {/* Resumen Voz */}
            <div className={styles.summaryCard}>
              <span className={styles.summaryCardLabel}>Locutor ElevenLabs</span>
              <p className={styles.highlightValue}>
                {formData.voiceId ? voiceLabels[formData.voiceId] : <span style={{ fontStyle: 'italic', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>No seleccionada</span>}
              </p>
            </div>

            {/* Resumen Estilo Visual */}
            <div className={styles.summaryCard}>
              <span className={styles.summaryCardLabel}>Estilo Visual</span>
              <p className={styles.highlightValue}>
                {formData.visualStyle ? styleLabels[formData.visualStyle] : <span style={{ fontStyle: 'italic', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>Sin definir</span>}
              </p>
            </div>
          </div>

          <div className={styles.summaryFooter}>
            <p className={styles.footerText}>
              Motor de IA Cempasúchil • Paso {currentStep} de 4
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
