import { useLanguage } from '../landing/LanguageContext';
import styles from './UpgrateModal.module.css';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planName: string) => void;
}

export default function UpgradeModal({ isOpen, onClose, onSelectPlan }: UpgradeModalProps) {
  const { lang } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      style={{
        overflowY: 'auto',
        alignItems: 'flex-start',
        paddingTop: '1.5rem',
        paddingBottom: '1.5rem',
      }}
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
        style={{
          margin: 'auto',
          maxHeight: '90vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          ✕
        </button>

        {/* Encabezado */}
        <div className={styles.header}>
          <span className={styles.badge}>
            {lang === 'en' ? 'Studio Lite Limit Reached' : 'Límite de Studio Lite alcanzado'}
          </span>
          <h2 className={styles.title}>
            {lang === 'en' ? 'Unlock More AI Videos' : 'Desbloquea más videos con IA'}
          </h2>
          <p className={styles.subtitle}>
            {lang === 'en'
              ? 'You have used your free credits. Choose an option below to keep creating incredible viral videos.'
              : 'Has usado tus créditos gratuitos. Elige una opción abajo para seguir creando videos increíbles.'}
          </p>
        </div>

        {/* Tarjetas de Opciones de Pago */}
        <div className={styles.plansGrid}>
          
          {/* Opción 1: Pay-Per-Video */}
          <div className={styles.planCard}>
            <div>
              <span className={styles.planCategory}>Pass</span>
              <h3 className={styles.planTitle}>Pay-Per-Video</h3>
              <div className={styles.planPrice}>
                $4.99 <span className={styles.priceUnit}>/ video</span>
              </div>
              <p className={styles.planDescription}>
                {lang === 'en' ? 'Buy a single pass to generate 1 extra video.' : 'Compra un pase único para generar 1 video extra.'}
              </p>
            </div>
            <button
              onClick={() => onSelectPlan('Pay-Per-Video')}
              className={styles.actionButton}
            >
              {lang === 'en' ? 'Get Pass' : 'Obtener Pase'}
            </button>
          </div>

          {/* Opción 2: Pro Creator */}
          <div className={styles.featuredPlanCard}>
            <div className={styles.popularBadge}>
              {lang === 'en' ? 'Popular' : 'Popular'}
            </div>
            <div>
              <span className={`${styles.planCategory} ${styles.featuredCategory}`}>Pro</span>
              <h3 className={styles.planTitle}>Pro Creator</h3>
              <div className={styles.planPrice}>
                $29 <span className={styles.priceUnit}>/ mo</span>
              </div>
              <p className={styles.planDescription}>
                {lang === 'en' ? 'Monthly credits for active content creators.' : 'Créditos mensuales para creadores activos.'}
              </p>
            </div>
            <button
              onClick={() => onSelectPlan('Pro Creator')}
              className={styles.featuredButton}
            >
              {lang === 'en' ? 'Upgrade to Pro' : 'Actualizar a Pro'}
            </button>
          </div>

          {/* Opción 3: Unlimited */}
          <div className={styles.planCard}>
            <div>
              <span className={`${styles.planCategory} ${styles.vipCategory}`}>VIP</span>
              <h3 className={styles.planTitle}>Unlimited</h3>
              <div className={`${styles.planPrice} ${styles.vipPrice}`}>
                $79 <span className={styles.priceUnit}>/ mo</span>
              </div>
              <p className={styles.planDescription}>
                {lang === 'en' ? 'Unlimited video generation without limits.' : 'Generación de videos ilimitada sin restricciones.'}
              </p>
            </div>
            <button
              onClick={() => onSelectPlan('Unlimited')}
              className={styles.actionButton}
            >
              {lang === 'en' ? 'Go Unlimited' : 'Ir a Ilimitado'}
            </button>
          </div>

        </div>

        {/* Nota al pie */}
        <div className={styles.footerNote}>
          <button
            onClick={onClose}
            className={styles.footerButton}
          >
            {lang === 'en' ? 'Maybe later, return to dashboard' : 'Tal vez después, volver al dashboard'}
          </button>
        </div>

      </div>
    </div>
  );
}
