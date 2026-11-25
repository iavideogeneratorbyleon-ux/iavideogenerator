import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import styles from './VideoCard.module.css';

export type PublishChannel = 'tiktok' | 'instagram' | 'youtube';

export interface VideoCardData {
  _id: string;
  title?: string;
  mode?: string;
  aspectRatio?: string;
  status?: string;
  jobId?: string;
  videoUrl?: string;
  downloadUrl?: string;
  url?: string;
  thumbnailUrl?: string;
  parameters?: {
    aspectRatio?: string;
    resolution?: string;
    durationSec?: number;
    visualFormatId?: string;
    voice?: string;
  };
  config?: {
    aspectRatio?: string;
    visualStyle?: string;
  };
  userInputs?: {
    mode?: string;
    rawContent?: string;
    tone?: string;
  };
  llmDirective?: {
    structuredScript?: {
      title?: string;
      totalDurationSeconds?: number;
    };
  };
  createdAt?: string;
}

export interface VideoCardProps {
  video: VideoCardData;
  canRegenerate?: boolean;
  onWatch?: (video: VideoCardData) => void;
  onDownload?: (video: VideoCardData) => void;
  onSelectPublishChannel?: (video: VideoCardData, channel: PublishChannel) => void;
  onRegenerate?: (video: VideoCardData) => void;
  compact?: boolean;
  className?: string;
}

