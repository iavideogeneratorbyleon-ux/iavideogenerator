import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import {
  SUBTITLE_STYLE_OPTIONS,
  VOICE_OPTIONS,
  type SubtitleStyleOptionItem,
} from './StudioLiteWorkspaceWizard';
import {
  getPlanWizardPolicy,
  type AllowedDurationSec,
} from './wizardPlanConfig';
import { type PlanTier, type WizardAspectRatio } from './wizardStorage';
import styles from './WizardStep4.module.css';

interface WizardStep4Props {
  aspectRatio: WizardAspectRatio;
  voice: string;
  durationSec: number;
  planTier: PlanTier;
  promptText?: string;
  subtitlesEnabled?: boolean;
  subtitleStyle?: string;
  canChooseSubtitleStyle?: boolean;
  subtitleStyles?: SubtitleStyleOptionItem[];
  onAspectRatioChange: (ratio: WizardAspectRatio) => void;
  onVoiceChange: (voice: string) => void;
  onDurationChange: (duration: number) => void;
  onSubtitlesEnabledChange?: (enabled: boolean) => void;
  onSubtitleStyleChange?: (styleId: string) => void;
}

type VoiceLang = 'es' | 'en';

const ALL_DURATIONS: AllowedDurationSec[] = [30, 60, 90];

const RATIO_META: Array<{
  id: WizardAspectRatio;
  frameClass: string;
  previewBoxClass: string;
  hint: { es: string; en: string };
}> = [
  {
    id: '16:9',
    frameClass: styles.frameLandscape,
    previewBoxClass: styles.previewRatio16x9,
    hint: { es: 'Horizontal · Web', en: 'Landscape · Web' },
  },
  {
    id: '9:16',
    frameClass: styles.frameVertical,
    previewBoxClass: styles.previewRatio9x16,
    hint: { es: 'Vertical · Reels', en: 'Vertical · Reels' },
  },
  {
    id: '1:1',
    frameClass: styles.frameSquare,
    previewBoxClass: styles.previewRatio1x1,
    hint: { es: 'Cuadrado · Feed', en: 'Square · Feed' },
  },
];

function detectPromptLanguage(text: string | undefined, fallback: VoiceLang): VoiceLang {
  const clean = (text ?? '').trim().toLowerCase();
  if (clean.length < 12) return fallback;

  if (/[ñ¿¡áéíóúü]/.test(clean)) return 'es';

  const esWords = clean.match(
    /\b(el|la|los|las|un|una|de|del|en|por|para|con|que|como|cómo|historia|video|guion|sobre|muy|más|crear|muestra)\b/g
  )?.length ?? 0;

  const enWords = clean.match(
    /\b(the|and|with|for|that|this|from|how|what|why|video|script|story|create|show|into|your)\b/g
  )?.length ?? 0;

  if (esWords > enWords) return 'es';
  if (enWords > esWords) return 'en';
  return fallback;
}

function getVoiceLanguage(voiceItem: Record<string, unknown>): VoiceLang | null {
  const rawLang = String(
    voiceItem.lang ?? voiceItem.language ?? voiceItem.locale ?? voiceItem.id ?? ''
  ).toLowerCase();

  if (rawLang.startsWith('es') || rawLang.includes('spanish') || rawLang.includes('mex') || rawLang.includes('latam')) {
    return 'es';
  }
  if (rawLang.startsWith('en') || rawLang.includes('english') || rawLang.includes('us') || rawLang.includes('uk')) {
    return 'en';
  }
  return null;
}

