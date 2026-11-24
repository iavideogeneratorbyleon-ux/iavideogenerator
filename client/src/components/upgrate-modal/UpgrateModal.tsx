import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
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
    badge: { en: 'Free', es: 'Gratis' },
    title: { en: 'Free Trial', es: 'Prueba Gratis' },
    price: { en: '$0', es: '$0' },
    description: {
      en: 'Create your first video with core presets and formats.',
      es: 'Crea tu primer video con presets y formatos base.',
    },
    highlight: {
      en: 'Includes 1 starter video',
      es: 'Incluye 1 video inicial',
    },
  },
  {
    id: 'pay_per_video',
    badge: { en: 'Flexible', es: 'Flexible' },
    title: { en: 'Pay Per Video', es: 'Pago por Video' },
    price: { en: 'Per clip', es: 'Por video' },
    description: {
      en: 'Pay only when you render extra videos without monthly lock-in.',
      es: 'Paga solo por video generado sin suscripción mensual.',
    },
    highlight: {
      en: 'Unlocks extra styles',
      es: 'Desbloquea estilos extra',
    },
  },
  {
    id: 'pro',
    badge: { en: 'Popular', es: 'Popular' },
    title: { en: 'Pro', es: 'Pro' },
    price: { en: 'Monthly', es: 'Mensual' },
    description: {
      en: 'Full access to presets, visual formats, and longer durations.',
      es: 'Acceso completo a presets, formatos visuales y mayor duración.',
    },
    highlight: {
      en: '60s clips + full formats',
      es: 'Clips de 60s + formatos',
    },
  },
  {
    id: 'unlimited',
    badge: { en: 'Studio', es: 'Estudio' },
    title: { en: 'Unlimited', es: 'Ilimitado' },
    price: { en: 'Unlimited', es: 'Ilimitado' },
    description: {
      en: 'High-volume creation workflow for continuous publishing.',
      es: 'Flujo de creación continuo sin límites mensuales.',
    },
    highlight: {
      en: 'Priority rendering',
      es: 'Render prioritario',
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
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(initialPlan);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={
        isSpanish ? 'Elige tu plan para continuar' : 'Choose your plan to continue'
      }
    >
      <div className={styles.panel}>
        <div className={styles.topBar}>
          <div>
            <span className={styles.kicker}>CEMPA.AI · PLANS & SIGN UP</span>
            <h2 className={styles.heading}>
              {isSpanish
                ? 'Elige un plan para generar tu video'
                : 'Choose a plan to generate your video'}
            </h2>
            <p className={styles.lead}>
              {isSpanish
                ? 'Tu configuración del Wizard ya está guardada. Elige tu plan y continúa con tu registro o acceso por email o Google.'
                : 'Your Wizard setup is saved. Pick a plan and continue to sign up or sign in with email or Google.'}
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
              ? 'Continuar con registro / acceso'
              : 'Continue to sign up / sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

export { UpgrateModal, DEFAULT_PLANS, type UpgrateModalProps };
export default UpgrateModal;
