import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { WizardData } from './WizardStep1';
import { useLanguage } from '../landing/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import styles from './WizardStep4.module.css';

type MusicStyleGroup = 'all' | 'lofi' | 'upbeat' | 'epic' | 'tech';
type EngineMusicStyle = 'none' | 'lofi' | 'epic' | 'upbeat' | 'tech';

interface MusicTrack {
  id: string;
  engineStyle: EngineMusicStyle;
  group: Exclude<MusicStyleGroup, 'all'>;
  title: string;
  subtitle: { en: string; es: string };
  icon: string;
  audioUrl?: string;
  isFreeBase: boolean;
}

const TRACKS_PER_STYLE = 25;
const PAGE_SIZE = 6;
const SNIPPET_SECONDS = 10;

const STYLE_CONFIGS: {
  group: Exclude<MusicStyleGroup, 'all'>;
  engineStyle: EngineMusicStyle;
  tabLabel: { en: string; es: string };
  icon: string;
  baseNames: string[];
  descEn: string;
  descEs: string;
  folder: string;
}[] = [
  {
    group: 'lofi',
    engineStyle: 'lofi',
    tabLabel: { en: 'Lo-Fi & Chill', es: 'Lo-Fi y Chill' },
    icon: '☕',
    baseNames: [
      'Rainy Cafe', 'Night Study', 'Vinyl Drift', 'Sunday Morning', 'Warm Rhodes',
      'Soft Tape', 'Amber Dusk', 'Cloud Nine', 'Quiet Bloom', 'Velvet Beats',
      'Paper Lanterns', 'Cozy Corner', 'Slow Tide', 'Mellow Keys', 'Hazy Window',
      'Midnight Tea', 'Driftwood', 'Breeze Loop', 'Golden Hour', 'Pillow Talk',
      'Echo Lounge', 'Pastel Sky', 'Calm Pulse', 'Cedar Smoke', 'Fading Light',
    ],
    descEn: 'Relaxed beats & warm textures',
    descEs: 'Ritmos suaves y texturas cálidas',
    folder: 'lofi',
  },
  {
    group: 'upbeat',
    engineStyle: 'upbeat',
    tabLabel: { en: 'Upbeat & Promo', es: 'Animado y Promo' },
    icon: '🚀',
    baseNames: [
      'Bright Launch', 'Fast Forward', 'Spark Energy', 'Fresh Start', 'City Groove',
      'Pop Momentum', 'Clear Horizon', 'Dynamic Push', 'Sunburst Beat', 'Agile Flow',
      'Bold Step', 'Studio Lift', 'Active Rhythm', 'Pure Drive', 'Modern Bounce',
      'Spotlight Hop', 'Crisp Tempo', 'Vibrant Edge', 'Upward Climb', 'Ready Set Go',
      'Cheerful Pulse', 'Peak Vibe', 'Quick Snap', 'Brand Spark', 'High Tide',
    ],
    descEn: 'Energetic rhythms for promos & reels',
    descEs: 'Ritmos dinámicos para promos y reels',
    folder: 'upbeat',
  },
  {
    group: 'epic',
    engineStyle: 'epic',
    tabLabel: { en: 'Epic & Story', es: 'Épico y Narrativo' },
    icon: '⚔️',
    baseNames: [
      'Horizon Rise', 'Iron Oath', 'Deep Tension', 'Crownfall', 'Titan Drums',
      'Shadow Ascent', 'Final Stand', 'Vast Frontier', 'Crimson Dawn', 'Sovereign',
      'Obsidian Echo', 'Legend Calls', 'Storm Surge', 'Ancient Brass', 'Valor Theme',
      'Broken Chains', 'Summit Peak', 'Overture Dark', 'Fates Aligned', 'War Cry',
      'Rising Ash', 'Vanguard', 'Eternity Call', 'Throne Room', 'Odyssey',
    ],
    descEn: 'Dramatic tension & cinematic swells',
    descEs: 'Tensión dramática y atmósferas intensas',
    folder: 'epic',
  },
  {
    group: 'tech',
    engineStyle: 'tech',
    tabLabel: { en: 'Tech & Synth', es: 'Tech y Synth' },
    icon: '🤖',
    baseNames: [
      'Neon Grid', 'Cyber Pulse', 'Data Stream', 'Synth Core', 'Future Lab',
      'Vector Wave', 'Quantum Bass', 'Binary Beat', 'Laser Horizon', 'Circuit Flow',
      'Dark Mode', 'Neural Arp', 'Grid Runner', 'Holo Sync', 'Pulse Matrix',
      'Chrome Echo', 'Subzero Synth', 'Ai Core', 'Hyperion', 'Signal Lock',
      'Pixel Drift', 'Volt Drive', 'Mainframe', 'Nightwire', 'Astro Freq',
    ],
    descEn: 'Futuristic synths & electronic pulse',
    descEs: 'Sintetizadores futuristas y pulso electrónico',
    folder: 'tech',
  },
];