function WizardStep4({
  aspectRatio,
  voice,
  durationSec,
  planTier,
  promptText = '',
  subtitlesEnabled = true,
  subtitleStyle = 'auto',
  canChooseSubtitleStyle = planTier !== 'free_trial',
  subtitleStyles = SUBTITLE_STYLE_OPTIONS,
  onAspectRatioChange,
  onVoiceChange,
  onDurationChange,
  onSubtitlesEnabledChange,
  onSubtitleStyleChange,
}: WizardStep4Props) {
  const { t, language } = useTranslation();
  const uiLang: VoiceLang = language === 'es' ? 'es' : 'en';
  const isSpanish = uiLang === 'es';
  const policy = getPlanWizardPolicy(planTier);
  const allowedSet = new Set<number>(policy.allowedDurationsSec);
  const allowProVoices = planTier !== 'free_trial';
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const effectiveVoiceLang: VoiceLang = useMemo(
    () => detectPromptLanguage(promptText, uiLang),
    [promptText, uiLang]
  );

  const filteredVoices = useMemo(() => {
    if (showAllLanguages) return VOICE_OPTIONS;
    const matching = VOICE_OPTIONS.filter((item) => {
      const detected = getVoiceLanguage(item as unknown as Record<string, unknown>);
      return detected === null || detected === effectiveVoiceLang;
    });
    return matching.length > 0 ? matching : VOICE_OPTIONS;
  }, [showAllLanguages, effectiveVoiceLang]);

  useEffect(() => {
    const currentExists = filteredVoices.some((v) => v.id === voice);
    if (!currentExists && filteredVoices.length > 0) {
      const preferred =
        filteredVoices.find((v) => v.tier === 'free' || allowProVoices) ??
        filteredVoices[0];
      if (preferred && preferred.id !== voice) {
        onVoiceChange(preferred.id);
      }
    }
  }, [filteredVoices, voice, allowProVoices, onVoiceChange]);

  const activeRatioMeta =
    RATIO_META.find((r) => r.id === aspectRatio) ?? RATIO_META[1];
  const selectedVoiceObj = VOICE_OPTIONS.find((v) => v.id === voice);
  const selectedVoiceLabel = selectedVoiceObj
    ? selectedVoiceObj.label[uiLang]
    : voice;
  const selectedSubtitleStyleObj = subtitleStyles.find(
    (s) => s.id === subtitleStyle
  );
  const selectedSubtitleLabel = selectedSubtitleStyleObj
    ? selectedSubtitleStyleObj.label[uiLang]
    : subtitleStyle;

  return (
    <div className={styles.stepSection}>
      <div className={styles.headerBlock}>
        <h3 className={styles.stepTitle}>
          {isSpanish
            ? '4. Define encuadre, voz, subtítulos y duración'
            : '4. Set framing, voice, subtitles, and duration'}
        </h3>
        <p className={styles.stepHint}>
          {isSpanish
            ? 'Ajusta la proporción visual, narración, subtítulos y duración antes de revisar el resumen.'
            : 'Adjust visual aspect ratio, narration, subtitles, and duration before reviewing the summary.'}
        </p>
      </div>

      <div className={styles.workspaceGrid}>
        <div className={styles.controlsColumn}>
          <div className={styles.blockGroup}>
            <span className={styles.groupLabel}>
              {t.studioLite.aspectRatioLabel}
            </span>
            <div className={styles.ratioGrid}>
              {RATIO_META.map((item) => {
                const isSelected = aspectRatio === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onAspectRatioChange(item.id)}
                    className={`${styles.ratioCard} ${
                      isSelected ? styles.ratioCardSelected : ''
                    }`}
                  >
                    <span className={item.frameClass} aria-hidden="true" />
                    <span className={styles.ratioText}>{item.id}</span>
                    <span className={styles.ratioHint}>{item.hint[uiLang]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.rowPair}>
            <div className={styles.blockGroup}>
              <div className={styles.labelWithAction}>
                <label htmlFor="wizard-step4-voice" className={styles.groupLabel}>
                  {t.studioLite.voiceLabel}
                </label>
                <button
                  type="button"
                  onClick={() => setShowAllLanguages((prev) => !prev)}
                  className={styles.langToggleBtn}
                >
                  {showAllLanguages
                    ? isSpanish
                      ? `Solo ${effectiveVoiceLang.toUpperCase()}`
                      : `Only ${effectiveVoiceLang.toUpperCase()}`
                    : isSpanish
                    ? `Idioma: ${effectiveVoiceLang.toUpperCase()} · Todas`
                    : `Lang: ${effectiveVoiceLang.toUpperCase()} · All`}
                </button>
              </div>
              <select
                id="wizard-step4-voice"
                value={voice}
                onChange={(e) => onVoiceChange(e.target.value)}
                className={styles.selectField}
              >
                {filteredVoices.map((voiceItem) => {
                  const isVoiceAllowed =
                    voiceItem.tier === 'free' || allowProVoices;
                  return (
                    <option
                      key={voiceItem.id}
                      value={voiceItem.id}
                      disabled={!isVoiceAllowed}
                    >
                      {isVoiceAllowed
                        ? voiceItem.label[uiLang]
                        : `${voiceItem.label[uiLang]} (Plan+)`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className={styles.blockGroup}>
              <span className={styles.groupLabel}>
                {t.studioLite.durationLabel}
              </span>
              <div
                className={styles.durationGroup}
                role="group"
                aria-label={t.studioLite.durationLabel}
              >
                {ALL_DURATIONS.map((dur) => {
                  const isAllowed = allowedSet.has(dur);
                  const isSelected = durationSec === dur;
                  return (
                    <button
                      key={dur}
                      type="button"
                      disabled={!isAllowed}
                      aria-disabled={!isAllowed}
                      aria-pressed={isSelected}
                      onClick={() => isAllowed && onDurationChange(dur)}
                      className={`${styles.durationBtn} ${
                        isSelected ? styles.durationBtnSelected : ''
                      } ${!isAllowed ? styles.durationBtnLocked : ''}`}
                    >
                      <span>{dur}s</span>
                      {!isAllowed && (
                        <span className={styles.lockedMiniTag}>Plan+</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.subtitlesCard}>
            <div className={styles.subtitleRow}>
              <div className={styles.subtitleInfo}>
                <span className={styles.subtitleTitle}>
                  {isSpanish ? 'Subtítulos en pantalla' : 'On-screen subtitles'}
                </span>
                <span className={styles.subtitleDesc}>
                  {isSpanish
                    ? 'Acompaña la narración con texto sincronizado.'
                    : 'Pair narration with synced captions.'}
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={subtitlesEnabled}
                onClick={() => onSubtitlesEnabledChange?.(!subtitlesEnabled)}
                className={`${styles.toggleBtn} ${
                  subtitlesEnabled ? styles.toggleBtnActive : ''
                }`}
              >
                <span className={styles.toggleThumb} />
                <span className={styles.toggleLabel}>
                  {subtitlesEnabled
                    ? isSpanish
                      ? 'Activos'
                      : 'On'
                    : isSpanish
                    ? 'No'
                    : 'Off'}
                </span>
              </button>
            </div>

            {canChooseSubtitleStyle && subtitlesEnabled && (
              <div className={styles.styleSelectBlock}>
                <label
                  htmlFor="wizard-step4-subtitle-style"
                  className={styles.groupLabel}
                >
                  {isSpanish ? 'Estilo de subtítulos' : 'Subtitle style'}
                </label>
                <select
                  id="wizard-step4-subtitle-style"
                  value={subtitleStyle}
                  onChange={(e) => onSubtitleStyleChange?.(e.target.value)}
                  className={styles.selectField}
                >
                  {subtitleStyles.map((styleOpt) => (
                    <option key={styleOpt.id} value={styleOpt.id}>
                      {styleOpt.label[uiLang]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <aside
          className={styles.previewStage}
          aria-label={
            isSpanish
              ? 'Vista previa de encuadre y configuración'
              : 'Framing and configuration preview'
          }
        >
          <div className={styles.stageHeader}>
            <span className={styles.stageBadge}>
              {isSpanish ? 'VISTA DE ENCUADRE' : 'FRAMING PREVIEW'}
            </span>
            <span className={styles.stageDuration}>{durationSec}s</span>
          </div>

          <div className={styles.stageCanvas}>
            <div className={`${styles.previewFrameBox} ${activeRatioMeta.previewBoxClass}`}>
              <span className={styles.previewRatioTag}>{aspectRatio}</span>
              {subtitlesEnabled && (
                <div className={styles.previewCaptionMock}>
                  {isSpanish
                    ? `Subtítulos · ${selectedSubtitleLabel}`
                    : `Captions · ${selectedSubtitleLabel}`}
                </div>
              )}
            </div>
          </div>

          <div className={styles.stageMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaKey}>
                {isSpanish ? 'Voz' : 'Voice'}
              </span>
              <span className={styles.metaVal}>{selectedVoiceLabel}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaKey}>
                {isSpanish ? 'Subtítulos' : 'Subtitles'}
              </span>
              <span className={styles.metaVal}>
                {subtitlesEnabled
                  ? canChooseSubtitleStyle
                    ? selectedSubtitleLabel
                    : isSpanish
                    ? 'Activos'
                    : 'On'
                  : isSpanish
                  ? 'Desactivados'
                  : 'Off'}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export { WizardStep4, type WizardStep4Props };
export default WizardStep4;
