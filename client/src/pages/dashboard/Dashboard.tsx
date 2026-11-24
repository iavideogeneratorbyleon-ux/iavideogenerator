import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslations';
import UpgrateModal from '../../components/upgrate-modal/UpgrateModal';
import StudioLiteWorkspaceWizard from '../../components/wizard/StudioLiteWorkspaceWizard';
import {
  evaluateCreditGate,
  getPlanWizardPolicy,
  normalizePlanTier,
} from '../../components/wizard/wizardPlanConfig';
import {
  clearWizardStorage,
  type PlanTier,
  type StudioLiteDraft,
} from '../../components/wizard/wizardStorage';
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

interface CompletedGenerationResult {
  title: string;
  prompt: string;
  presetId: string;
  styleFormatId: string;
  aspectRatio: string;
  resolution: string;
  durationSec: number;
  voice: string;
  creditsRemaining?: number;
}

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || 'http://localhost:3030';

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

  const normalizedPlan = normalizePlanTier(planTier);
  const planPolicy = getPlanWizardPolicy(normalizedPlan);

  const [activeSection, setActiveSection] =
    useState<WorkspaceSection>(initialSection);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [ttsText, setTtsText] = useState<string>('');
  const [credits, setCredits] = useState<number>(
    typeof (user as { credits?: number } | null)?.credits === 'number'
      ? (user as { credits?: number }).credits!
      : planPolicy.initialCredits
  );
  const [creditNotice, setCreditNotice] = useState<{
    type: 'info' | 'warning';
    text: string;
  } | null>(null);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    const userCredits = (user as { credits?: number } | null)?.credits;
    if (typeof userCredits === 'number') {
      setCredits(userCredits);
    } else if (!isAuthenticated && normalizedPlan === 'free_trial') {
      setCredits(planPolicy.initialCredits);
    }
  }, [isAuthenticated, normalizedPlan, planPolicy.initialCredits, user]);

  const loadUserVideos = useCallback(async (email: string) => {
    setLoadingVideos(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/videos/${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      }
    } catch (err) {
      console.error('Error loading user videos:', err);
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.email) {
      setVideos([]);
      setLoadingVideos(false);
      return;
    }

    loadUserVideos(user.email);
  }, [loadUserVideos, user?.email]);

  const handleSelectPlanInModal = (plan: PlanTier) => {
    const nextTier = normalizePlanTier(plan);
    const nextPolicy = getPlanWizardPolicy(nextTier);
    setPlanTier(nextTier);
    setSelectedPlanForAuth(nextTier);
    if (nextTier === 'free_trial' && credits < nextPolicy.initialCredits) {
      setCredits(nextPolicy.initialCredits);
    }
    setCreditNotice(null);
    setIsUpgradeModalOpen(false);
  };

  const handleWizardRequireAuth = (draft: StudioLiteDraft) => {
    if (onRequireAuthFromWizard) {
      onRequireAuthFromWizard(draft);
      return;
    }
    setIsUpgradeModalOpen(true);
  };

  const handleSelectSection = (section: WorkspaceSection) => {
    setActiveSection(section);
    if (section === 'dashboard' && user?.email) {
      loadUserVideos(user.email);
    }
  };

  const handleGenerationCompleted = async (
    result: CompletedGenerationResult
  ) => {
    const creditGate = evaluateCreditGate({
      rawPlan: normalizedPlan,
      credits,
    });

    if (!creditGate.canGenerate) {
      setCreditNotice({
        type: 'warning',
        text: isEn
          ? `Insufficient credits (${creditGate.remainingCredits}/${creditGate.requiredCredits} required). Upgrade your plan to unlock more videos.`
          : `Créditos insuficientes (${creditGate.remainingCredits}/${creditGate.requiredCredits} requeridos). Mejora tu plan para generar más videos.`,
      });
      setIsUpgradeModalOpen(true);
      return;
    }

    try {
      if (user?.email) {
        const res = await fetch(`${API_BASE_URL}/api/videos/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            userId:
              (user as { id?: string; _id?: string }).id ||
              (user as { id?: string; _id?: string })._id,
            title:
              result.title.trim().slice(0, 60) ||
              result.prompt.trim().slice(0, 60) ||
              (isEn ? 'Studio Lite Video' : 'Video Studio Lite'),
            mode: 'idea',
            aspectRatio: result.aspectRatio,
            parameters: {
              planTier: normalizedPlan,
              presetId: result.presetId,
              visualFormatId: result.styleFormatId,
              aspectRatio: result.aspectRatio,
              resolution: result.resolution,
              voice: result.voice,
              durationSec: result.durationSec,
            },
          }),
        });

        const data = await res.json();

        if (res.status === 403 && data?.needsUpgrade) {
          const remaining =
            typeof data.remainingCredits === 'number'
              ? data.remainingCredits
              : credits;
          setCredits(remaining);
          setCreditNotice({
            type: 'warning',
            text: isEn
              ? `You have ${remaining} credits remaining. Upgrade your plan to generate another video.`
              : `Te quedan ${remaining} créditos. Mejora tu plan para generar otro video.`,
          });
          setIsUpgradeModalOpen(true);
          return;
        }

        if (res.ok && data.success) {
          const updatedCredits =
            typeof result.creditsRemaining === 'number'
              ? result.creditsRemaining
              : typeof data.remainingCredits === 'number'
              ? data.remainingCredits
              : Math.max(0, credits - creditGate.videoCreditCost);

          setCredits(updatedCredits);
          clearWizardStorage();
          await loadUserVideos(user.email);
          setActiveSection('dashboard');

          if (updatedCredits < creditGate.requiredCredits) {
            setCreditNotice({
              type: 'warning',
              text: isEn
                ? `Video saved. You have ${updatedCredits} credits left—upgrade your plan to generate another video.`
                : `Video guardado. Te quedan ${updatedCredits} créditos; mejora tu plan para generar otro video.`,
            });
          } else {
            setCreditNotice({
              type: 'info',
              text: isEn
                ? `Video saved to your Dashboard. Remaining credits: ${updatedCredits}.`
                : `Video guardado en tu Panel. Créditos restantes: ${updatedCredits}.`,
            });
          }
          return;
        }
      }

      const nextLocalCredits =
        typeof result.creditsRemaining === 'number'
          ? result.creditsRemaining
          : Math.max(0, credits - creditGate.videoCreditCost);
      setCredits(nextLocalCredits);
      clearWizardStorage();
      setActiveSection('dashboard');

      if (nextLocalCredits < creditGate.requiredCredits) {
        setCreditNotice({
          type: 'warning',
          text: isEn
            ? `You have ${nextLocalCredits} credits left. Upgrade your plan to continue generating.`
            : `Te quedan ${nextLocalCredits} créditos. Mejora tu plan para seguir generando.`,
        });
      }
    } catch (err) {
      console.error('Error saving video after generation:', err);
      setActiveSection('dashboard');
    }
  };

  const userSummary = isAuthenticated
    ? `${user?.name || user?.email} · ${credits} ${
        isEn ? 'credits' : 'créditos'
      }`
    : isEn
    ? `Guest session · ${credits} credits`
    : `Modo invitado · ${credits} créditos`;

  return (
    <div className={styles.shell}>
      <aside
        className={styles.sidebar}
        aria-label={isEn ? 'Workspace menu' : 'Menú del espacio de trabajo'}
      >
        <div>
          <div className={styles.sidebarBrand}>
            <span className={styles.brandTitle}>CEMPA.AI</span>
            <span className={styles.planPill}>{normalizedPlan}</span>
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navSectionLabel}>
              {isEn ? 'Core Studio' : 'Estudio Principal'}
            </span>

            <button
              type="button"
              onClick={() => handleSelectSection('studio-lite')}
              className={`${styles.navButton} ${
                activeSection === 'studio-lite' ? styles.navButtonActive : ''
              }`}
            >
              <span>✨ Studio Lite</span>
              <span className={styles.badgeSecondary}>5 steps</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSection('dashboard')}
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
              onClick={() => handleSelectSection('text-to-speech')}
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
          <div className={styles.userMeta}>{userSummary}</div>

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
          {creditNotice && (
            <div
              role="status"
              style={{
                marginBottom: '1rem',
                padding: '0.85rem 1rem',
                borderRadius: '0.75rem',
                border:
                  creditNotice.type === 'warning'
                    ? '1px solid #f59e0b'
                    : '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-page)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                fontSize: '0.9rem',
                flexWrap: 'wrap',
              }}
            >
              <span>{creditNotice.text}</span>
              {creditNotice.type === 'warning' && (
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className={styles.secondaryCta}
                >
                  {isEn ? 'Upgrade Plan' : 'Mejorar Plan'}
                </button>
              )}
            </div>
          )}

          {activeSection === 'studio-lite' && (
            <StudioLiteWorkspaceWizard
              initialPrompt={initialPrompt}
              onRequireAuth={handleWizardRequireAuth}
              onGenerationCompleted={handleGenerationCompleted}
              onBackToDashboard={() => handleSelectSection('dashboard')}
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
                    onClick={() => handleSelectSection('studio-lite')}
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
                  <div className={styles.statValue}>{normalizedPlan}</div>
                </div>

                <div className={styles.statCard}>
                  <span className={styles.statLabel}>
                    {isEn ? 'Remaining Credits' : 'Créditos Restantes'}
                  </span>
                  <div className={styles.statValueNeutral}>{credits}</div>
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
                      onClick={() => handleSelectSection('studio-lite')}
                      className={styles.primaryCta}
                    >
                      {isEn
                        ? 'Start in Studio Lite'
                        : 'Empezar en Studio Lite'}
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
        initialPlan={normalizedPlan}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSelectPlanAndAuth={handleSelectPlanInModal}
      />
    </div>
  );
}
