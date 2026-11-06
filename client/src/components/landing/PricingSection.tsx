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
              <span className={styles.badgeMuted}>Sin Suscripción</span>
              <h3 className={styles.cardTitle}>{t('pay_per_video')}</h3>
              
              <div className={styles.priceRow}>
                <span className={styles.priceBig}>$4.99</span>
                <span className={styles.priceUnit}>/ video</span>
              </div>
              
              <p className={styles.cardDesc}>
                {t('pay_per_video_desc')}
              </p>
              
              <ul className={styles.featureList}>
                <li className={styles.featureItem}>✓ 1 Video HD completo</li>
                <li className={styles.featureItem}>✓ Voces ElevenLabs incluidas</li>
                <li className={styles.featureItem}>✓ Exportación sin marca de agua</li>
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
              Comprar 1 Video
            </button>
          </div>

          {/* Opción 2: Plan Pro Creadores (Destacado) */}
          <div 
            onClick={() => handleSelect('pro')}
            className={`${styles.cardPro} ${selectedPlan === 'pro' ? styles.cardSelected : ''}`}
          >
            <div className={styles.proBadge}>
              Más Popular
            </div>

            <div className={`${styles.cardBody} mt-2`}>
              <span className={styles.badgeBrand}>Suscripción Mensual</span>
              <h3 className={styles.cardTitle}>Pro Creator</h3>
              
              <div className={styles.priceRow}>
                <span className={styles.priceBigPro}>$29</span>
                <span className={styles.priceUnit}>/ mes</span>
              </div>

              <p className={styles.cardDesc}>
                Para creadores y marcas que publican contenido semanalmente en TikTok y Reels.
              </p>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>✓ 15 Videos HD al mes</li>
                <li className={styles.featureItem}>✓ Soporte prioritario ElevenLabs</li>
                <li className={styles.featureItem}>✓ Renderizado ultra rápido</li>
                <li className={styles.featureItem}>✓ Acceso a todos los estilos visuales</li>
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
              Probar Plan Pro
            </button>
          </div>

          {/* Opción 3: Créditos Gratis de Prueba */}
          <div 
            onClick={() => handleSelect('free')}
            className={`${styles.cardStandard} ${selectedPlan === 'free' ? styles.cardSelected : ''}`}
          >
            <div className={styles.cardBody}>
              <span className={styles.badgeMuted}>Prueba Gratuita</span>
              <h3 className={styles.cardTitle}>Free Pass</h3>
              
              <div className={styles.priceRow}>
                <span className={styles.priceBig}>$0</span>
              </div>

              <p className={styles.cardDesc}>
                {t('free_credits')}
              </p>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>✓ 1 Crédito de prueba gratis</li>
                <li className={styles.featureItem}>✓ Acceso a todas las herramientas</li>
                <li className={styles.featureItem}>✓ Sin tarjeta de crédito requerida</li>
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
              Comenzar Gratis
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
