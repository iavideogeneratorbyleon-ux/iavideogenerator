import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import styles from './WizardStep2.module.css';

interface Step2Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function WizardStep2({ data, onUpdate, onNext, onPrev }: Step2Props) {
  const { lang, t } = useLanguage();

  const voices = [
    { 
      id: 'carlos', 
      name: lang === 'en' ? 'Carlos (Narrative)' : 'Carlos (Narrativo)', 
      accent: lang === 'en' ? 'Spanish (Latin)' : 'Español (Latino)', 
      gender: lang === 'en' ? 'Male' : 'Masculino', 
      desc: lang === 'en' ? 'Deep, warm, and excellent for documentaries or corporate explanations.' : 'Profundo, cálido y excelente para documentales o explicaciones corporativas.' 
    },
    { 
      id: 'sofia', 
      name: lang === 'en' ? 'Sofia (Commercial)' : 'Sofía (Comercial)', 
      accent: lang === 'en' ? 'Spanish (Spain)' : 'Español (España)', 
      gender: lang === 'en' ? 'Female' : 'Femenino', 
      desc: lang === 'en' ? 'Dynamic, clear, and persuasive, ideal for ads and social media.' : 'Dinámica, clara y persuasiva, ideal para anuncios y redes sociales.' 
    },
    { 
      id: 'alex', 
      name: lang === 'en' ? 'Alex (Young / Casual)' : 'Alex (Joven / Casual)', 
      accent: lang === 'en' ? 'Spanish (Neutral)' : 'Español (Neutro)', 
      gender: lang === 'en' ? 'Male' : 'Masculino', 
      desc: lang === 'en' ? 'Fresh, approachable, and energetic for lifestyle content.' : 'Fresco, cercano y energético para contenido de estilo lifestyle.' 
    },
  ];

  const handleSelectVoice = (voiceId: string) => {
    onUpdate({ voiceId });
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>
            {t('step2_title')}
          </h1>
          <p className={styles.headingSub}>
            {t('step2_sub')}
          </p>
        </div>

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

      <div className={styles.footerAction}>
        <button
          type="button"
          onClick={onPrev}
          className={styles.backBtn}
        >
          {t('step2_back_btn')}
        </button>
        <button
          type="button"
          disabled={!data.voiceId}
          onClick={onNext}
          className={styles.nextBtn}
        >
          {t('step2_next_btn')}
          <svg className={styles.iconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
