import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import { normalizePlanTier } from '../wizard/wizardPlanConfig';
import { type PlanTier } from '../wizard/wizardStorage';
import styles from './UpgrateModal.module.css';

export interface PlanOptionItem {
  id: PlanTier;
  badge: { en: string; es: string };
  title: { en: string; es: string };
  price: { en: string; es: string };
  description: { en: string; es: string };
  highlight: { en: string; es: string };
}

interface UpgrateModalProps {
  isOpen: boolean;
  initialPlan?: PlanTier;
  onClose: () => void;
  onSelectPlanAndAuth: (plan: PlanTier) => void;
}

const DEFAULT_PLANS: PlanOptionItem[] = [
  {
    id: 'free_trial',
    badge: { en: 'Starter', es: 'Inicial' },
    title: { en: 'Free Trial', es: 'Prueba Gratis' },
    price: { en: '50 credits', es: '50 créditos' },
    description: {
      en: 'Explore Cempa.ai across core presets, visual formats, and 30s clips.',
      es: 'Explora Cempa.ai con presets base, formatos visuales y clips de 30s.',
    },
    highlight: {
      en: '50 starter credits (30/video)',
      es: '50 créditos iniciales (30/video)',
    },
  },
  {
    id: 'pay_per_video',
    badge: { en: 'Flexible', es: 'Flexible' },
    title: { en: 'Pay Per Video', es: 'Pago por Video' },
    price: { en: 'Per video', es: 'Por video' },
    description: {
      en: 'Generate videos on demand with custom scripts, 30s/60s/90s durations, and all styles.',
      es: 'Genera videos bajo demanda con guion propio, 30s/60s/90s y todos los estilos.',
    },
    highlight: {
      en: 'Custom script + all styles',
      es: 'Guion propio + todos los estilos',
    },
  },
  {
    id: 'pro',
    badge: { en: 'Popular', es: 'Popular' },
    title: { en: 'Pro', es: 'Pro' },
    price: { en: 'Monthly', es: 'Mensual' },
    description: {
      en: 'Full creative control across presets, visual formats, voices, and durations.',
      es: 'Control creativo completo en presets, formatos visuales, voces y duraciones.',
    },
    highlight: {
      en: 'Full studio access',
      es: 'Acceso completo al estudio',
    },
  },
  {
    id: 'unlimited',
    badge: { en: 'Studio', es: 'Estudio' },
    title: { en: 'Unlimited', es: 'Ilimitado' },
    price: { en: 'Unlimited', es: 'Ilimitado' },
    description: {
      en: 'Continuous production capacity without credit bottlenecks for active creators.',
      es: 'Capacidad continua de producción sin límites de créditos para creadores activos.',
    },
    highlight: {
      en: 'Unlimited video creation',
      es: 'Creación de videos ilimitada',
    },
  },
];

function UpgrateModal({
  isOpen,
  initialPlan = 'free_trial',
  onClose,
  onSelectPlanAndAuth,
}: UpgrateModalProps) {
  const { t, language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';
  const isSpanish = lang === 'es';
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(
    normalizePlanTier(initialPlan)
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(normalizePlanTier(initialPlan));
    }
  }, [initialPlan, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={
        isSpanish ? 'Planes y acceso de cuenta' : 'Plans and account access'
      }
    >
      <div className={styles.panel}>
        <div className={styles.topBar}>
          <div>
            <span className={styles.kicker}>CEMPA.AI · PLANS</span>
            <h2 className={styles.heading}>
              {isSpanish
                ? 'Selecciona un plan en Cempa.ai'
                : 'Select a plan on Cempa.ai'}
            </h2>
            <p className={styles.lead}>
              {isSpanish
                ? 'Elige el plan que mejor se adapte a tu flujo en la plataforma y continúa con tu cuenta por email o Google.'
                : 'Choose the plan that fits your workflow across the platform and continue with email or Google.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
          >
            ✕ {t.common.cancel}
          </button>
        </div>

        <div className={styles.plansGrid}>
          {DEFAULT_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`${styles.planCard} ${
                  isSelected ? styles.planCardSelected : ''
                }`}
              >
                <div>
                  <span className={styles.planTag}>{plan.badge[lang]}</span>
                  <h3 className={styles.planTitle}>{plan.title[lang]}</h3>
                  <div className={styles.planPrice}>{plan.price[lang]}</div>
                  <p className={styles.planDesc}>{plan.description[lang]}</p>
                </div>

                <div className={styles.planFeature}>{plan.highlight[lang]}</div>
              </button>
            );
          })}
        </div>

        <div className={styles.bottomBar}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelAction}
          >
            {t.common.back}
          </button>

          <button
            type="button"
            onClick={() => onSelectPlanAndAuth(selectedPlan)}
            className={styles.confirmAction}
          >
            {isSpanish
              ? 'Continuar con cuenta'
              : 'Continue with account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export { UpgrateModal, DEFAULT_PLANS, type UpgrateModalProps };
export default UpgrateModal;
