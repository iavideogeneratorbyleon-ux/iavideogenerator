import type { WizardData } from './WizardStep1';
import styles from './WizardStep3.module.css';

interface Step3Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function WizardStep3({ data, onUpdate, onNext, onPrev }: Step3Props) {
  const aspectRatios = [
    { id: '9:16', label: 'Vertical (9:16)', tag: 'Reels / TikTok / Shorts', icon: '📱' },
    { id: '16:9', label: 'Horizontal (16:9)', tag: 'YouTube / TV', icon: '🖥️' },
    { id: '1:1', label: 'Cuadrado (1:1)', tag: 'Feed Instagram / LinkedIn', icon: '⏹️' },
  ];

  const visualStyles = [
    { id: 'cinematic', label: 'Cinematográfico', desc: 'Realismo alto, iluminación dramática' },
    { id: '3d-render', label: 'Render 3D', desc: 'Estilo animación 3D moderno y colorido' },
    { id: 'vector', label: 'Vector Minimalista', desc: 'Líneas limpias y estilo gráfico corporativo' },
  ];

  return (
    <div className={styles.stepContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>
            Estilo Visual y Formato
          </h1>
          <p className={styles.headingSub}>
            Define la proporción del video según la plataforma donde lo vas a publicar y su apariencia artística.
          </p>
        </div>

        {/* Selector de Aspect Ratio */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            Orientación del Video
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
            Estilo de Renderizado IA
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
          ← Regresar
        </button>
        <button
          type="button"
          disabled={!data.aspectRatio || !data.visualStyle}
          onClick={onNext}
          className={styles.nextBtn}
        >
          Siguiente: Resumen Final
          <svg className={styles.iconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
