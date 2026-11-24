import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslations';
import UpgrateModal from '../upgrate-modal/UpgrateModal';
import StudioLiteWorkspaceWizard from '../wizard/StudioLiteWorkspaceWizard';
import { type PlanTier, type StudioLiteDraft } from '../wizard/wizardStorage';
import styles from './Dashboard.module.css';

export type WorkspaceSection =
  | 'studio-lite'
  | 'dashboard'
  | 'text-to-speech';

interface DashboardProps {
  initialSection?: WorkspaceSection;
  initialPrompt?: string;
  onRequireAuthFromWizard?: (draft: StudioLiteDraft) => void;
  onBackToLanding?: () => void;
}

interface VideoItem {
  _id: string;
  title: string;
  mode: string;
  aspectRatio: string;
  createdAt: string;
}

export default function Dashboard({
  initialSection = 'studio-lite',
  initialPrompt = '',
  onRequireAuthFromWizard,
  onBackToLanding,
}: DashboardProps) {
  const {
    user,
    isAuthenticated,
    planTier,
    setPlanTier,
    setSelectedPlanForAuth,
    logout,
  } = useAuth();
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [activeSection, setActiveSection] =
    useState<WorkspaceSection>(initialSection);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [ttsText, setTtsText] = useState<string>('');

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if (!user?.email) {
      setVideos([]);
      setLoadingVideos(false);
      return;
    }

    setLoadingVideos(true);
    fetch(`http://localhost:3030/api/videos/${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.videos)) {
          setVideos(data.videos);
        }
      })
      .catch((err) => {
        console.error('Error loading user videos:', err);
      })
      .finally(() => {
        setLoadingVideos(false);
      });
  }, [user?.email]);

  const handleSelectPlanInModal = (plan: PlanTier) => {
    setPlanTier(plan);
    setSelectedPlanForAuth(plan);
    setIsUpgradeModalOpen(false);
  };

  const handleWizardRequireAuth = (draft: StudioLiteDraft) => {
    if (onRequireAuthFromWizard) {
      onRequireAuthFromWizard(draft);
      return;
    }
    setIsUpgradeModalOpen(true);
  };

  return (
    <div className={styles.shell}>
      <aside
        className={styles.sidebar}
        aria-label={isEn ? 'Workspace menu' : 'Menú del espacio de trabajo'}
      >
        <div>
          <div className={styles.sidebarBrand}>
            <span className={styles.brandTitle}>CEMPA.AI</span>
            <span className={styles.planPill}>{planTier}</span>
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navSectionLabel}>
              {isEn ? 'Core Studio' : 'Estudio Principal'}
            </span>

            <button
              type="button"
              onClick={() => setActiveSection('studio-lite')}
              className={`${styles.navButton} ${
                activeSection === 'studio-lite' ? styles.navButtonActive : ''
              }`}
            >
              <span>✨ Studio Lite</span>
              <span className={styles.badgeSecondary}>5 steps</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('dashboard')}
              className={`${styles.navButton} ${
                activeSection === 'dashboard' ? styles.navButtonActive : ''
              }`}
            >
              <span>📊 {isEn ? 'Dashboard' : 'Panel'}</span>
              <span className={styles.badgeSecondary}>{videos.length}</span>
            </button>

            <span className={styles.navSectionLabel}>
              {isEn ? 'Secondary Tools' : 'Herramientas Extra'}
            </span>

            <button
              type="button"
              onClick={() => setActiveSection('text-to-speech')}
              className={`${styles.navButton} ${
                activeSection === 'text-to-speech'
                  ? styles.navButtonActive
                  : ''
              }`}
            >
              <span>🎙️ Text to Speech</span>
            </button>

            <span className={styles.navSectionLabel}>
              {isEn ? 'Account & Plans' : 'Cuenta y Planes'}
            </span>

            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className={styles.navButton}
            >
              <span>⚡ {isEn ? 'Plans & Upgrade' : 'Planes'}</span>
            </button>

            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className={styles.navButton}
              >
                <span>← {isEn ? 'Landing Page' : 'Inicio'}</span>
              </button>
            )}
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userMeta}>
            {isAuthenticated
              ? user?.name || user?.email
              : isEn
              ? 'Guest session (drafts saved)'
              : 'Modo invitado (borrador activo)'}
          </div>

          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              className={styles.logoutButton}
            >
              {isEn ? 'Sign Out' : 'Cerrar sesión'}
            </button>
          )}
        </div>
      </aside>

      <main className={styles.workspaceMain}>
        <div className={styles.workspaceInner}>
          {activeSection === 'studio-lite' && (
            <StudioLiteWorkspaceWizard
              initialPrompt={initialPrompt}
              isAuthenticated={isAuthenticated}
              planTier={planTier}
              onRequireAuthAndPlan={handleWizardRequireAuth}
            />
          )}

          {activeSection === 'dashboard' && (
            <>
              <div className={styles.headerCard}>
                <div>
                  <h1 className={styles.headerTitle}>
                    {isAuthenticated
                      ? isEn
                        ? `Welcome back, ${user?.name || 'Creator'}`
                        : `Bienvenido de nuevo, ${user?.name || 'Creador'}`
                      : isEn
                      ? 'Your Creator Workspace'
                      : 'Tu Espacio de Creación'}
                  </h1>
                  <p className={styles.headerSubtitle}>
                    {isEn
                      ? 'Launch Studio Lite or review your generated videos.'
                      : 'Abre Studio Lite o revisa tus videos generados.'}
                  </p>
                </div>

                <div className={styles.headerActions}>
                  <button
                    type="button"
                    onClick={() => setActiveSection('studio-lite')}
                    className={styles.primaryCta}
                  >
                    {isEn ? 'Open Studio Lite' : 'Abrir Studio Lite'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className={styles.secondaryCta}
                  >
                    {isEn ? 'Manage Plan' : 'Cambiar Plan'}
                  </button>
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>
                    {isEn ? 'Active Plan' : 'Plan Activo'}
                  </span>
                  <div className={styles.statValue}>{planTier}</div>
                </div>

                <div className={styles.statCard}>
                  <span className={styles.statLabel}>
                    {isEn ? 'Generated Videos' : 'Videos Generados'}
                  </span>
                  <div className={styles.statValueNeutral}>{videos.length}</div>
                </div>

                <div className={styles.statCard}>
                  <span className={styles.statLabel}>
                    {isEn ? 'Session Status' : 'Estado de Sesión'}
                  </span>
                  <div className={styles.statValueNeutral}>
                    {isAuthenticated
                      ? isEn
                        ? 'Authenticated'
                        : 'Conectado'
                      : isEn
                      ? 'Guest'
                      : 'Invitado'}
                  </div>
                </div>
              </div>

              <div>
                <h2 className={styles.sectionHeading}>
                  {isEn ? 'Your Projects' : 'Tus Proyectos'}
                </h2>

                {loadingVideos ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyDesc}>
                      {isEn ? 'Loading projects...' : 'Cargando proyectos...'}
                    </p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyTitle}>
                      {isEn
                        ? 'No videos generated yet'
                        : 'Aún no has generado ningún video'}
                    </p>
                    <p className={styles.emptyDesc}>
                      {isEn
                        ? 'Start a new concept in Studio Lite across 5 guided steps.'
                        : 'Inicia un nuevo concepto en Studio Lite en 5 pasos guiados.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveSection('studio-lite')}
                      className={styles.primaryCta}
                    >
                      {isEn ? 'Start in Studio Lite' : 'Empezar en Studio Lite'}
                    </button>
                  </div>
                ) : (
                  <div className={styles.projectsGrid}>
                    {videos.map((video) => (
                      <div key={video._id} className={styles.projectCard}>
                        <div>
                          <div className={styles.projectMeta}>
                            <span className={styles.aspectBadge}>
                              {video.aspectRatio || '9:16'}
                            </span>
                            <span className={styles.projectDate}>
                              {new Date(video.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className={styles.projectTitle}>{video.title}</h3>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              isEn
                                ? 'Downloading video...'
                                : 'Descargando video...'
                            )
                          }
                          className={styles.downloadButton}
                        >
                          {t.common.continue} ·{' '}
                          {isEn ? 'Download' : 'Descargar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === 'text-to-speech' && (
            <div className={styles.secondaryToolCard}>
              <h1 className={styles.headerTitle}>Text to Speech</h1>
              <p className={styles.headerSubtitle}>
                {isEn
                  ? 'Draft voiceover scripts for your upcoming videos.'
                  : 'Redacta guiones de voz en off para tus próximos videos.'}
              </p>

              <textarea
                rows={5}
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder={
                  isEn
                    ? 'Write your narration script here...'
                    : 'Escribe aquí el guion de tu narración...'
                }
                style={{
                  width: '100%',
                  marginTop: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-primary)',
                  padding: '0.85rem',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          )}
        </div>
      </main>

      <UpgrateModal
        isOpen={isUpgradeModalOpen}
        initialPlan={planTier}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSelectPlanAndAuth={handleSelectPlanInModal}
      />
    </div>
  );
}
