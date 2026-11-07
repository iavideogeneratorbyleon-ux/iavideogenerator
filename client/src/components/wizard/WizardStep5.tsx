import { useState } from 'react';
import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import styles from './WizardStep4.module.css';

interface Step5Props {
  data: WizardData;
  onPrev: () => void;
  toneLabels: Record<string, string>;
  voiceLabels: Record<string, string>;
  styleLabels: Record<string, string>;
}

export default function WizardStep5({ data, onPrev, toneLabels, voiceLabels, styleLabels }: Step5Props) {
  const { lang, t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const musicLabels: Record<string, string> = {
    none: lang === 'en' ? 'No music' : 'Sin música',
    lofi: lang === 'en' ? 'Lo-Fi / Chill' : 'Lo-Fi / Relajante',
    epic: lang === 'en' ? 'Epic / Cinematic' : 'Épico / Cinematográfico',
    upbeat: lang === 'en' ? 'Upbeat / Corporate' : 'Animado / Corporativo',
    tech: lang === 'en' ? 'Cyberpunk / Tech' : 'Cyberpunk / Tech',
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsCompleted(true);
    }, 3000);
  };

  if (isCompleted) {
    return (
      <div className={styles.completedContainer}>
        <div className={styles.successIconWrapper}>✨</div>
        <div className={styles.completedTextGroup}>
          <h1 className={styles.completedTitle}>{t('step4_success_title')}</h1>
          <p className={styles.completedSub}>{t('step4_success_sub')}</p>
        </div>
        <div style={{ paddingTop: '1rem' }}>
          <button type="button" onClick={() => window.location.reload()} className={styles.primaryActionBtn}>
            {t('step4_create_another_btn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>{t('step4_title')}</h1>
          <p className={styles.headingSub}>{t('step4_sub')}</p>
        </div>

        <div className={styles.summaryCardBox}>
          <div className={styles.summarySection}>
            <span className={styles.labelTitle}>{t('step4_concept_label')}</span>
            <p className={styles.conceptText}>{data.scriptIdea || t('summary_undefined')}</p>
          </div>

          <div className={styles.gridTwoCols}>
            <div>
              <span className={styles.labelTitle}>{t('step4_tone_label')}</span>
              <p className={styles.itemValue}>{toneLabels[data.tone] || data.tone}</p>
            </div>
            <div>
              <span className={styles.labelTitle}>{t('step4_format_label')}</span>
              <p className={styles.itemValue}>{data.aspectRatio || '9:16'}</p>
            </div>
          </div>

          <div className={styles.gridTwoColsLast}>
            <div>
              <span className={styles.labelTitle}>{t('step4_voice_label')}</span>
              <p className={styles.itemValue}>{data.voiceId ? voiceLabels[data.voiceId] : t('summary_unselected')}</p>
            </div>
            <div>
              <span className={styles.labelTitle}>{lang === 'en' ? 'Background Music' : 'Música de Fondo'}</span>
              <p className={styles.itemValue}>{musicLabels[data.musicStyle || 'none']}</p>
            </div>
          </div>

          {/* Estilo visual separado abajo para que luzca ordenado */}
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className={styles.labelTitle}>{t('step4_style_label')}</span>
            <p className={styles.itemValue}>{data.visualStyle ? styleLabels[data.visualStyle] : t('summary_undefined')}</p>
          </div>
        </div>

        <div className={styles.creditsNotice}>
          <span className={styles.creditsEmoji}>⚡</span>
          <div className={styles.creditsInfo}>
            <p className={styles.creditsTitle}>{t('step4_credits_title')}</p>
            <p className={styles.creditsDesc}>{t('step4_credits_desc')}</p>
          </div>
        </div>
      </div>

      <div className={styles.footerAction}>
        <button type="button" onClick={onPrev} disabled={isGenerating} className={styles.backBtn}>
          {t('step4_back_btn')}
        </button>
        <button type="button" disabled={isGenerating} onClick={handleGenerate} className={styles.generateBtn}>
          {isGenerating ? (
            <>
              <svg className={styles.spinner} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('step4_generating_btn')}
            </>
          ) : (
            <>{t('step4_generate_btn')}</>
          )}
        </button>
      </div>
    </div>
  );
}
