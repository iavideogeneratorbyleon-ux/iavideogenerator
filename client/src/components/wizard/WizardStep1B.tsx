import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import styles from './WizardStep1B.module.css';
import { SCRIPT_TEMPLATES } from '../../constants/templates';

interface Step1BProps {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
  wizardMode?: 'lite' | 'pro';
}

export default function WizardStep1B({
  data,
  onUpdate,
  onNext,
  onPrev,
  wizardMode = 'lite',
}: Step1BProps) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const isPro = wizardMode === 'pro';
  const isPaidUser = isPro || ['pro', 'unlimited', 'pay_per_video'].includes((user as any)?.plan);

  const tones = [
    {
      id: 'professional',
      label: lang === 'en' ? 'Professional' : 'Profesional',
      desc: lang === 'en' ? 'Serious, clear, and business-focused' : 'Serio, claro y enfocado en negocios',
    },
    {
      id: 'dynamic',
      label: lang === 'en' ? 'Dynamic' : 'Dinámico',
      desc: lang === 'en' ? 'Fast-paced, entertaining, and high energy' : 'Rápido, entretenido y con ritmo alto',
    },
    {
      id: 'casual',
      label: lang === 'en' ? 'Casual' : 'Casual',
      desc: lang === 'en' ? 'Approachable, friendly, and conversational' : 'Cercano, amigable y conversacional',
    },
  ];

  const hooksList = SCRIPT_TEMPLATES.filter((item) => item.type === 'hook');
  const ctasList = SCRIPT_TEMPLATES.filter((item) => item.type === 'cta');

  const handleSelectTemplate = (type: 'hook' | 'cta', templateId: string, isProOnly?: boolean) => {
    if (isProOnly && !isPaidUser) return;

    if (type === 'hook') {
      onUpdate({ introHook: data.introHook === templateId ? '' : templateId });
    } else {
      onUpdate({ outroCta: data.outroCta === templateId ? '' : templateId });
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>
            {lang === 'en' ? 'Structure, Hooks & Tone' : 'Estructura, Ganchos y Tono'}
          </h1>
          <p className={styles.headingSub}>
            {lang === 'en'
              ? 'Customize your video opening, closing CTA, and communication tone.'
              : 'Personaliza la apertura de tu video, el cierre y el tono de comunicación.'}
          </p>
        </div>

        {/* SECCIÓN DE GANCHOS Y CIERRES EN DOS COLUMNAS */}
        <div className={styles.templatesGrid}>
          {/* Columna Ganchos (Hooks) */}
          <div className={styles.templateColumn}>
            <label className={styles.templateColumnLabel}>
              🎣 {lang === 'en' ? 'Intro Hook' : 'Gancho Inicial'}
            </label>
            <div className={styles.templateScrollList}>
              <div
                onClick={() => onUpdate({ introHook: '' })}
                className={`${styles.templateOption} ${!data.introHook ? styles.templateOptionSelected : ''}`}
              >
                <div className={styles.templateOptionTitle}>
                  {lang === 'en' ? '✨ Auto / Default' : '✨ Automático'}
                </div>
              </div>
              {hooksList.map((tpl) => {
                const isSelected = data.introHook === tpl.id;
                const isLocked = tpl.isProOnly && !isPaidUser;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate('hook', tpl.id, tpl.isProOnly)}
                    className={`${styles.templateOption} ${isSelected ? styles.templateOptionSelected : ''} ${isLocked ? styles.templateOptionLocked : ''}`}
                  >
                    <div className={styles.templateOptionTitle}>{tpl.label[lang]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna Cierres (CTAs) */}
          <div className={styles.templateColumn}>
            <label className={styles.templateColumnLabel}>
              🎯 {lang === 'en' ? 'Outro CTA' : 'Cierre / CTA'}
            </label>
            <div className={styles.templateScrollList}>
              <div
                onClick={() => onUpdate({ outroCta: '' })}
                className={`${styles.templateOption} ${!data.outroCta ? styles.templateOptionSelected : ''}`}
              >
                <div className={styles.templateOptionTitle}>
                  {lang === 'en' ? '🚫 None / Default' : '🚫 Ninguno / Default'}
                </div>
              </div>
              {ctasList.map((tpl) => {
                const isSelected = data.outroCta === tpl.id;
                const isLocked = tpl.isProOnly && !isPaidUser;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate('cta', tpl.id, tpl.isProOnly)}
                    className={`${styles.templateOption} ${isSelected ? styles.templateOptionSelected : ''} ${isLocked ? styles.templateOptionLocked : ''}`}
                  >
                    <div className={styles.templateOptionTitle}>{tpl.label[lang]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SELECTOR DE TONO */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            {t('step1_tone_label') || 'Communication Tone'}
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
                    <span className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}>
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

      {/* FOOTER ESTÁNDAR */}
      <div className={styles.footerAction}>
        <button
          type="button"
          onClick={onPrev}
          className={styles.backBtn}
        >
          {t('wizard_back_btn') || (lang === 'en' ? 'Back' : 'Atrás')}
        </button>
        <button
          type="button"
          onClick={onNext}
          className={styles.submitBtn}
        >
          {lang === 'en' ? 'Next: Voice and Style' : 'Siguiente: Voz y Estilo'}
          <svg className={styles.iconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
