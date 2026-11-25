import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslations';
import UpgrateModal from '../../components/upgrate-modal/UpgrateModal';
import VideoCard, {
  type PublishChannel,
  type VideoCardData,
} from '../../components/video-card/VideoCard';
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

export interface VideoItem extends VideoCardData {
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
    credits,
    setCredits,
    setPlanTier,
    setSelectedPlanForAuth,
  } = useAuth();
  const { language } = useTranslation();
  const isEn = language === 'en';

  const normalizedPlan = normalizePlanTier(planTier);
  const planPolicy = getPlanWizardPolicy(normalizedPlan);
  const canRegenerateVideo = normalizedPlan !== 'free_trial';

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [watchingVideo, setWatchingVideo] = useState<VideoCardData | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const syncCredits = useCallback(
    (nextCredits: number) => {
      const safeCredits = Math.max(0, nextCredits);
      setCredits(safeCredits);
      onCreditsChange?.(safeCredits);
    },
    [onCreditsChange, setCredits]
  );

  useEffect(() => {
    const userCredits = (user as { credits?: number } | null)?.credits;
    if (typeof userCredits === 'number' && userCredits !== credits) {
      syncCredits(userCredits);
    } else if (
      !isAuthenticated &&
      normalizedPlan === 'free_trial' &&
      credits !== planPolicy.initialCredits
    ) {
      syncCredits(planPolicy.initialCredits);
    }
  }, [
    credits,
    isAuthenticated,
    normalizedPlan,
    planPolicy.initialCredits,
    syncCredits,
    user,
  ]);

  const loadUserVideos = useCallback(
    async (email: string) => {
      setLoadingVideos(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/videos/${encodeURIComponent(email)}`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.videos)) {
          setVideos(data.videos);
        }

        const backendCredits =
          typeof data?.credits === 'number'
            ? data.credits
            : typeof data?.creditsRemaining === 'number'
            ? data.creditsRemaining
            : typeof data?.user?.credits === 'number'
            ? data.user.credits
            : undefined;

        if (typeof backendCredits === 'number') {
          syncCredits(backendCredits);
        }
      } catch (err) {
        console.error('Error loading user videos:', err);
      } finally {
        setLoadingVideos(false);
      }
    },
    [syncCredits]
  );

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

  const getVideoTitle = (vid: VideoCardData) =>
    vid.title?.trim() ||
    vid.llmDirective?.structuredScript?.title?.trim() ||
    (isEn ? 'Untitled Video' : 'Video sin título');

  const getMediaUrl = (vid: VideoCardData) =>
    vid.videoUrl || vid.downloadUrl || vid.url || '';

  const handleWatchVideo = (vid: VideoCardData) => {
    setWatchingVideo(vid);
  };

  const handleDownloadVideo = (vid: VideoCardData) => {
    const mediaUrl = vid.downloadUrl || vid.videoUrl || vid.url;
    const videoName = getVideoTitle(vid);

    if (!mediaUrl) {
      setActionFeedback(
        isEn
          ? `"${videoName}" does not have a rendered file URL yet.`
          : `"${videoName}" aún no tiene un archivo de video renderizado disponible.`
      );
      return;
    }

    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `${videoName}.mp4`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionFeedback(
      isEn
        ? `Starting download for "${videoName}".`
        : `Iniciando descarga de "${videoName}".`
    );
  };

  const handleSelectPublishChannel = (
    vid: VideoCardData,
    channel: PublishChannel
  ) => {
    const videoName = getVideoTitle(vid);
    const socialUrls: Record<PublishChannel, string> = {
      tiktok: 'https://www.tiktok.com/tiktokstudio/upload',
      instagram: 'https://www.instagram.com/',
      youtube: 'https://studio.youtube.com/',
    };
    const channelNames: Record<PublishChannel, string> = {
      tiktok: 'TikTok',
      instagram: 'Instagram Reels',
      youtube: 'YouTube Shorts',
    };

    window.open(socialUrls[channel], '_blank', 'noopener,noreferrer');
    setActionFeedback(
      isEn
        ? `Opened ${channelNames[channel]} for "${videoName}".`
        : `Se abrió ${channelNames[channel]} para "${videoName}".`
    );
  };

  const handleRegenerateVideo = (vid: VideoCardData) => {
    if (!canRegenerateVideo) return;
    const videoName = getVideoTitle(vid);
    setActionFeedback(
      isEn
        ? `Regeneration requested for "${videoName}".`
        : `Se solicitó regenerar "${videoName}".`
    );
  };

  const watchingMediaUrl = watchingVideo ? getMediaUrl(watchingVideo) : '';

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

          {actionFeedback && (
            <div className={styles.headerCard} role="status">
              <p className={styles.headerSubtitle}>{actionFeedback}</p>
              <button
                type="button"
                className={styles.secondaryCta}
                onClick={() => setActionFeedback(null)}
              >
                {isEn ? 'Dismiss' : 'Cerrar'}
              </button>
            </div>
          )}

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
                <VideoCard
                  key={vid._id}
                  video={vid}
                  canRegenerate={canRegenerateVideo}
                  onWatch={handleWatchVideo}
                  onDownload={handleDownloadVideo}
                  onSelectPublishChannel={handleSelectPublishChannel}
                  onRegenerate={handleRegenerateVideo}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {watchingVideo && (
        <div
          className={styles.emptyState}
          role="dialog"
          aria-modal="true"
          aria-label={getVideoTitle(watchingVideo)}
        >
          <h3 className={styles.emptyTitle}>{getVideoTitle(watchingVideo)}</h3>

          {watchingMediaUrl ? (
            <video
              src={watchingMediaUrl}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', maxHeight: '420px', borderRadius: '12px' }}
            />
          ) : (
            <p className={styles.emptyDesc}>
              {isEn
                ? 'This video entry is saved in your library, but no playable media URL is attached yet.'
                : 'Este video está guardado en tu biblioteca, pero aún no tiene un archivo de video reproducible asociado.'}
            </p>
          )}

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.secondaryCta}
              onClick={() => setWatchingVideo(null)}
            >
              {isEn ? 'Close Player' : 'Cerrar Reproductor'}
            </button>
          </div>
        </div>
      )}

      <UpgrateModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSelectPlanAndAuth={handleSelectPlanInModal}
      />
    </div>
  );
}
