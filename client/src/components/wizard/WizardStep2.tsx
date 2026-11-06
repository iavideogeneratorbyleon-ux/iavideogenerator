import type { WizardData } from './WizardStep1';
import styles from './WizardStep2.module.css';

interface Step2Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function WizardStep2({ data, onUpdate, onNext, onPrev }: Step2Props) {
  // Voces simuladas inspiradas en ElevenLabs
  const voices = [
    { id: 'carlos', name: 'Carlos (Narrativo)', accent: 'Español (Latino)', gender: 'Masculino', desc: 'Profundo, cálido y excelente para documentales o explicaciones corporativas.' },
    { id: 'sofia', name: 'Sofía (Comercial)', accent: 'Español (España)', gender: 'Femenino', desc: 'Dinámica, clara y persuasiva, ideal para anuncios y redes sociales.' },
    { id: 'alex', name: 'Alex (Joven / Casual)', accent: 'Español (Neutro)', gender: 'Masculino', desc: 'Fresco, cercano y energético para contenido de estilo lifestyle.' },
  ];

  const handleSelectVoice = (voiceId: string) => {
    onUpdate({ voiceId });
  };

  return (
    <div className={styles.stepContainer}>
      {/* Sección principal */}
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>
            Elige la voz de tu video
          </h1>
          <p className={styles.headingSub}>
            Selecciona la locución de IA impulsada por ElevenLabs que mejor se adapte a la personalidad de tu marca.
          </p>
        </div>

        {/* Listado de Voces */}
        <div className={styles.voicesList}>
          {voices.map((voice) => {
            const isSelected = data.voiceId === voice.id;
            return (
              <div
                key={voice.id}
                onClick={() => handleSelectVoice(voice.id)}
                className={`${styles.voiceCard} ${isSelected ? styles.voiceCardSelected : ''}`}
              >
                <div className={styles.voiceHeader}>
                  <div className={styles.voiceInfoGroup}>
                    <span className={styles.voiceName}>{voice.name}</span>
                    <span className={styles.voiceAccentBadge}>
                      {voice.accent}
                    </span>
                  </div>
                  <span
                    className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}
                  >
                    {isSelected && <span className={styles.radioDot} />}
                  </span>
                </div>
                <p className={styles.voiceDesc}>{voice.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botones de navegación inferiores */}
      <div className={styles.footerAction}>
        <button
          type="button"
          onClick={onPrev}
          className={styles.backBtn}
        >
          ← Regresar
        </button>
        <button
          type="button"
          disabled={!data.voiceId}
          onClick={onNext}
          className={styles.nextBtn}
        >
          Siguiente: Estilo Visual
          <svg className={styles.iconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
