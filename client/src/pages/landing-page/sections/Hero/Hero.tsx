import { useState } from 'react';
import { useTranslation } from '../../../../hooks/useTranslations';
import styles from './Hero.module.css';

interface HeroProps {
  onStartWizard?: (initialPrompt: string) => void;
}

function Hero({ onStartWizard }: HeroProps) {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');

  const quickPrompts = [
    t.landing.hero.quickPrompt1,
    t.landing.hero.quickPrompt2,
    t.landing.hero.quickPrompt3,
  ];

  return (
    <section id="hero" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>{t.landing.hero.badge}</span>
          <h1 className={styles.headline}>
            {t.landing.hero.headlineStart}{' '}
            <span className={styles.headlineHighlight}>
              {t.landing.hero.headlineHighlight}
            </span>
          </h1>
          <p className={styles.subtitle}>{t.landing.hero.subtitle}</p>
        </div>

        <div className={styles.composerCard}>
          <div className={styles.composerTopBar}>
            <span className={styles.composerLabel}>
              {t.landing.hero.composerLabel}
            </span>
            <span className={styles.cursorHint}>{t.landing.hero.cursorHint}</span>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.landing.hero.placeholder}
            className={styles.promptTextarea}
            rows={3}
          />

          <div className={styles.quickPromptsRow}>
            {quickPrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(sample)}
                className={styles.quickPromptChip}
              >
                {sample}
              </button>
            ))}
          </div>

          <div className={styles.composerFooter}>
            <p className={styles.footerNote}>{t.landing.hero.footerNote}</p>

            <div className={styles.actionsGroup}>
              <a href="#products" className={styles.secondaryBtn}>
                {t.landing.hero.secondaryCta}
              </a>
              <button
                type="button"
                onClick={() => onStartWizard?.(prompt)}
                className={styles.primaryBtn}
              >
                {t.landing.hero.primaryCta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Hero, type HeroProps };
export default Hero;
