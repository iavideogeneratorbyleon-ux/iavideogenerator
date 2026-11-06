import React from 'react';
import styles from './WizardStep1.module.css';

// Exportamos explícitamente el tipo con 'export type'
export type WizardData = {
  scriptIdea: string;
  tone: string;
  voiceId?: string;
  aspectRatio?: string;
  visualStyle?: string;
};

interface Step1Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
}

export default function WizardStep1({ data, onUpdate, onNext }: Step1Props) {
  const tones = [
    { id: 'professional', label: 'Profesional', desc: 'Serio, claro y enfocado en negocios' },
    { id: 'dynamic', label: 'Dinámico', desc: 'Rápido, entretenido y con ritmo alto' },
    { id: 'casual', label: 'Casual', desc: 'Cercano, amigable y conversacional' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.scriptIdea.trim()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {/* Sección principal del contenido */}
      <div className={styles.contentSection}>
        
        {/* Encabezado de la sección */}
        <div>
          <h1 className={styles.headingTitle}>
            ¿De qué tratará tu video?
          </h1>
          <p className={styles.headingSub}>
            Describe la idea o concepto principal. La IA estructurará el guion optimizado para tu audiencia.
          </p>
        </div>

        {/* Input / Textarea del prompt */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            Idea o Guion Inicial
          </label>
          <textarea
            rows={4}
            value={data.scriptIdea}
            onChange={(e) => onUpdate({ scriptIdea: e.target.value })}
            placeholder="Ej. Un video corto explicando las ventajas de nuestra nueva aplicación móvil para emprendedores..."
            className={styles.textareaField}
            required
          />
        </div>

        {/* Selector de Tono */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            Tono de Comunicación
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

      {/* Footer / Acción principal */}
      <div className={styles.footerAction}>
        <button
          type="submit"
          disabled={!data.scriptIdea.trim()}
          className={styles.submitBtn}
        >
          Siguiente: Voz y Estilo
          <svg className={styles.iconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
