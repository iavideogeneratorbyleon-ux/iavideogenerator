import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import styles from './WizardStep3.module.css'; // Reutilizamos el estilo de tarjetas de step3 para mantener consistencia

interface Step4Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function WizardStep4({ data, onUpdate, onNext, onPrev }: Step4Props) {
  const { lang, t } = useLanguage();

  const musicStyles = [
    { 
      id: 'none', 
      label: lang === 'en' ? 'No Background Music' : 'Sin Música de Fondo', 
      desc: lang === 'en' ? 'Clean voice-over only' : 'Solo locución limpia',
      icon: '🔇' 
    },
    { 
      id: 'lofi', 
      label: lang === 'en' ? 'Lo-Fi / Chill' : 'Lo-Fi / Relajante', 
      desc: lang === 'en' ? 'Smooth beats for casual content' : 'Ritmos suaves para contenido casual',
      icon: '☕' 
    },
    { 
      id: 'epic', 
      label: lang === 'en' ? 'Epic / Cinematic' : 'Épico / Cinematográfico', 
      desc: lang === 'en' ? 'Dramatic and powerful storytelling vibe' : 'Atmósfera dramática y narrativa potente',
      icon: '⚔️' 
    },
    { 
      id: 'upbeat', 
      label: lang === 'en' ? 'Upbeat / Corporate' : 'Animado / Corporativo', 
      desc: lang === 'en' ? 'Energetic rhythm for ads & promos' : 'Ritmo enérgico para anuncios y promos',
      icon: '🚀' 
    },
    { 
      id: 'tech', 
      label: lang === 'en' ? 'Cyberpunk / Tech' : 'Cyberpunk / Tecnológico', 
      desc: lang === 'en' ? 'Futuristic synth sounds' : 'Sonidos sintetizados futuristas',
      icon: '🤖' 
    },
  ];

  const currentMusic = data.musicStyle || 'none';

  return (
    <div className={styles.stepContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>
            {lang === 'en' ? 'Background Music' : 'Música de Fondo'}
          </h1>
          <p className={styles.headingSub}>
            {lang === 'en' ? 'Choose an audio vibe to set the mood of your video.' : 'Elige una atmósfera musical para darle ritmo y emoción a tu video.'}
          </p>
        </div>

        {/* Selector de Música */}
        <div className={styles.inputGroup}>
          <div className={styles.cardsGrid}>
            {musicStyles.map((item) => {
              const isSelected = currentMusic === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onUpdate({ musicStyle: item.id as WizardData['musicStyle'] })}
                  className={`${styles.selectionCard} ${isSelected ? styles.selectionCardSelected : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardIcon}>{item.icon}</span>
                    <span
                      className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}
                    >
                      {isSelected && <span className={styles.radioDot} />}
                    </span>
                  </div>
                  <div>
                    <p className={styles.cardTitle}>{item.label}</p>
                    <p className={styles.cardDesc} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.footerAction}>
        <button
          type="button"
          onClick={onPrev}
          className={styles.backBtn}
        >
          {t('step3_back_btn') || (lang === 'en' ? 'Back' : 'Atrás')}
        </button>
        <button
          type="button"
          onClick={onNext}
          className={styles.nextBtn}
        >
          {lang === 'en' ? 'Next: Review' : 'Siguiente: Revisión'}
          <svg className={styles.iconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
