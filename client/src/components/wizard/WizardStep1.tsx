import React from 'react';
import { useLanguage } from '../landing/LanguageContext';
import styles from './WizardStep1.module.css';

export type WizardData = {
  mode?: 'idea' | 'script';
  scriptIdea: string;
  visualPrompt?: string;
  tone: string;
  voiceId?: string;
  aspectRatio?: string;
  visualStyle?: string;
  musicStyle?: 'none' | 'lofi' | 'epic' | 'upbeat' | 'tech';
  subtitles: boolean;
};

interface Step1Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  wizardMode?: 'lite' | 'pro';
}

export default function WizardStep1({ 
  data, 
  onUpdate, 
  onNext, 
  wizardMode = 'lite' 
}: Step1Props) {
  const { t, lang } = useLanguage();

  // En Studio Lite, forzamos el modo a 'idea'
  const isPro = wizardMode === 'pro';
  const currentMode = isPro ? (data.mode || 'idea') : 'idea';

  const tones = [
    { 
      id: 'professional', 
      label: lang === 'en' ? 'Professional' : 'Profesional', 
      desc: lang === 'en' ? 'Serious, clear, and business-focused' : 'Serio, claro y enfocado en negocios' 
    },
    { 
      id: 'dynamic', 
      label: lang === 'en' ? 'Dynamic' : 'Dinámico', 
      desc: lang === 'en' ? 'Fast-paced, entertaining, and high energy' : 'Rápido, entretenido y con ritmo alto' 
    },
    { 
      id: 'casual', 
      label: lang === 'en' ? 'Casual' : 'Casual', 
      desc: lang === 'en' ? 'Approachable, friendly, and conversational' : 'Cercano, amigable y conversacional' 
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.scriptIdea.trim()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.contentSection}>
        
        <div>
          <h1 className={styles.headingTitle}>
            {t('step1_title')}
          </h1>
          <p className={styles.headingSub}>
            {t('step1_sub')}
          </p>
        </div>

        {/* SELECTOR DE MÉTODO DE CREACIÓN */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            {lang === 'en' ? 'Select Creation Method' : 'Selecciona el método de creación'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            
            {/* Opción 1: Generar desde idea (Habilitada en ambos) */}
            <button
              type="button"
              onClick={() => onUpdate({ mode: 'idea' })}
              style={{
                background: currentMode === 'idea' ? 'rgba(255, 107, 0, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                border: `1px solid ${currentMode === 'idea' ? 'var(--color-brand-primary, #FF6B00)' : 'rgba(255, 255, 255, 0.08)'}`,
                color: currentMode === 'idea' ? 'var(--color-brand-primary, #FF6B00)' : 'var(--color-text-muted, #94A3B8)',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {lang === 'en' ? '💡 AI Idea Generator' : '💡 Generar desde Idea'}
            </button>

            {/* Opción 2: Guion propio (Exclusiva Studio Pro) */}
            <button
              type="button"
              disabled={!isPro}
              onClick={() => isPro && onUpdate({ mode: 'script' })}
              title={!isPro ? (lang === 'en' ? 'Available in Studio Pro' : 'Disponible en Studio Pro') : undefined}
              style={{
                background: currentMode === 'script' 
                  ? 'rgba(255, 107, 0, 0.15)' 
                  : isPro 
                    ? 'rgba(30, 41, 59, 0.5)' 
                    : 'rgba(30, 41, 59, 0.25)',
                border: `1px solid ${currentMode === 'script' ? 'var(--color-brand-primary, #FF6B00)' : 'rgba(255, 255, 255, 0.08)'}`,
                color: isPro 
                  ? (currentMode === 'script' ? 'var(--color-brand-primary, #FF6B00)' : 'var(--color-text-muted, #94A3B8)') 
                  : '#64748B',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: isPro ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                opacity: isPro ? 1 : 0.6
              }}
            >
              <span>{lang === 'en' ? '📝 My Own Script' : '📝 Tengo mi Guion'}</span>
              {!isPro && (
                <span style={{ 
                  background: '#FF6B00', 
                  color: '#FFF', 
                  fontSize: '0.65rem', 
                  padding: '0.1rem 0.35rem', 
                  borderRadius: '0.25rem',
                  fontWeight: 800,
                  marginLeft: '0.2rem'
                }}>
                  PRO 🔒
                </span>
              )}
            </button>

          </div>
        </div>

        {/* MODO A: GENERAR DESDE IDEA GENERAL (Studio Lite & Pro) */}
        {currentMode === 'idea' ? (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              {t('step1_input_label')}
            </label>
            <textarea
              rows={4}
              value={data.scriptIdea}
              onChange={(e) => onUpdate({ scriptIdea: e.target.value })}
              placeholder={t('step1_placeholder')}
              className={styles.textareaField}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #94A3B8)', marginTop: '0.25rem', display: 'block' }}>
              {lang === 'en' 
                ? '✨ Our AI will write the script, handle scene transitions, and sync the audio.' 
                : '✨ Nuestra IA redactará el guion, gestionará las escenas y sincronizará el audio.'}
            </span>
          </div>
        ) : (
          /* MODO B: GUION PROPIO + PROMPT DIRECCIÓN VISUAL (Exclusivo Studio Pro) */
          <>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                {lang === 'en' ? '1. Paste your exact script or dialogue:' : '1. Pega tu guion o diálogo exacto:'}
              </label>
              <textarea
                rows={4}
                value={data.scriptIdea}
                onChange={(e) => onUpdate({ scriptIdea: e.target.value })}
                placeholder={lang === 'en' ? 'E.g., [Narrator]: Welcome back to the channel. Today we talk about...' : 'Ej., [Narrador]: Bienvenidos al canal. Hoy hablaremos sobre...'}
                className={styles.textareaField}
                required
              />
            </div>

            <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
              <label className={styles.inputLabel}>
                {lang === 'en' ? '2. Visual context / idea for the scenes (Optional):' : '2. Contexto de la idea / Dirección visual (Opcional):'}
              </label>
              <textarea
                rows={2}
                value={data.visualPrompt || ''}
                onChange={(e) => onUpdate({ visualPrompt: e.target.value })}
                placeholder={lang === 'en' ? 'E.g., Show 3D golden spirals, mathematical formulas floating in dark space...' : 'Ej., Muestra espirales doradas 3D, fórmulas matemáticas flotando en el espacio oscuro...'}
                className={styles.textareaField}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #94A3B8)', marginTop: '0.25rem', display: 'block' }}>
                {lang === 'en'
                  ? '🎨 Describe the imagery you want the AI to generate while your script plays.'
                  : '🎨 Describe las imágenes que quieres que la IA genere mientras suena tu guion.'}
              </span>
            </div>
          </>
        )}

        {/* SELECTOR DE TONO (Habilitado para Studio Lite y Studio Pro) */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            {t('step1_tone_label')}
          </label>
          <div className={styles.tonesGrid}>
            {tones.map((tone) => {
              const isSelected = data.tone === tone.id;
              return (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => onUpdate({ tone: tone.id })}
                  className={`${styles.toneCard} ${isSelected ? styles.toneCardSelected : ''}`}
                >
                  <div className={styles.toneHeader}>
                    <span className={styles.toneTitle}>{tone.label}</span>
                    <span
                      className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}
                    >
                      {isSelected && <span className={styles.radioDot} />}
                    </span>
                  </div>
                  <p className={styles.toneDesc}>{tone.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.footerAction}>
        <button
          type="button"
          disabled={!data.scriptIdea.trim()}
          onClick={handleSubmit}
          className={styles.submitBtn}
        >
          {t('step1_next_btn')}
          <svg className={styles.iconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
