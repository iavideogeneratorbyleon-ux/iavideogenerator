import { useState, useEffect } from 'react';
import { useLanguage } from '../landing/LanguageContext';
import styles from './WizardProcessingStep.module.css';
import { type GenerateVideoResponse } from '../../features/studio-lite/types';

interface WizardProcessingStepProps {
  onComplete: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  generatedResult?: GenerateVideoResponse | null;
}

interface StepItem {
  id: number;
  titleKey: string;
  defaultTitle: string;
}

export default function WizardProcessingStep({ onComplete, setIsProcessing, generatedResult }: WizardProcessingStepProps) {
  const { lang } = useLanguage();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const steps: StepItem[] = [
    { id: 1, titleKey: 'proc_step_1', defaultTitle: lang === 'en' ? 'Analyzing script and creative parameters...' : 'Analizando guión y parámetros creativos...' },
    { id: 2, titleKey: 'proc_step_2', defaultTitle: lang === 'en' ? 'Generating neural voice (ElevenLabs)...' : 'Generando voz neuronal (ElevenLabs)...' },
    { id: 3, titleKey: 'proc_step_3', defaultTitle: lang === 'en' ? 'Rendering structured background and visuals...' : 'Renderizando fondo estructurado y visuales...' },
    { id: 4, titleKey: 'proc_step_4', defaultTitle: lang === 'en' ? 'Composing and mixing background music...' : 'Componiendo y mezclando música de fondo...' },
    { id: 5, titleKey: 'proc_step_5', defaultTitle: lang === 'en' ? 'Finalizing and packaging your video...' : 'Finalizando y empaquetando tu video...' },
  ];

  // Simulamos el avance fluido de las barras de estado mientras llega la respuesta del contenedor
  useEffect(() => {
    setActiveStepIndex(0); 
    setProgress(15);

    const t1 = setTimeout(() => { setActiveStepIndex(1); setProgress(35); }, 1500);
    const t2 = setTimeout(() => { setActiveStepIndex(2); setProgress(60); }, 4000);
    const t3 = setTimeout(() => { setActiveStepIndex(3); setProgress(80); }, 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // En cuanto `generatedResult` llega desde el WizardContainer, completamos el 100% y mostramos el éxito
  useEffect(() => {
    if (generatedResult) {
      setActiveStepIndex(4);
      setProgress(100);
      const finishTimer = setTimeout(() => {
        setIsFinished(true);
      }, 600);
      return () => clearTimeout(finishTimer);
    }
  }, [generatedResult]);

  // Si ya terminó el proceso y tenemos el resultado, mostramos la tarjeta de éxito con descarga real
  if (isFinished && generatedResult) {
    const downloadUrl = `http://localhost:3030${generatedResult.videoUrl}`;

    return (
      <div className={styles.container}>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 className={styles.title}>
            {lang === 'en' ? 'Your Studio Lite Video is Ready!' : '¡Tu video de Studio Lite está listo!'}
          </h2>
          <p className={styles.subtitle}>
            {lang === 'en' 
              ? 'Your video has been successfully generated and saved to your account.' 
              : 'Tu video se ha generado con éxito y se ha guardado en tu cuenta.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '1.5rem' }}>
            <a
              href={downloadUrl}
              download={generatedResult.videoFileName || 'cempai_video.mp4'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(to right, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                padding: '0.85rem 1rem',
                borderRadius: '0.75rem',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                textDecoration: 'none'
              }}
            >
              📥 {lang === 'en' ? 'Download Video (.mp4)' : 'Descargar Video (.mp4)'}
            </a>

            <button
              type="button"
              onClick={onComplete}
              style={{
                background: 'linear-gradient(to right, #f97316, #ea580c)',
                color: '#fff',
                border: 'none',
                padding: '0.85rem 1rem',
                borderRadius: '0.75rem',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
              }}
            >
              🚀 {lang === 'en' ? 'Go to Dashboard' : 'Ir al Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner}></div>
          <span className={styles.progressPercentage}>{progress}%</span>
        </div>

        <h2 className={styles.title}>
          {lang === 'en' ? 'Creating your Studio Lite video...' : 'Creando tu video en Studio Lite...'}
        </h2>
        <p className={styles.subtitle}>
          {lang === 'en' 
            ? 'Our AI engine is working hard. Please do not close this window.' 
            : 'Nuestra IA está trabajando al máximo. Por favor no cierres esta ventana.'}
        </p>

        <div className={styles.stepsList}>
          {steps.map((step, index) => {
            const isCompleted = index < activeStepIndex;
            const isCurrent = index === activeStepIndex;

            return (
              <div 
                key={step.id} 
                className={`${styles.stepItem} ${isCurrent ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              >
                <div className={styles.stepIcon}>
                  {isCompleted ? (
                    <span className={styles.checkIcon}>✓</span>
                  ) : isCurrent ? (
                    <span className={styles.dotPulse}></span>
                  ) : (
                    <span className={styles.pendingDot}></span>
                  )}
                </div>
                <div className={styles.stepText}>
                  <p className={styles.stepTitle}>
                    {step.defaultTitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
