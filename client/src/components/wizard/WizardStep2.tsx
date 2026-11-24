import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import { getOptionAccessState, getPlanWizardPolicy } from './wizardPlanConfig';
import { type PlanTier } from './wizardStorage';
import styles from './WizardStep2.module.css';

export interface PresetOption {
  id: string;
  label: { en: string; es: string };
  description: { en: string; es: string };
  toneTag?: { en: string; es: string };
  imageUrl?: string;
  videoUrl?: string;
  requiresPaidPlan?: boolean;
}

interface WizardStep2Props {
  selectedPresetId: string;
  planTier: PlanTier;
  presets: PresetOption[];
  onSelectPreset: (id: string) => void;
  onLockedSelect?: (id: string) => void;
}

function formatFallbackTitle(id: string): string {
  return id
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getToneBadge(preset: PresetOption, lang: 'es' | 'en'): string {
  if (preset.toneTag?.[lang]) {
    return preset.toneTag[lang];
  }
  const key = preset.id.toLowerCase();
  if (key.includes('cinematic')) {
    return lang === 'es' ? 'Dramático · Atmosférico' : 'Dramatic · Atmospheric';
  }
  if (key.includes('documentary')) {
    return lang === 'es' ? 'Investigativo · Real' : 'Investigative · Grounded';
  }
  if (key.includes('educational')) {
    return lang === 'es' ? 'Claro · Didáctico' : 'Clear · Articulate';
  }
  if (key.includes('minimalist')) {
    return lang === 'es' ? 'Sereno · Limpio' : 'Calm · Unhurried';
  }
  if (key.includes('tiktok') || key.includes('viral')) {
    return lang === 'es' ? 'Ágil · Alto impacto' : 'Upbeat · Fast-paced';
  }
  return lang === 'es' ? 'Balanceado' : 'Balanced';
}

function getPresetThemeClass(id: string): string {
  const key = id.toLowerCase();
  if (key.includes('cinematic')) return styles.themeCinematic;
  if (key.includes('documentary')) return styles.themeDocumentary;
  if (key.includes('educational')) return styles.themeEducational;
  if (key.includes('minimalist')) return styles.themeMinimalist;
  if (key.includes('tiktok') || key.includes('viral')) return styles.themeViral;
  return styles.themeDefault;
}

function WizardStep2({
  selectedPresetId,
  planTier,
  presets,
  onSelectPreset,
  onLockedSelect,
}: WizardStep2Props) {
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
            ? '2. Elige el preset narrativo'
            : '2. Choose your narrative preset'}
        </h3>
        <p className={styles.stepHint}>
          {isSpanish
            ? 'Define el ritmo, la energía y el tono visual de tu historia.'
            : 'Sets the pacing, energy, and visual tone of your story.'}
        </p>
      </div>

      <div className={styles.cardsGrid}>
        {presets.map((preset) => {
          const access = getOptionAccessState(
            policy.presets,
            preset.id,
            preset.requiresPaidPlan
          );
          const isLocked = access.locked;
          const isSelected = preset.id === selectedPresetId;
          const titleText =
            preset.label?.[lang]?.trim() || formatFallbackTitle(preset.id);
          const toneText = getToneBadge(preset, lang);
          const themeClass = getPresetThemeClass(preset.id);
          const showVideo = Boolean(
            preset.videoUrl && (isSelected || hoveredId === preset.id)
          );

          const handleClick = () => {
            if (isLocked) {
              onLockedSelect?.(preset.id);
              return;
            }
            onSelectPreset(preset.id);
          };

          return (
            <button
              key={preset.id}
              type="button"
              aria-disabled={isLocked}
              aria-pressed={isSelected}
              onClick={handleClick}
              onMouseEnter={() => setHoveredId(preset.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`${styles.optionCard} ${
                isSelected ? styles.optionCardSelected : ''
              } ${isLocked ? styles.optionCardLocked : ''}`}
            >
              <div className={`${styles.previewBox} ${themeClass}`}>
                {preset.imageUrl && (
                  <img
                    src={preset.imageUrl}
                    alt={titleText}
                    className={styles.previewImage}
                    loading="lazy"
                  />
                )}
                {showVideo && preset.videoUrl && (
                  <video
                    src={preset.videoUrl}
                    className={styles.previewVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                )}
                <span className={styles.badgePill}>
                  {isSpanish ? 'Estilo' : 'Style'}
                </span>
                {isLocked && (
                  <span className={styles.lockedTag}>
                    {isSpanish ? 'Plan+' : 'Plan+'}
                  </span>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTitleRow}>
                  <span className={styles.cardTitle}>{titleText}</span>
                </div>
                <span className={styles.tonePill}>{toneText}</span>
                <p className={styles.cardDesc}>{preset.description[lang]}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { WizardStep2, type WizardStep2Props };
export default WizardStep2;
