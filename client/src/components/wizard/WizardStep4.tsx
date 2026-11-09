import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import styles from './WizardStep3.module.css'; // Reutilizamos el estilo de tarjetas

interface Step4Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
  wizardMode?: 'lite' | 'pro'; // Recibimos el modo para aplicar restricciones
}

export default function WizardStep4({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev, 
  wizardMode = 'lite' 
}: Step4Props) {
  const { lang, t } = useLanguage();
  const isPro = wizardMode === 'pro';

  const musicStyles = [
    // Opciones Base (Disponibles en Lite y Pro)
    { 
      id: 'none', 
      label: lang === 'en' ? 'No Background Music' : 'Sin Música de Fondo', 
      desc: lang === 'en' ? 'Clean voice-over only' : 'Solo locución limpia',
      icon: '🔇',
      isProOnly: false 
    },
    { 
      id: 'lofi', 
      label: lang === 'en' ? 'Lo-Fi / Chill' : 'Lo-Fi / Relajante', 
      desc: lang === 'en' ? 'Smooth beats for casual content' : 'Ritmos suaves para contenido casual',
      icon: '☕',
      isProOnly: false 
    },
    // Opciones Exclusivas Pro (Bloqueadas en Lite)
    { 
      id: 'epic', 
      label: lang === 'en' ? 'Epic / Cinematic' : 'Épico / Cinematográfico', 
      desc: lang === 'en' ? 'Dramatic and powerful storytelling vibe' : 'Atmósfera dramática y narrativa potente',
      icon: '⚔️',
      isProOnly: true 
    },
    { 
      id: 'upbeat', 
      label: lang === 'en' ? 'Upbeat / Corporate' : 'Animado / Corporativo', 
      desc: lang === 'en' ? 'Energetic rhythm for ads & promos' : 'Ritmo enérgico para anuncios y promos',
      icon: '🚀',
      isProOnly: true 
    },
    { 
      id: 'tech', 
      label: lang === 'en' ? 'Cyberpunk / Tech' : 'Cyberpunk / Tecnológico', 
      desc: lang === 'en' ? 'Futuristic synth sounds' : 'Sonidos sintetizados futuristas',
      icon: '🤖',
      isProOnly: true 
    },
  ];

  const currentMusic = data.musicStyle || 'none';

  const handleSelectMusic = (musicId: string, isProOnly: boolean) => {
    if (isProOnly && !isPro) return; // Bloquea la selección si es Pro y el usuario está en Lite
    onUpdate({ musicStyle: musicId as WizardData['musicStyle'] });
  };

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
              const isDisabled = item.isProOnly && !isPro;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectMusic(item.id, item.isProOnly)}
                  style={{
                    opacity: isDisabled ? 0.6 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                  className={`${styles.selectionCard} ${isSelected ? styles.selectionCardSelected : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className={styles.cardIcon}>{item.icon}</span>
                      {item.isProOnly && (
                        <span style={{ 
                          background: '#FF6B00', 
                          color: '#FFF', 
                          fontSize: '0.55rem', 
                          padding: '0.1rem 0.3rem', 
                          borderRadius: '0.2rem',
                          fontWeight: 800 
                        }}>
                          PRO 🔒
                        </span>
                      )}
                    </div>
                    {!item.isProOnly || isPro ? (
                      <span
                        className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}
                      >
                        {isSelected && <span className={styles.radioDot} />}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem' }}>🔒</span>
                    )}
                  </div>
                  <div>
                    <p className={styles.cardTitle}>{item.label}</p>
                    <p className={styles.cardDesc} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      {item.desc}
                    </p>
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
