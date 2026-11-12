import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../landing/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import styles from './WizardProcessingStep.module.css';

interface WizardProcessingStepProps {
  onComplete: () => void; // Callback para cerrar el Wizard y mandar al Dashboard
}

interface StepItem {
  id: number;
  titleKey: string;
  defaultTitle: string;
}

export default function WizardProcessingStep({ onComplete }: WizardProcessingStepProps) {
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
    const intervalTime = 900; 
    const totalSteps = steps.length;

    const timer = setInterval(() => {
      setActiveStepIndex((prev) => {
        const next = prev + 1;
        if (next >= totalSteps) {
          clearInterval(timer);
          
          // Guardar el video generado con los parámetros dinámicos UNA SOLA VEZ
          if (user?.email && !hasSavedRef.current) {
            hasSavedRef.current = true;

            // Recuperamos los parámetros del borrador o usamos valores por defecto
            let wizardParameters = {
              scriptIdea: 'Studio Lite Video Generation',
              tone: 'professional',
              voiceId: 'carlos',
              aspectRatio: '9:16',
              visualStyle: 'cinematic',
              musicStyle: 'none'
            };

            try {
              // const savedDraft = localStorage.getItem('cempa_wizard_draft');
              const savedDraft = localStorage.getItem('cempa_pending_video_draft');
              if (savedDraft) {
                const parsed = JSON.parse(savedDraft);
                wizardParameters = {
                  scriptIdea: parsed.scriptIdea || wizardParameters.scriptIdea,
                  tone: parsed.tone || wizardParameters.tone,
                  voiceId: parsed.voiceId || wizardParameters.voiceId,
                  aspectRatio: parsed.aspectRatio || wizardParameters.aspectRatio,
                  visualStyle: parsed.visualStyle || wizardParameters.visualStyle,
                  musicStyle: parsed.musicStyle || wizardParameters.musicStyle,
                };
              }
            } catch (e) {
              console.error('Error al leer el borrador del wizard:', e);
            }

            fetch('http://localhost:3030/api/videos/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                title: wizardParameters.scriptIdea.slice(0, 40) + '...',
                mode: 'lite',
                parameters: wizardParameters // <--- Enviamos los 6 parámetros dinámicos al backend
              })
            })
            .then(async (res) => {
              const data = await res.json();
              if (data.success) {
                if (typeof data.remainingCredits === 'number') {
                  updateCredits(data.remainingCredits);
                }
              } else {
                console.warn('Aviso del servidor:', data.error);
              }
            })
            .catch((err) => console.error('Error al guardar video en historial:', err));
          }

          setTimeout(() => {
            setIsFinished(true);
          }, 600);
          return prev;
        }
        return next;
      });
    }, intervalTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 90);

    return () => {
      clearInterval(timer);
      clearInterval(progressInterval);
    };
  }, [user, updateCredits]);

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
