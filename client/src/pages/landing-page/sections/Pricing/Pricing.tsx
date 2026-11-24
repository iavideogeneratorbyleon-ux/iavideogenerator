import { useTranslation } from '../../../../hooks/useTranslations';
import styles from './Pricing.module.css';

interface LocalizedText {
  en: string;
  es: string;
}

interface PricingPlanItem {
  id: string;
  name: LocalizedText;
  priceMonthly: string;
  description: LocalizedText;
  features: LocalizedText[];
  highlighted?: boolean;
  ctaLabel: LocalizedText;
}

interface PricingProps {
  plans?: PricingPlanItem[];
  onSelectPlan?: (planId: string) => void;
}

const DEFAULT_PRICING: PricingPlanItem[] = [
  {
    id: 'free_trial',
    name: { en: 'Free Trial', es: 'Prueba Gratis' },
    priceMonthly: '$0',
    description: {
      en: 'Explore Studio Lite and test your first creative prompts.',
      es: 'Explora Studio Lite y prueba tus primeros prompts creativos.',
    },
    features: [
      { en: 'Studio Lite guided flow', es: 'Flujo guiado Studio Lite' },
      { en: 'Dual-mode workspace', es: 'Espacio de trabajo dual' },
      { en: 'Starter render credits', es: 'Créditos iniciales de render' },
    ],
    ctaLabel: { en: 'Start Free', es: 'Empezar Gratis' },
  },
  {
    id: 'pro',
    name: { en: 'Pro Studio', es: 'Estudio Pro' },
    priceMonthly: '$19',
    description: {
      en: 'Full creative control, priority rendering, and reusable blueprints.',
      es: 'Control creativo total, render prioritario y blueprints reutilizables.',
    },
    features: [
      { en: 'Director Studio & Blueprints', es: 'Director Studio y Blueprints' },
      { en: 'Expanded monthly credits', es: 'Créditos mensuales ampliados' },
      { en: 'High-resolution exports', es: 'Exportaciones en alta resolución' },
    ],
    highlighted: true,
    ctaLabel: { en: 'Upgrade to Pro', es: 'Subir a Pro' },
  },
];

function Pricing({ plans = DEFAULT_PRICING, onSelectPlan }: PricingProps) {
  const { t, language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';

  return (
    <section id="pricing" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t.landing.pricing.eyebrow}</span>
          <h2 className={styles.title}>{t.landing.pricing.title}</h2>
          <p className={styles.subtitle}>{t.landing.pricing.subtitle}</p>
        </div>

        <div className={styles.grid}>
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`${styles.card} ${plan.highlighted ? styles.cardHighlighted : ''}`}
            >
              <div>
                <div className={styles.cardHeader}>
                  <h3 className={styles.planName}>{plan.name[lang]}</h3>
                  {plan.highlighted && (
                    <span className={styles.popularBadge}>
                      {t.landing.pricing.popularBadge}
                    </span>
                  )}
                </div>

                <div className={styles.priceRow}>
                  <span className={styles.price}>{plan.priceMonthly}</span>
                  <span className={styles.priceSuffix}>
                    {t.landing.pricing.monthlySuffix}
                  </span>
                </div>

                <p className={styles.description}>{plan.description[lang]}</p>

                <ul className={styles.featureList}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className={styles.featureItem}>
                      <span className={styles.featureDot}>●</span>
                      <span>{feat[lang]}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectPlan?.(plan.id)}
                className={`${styles.ctaBtn} ${
                  plan.highlighted ? styles.ctaBtnHighlighted : ''
                }`}
              >
                {plan.ctaLabel[lang]}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Pricing, DEFAULT_PRICING, type PricingProps, type PricingPlanItem };
export default Pricing;
