import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../landing/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import styles from './WizardProcessingStep.module.css';
import { buildMasterVideoPayload } from '../../utils/masterVideoPayload';
import type { WizardData } from './WizardStep1';

interface WizardProcessingStepProps {
  onComplete: () => void; // Callback para cerrar el Wizard y mandar al Dashboard
  setIsProcessing: (isProcessing: boolean) => void
}

interface StepItem {
  id: number;
  titleKey: string;
  defaultTitle: string;
}

export default function WizardProcessingStep({ onComplete, setIsProcessing }: WizardProcessingStepProps) {
  const { lang } = useLanguage();
  const { user, updateCredits } = useAuth();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Candado para evitar peticiones duplicadas al backend 
  const hasSavedRef = useRef<boolean>(false);

  const steps: StepItem[] = [
    { id: 1, titleKey: 'proc_step_1', defaultTitle: lang === 'en' ? 'Analyzing script and creative parameters...' : 'Analizando guión y parámetros creativos...' },
    { id: 2, titleKey: 'proc_step_2', defaultTitle: lang === 'en' ? 'Generating neural voice (ElevenLabs)...' : 'Generando voz neuronal (ElevenLabs)...' },
    { id: 3, titleKey: 'proc_step_3', defaultTitle: lang === 'en' ? 'Rendering structured background and visuals...' : 'Renderizando fondo estructurado y visuales...' },
    { id: 4, titleKey: 'proc_step_4', defaultTitle: lang === 'en' ? 'Composing and mixing background music...' : 'Componiendo y mezclando música de fondo...' },
    { id: 5, titleKey: 'proc_step_5', defaultTitle: lang === 'en' ? 'Finalizing and packaging your video...' : 'Finalizando y empaquetando tu video...' },
  ];

  useEffect(() => {
    // Evitar llamadas duplicadas con el ref
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;

    async function executeRealPipeline() {
      try {
        // 1. Simular avance visual fluido en los primeros 4 pasos mientras el backend procesa
        setActiveStepIndex(0); setProgress(15); // Paso 1: Analizando guion
        
        // Recuperar borrador del wizard guardado en localStorage
        let wizardParameters: WizardData = {
          mode: 'idea',
          scriptIdea: 'Studio Lite Video Generation',
          tone: 'professional',
          voiceId: 'carlos',
          aspectRatio: '9:16',
          visualStyle: 'cinematic',
          musicStyle: 'none',
          subtitles: true
        };

        const savedDraft = localStorage.getItem('cempa_pending_video_draft');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          wizardParameters = { ...wizardParameters, ...parsed };
        }

        // Construir el Master Payload usando el idioma actual de la app (lang)
        const masterPayload = buildMasterVideoPayload({
          wizardData: wizardParameters,
          userId: (user as any)?.id || (user as any)?._id || 'usr_authenticated',
          userPlan: 'free_trial',
          language: lang === 'en' ? 'en' : 'es',
        });

        setTimeout(() => { setActiveStepIndex(1); setProgress(35); }, 1500); // Paso 2: ElevenLabs
        setTimeout(() => { setActiveStepIndex(2); setProgress(60); }, 4000); // Paso 3: Visuales Gemini
        setTimeout(() => { setActiveStepIndex(3); setProgress(80); }, 7500); // Paso 4: Música

        // 🔗 2. Disparar el endpoint unificado real del backend que corre los 5 pasos (incluyendo FFmpeg)
        const response = await fetch('http://localhost:3030/api/studio-lite/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(masterPayload)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Error en el pipeline de renderizado.');
        }

        // 3. Todo OK: Llegamos al paso 5 (Finalizado real)
        setActiveStepIndex(4);
        setProgress(100);

        if (typeof data.remainingCredits === 'number' && updateCredits) {
          updateCredits(data.remainingCredits);
        }

        // Pequeña pausa elegante antes de mostrar la pantalla de éxito con el botón de descarga y Dashboard
        setTimeout(() => {
          setIsFinished(true);
        }, 800);

      } catch (err) {
        console.error('❌ Error crítico ejecutando el pipeline desde el Wizard:', err);
        alert(lang === 'en' ? 'Error generating video. Please try again.' : 'Error generando el video. Por favor intenta de nuevo.');
        setIsProcessing(false); // <--- Aquí se estaría usando, eliminando la advertencia
      }

    }

    if (user?.email) {
      executeRealPipeline();
    }
  }, [user, lang, updateCredits, onComplete]);


  // Si ya terminó el proceso, mostramos la tarjeta de éxito con opciones de descarga
  if (isFinished) {
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
            <button
              type="button"
              onClick={() => alert(lang === 'en' ? 'Downloading video file...' : 'Descargando archivo de video...')}
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
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              📥 {lang === 'en' ? 'Download Video (.mp4)' : 'Descargar Video (.mp4)'}
            </button>

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
