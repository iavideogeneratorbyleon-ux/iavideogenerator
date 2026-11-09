import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import styles from './WizardStep3.module.css';

interface Step3Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
  wizardMode?: 'lite' | 'pro'; // Recibimos el modo para aplicar restricciones
}

export default function WizardStep3({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev, 
  wizardMode = 'lite' 
}: Step3Props) {
  const { lang, t } = useLanguage();
  const isPro = wizardMode === 'pro';

  // Formatos: 1:1 es exclusivo Pro
  const aspectRatios = [
    { id: '9:16', label: lang === 'en' ? 'Vertical (9:16)' : 'Vertical (9:16)', tag: 'Reels / TikTok / Shorts', icon: '📱', isProOnly: false },
    { id: '16:9', label: lang === 'en' ? 'Horizontal (16:9)' : 'Horizontal (16:9)', tag: 'YouTube / TV', icon: '🖥️', isProOnly: false },
    { id: '1:1', label: lang === 'en' ? 'Square (1:1)' : 'Cuadrado (1:1)', tag: 'Instagram Feed / LinkedIn', icon: '⏹️', isProOnly: true },
  ];

  // Estilos visuales: 3 base + 2 exclusivos Pro
  const visualStyles = [
    // Base (Lite y Pro)
    { 
      id: 'cinematic', 
      label: lang === 'en' ? 'Cinematic' : 'Cinematográfico', 
      desc: lang === 'en' ? 'High realism, dramatic lighting' : 'Realismo alto, iluminación dramática',
      isProOnly: false
    },
    { 
      id: '3d-render', 
      label: lang === 'en' ? '3D Render' : 'Render 3D', 
      desc: lang === 'en' ? 'Modern and colorful 3D animation style' : 'Estilo animación 3D moderno y colorido',
      isProOnly: false
    },
    { 
      id: 'vector', 
      label: lang === 'en' ? 'Minimalist Vector' : 'Vector Minimalista', 
      desc: lang === 'en' ? 'Clean lines and corporate graphic style' : 'Líneas limpias y estilo gráfico corporativo',
      isProOnly: false
    },
    // Exclusivos Pro
    { 
      id: 'anime', 
      label: lang === 'en' ? 'Anime / Concept Art' : 'Anime / Arte Conceptual', 
      desc: lang === 'en' ? 'Vibrant Japanese animation and artistic concept design' : 'Animación japonesa vibrante y diseño artístico conceptual',
      isProOnly: true
    },
    { 
      id: 'photorealistic', 
      label: lang === 'en' ? 'Photorealistic Studio' : 'Estudio Fotorrealista', 
      desc: lang === 'en' ? 'Ultra-high fidelity studio photography style' : 'Estilo de fotografía de estudio de ultra alta fidelidad',
      isProOnly: true
    },
  ];

  const handleSelectAspect = (ratioId: string, isProOnly: boolean) => {
    if (isProOnly && !isPro) return;
    onUpdate({ aspectRatio: ratioId });
  };

  const handleSelectStyle = (styleId: string, isProOnly: boolean) => {
    if (isProOnly && !isPro) return;
    onUpdate({ visualStyle: styleId });
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>
            {t('step3_title')}
          </h1>
          <p className={styles.headingSub}>
            {t('step3_sub')}
          </p>
        </div>

        {/* Selector de Aspect Ratio */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            {t('step3_orientation_label')}
          </label>
          <div className={styles.cardsGrid}>
            {aspectRatios.map((ratio) => {
              const isSelected = data.aspectRatio === ratio.id;
              const isDisabled = ratio.isProOnly && !isPro;

              return (
                <button
                  key={ratio.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectAspect(ratio.id, ratio.isProOnly)}
                  style={{
                    opacity: isDisabled ? 0.6 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                  className={`${styles.selectionCard} ${isSelected ? styles.selectionCardSelected : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className={styles.cardIcon}>{ratio.icon}</span>
                      {ratio.isProOnly && (
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
                    {!ratio.isProOnly || isPro ? (
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
                    <p className={styles.cardTitle}>{ratio.label}</p>
                    <span className={styles.cardTag}>{ratio.tag}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector de Estilo Visual */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            {t('step3_style_label')}
          </label>
          <div className={styles.cardsGrid}>
            {visualStyles.map((style) => {
              const isSelected = data.visualStyle === style.id;
              const isDisabled = style.isProOnly && !isPro;

              return (
                <button
                  key={style.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectStyle(style.id, style.isProOnly)}
                  style={{
                    opacity: isDisabled ? 0.6 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                  className={`${styles.selectionCard} ${isSelected ? styles.selectionCardSelected : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className={styles.cardTitle}>{style.label}</span>
                      {style.isProOnly && (
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
                    {!style.isProOnly || isPro ? (
                      <span
                        className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}
                      >
                        {isSelected && <span className={styles.radioDot} />}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem' }}>🔒</span>
                    )}
                  </div>
                  <p className={styles.cardDesc}>{style.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Botones de Navegación */}
      <div className={styles.footerAction}>
        <button
          type="button"
          onClick={onPrev}
          className={styles.backBtn}
        >
          {t('step3_back_btn')}
        </button>
        <button
          type="button"
          disabled={!data.aspectRatio || !data.visualStyle}
          onClick={onNext}
          className={styles.nextBtn}
        >
          {t('step3_next_btn')}
          <svg className={styles.iconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
