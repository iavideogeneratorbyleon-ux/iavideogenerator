import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();
  const userProfile = user as
    | { name?: string; email?: string; avatarUrl?: string; picture?: string }
    | null;

  const displayName =
    userProfile?.name?.trim() ||
    (isEn ? 'Creator Account' : 'Cuenta de Creador');
  const displayEmail = userEmail || userProfile?.email || '';
  const avatarSrc = userProfile?.avatarUrl || userProfile?.picture || '';
  const initial = (displayName || displayEmail || 'C')
    .trim()
    .charAt(0)
    .toUpperCase();

  const productGroups: Array<{
    title: string;
    items: Array<{ id: AppRouteId; label: string }>;
  }> = [
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
      <div>
        <div className={styles.profileCard}>
          <span className={styles.avatarBadge}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={displayName}
                className={styles.avatarImg}
              />
            ) : (
              initial
            )}
          </span>
          <div className={styles.profileMeta}>
            <span className={styles.badge}>CEMPA.AI</span>
            <p className={styles.userName} title={displayName}>
              {displayName}
            </p>
            {displayEmail && (
              <span className={styles.email} title={displayEmail}>
                {displayEmail}
              </span>
            )}
          </div>
        </div>

        <div style={{ marginTop: '14px' }}>
          <button
            type="button"
            className={`${styles.primaryDashboardBtn} ${
              currentRoute === 'dashboard'
                ? styles.primaryDashboardBtnActive
                : ''
            }`}
            onClick={() => onNavigate('dashboard')}
          >
            <span>{isEn ? 'Dashboard' : 'Dashboard'}</span>
          </button>
        </div>
      </div>

      <div className={styles.groups}>
        {productGroups.map((group) => (
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
        <div className={styles.balanceBox}>
          <div className={styles.balanceTop}>
            <span>⚡ {isEn ? 'Balance' : 'Balance'}</span>
            <span className={styles.balancePlan}>{planLabel}</span>
          </div>
          <div className={styles.balanceCreditsRow}>
            <span className={styles.balanceCreditsLabel}>
              {isEn ? 'Available credits' : 'Créditos disponibles'}
            </span>
            <span className={styles.balanceCreditsValue}>
              {credits} {isEn ? 'credits' : 'créditos'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className={styles.upgradeButton}
          onClick={onOpenUpgrade}
        >
          {isEn ? 'Upgrade' : 'Mejorar Plan'}
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
            className={styles.signOutButton}
            onClick={onLogout}
          >
            {logoutLabel}
          </button>
        )}
      </div>
    </aside>
  );
}
