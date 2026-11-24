import type { AppRouteId } from '../../navigation/appRoutes';
import styles from './AppSidebar.module.css';

interface AppSidebarProps {
  currentRoute: AppRouteId;
  isEn: boolean;
  isAuthenticated: boolean;
  userEmail?: string | null;
  planLabel: string;
  credits: number;
  logoutLabel: string;
  onNavigate: (route: AppRouteId) => void;
  onOpenUpgrade: () => void;
  onBackToLanding: () => void;
  onLogout: () => void;
}

export default function AppSidebar({
  currentRoute,
  isEn,
  isAuthenticated,
  userEmail,
  planLabel,
  credits,
  logoutLabel,
  onNavigate,
  onOpenUpgrade,
  onBackToLanding,
  onLogout,
}: AppSidebarProps) {
  const navGroups: Array<{
    title: string;
    items: Array<{ id: AppRouteId; label: string }>;
  }> = [
    {
      title: isEn ? 'Account' : 'Cuenta',
      items: [
        { id: 'dashboard', label: isEn ? 'My Dashboard' : 'Mi Panel' },
      ],
    },
    {
      title: isEn ? 'Main Studio' : 'Estudio Principal',
      items: [
        { id: 'studio-lite', label: 'Studio Lite' },
        { id: 'products', label: 'Director Studio' },
        { id: 'features', label: 'Studio Blueprints' },
        { id: 'plans', label: 'Studio Memories' },
      ],
    },
    {
      title: isEn ? 'Extra Tools' : 'Herramientas Extra',
      items: [
        { id: 'text-to-speech', label: 'Text to Speech' },
        { id: 'extra-tools', label: 'Text to Image' },
        { id: 'pricing', label: 'Image to Video' },
        { id: 'testimonials', label: 'AI Voiceover' },
      ],
    },
  ];

  return (
    <aside
      className={styles.sidebar}
      aria-label={isEn ? 'Application navigation' : 'Navegación de la aplicación'}
    >
      <div className={styles.header}>
        <span className={styles.badge}>CEMPA.AI</span>
        <p className={styles.heading}>
          {isEn ? 'Navigation' : 'Navegación'}
        </p>
        {userEmail && (
          <span className={styles.email} title={userEmail}>
            {userEmail}
          </span>
        )}
      </div>

      <div className={styles.groups}>
        {navGroups.map((group) => (
          <div key={group.title} className={styles.group}>
            <span className={styles.groupTitle}>{group.title}</span>
            <nav className={styles.navList}>
              {group.items.map((item) => {
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.navButton} ${
                      isActive ? styles.navButtonActive : ''
                    }`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <span className={styles.dot} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.planBox}>
          <span className={styles.planCaption}>
            {isEn ? 'Current Plan' : 'Plan Actual'}
          </span>
          <strong className={styles.planName}>{planLabel}</strong>
          <span className={styles.creditsText}>
            {credits} {isEn ? 'credits' : 'créditos'}
          </span>
        </div>

        <button
          type="button"
          className={styles.upgradeButton}
          onClick={onOpenUpgrade}
        >
          {isEn ? 'Upgrade Plan' : 'Mejorar Plan'}
        </button>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onBackToLanding}
        >
          {isEn ? 'Landing Page' : 'Página de Inicio'}
        </button>

        {isAuthenticated && (
          <button
            type="button"
            className={styles.ghostButton}
            onClick={onLogout}
          >
            {logoutLabel}
          </button>
        )}
      </div>
    </aside>
  );
}
