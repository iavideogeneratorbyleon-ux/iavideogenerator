import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import styles from './PricingSection.module.css';

interface PricingProps {
  onSelectPlan: () => void;
}

export default function PricingSection({ onSelectPlan }: PricingProps) {
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro' | 'free' | null>(null);

  const handleSelect = (plan: 'standard' | 'pro' | 'free') => {
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
          
          {/* Opción 1: Single Pass / Pay-Per-Video */}
          <div 
            onClick={() => handleSelect('standard')}
            className={`${styles.cardStandard} ${selectedPlan === 'standard' ? styles.cardSelected : ''}`}
          >
            <div className={styles.cardBody}>
              <span className={styles.badgeMuted}>{t('pricing_no_sub')}</span>
              <h3 className={styles.cardTitle}>{t('pay_per_video')}</h3>
              
              <div className={styles.priceRow}>
                <span className={styles.priceBig}>$4.99</span>
                <span className={styles.priceUnit}>{t('pricing_per_video')}</span>
              </div>
              
              <p className={styles.cardDesc}>
                {t('pay_per_video_desc')}
              </p>
              
              <ul className={styles.featureList}>
                <li className={styles.featureItem}>✓ {t('pricing_feat_1_hd')}</li>
                <li className={styles.featureItem}>✓ {t('pricing_feat_elevenlabs')}</li>
                <li className={styles.featureItem}>✓ {t('pricing_feat_no_watermark')}</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('standard');
              }}
              className={styles.btnStandard}
            >
              {t('pricing_buy_1_video')}
            </button>
          </div>

          {/* Opción 2: Plan Pro Creadores (Destacado) */}
          <div 
            onClick={() => handleSelect('pro')}
            className={`${styles.cardPro} ${selectedPlan === 'pro' ? styles.cardSelected : ''}`}
          >
            <div className={styles.proBadge}>
              {t('pricing_most_popular')}
            </div>

            <div className={`${styles.cardBody} mt-2`}>
              <span className={styles.badgeBrand}>{t('pricing_monthly_sub')}</span>
              <h3 className={styles.cardTitle}>Pro Creator</h3>
              
              <div className={styles.priceRow}>
                <span className={styles.priceBigPro}>$29</span>
                <span className={styles.priceUnit}>{t('pricing_per_month')}</span>
              </div>

              <p className={styles.cardDesc}>
                {t('pricing_pro_desc')}
              </p>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>✓ {t('pricing_feat_15_hd')}</li>
                <li className={styles.featureItem}>✓ {t('pricing_feat_priority')}</li>
                <li className={styles.featureItem}>✓ {t('pricing_feat_fast_render')}</li>
                <li className={styles.featureItem}>✓ {t('pricing_feat_all_styles')}</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('pro');
              }}
              className={styles.btnPro}
            >
              {t('pricing_try_pro')}
            </button>
          </div>

          {/* Opción 3: Créditos Gratis de Prueba */}
          <div 
            onClick={() => handleSelect('free')}
            className={`${styles.cardStandard} ${selectedPlan === 'free' ? styles.cardSelected : ''}`}
          >
            <div className={styles.cardBody}>
              <span className={styles.badgeMuted}>{t('pricing_free_trial')}</span>
              <h3 className={styles.cardTitle}>Free Pass</h3>
              
              <div className={styles.priceRow}>
                <span className={styles.priceBig}>$0</span>
              </div>

              <p className={styles.cardDesc}>
                {t('free_credits')}
              </p>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>✓ {t('pricing_feat_free_credit')}</li>
                <li className={styles.featureItem}>✓ {t('pricing_feat_all_tools')}</li>
                <li className={styles.featureItem}>✓ {t('pricing_feat_no_card')}</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('free');
              }}
              className={styles.btnStandard}
            >
              {t('pricing_start_free')}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
