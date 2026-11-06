import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import styles from './PricingSection.module.css';

interface PricingSectionProps {
  onSelectPlan: () => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro' | null>(null);

  const handleSelect = (plan: 'standard' | 'pro') => {
    setSelectedPlan(plan);
    onSelectPlan();
  };

  return (
    <section className={styles.pricingSection}>
      <div className={styles.pricingContainer}>
        
        <div className={styles.headerWrapper}>
          <h2 className={styles.title}>
            {t('pricing_title')}
          </h2>
          <p className={styles.subtitle}>
            {t('pricing_sub')}
          </p>
        </div>

        <div className={styles.cardsGrid}>
          
          {/* Tarjeta 1: Pay-per-video */}
          <div 
            onClick={() => handleSelect('standard')}
            className={`${styles.cardStandard} ${selectedPlan === 'standard' ? styles.cardSelected : ''}`}
          >
            <div className={styles.cardContent}>
              <span className={styles.badgeStandard}>
                {t('no_sub')}
              </span>
              <h3 className={styles.cardTitle}>{t('pay_per_video')}</h3>
              <p className={styles.cardDesc}>{t('pay_per_video_desc')}</p>
              
              <div className={styles.priceWrapper}>
                <span className={styles.priceNumber}>$9</span>
                <span className={styles.priceUnit}>/ video</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('standard');
              }}
              className={styles.btnStandard}
            >
              {t('buy_video')}
            </button>
          </div>

          {/* Tarjeta 2: Suscripción Mensual Pro */}
          <div 
            onClick={() => handleSelect('pro')}
            className={`${styles.cardPro} ${selectedPlan === 'pro' ? styles.cardSelected : ''}`}
          >
            <div className={styles.proBadge}>
              {t('pro_badge')}
            </div>

            <div className={styles.cardContent}>
              <span className={styles.badgePro}>
                {t('monthly_sub')}
              </span>
              <h3 className={styles.cardTitle}>Pro Creator</h3>
              <p className={styles.cardDesc}>{t('pro_desc')}</p>
              
              <div className={styles.priceWrapper}>
                <span className={styles.priceNumber}>$29</span>
                <span className={styles.priceUnit}>/ month</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('pro');
              }}
              className={styles.btnPro}
            >
              {t('try_pro')}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