function buildMusicCatalog(): MusicTrack[] {
  const tracks: MusicTrack[] = [
    {
      id: 'none',
      engineStyle: 'none',
      group: 'lofi',
      title: 'No Background Music',
      subtitle: { en: 'Clean voice-over only', es: 'Solo locución sin música' },
      icon: '🔇',
      isFreeBase: true,
    },
  ];

  for (const cfg of STYLE_CONFIGS) {
    for (let i = 0; i < TRACKS_PER_STYLE; i++) {
      const num = String(i + 1).padStart(2, '0');
      const name = cfg.baseNames[i] || `Track ${num}`;
      const isFreeBase = cfg.group === 'lofi' && i < 2;

      tracks.push({
        id: `${cfg.group}_${num}`,
        engineStyle: cfg.engineStyle,
        group: cfg.group,
        title: `${name} ${num}`,
        subtitle: { en: cfg.descEn, es: cfg.descEs },
        icon: cfg.icon,
        audioUrl: `/audio/music/${cfg.folder}/${cfg.group}_${num}.mp3`,
        isFreeBase,
      });
    }
  }

  return tracks;
}

interface Step4Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
  wizardMode?: 'lite' | 'pro';
}

export default function WizardStep4({
  data,
  onUpdate,
  onNext,
  onPrev,
  wizardMode = 'lite',
}: Step4Props) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const isPro = wizardMode === 'pro';
  const isPaidPlan = ['pro', 'unlimited', 'pay_per_video'].includes((user as any)?.plan);
  const canUseAllTracks = isPro || isPaidPlan;

  const catalog = useMemo(() => buildMusicCatalog(), []);
  const [activeGroup, setActiveGroup] = useState<MusicStyleGroup>('lofi');
  const [page, setPage] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<'snippet' | 'full'>('snippet');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const snippetTimerRef = useRef<number | null>(null);

  const stopAudio = () => {
    if (snippetTimerRef.current) {
      window.clearTimeout(snippetTimerRef.current);
      snippetTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingTrackId(null);
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const filteredTracks = useMemo(() => {
    if (activeGroup === 'all') return catalog;
    const noMusic = catalog[0];
    const groupTracks = catalog.filter((trk) => trk.id !== 'none' && trk.group === activeGroup);
    return activeGroup === 'lofi' ? [noMusic, ...groupTracks] : groupTracks;
  }, [activeGroup, catalog]);

  const totalPages = Math.max(1, Math.ceil(filteredTracks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedTracks = filteredTracks.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const currentTrackId =
    (data as any).musicTrackId || (data.musicStyle === 'none' || !data.musicStyle ? 'none' : undefined);

  const activePreviewTrack =
    catalog.find((trk) => trk.id === (playingTrackId || currentTrackId)) || catalog[0];

  const handleSelectTrack = (track: MusicTrack) => {
    const isLocked = !track.isFreeBase && !canUseAllTracks;
    if (isLocked) return;

    onUpdate({
      musicStyle: track.engineStyle,
      ...({ musicTrackId: track.id } as any),
    });
  };

  const handlePlayTrack = (track: MusicTrack) => {
    const isLocked = !track.isFreeBase && !canUseAllTracks;
    if (!track.audioUrl || isLocked) return;

    if (playingTrackId === track.id) {
      stopAudio();
      return;
    }

    stopAudio();
    const audio = new Audio(track.audioUrl);
    audioRef.current = audio;
    setPlayingTrackId(track.id);

    audio.onended = () => stopAudio();
    audio.play().catch(() => stopAudio());

    if (previewMode === 'snippet') {
      snippetTimerRef.current = window.setTimeout(() => {
        stopAudio();
      }, SNIPPET_SECONDS * 1000);
    }
  };

  const tabs: { id: MusicStyleGroup; label: string }[] = [
    { id: 'all', label: lang === 'en' ? 'All' : 'Todos' },
    ...STYLE_CONFIGS.map((cfg) => ({
      id: cfg.group,
      label: cfg.tabLabel[lang],
    })),
  ];

  return (
    <div className={styles.stepContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>
            {lang === 'en' ? 'Background Music' : 'Música de Fondo'}
          </h1>
          <p className={styles.headingSub}>
            {lang === 'en'
              ? 'Pick a style tab, browse tracks cleanly, and test a short clip or full track.'
              : 'Elige un estilo, recorre las pistas en una lista limpia y prueba un fragmento o la pista completa.'}
          </p>
        </div>

        {/* Pestañas de estilo */}
        <div className={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeGroup === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  stopAudio();
                  setActiveGroup(tab.id);
                  setPage(0);
                }}
                className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Lista compacta de pistas */}
        <div className={styles.trackListBox}>
          {paginatedTracks.map((track) => {
            const isSelected = currentTrackId
              ? currentTrackId === track.id
              : track.id === 'none' && (!data.musicStyle || data.musicStyle === 'none');
            const isLocked = !track.isFreeBase && !canUseAllTracks;
            const isPlaying = playingTrackId === track.id;

            return (
              <div
                key={track.id}
                role="button"
                tabIndex={isLocked ? -1 : 0}
                onClick={() => handleSelectTrack(track)}
                onKeyDown={(e) => {
                  if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSelectTrack(track);
                  }
                }}
                className={`${styles.trackRow} ${isSelected ? styles.trackRowSelected : ''} ${
                  isLocked ? styles.trackRowLocked : ''
                }`}
              >
                <div className={styles.trackLeft}>
                  <span className={styles.trackIcon}>{track.icon}</span>
                  <div className={styles.trackMeta}>
                    <div className={styles.trackTitleRow}>
                      <span className={styles.trackTitle}>
                        {track.id === 'none'
                          ? lang === 'en'
                            ? 'No Background Music'
                            : 'Sin Música de Fondo'
                          : track.title}
                      </span>
                      {isLocked && <span className={styles.proBadge}>PRO 🔒</span>}
                    </div>
                    <p className={styles.trackSubtitle}>{track.subtitle[lang]}</p>
                  </div>
                </div>

                <div className={styles.trackRight}>
                  {track.audioUrl && !isLocked && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTrack(track);
                      }}
                      aria-label={isPlaying ? 'Stop preview' : 'Play preview'}
                      className={`${styles.playBtn} ${isPlaying ? styles.playBtnPlaying : ''}`}
                    >
                      {isPlaying ? '⏹' : '▶'}
                    </button>
                  )}

                  <span
                    className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}
                  >
                    {isSelected && <span className={styles.radioDot} />}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Paginación limpia */}
          {totalPages > 1 && (
            <div className={styles.paginationBar}>
              <span>
                {lang === 'en' ? 'Page' : 'Página'} {safePage + 1} / {totalPages}
              </span>
              <div className={styles.paginationActions}>
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className={styles.pageBtn}
                >
                  {lang === 'en' ? 'Prev' : 'Ant.'}
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className={styles.pageBtn}
                >
                  {lang === 'en' ? 'Next' : 'Sig.'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Barra inferior estética de preescucha */}
        <div className={styles.previewBar}>
          <div className={styles.previewInfo}>
            <span className={styles.previewLabel}>
              {lang === 'en' ? 'Preview mode: ' : 'Modo de escucha: '}
            </span>
            <strong className={styles.previewTrackName}>
              {activePreviewTrack.id === 'none'
                ? lang === 'en'
                  ? 'No Background Music'
                  : 'Sin Música de Fondo'
                : activePreviewTrack.title}
            </strong>
          </div>

          <div className={styles.previewModes}>
            <button
              type="button"
              onClick={() => {
                stopAudio();
                setPreviewMode('snippet');
              }}
              className={`${styles.modeBtn} ${
                previewMode === 'snippet' ? styles.modeBtnActive : ''
              }`}
            >
              {lang === 'en' ? `Clip (${SNIPPET_SECONDS}s)` : `Fragmento (${SNIPPET_SECONDS}s)`}
            </button>
            <button
              type="button"
              onClick={() => {
                stopAudio();
                setPreviewMode('full');
              }}
              className={`${styles.modeBtn} ${previewMode === 'full' ? styles.modeBtnActive : ''}`}
            >
              {lang === 'en' ? 'Full Track' : 'Completa'}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.footerAction}>
        <button
          type="button"
          onClick={() => {
            stopAudio();
            onPrev();
          }}
          className={styles.backBtn}
        >
          {t('step3_back_btn') || (lang === 'en' ? 'Back' : 'Atrás')}
        </button>
        <button
          type="button"
          onClick={() => {
            stopAudio();
            onNext();
          }}
          className={styles.nextBtn}
        >
          {lang === 'en' ? 'Next: Review' : 'Siguiente: Revisión'}
          <svg className={styles.iconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
