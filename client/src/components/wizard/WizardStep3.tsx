import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import styles from './WizardStep3.module.css';

interface Step3Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function WizardStep3({ data, onUpdate, onNext, onPrev }: Step3Props) {
  const { lang, t } = useLanguage();

  const aspectRatios = [
    { id: '9:16', label: lang === 'en' ? 'Vertical (9:16)' : 'Vertical (9:16)', tag: 'Reels / TikTok / Shorts', icon: '📱' },
    { id: '16:9', label: lang === 'en' ? 'Horizontal (16:9)' : 'Horizontal (16:9)', tag: 'YouTube / TV', icon: '🖥️' },
    { id: '1:1', label: lang === 'en' ? 'Square (1:1)' : 'Cuadrado (1:1)', tag: 'Instagram Feed / LinkedIn', icon: '⏹️' },
  ];

  const visualStyles = [
    { 
      id: 'cinematic', 
      label: lang === 'en' ? 'Cinematic' : 'Cinematográfico', 
      desc: lang === 'en' ? 'High realism, dramatic lighting' : 'Realismo alto, iluminación dramática' 
    },
    { 
      id: '3d-render', 
      label: lang === 'en' ? '3D Render' : 'Render 3D', 
      desc: lang === 'en' ? 'Modern and colorful 3D animation style' : 'Estilo animación 3D moderno y colorido' 
    },
    { 
      id: 'vector', 
      label: lang === 'en' ? 'Minimalist Vector' : 'Vector Minimalista', 
      desc: lang === 'en' ? 'Clean lines and corporate graphic style' : 'Líneas limpias y estilo gráfico corporativo' 
    },
  ];

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
              return (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => onUpdate({ aspectRatio: ratio.id })}
                  className={`${styles.selectionCard} ${isSelected ? styles.selectionCardSelected : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardIcon}>{ratio.icon}</span>
                    <span
                      className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}
                    >
                      {isSelected && <span className={styles.radioDot} />}
                    </span>
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
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onUpdate({ visualStyle: style.id })}
                  className={`${styles.selectionCard} ${isSelected ? styles.selectionCardSelected : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{style.label}</span>
                    <span
                      className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}
                    >
                      {isSelected && <span className={styles.radioDot} />}
                    </span>
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
