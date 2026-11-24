import { APP_ROUTES, type AppRouteId } from '../../navigation/appRoutes';
import styles from './RouteErrorPage.module.css';

interface RouteErrorPageProps {
  routeId: AppRouteId;
  isEn: boolean;
  onGoToStudio: () => void;
  onGoToLanding: () => void;
}

export default function RouteErrorPage({
  routeId,
  isEn,
  onGoToStudio,
  onGoToLanding,
}: RouteErrorPageProps) {
  const routeConfig = APP_ROUTES[routeId];
  const routeLabel = routeConfig
    ? routeConfig.label[isEn ? 'en' : 'es']
    : routeId;
  const routePath = routeConfig?.path || `/${routeId}`;

  return (
    <section className={styles.wrapper} role="alert">
      <div className={styles.card}>
        <span className={styles.codeBadge}>404 • ROUTE CHECK</span>
        <h1 className={styles.title}>
          {isEn
            ? `Page "${routeLabel}" is not built yet`
            : `La página "${routeLabel}" aún no está disponible`}
        </h1>
        <p className={styles.description}>
          {isEn
            ? 'Navigation link verified successfully. Dedicated view pending implementation.'
            : 'Enlace de navegación verificado correctamente. Vista dedicada pendiente de implementación.'}
        </p>

        <div className={styles.metaBox}>
          <span>
            <strong>Route ID:</strong> <code>{routeId}</code>
          </span>
          <span>
            <strong>Path:</strong> <code>{routePath}</code>
          </span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onGoToStudio}
          >
            {isEn ? 'Go to Studio Lite' : 'Ir a Studio Lite'}
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onGoToLanding}
          >
            {isEn ? 'Back to Landing Page' : 'Volver a Inicio'}
          </button>
        </div>
      </div>
    </section>
  );
}
