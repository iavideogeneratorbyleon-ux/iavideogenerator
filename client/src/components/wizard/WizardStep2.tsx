import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import styles from './WizardStep2.module.css';

interface Step2Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
  wizardMode?: 'lite' | 'pro'; // Recibimos el modo para filtrar/restringir voces Pro
}

export default function WizardStep2({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev, 
  wizardMode = 'lite' 
}: Step2Props) {
  const { lang, t } = useLanguage();
  const isPro = wizardMode === 'pro';

  // 6 Voces totales: 3 Base (Lite y Pro) + 3 Exclusivas (Solo Pro)
  const voices = [
    // Voces Base (Disponibles en Lite y Pro)
    { 
      id: 'carlos', 
      name: lang === 'en' ? 'Carlos (Narrative)' : 'Carlos (Narrativo)', 
      accent: lang === 'en' ? 'Spanish (Latin)' : 'Español (Latino)', 
      gender: lang === 'en' ? 'Male' : 'Masculino', 
      desc: lang === 'en' ? 'Deep, warm, and excellent for documentaries or corporate explanations.' : 'Profundo, cálido y excelente para documentales o explicaciones corporativas.',
      isProOnly: false
    },
    { 
      id: 'sofia', 
      name: lang === 'en' ? 'Sofia (Commercial)' : 'Sofía (Comercial)', 
      accent: lang === 'en' ? 'Spanish (Spain)' : 'Español (España)', 
      gender: lang === 'en' ? 'Female' : 'Femenino', 
      desc: lang === 'en' ? 'Dynamic, clear, and persuasive, ideal for ads and social media.' : 'Dinámica, clara y persuasiva, ideal para anuncios y redes sociales.',
      isProOnly: false
    },
    { 
      id: 'alex', 
      name: lang === 'en' ? 'Alex (Young / Casual)' : 'Alex (Joven / Casual)', 
      accent: lang === 'en' ? 'Spanish (Neutral)' : 'Español (Neutro)', 
      gender: lang === 'en' ? 'Male' : 'Masculino', 
      desc: lang === 'en' ? 'Fresh, approachable, and energetic for lifestyle content.' : 'Fresco, cercano y energético para contenido de estilo lifestyle.',
      isProOnly: false
    },
    // Voces Exclusivas Pro (Bloqueadas si el usuario está en Studio Lite)
    { 
      id: 'valeria', 
      name: lang === 'en' ? 'Valeria (Executive)' : 'Valeria (Ejecutiva)', 
      accent: lang === 'en' ? 'Spanish (Neutral Pro)' : 'Español (Neutro Pro)', 
      gender: lang === 'en' ? 'Female' : 'Femenino', 
      desc: lang === 'en' ? 'Authoritative, precise, and sophisticated for high-end corporate presentations.' : 'Autoritaria, precisa y sofisticada para presentaciones corporativas de alto nivel.',
      isProOnly: true
    },
    { 
      id: 'mateo', 
      name: lang === 'en' ? 'Mateo (Cinematic Trailer)' : 'Mateo (Trailer Cinematográfico)', 
      accent: lang === 'en' ? 'Spanish (Latin)' : 'Español (Latino)', 
      gender: lang === 'en' ? 'Male' : 'Masculino', 
      desc: lang === 'en' ? 'Deep, dramatic trailer voice with intense cinematic gravitas.' : 'Voz profunda y dramática de trailer con gran peso cinematográfico.',
      isProOnly: true
    },
    { 
      id: 'elena', 
      name: lang === 'en' ? 'Elena (Warm Storyteller)' : 'Elena (Narradora Cálida)', 
      accent: lang === 'en' ? 'Spanish (Spain)' : 'Español (España)', 
      gender: lang === 'en' ? 'Female' : 'Femenino', 
      desc: lang === 'en' ? 'Empathetic, soulful voice designed for storytelling and emotional content.' : 'Voz empática y emotiva diseñada para narrativa y contenido emocional.',
      isProOnly: true
    },
  ];

  const handleSelectVoice = (voiceId: string, isProOnly: boolean) => {
    if (isProOnly && !isPro) return; // Evita seleccionar si es Pro y el usuario está en Lite
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
            const isDisabled = voice.isProOnly && !isPro;

            return (
              <div
                key={voice.id}
                onClick={() => handleSelectVoice(voice.id, voice.isProOnly)}
                style={{
                  opacity: isDisabled ? 0.6 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer'
                }}
                className={`${styles.voiceCard} ${isSelected ? styles.voiceCardSelected : ''}`}
              >
                <div className={styles.voiceHeader}>
                  <div className={styles.voiceInfoGroup}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={styles.voiceName}>{voice.name}</span>
                      {voice.isProOnly && (
                        <span style={{ 
                          background: '#FF6B00', 
                          color: '#FFF', 
                          fontSize: '0.6rem', 
                          padding: '0.1rem 0.35rem', 
                          borderRadius: '0.25rem',
                          fontWeight: 800 
                        }}>
                          PRO 🔒
                        </span>
                      )}
                    </div>
                    <span className={styles.voiceAccentBadge}>
                      {voice.accent}
                    </span>
                  </div>
                  
                  {!voice.isProOnly || isPro ? (
                    <span
                      className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}
                    >
                      {isSelected && <span className={styles.radioDot} />}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.85rem' }}>🔒</span>
                  )}
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