export default function VideoCard({
  video,
  canRegenerate = false,
  onWatch,
  onDownload,
  onSelectPublishChannel,
  onRegenerate,
  compact = false,
  className = '',
}: VideoCardProps) {
  const { language } = useTranslation();
  const isEn = language === 'en';

  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const publishWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPublishOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        publishWrapperRef.current &&
        !publishWrapperRef.current.contains(event.target as Node)
      ) {
        setIsPublishOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPublishOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isPublishOpen]);

  const title =
    video.title?.trim() ||
    video.llmDirective?.structuredScript?.title?.trim() ||
    (isEn ? 'Untitled Video' : 'Video sin título');

  const aspectRatio =
    video.aspectRatio ||
    video.config?.aspectRatio ||
    video.parameters?.aspectRatio ||
    '9:16';

  const mode = video.mode || video.userInputs?.mode || 'idea';
  const status = video.status || 'saved';
  const visualStyle =
    video.config?.visualStyle || video.parameters?.visualFormatId || '';
  const durationSec =
    video.llmDirective?.structuredScript?.totalDurationSeconds ||
    video.parameters?.durationSec;
  const previewSrc = video.thumbnailUrl || video.videoUrl || video.url || '';
  const isDirectVideo = Boolean(video.videoUrl || video.url);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return isEn ? 'Recently' : 'Reciente';
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) {
      return isEn ? 'Recently' : 'Reciente';
    }
    return parsed.toLocaleDateString(isEn ? 'en-US' : 'es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusMeta = (rawStatus: string) => {
    const normalized = rawStatus.toLowerCase();
    if (normalized === 'completed' || normalized === 'ready') {
      return { text: isEn ? 'Ready' : 'Listo', tone: 'ready' as const };
    }
    if (
      normalized === 'processing' ||
      normalized === 'rendering' ||
      normalized === 'audio_generated'
    ) {
      return {
        text: isEn ? 'In Pipeline' : 'En Proceso',
        tone: 'processing' as const,
      };
    }
    if (normalized === 'failed' || normalized === 'error') {
      return { text: isEn ? 'Failed' : 'Error', tone: 'error' as const };
    }
    return { text: isEn ? 'Saved' : 'Guardado', tone: 'saved' as const };
  };

  const statusMeta = getStatusMeta(status);

  const handleChannelClick = (channel: PublishChannel) => {
    setIsPublishOpen(false);
    onSelectPublishChannel?.(video, channel);
  };

  return (
    <article
      className={`${styles.card} ${compact ? styles.cardCompact : ''} ${className}`}
    >
      <div className={styles.previewBox}>
        {previewSrc && isDirectVideo ? (
          <video
            src={video.videoUrl || video.url}
            poster={video.thumbnailUrl}
            className={styles.mediaEl}
            preload="metadata"
            muted
            playsInline
          />
        ) : previewSrc ? (
          <img
            src={previewSrc}
            alt={title}
            className={styles.mediaEl}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholderVisual}>
            <span className={styles.ratioTag}>{aspectRatio}</span>
            <span className={styles.placeholderLabel}>
              {visualStyle || (isEn ? 'Cempai AI Video' : 'Video Cempai IA')}
            </span>
          </div>
        )}

        <div className={styles.previewOverlayTop}>
          <span className={styles.aspectPill}>{aspectRatio}</span>
          <span
            className={`${styles.statusPill} ${styles[`status_${statusMeta.tone}`]}`}
          >
            {statusMeta.text}
          </span>
        </div>

        {typeof durationSec === 'number' && durationSec > 0 && (
          <span className={styles.durationPill}>{durationSec}s</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.metaRow}>
          <span className={styles.modeTag}>
            {isEn ? 'Mode' : 'Modo'}: <strong>{mode}</strong>
          </span>
          <span className={styles.dateText}>{formatDate(video.createdAt)}</span>
        </div>

        <h3 className={styles.title} title={title}>
          {title}
        </h3>

        {video.userInputs?.rawContent && !compact && (
          <p className={styles.excerpt}>{video.userInputs.rawContent}</p>
        )}

        <div className={styles.actions}>
          {onWatch && (
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => onWatch(video)}
            >
              {isEn ? 'Watch' : 'Ver'}
            </button>
          )}

          {onDownload && (
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => onDownload(video)}
            >
              {isEn ? 'Download' : 'Descargar'}
            </button>
          )}

          <div className={styles.publishWrapper} ref={publishWrapperRef}>
            <button
              type="button"
              className={styles.secondaryAction}
              aria-expanded={isPublishOpen}
              aria-haspopup="menu"
              onClick={() => setIsPublishOpen((prev) => !prev)}
            >
              {isEn ? 'Publish' : 'Publicar'}
            </button>

            {isPublishOpen && (
              <div
                className={styles.popover}
                role="menu"
                aria-label={isEn ? 'Share to social media' : 'Publicar en redes'}
              >
                <span className={styles.popoverTitle}>
                  {isEn ? 'Share to' : 'Compartir en'}
                </span>

                <div className={styles.popoverChannels}>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.channelBtn}
                    onClick={() => handleChannelClick('tiktok')}
                    title="TikTok"
                    aria-label="TikTok"
                  >
                    <span className={styles.channelIcon} aria-hidden="true">
                      ♪
                    </span>
                    <span className={styles.channelLabel}>TikTok</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className={styles.channelBtn}
                    onClick={() => handleChannelClick('instagram')}
                    title="Instagram Reels"
                    aria-label="Instagram Reels"
                  >
                    <span className={styles.channelIcon} aria-hidden="true">
                      ◎
                    </span>
                    <span className={styles.channelLabel}>Reels</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className={styles.channelBtn}
                    onClick={() => handleChannelClick('youtube')}
                    title="YouTube Shorts"
                    aria-label="YouTube Shorts"
                  >
                    <span className={styles.channelIcon} aria-hidden="true">
                      ▶
                    </span>
                    <span className={styles.channelLabel}>Shorts</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {onRegenerate && (
            <button
              type="button"
              className={styles.regenerateAction}
              disabled={!canRegenerate}
              onClick={() => {
                if (canRegenerate) onRegenerate(video);
              }}
              title={
                canRegenerate
                  ? isEn
                    ? 'Regenerate video variation'
                    : 'Regenerar variación de video'
                  : isEn
                  ? 'Upgrade plan to regenerate videos'
                  : 'Mejora tu plan para regenerar videos'
              }
            >
              {isEn ? 'Regenerate' : 'Regenerar'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
