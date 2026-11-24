import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslations';
import UpgrateModal from '../../components/upgrate-modal/UpgrateModal';
import {
  getPlanWizardPolicy,
  normalizePlanTier,
} from '../../components/wizard/wizardPlanConfig';
import type { PlanTier } from '../../components/wizard/wizardStorage';
import styles from './Dashboard.module.css';

export type WorkspaceSection =
  | 'studio-lite'
  | 'dashboard'
  | 'text-to-speech';

interface DashboardProps {
  onOpenStudioLite: () => void;
  onCreditsChange?: (credits: number) => void;
}

interface VideoItem {
  _id: string;
  title: string;
  mode: string;
  aspectRatio: string;
  createdAt: string;
}

export interface CompletedGenerationResult {
  title: string;
  prompt: string;
  presetId: string;
  styleFormatId: string;
  aspectRatio: string;
  resolution: string;
  durationSec: number;
  voice: string;
  subtitlesEnabled?: boolean;
  subtitleStyle?: string;
  creditsRemaining?: number;
}

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || 'http://localhost:3030';

export default function Dashboard({
  onOpenStudioLite,
  onCreditsChange,
}: DashboardProps) {
  const {
    user,
    isAuthenticated,
    planTier,
    setPlanTier,
    setSelectedPlanForAuth,
  } = useAuth();
  const { language } = useTranslation();
  const isEn = language === 'en';

  const normalizedPlan = normalizePlanTier(planTier);
  const planPolicy = getPlanWizardPolicy(normalizedPlan);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(
    typeof (user as { credits?: number } | null)?.credits === 'number'
      ? (user as { credits?: number }).credits!
      : planPolicy.initialCredits
  );

  const syncCredits = useCallback(
    (nextCredits: number) => {
      const safeCredits = Math.max(0, nextCredits);
      setCredits(safeCredits);
      onCreditsChange?.(safeCredits);
    },
    [onCreditsChange]
  );

  useEffect(() => {
    const userCredits = (user as { credits?: number } | null)?.credits;
    if (typeof userCredits === 'number') {
      syncCredits(userCredits);
    } else if (!isAuthenticated && normalizedPlan === 'free_trial') {
      syncCredits(planPolicy.initialCredits);
    }
  }, [
    isAuthenticated,
    normalizedPlan,
    planPolicy.initialCredits,
    syncCredits,
    user,
  ]);

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
      syncCredits(nextPolicy.initialCredits);
    }
    setIsUpgradeModalOpen(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return isEn ? 'Recently' : 'Reciente';
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime())
      ? isEn
        ? 'Recently'
        : 'Reciente'
      : d.toLocaleDateString(isEn ? 'en-US' : 'es-MX', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
  };

  return (
    <div className={styles.shell}>
      <main className={styles.workspaceMain}>
        <div className={styles.workspaceInner}>
          <div className={styles.headerCard}>
            <div>
              <h1 className={styles.headerTitle}>
                {isEn ? 'My Dashboard' : 'Mi Panel'}
              </h1>
              <p className={styles.headerSubtitle}>
                {isEn
                  ? 'Videos generated and saved to your account.'
                  : 'Videos generados y guardados en tu cuenta.'}
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.secondaryCta}
                onClick={() => setIsUpgradeModalOpen(true)}
              >
                {isEn ? 'Upgrade Plan' : 'Mejorar Plan'}
              </button>
              <button
                type="button"
                className={styles.primaryCta}
                onClick={onOpenStudioLite}
              >
                {isEn ? '+ New Studio Lite Video' : '+ Nuevo Video Studio Lite'}
              </button>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                {isEn ? 'Current Plan' : 'Plan Actual'}
              </span>
              <span className={styles.statValue}>
                {planPolicy.label[language === 'es' ? 'es' : 'en']}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                {isEn ? 'Available Credits' : 'Créditos Disponibles'}
              </span>
              <span className={styles.statValueNeutral}>{credits}</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                {isEn ? 'Saved Videos' : 'Videos Guardados'}
              </span>
              <span className={styles.statValueNeutral}>{videos.length}</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                {isEn ? 'Account Status' : 'Estado de Cuenta'}
              </span>
              <span className={styles.statValueNeutral}>
                {isAuthenticated
                  ? isEn
                    ? 'Active'
                    : 'Activa'
                  : isEn
                  ? 'Guest'
                  : 'Invitado'}
              </span>
            </div>
          </div>

          <h2 className={styles.sectionHeading}>
            {isEn ? 'Saved Videos' : 'Videos Guardados'}
          </h2>

          {loadingVideos ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyDesc}>
                {isEn ? 'Loading your videos...' : 'Cargando tus videos...'}
              </p>
            </div>
          ) : videos.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>
                {isEn
                  ? 'No videos saved yet'
                  : 'Aún no tienes videos guardados'}
              </h3>
              <p className={styles.emptyDesc}>
                {isEn
                  ? 'Create your first video in Studio Lite and it will appear here.'
                  : 'Crea tu primer video en Studio Lite y aparecerá aquí.'}
              </p>
              <button
                type="button"
                className={styles.primaryCta}
                onClick={onOpenStudioLite}
              >
                {isEn ? 'Go to Studio Lite' : 'Ir a Studio Lite'}
              </button>
            </div>
          ) : (
            <div className={styles.projectsGrid}>
              {videos.map((vid) => (
                <article key={vid._id} className={styles.projectCard}>
                  <div>
                    <div className={styles.projectMeta}>
                      <span className={styles.aspectBadge}>
                        {vid.aspectRatio || '9:16'}
                      </span>
                      <span className={styles.projectDate}>
                        {formatDate(vid.createdAt)}
                      </span>
                    </div>
                    <h3 className={styles.projectTitle}>{vid.title}</h3>
                    <p className={styles.headerSubtitle}>
                      {isEn ? 'Mode' : 'Modo'}: {vid.mode || 'idea'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.downloadButton}
                    onClick={onOpenStudioLite}
                  >
                    {isEn ? 'Open in Studio Lite' : 'Abrir en Studio Lite'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <UpgrateModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSelectPlanAndAuth={handleSelectPlanInModal}
      />
    </div>
  );
}
