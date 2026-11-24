import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import { getOptionAccessState, getPlanWizardPolicy } from './wizardPlanConfig';
import { type PlanTier } from './wizardStorage';
import styles from './WizardStep3.module.css';

export interface VisualFormatOption {
  id: string;
  label: { en: string; es: string };
  description: { en: string; es: string };
  styleTag?: { en: string; es: string };
  imageUrl?: string;
  videoUrl?: string;
  requiresPaidPlan?: boolean;
}

interface WizardStep3Props {
  selectedFormatId: string;
  planTier: PlanTier;
  formats: VisualFormatOption[];
  onSelectFormat: (id: string) => void;
  onLockedSelect?: (id: string) => void;
}

function formatFallbackTitle(id: string): string {
  return id
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStyleBadge(format: VisualFormatOption, lang: 'es' | 'en'): string {
  if (format.styleTag?.[lang]) {
    return format.styleTag[lang];
  }
  const key = format.id.toLowerCase();
  if (key.includes('comic') || key.includes('manga')) {
    return lang === 'es' ? 'Viñeta · Tinta' : 'Ink · Panel';
  }
  if (key.includes('3d') || key.includes('render')) {
    return lang === 'es' ? 'Volumen · 3D' : 'Depth · 3D';
  }
  if (key.includes('anime')) {
    return lang === 'es' ? 'Animación · Japonesa' : 'Cel · Anime';
  }
  if (key.includes('cyber') || key.includes('neon') || key.includes('sci')) {
    return lang === 'es' ? 'Neón · Futuro' : 'Neon · Sci-Fi';
  }
  if (key.includes('photo') || key.includes('real') || key.includes('film')) {
    return lang === 'es' ? 'Fotografía · Real' : 'Photo · Live';
  }
  return lang === 'es' ? 'Estética Visual' : 'Visual Style';
}

function getFormatThemeClass(id: string): string {
  const key = id.toLowerCase();
  if (key.includes('comic') || key.includes('manga')) return styles.themeComic;
  if (key.includes('3d') || key.includes('render')) return styles.theme3d;
  if (key.includes('anime')) return styles.themeAnime;
  if (key.includes('cyber') || key.includes('neon') || key.includes('sci')) {
    return styles.themeNeon;
  }
  if (key.includes('photo') || key.includes('real') || key.includes('film')) {
    return styles.themePhoto;
  }
  return styles.themeDefault;
}

function WizardStep3({
  selectedFormatId,
  planTier,
  formats,
  onSelectFormat,
  onLockedSelect,
}: WizardStep3Props) {
  const { language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';
  const isSpanish = lang === 'es';
  const policy = getPlanWizardPolicy(planTier);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className={styles.stepSection}>
      <div className={styles.headerBlock}>
        <h3 className={styles.stepTitle}>
          {isSpanish
            ? '3. Elige el formato visual'
            : '3. Choose the visual format'}
        </h3>
        <p className={styles.stepHint}>
          {isSpanish
            ? 'Selecciona la estética visual con referencia en imagen (cómic, 3D render, etc.).'
            : 'Pick the visual look with image reference (comic, 3D render, etc.).'}
        </p>
      </div>

      <div className={styles.formatsGrid}>
        {formats.map((format) => {
          const access = getOptionAccessState(
            policy.styleFormats,
            format.id,
            format.requiresPaidPlan
          );
          const isLocked = access.locked;
          const isSelected = format.id === selectedFormatId;
          const titleText =
            format.label?.[lang]?.trim() || formatFallbackTitle(format.id);
          const styleBadgeText = getStyleBadge(format, lang);
          const themeClass = getFormatThemeClass(format.id);
          const showVideo = Boolean(
            format.videoUrl && (isSelected || hoveredId === format.id)
          );

          const handleClick = () => {
            if (isLocked) {
              onLockedSelect?.(format.id);
              return;
            }
            onSelectFormat(format.id);
          };

          return (
            <button
              key={format.id}
              type="button"
              aria-disabled={isLocked}
              aria-pressed={isSelected}
              onClick={handleClick}
              onMouseEnter={() => setHoveredId(format.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`${styles.formatCard} ${
                isSelected ? styles.formatCardSelected : ''
              } ${isLocked ? styles.formatCardLocked : ''}`}
            >
              <div className={`${styles.visualThumb} ${themeClass}`}>
                {format.imageUrl && (
                  <img
                    src={format.imageUrl}
                    alt={titleText}
                    className={styles.visualImg}
                    loading="lazy"
                  />
                )}
                {showVideo && format.videoUrl && (
                  <video
                    src={format.videoUrl}
                    className={styles.visualVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                )}
                <span className={styles.formatTag}>
                  {isSpanish ? 'Formato' : 'Format'}
                </span>
                {isLocked && (
                  <span className={styles.lockedBadge}>
                    {isSpanish ? 'Plan+' : 'Plan+'}
                  </span>
                )}
              </div>

              <div className={styles.cardBody}>
                <span className={styles.formatTitle}>{titleText}</span>
                <span className={styles.styleBadge}>{styleBadgeText}</span>
                <p className={styles.formatDesc}>{format.description[lang]}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { WizardStep3, type WizardStep3Props };
export default WizardStep3;
