import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import VideoShowcaseModal, { type VideoShowcaseItem } from './VideoShowcaseModal';
import PricingSection from './PricingSection';
import AuthModal from '../auth/AuthModal';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onStartWizard: () => void;
  onOpenAuthModal?: (mode: 'login' | 'signup') => void;
}

export default function LandingPage({ onStartWizard }: LandingPageProps) {
  const { t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoShowcaseItem | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);

  const handleHeroClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartWizard();
  };

  const showcaseVideos: VideoShowcaseItem[] = [
    {
      id: '1',
      title: t('showcase_1_title'),
      format: '9:16',
      videoUrl: '',
      thumbnail: '',
      prompt: t('showcase_1_prompt'),
      voice: 'Carlos (Narrativo)',
      tone: 'Profesional',
      style: 'Cinematográfico',
    },
    {
      id: '2',
      title: t('showcase_2_title'),
      format: '16:9',
      videoUrl: '',
      thumbnail: '',
      prompt: t('showcase_2_prompt'),
      voice: 'Sofía (Comercial)',
      tone: 'Dinámico',
      style: 'Render 3D',
    },
    {
      id: '3',
      title: t('showcase_3_title'),
      format: '9:16',
      videoUrl: '',
      thumbnail: '',
      prompt: t('showcase_3_prompt'),
      voice: 'Alex (Joven / Casual)',
      tone: 'Casual',
      style: 'Vector Minimalista',
    },
  ];

  const reviews = [
    {
      name: t('review_1_name'),
      role: t('review_1_role'),
      avatar: '👩‍💻',
      text: t('review_1_text'),
      rating: 5,
    },
    {
      name: t('review_2_name'),
      role: t('review_2_role'),
      avatar: '👨‍💼',
      text: t('review_2_text'),
      rating: 5,
    },
    {
      name: t('review_3_name'),
      role: t('review_3_role'),
      avatar: '🚀',
      text: t('review_3_text'),
      rating: 5,
    },
  ];

  return (
    <div className={styles.landingWrapper}>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroBadge}>
            <span>✨</span> {t('hero_badge')}
          </div>

          <h1 className={styles.heroTitle}>
            {t('hero_title_1')} <br />
            <span className={styles.brandHighlight}>{t('hero_title_2')}</span>
          </h1>

          <p className={styles.heroSub}>
            {t('hero_sub')}
          </p>

          <div>
            <button
              type="button"
              onClick={handleHeroClick}
              className={styles.heroCtaBtn}
            >
              {t('hero_cta')} →
            </button>
          </div>
        </div>
      </section>

      {/* Galería Showcase Interactiva */}
      <section className={`${styles.sectionBordered} ${styles.sectionBgSurface}`}>
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('showcase_title')}
            </h2>
            <p className={styles.sectionSub}>
              {t('showcase_sub')}
            </p>
          </div>

          <div className={styles.gridThreeCols}>
            {showcaseVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={styles.showcaseCard}
              >
                <div className={styles.thumbnailPlaceholder}>
                  <span style={{ fontSize: '1.875rem' }}>🎬</span>
                  <span className={styles.recipeBadge}>
                    {t('view_recipe')}
                  </span>
                </div>

                <div className={styles.showcaseMeta}>
                  <div className={styles.showcaseTopRow}>
                    <span className={styles.showcaseCardTitle}>
                      {video.title}
                    </span>
                    <span className={styles.formatBadge}>
                      {video.format}
                    </span>
                  </div>
                  <p className={styles.showcasePrompt}>
                    {video.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Reviews */}
      <section className={styles.sectionBordered}>
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('reviews_title')}
            </h2>
          </div>

          <div className={styles.gridThreeCols}>
            {reviews.map((rev, index) => (
              <div key={index} className={styles.reviewCard}>
                <div className={styles.reviewerProfile}>
                  <span className={styles.avatar}>{rev.avatar}</span>
                  <div>
                    <h4 className={styles.reviewerName}>{rev.name}</h4>
                    <p className={styles.reviewerRole}>{rev.role}</p>
                  </div>
                </div>
                <div className={styles.stars}>
                  {'★'.repeat(rev.rating)}
                </div>
                <p className={styles.reviewText}>
                  "{rev.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Precios */}
      <PricingSection onSelectPlan={onStartWizard} />

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Cempa.ai • All rights reserved.</p>
      </footer>

      {/* Modal de Receta en Video */}
      <VideoShowcaseModal
        item={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onUseRecipe={() => {
          setSelectedVideo(null);
          onStartWizard();
        }}
      />

      {/* Modal de Autenticación local */}
      {authModalMode && (
        <AuthModal mode={authModalMode} onClose={() => setAuthModalMode(null)} />
      )}

    </div>
  );
}
