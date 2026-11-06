import { useState } from 'react';
import type { WizardData } from './WizardStep1';
import styles from './WizardStep4.module.css';

interface Step4Props {
  data: WizardData;
  onPrev: () => void;
  toneLabels: Record<string, string>;
  voiceLabels: Record<string, string>;
  styleLabels: Record<string, string>;
}

export default function WizardStep4({ data, onPrev, toneLabels, voiceLabels, styleLabels }: Step4Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulamos un proceso de renderizado con IA de 3 segundos
    setTimeout(() => {
      setIsGenerating(false);
      setIsCompleted(true);
    }, 3000);
  };

  if (isCompleted) {
    return (
      <div className={styles.completedContainer}>
        <div className={styles.successIconWrapper}>
          ✨
        </div>
        <div className={styles.completedTextGroup}>
          <h1 className={styles.completedTitle}>
            ¡Tu video se está generando!
          </h1>
          <p className={styles.completedSub}>
            El motor de Cempasúchil IA ha comenzado el renderizado. Te avisaremos en cuanto esté listo para descargar o compartir.
          </p>
        </div>
        <div style={{ paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={styles.primaryActionBtn}
          >
            Crear otro video
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>
            Resumen de tu proyecto
          </h1>
          <p className={styles.headingSub}>
            Revisa que todos los parámetros sean correctos antes de activar la generación con Inteligencia Artificial.
          </p>
        </div>

        {/* Tarjeta de Resumen Detallado */}
        <div className={styles.summaryCardBox}>
          
          <div className={styles.summarySection}>
            <span className={styles.labelTitle}>Idea / Concepto</span>
            <p className={styles.conceptText}>
              {data.scriptIdea || 'Sin definir'}
            </p>
          </div>

          <div className={styles.gridTwoCols}>
            <div>
              <span className={styles.labelTitle}>Tono</span>
              <p className={styles.itemValue}>
                {toneLabels[data.tone] || data.tone}
              </p>
            </div>
            <div>
              <span className={styles.labelTitle}>Formato (Aspect Ratio)</span>
              <p className={styles.itemValue}>
                {data.aspectRatio || '9:16'}
              </p>
            </div>
          </div>

          <div className={styles.gridTwoColsLast}>
            <div>
              <span className={styles.labelTitle}>Locutor ElevenLabs</span>
              <p className={styles.itemValue}>
                {data.voiceId ? voiceLabels[data.voiceId] : 'No seleccionado'}
              </p>
            </div>
            <div>
              <span className={styles.labelTitle}>Estilo Visual</span>
              <p className={styles.itemValue}>
                {data.visualStyle ? styleLabels[data.visualStyle] : 'Sin definir'}
              </p>
            </div>
          </div>

        </div>

        {/* Aviso de Créditos */}
        <div className={styles.creditsNotice}>
          <span className={styles.creditsEmoji}>⚡</span>
          <div className={styles.creditsInfo}>
            <p className={styles.creditsTitle}>Costo estimado: 1 Crédito de IA</p>
            <p className={styles.creditsDesc}>El proceso tomará aproximadamente entre 30 y 60 segundos.</p>
          </div>
        </div>
      </div>

      {/* Botones de Navegación y Generación */}
      <div className={styles.footerAction}>
        <button
          type="button"
          onClick={onPrev}
          disabled={isGenerating}
          className={styles.backBtn}
        >
          ← Regresar
        </button>
        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerate}
          className={styles.generateBtn}
        >
          {isGenerating ? (
            <>
              <svg className={styles.spinner} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando Video...
            </>
          ) : (
            <>
              🚀 Generar Video con IA
            </>
          )}
        </button>
      </div>
    </div>
  );
}
