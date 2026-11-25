import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import { type StudioLiteDraft } from './wizardStorage';
import styles from './WizardProcessingStep.module.css';

interface WizardProcessingStepProps {
  draft: StudioLiteDraft;
  voiceLabel?: string;
  isFinished?: boolean;
  onCancel: () => void;
  onComplete?: () => void;
}

interface PipelineStageItem {
  id: string;
  code: string;
  title: string;
  detail: string;
  weight: number;
}

function WizardProcessingStep({
  draft,
  voiceLabel,
  isFinished = false,
  onCancel,
  onComplete,
}: WizardProcessingStepProps) {
  const { language } = useTranslation();
  const isSpanish = language === 'es';
  const [stageIndex, setStageIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(12);

  const stages = useMemo<PipelineStageItem[]>(() => {
    const modeText =
      draft.mode === 'script'
        ? isSpanish
          ? 'guion'
          : 'script'
        : isSpanish
        ? 'idea'
        : 'idea';

    const voiceText =
      voiceLabel ||
      draft.voice ||
      (isSpanish ? 'voz seleccionada' : 'selected voice');

    if (isSpanish) {
      return [
        {
          id: 'script_scenes',
          code: '01',
          title: 'Generando guion y escenas',
          detail: `Estructurando escenas desde ${modeText} con preset ${draft.presetId}`,
          weight: 22,
        },
        {
          id: 'voice_synthesis',
          code: '02',
          title: 'Sintetizando voz por escena',
          detail: `Locución y ritmo (${draft.durationSec}s aprox.) · ${voiceText}`,
          weight: 48,
        },
        {
          id: 'ai_visuals',
          code: '03',
          title: 'Renderizando visuales con IA',
          detail: `Componiendo escenas en ${draft.aspectRatio} · estilo ${draft.visualFormatId}`,
          weight: 78,
        },
        {
          id: 'final_render',
          code: '04',
          title: 'Sincronizando y preparando entrega',
          detail: 'Uniendo audio, subtítulos y escenas para tu Dashboard',
          weight: 94,
        },
      ];
    }

    return [
      {
        id: 'script_scenes',
        code: '01',
        title: 'Generating script & scenes',
        detail: `Structuring scenes from ${modeText} using ${draft.presetId} preset`,
        weight: 22,
      },
      {
        id: 'voice_synthesis',
        code: '02',
        title: 'Synthesizing scene voiceover',
        detail: `Pacing & narration (~${draft.durationSec}s) · ${voiceText}`,
        weight: 48,
      },
      {
        id: 'ai_visuals',
        code: '03',
        title: 'Generating AI visuals',
        detail: `Rendering frames in ${draft.aspectRatio} · ${draft.visualFormatId} look`,
        weight: 78,
      },
      {
        id: 'final_render',
        code: '04',
        title: 'Syncing & finalizing render',
        detail: 'Combining voice, captions, and scenes for your Dashboard',
        weight: 94,
      },
    ];
  }, [
    draft.aspectRatio,
    draft.durationSec,
    draft.mode,
    draft.presetId,
    draft.visualFormatId,
    isSpanish,
    voiceLabel,
    draft.voice,
  ]);

  // Ritmo proporcional a la duración configurada (más corto para 15s-30s, más pausado para 60s+)
  const stepIntervalMs = useMemo(() => {
    const baseMs = Math.max(1600, Math.min(3600, (draft.durationSec || 30) * 85));
    return baseMs;
  }, [draft.durationSec]);

  useEffect(() => {
    if (isFinished) {
      setStageIndex(stages.length - 1);
      setProgressPct(100);
      onComplete?.();
      return;
    }

    setProgressPct((prev) => Math.max(prev, stages[0]?.weight ?? 15));

    const interval = window.setInterval(() => {
      setStageIndex((prev) => {
        if (prev < stages.length - 1) {
          const next = prev + 1;
          setProgressPct(stages[next].weight);
          return next;
        }
        // Si aún no ha respondido el backend, avanza sutilmente hasta 96% sin completar falso
        setProgressPct((p) => (p < 96 ? p + 1 : 96));
        return prev;
      });
    }, stepIntervalMs);

    return () => window.clearInterval(interval);
  }, [isFinished, onComplete, stages, stepIntervalMs]);

  const activeStage = stages[stageIndex] || stages[0];

  return (
    <div className={styles.processingWrap} role="status" aria-live="polite">
      <div className={styles.aiOrbStage} aria-hidden="true">
        <div className={styles.aiHalo} />
        <div className={styles.spinnerRing} />
        <div className={styles.aiCore}>
          <span className={styles.aiSparkle}>✦</span>
          <span className={styles.aiBadgeText}>AI</span>
        </div>
      </div>

      <div className={styles.headerGroup}>
        <span className={styles.stageTag}>
          <span aria-hidden="true">✦</span>{' '}
          {isSpanish
            ? `PIPELINE AI · ${activeStage.code}/${String(stages.length).padStart(2, '0')}`
            : `AI PIPELINE · ${activeStage.code}/${String(stages.length).padStart(2, '0')}`}
        </span>

        <h3 className={styles.heading}>{activeStage.title}</h3>

        <p className={styles.activeDetail}>{activeStage.detail}</p>
      </div>

      <div className={styles.progressBlock}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>
            {isSpanish ? 'Progreso estimado del flujo' : 'Estimated pipeline flow'}
          </span>
          <span className={styles.progressValue}>{progressPct}%</span>
        </div>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
        >
          <div
            className={styles.progressFill}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <ol className={styles.stageList}>
        {stages.map((item, idx) => {
          const status =
            isFinished || idx < stageIndex
              ? 'done'
              : idx === stageIndex
              ? 'active'
              : 'pending';

          return (
            <li
              key={item.id}
              className={`${styles.stageItem} ${
                status === 'active'
                  ? styles.stageItemActive
                  : status === 'done'
                  ? styles.stageItemDone
                  : ''
              }`}
            >
              <span className={styles.stageIndicator} aria-hidden="true">
                {status === 'done' ? '✓' : status === 'active' ? '✦' : item.code}
              </span>
              <div className={styles.stageTextCol}>
                <span className={styles.stageItemTitle}>{item.title}</span>
                <span className={styles.stageItemSub}>{item.detail}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <p className={styles.description}>
        {isSpanish
          ? 'Tu configuración quedó guardada. Estamos procesando cada escena y enviaremos el video listo a tu Dashboard.'
          : 'Your setup is saved. We are processing each scene and will deliver your finished video to your Dashboard.'}
      </p>

      <div className={styles.metaPillRow}>
        <span className={styles.metaPill}>{draft.presetId}</span>
        <span className={styles.metaPill}>{draft.visualFormatId}</span>
        <span className={styles.metaPill}>{draft.aspectRatio}</span>
        <span className={styles.metaPill}>{draft.durationSec}s</span>
        {voiceLabel && <span className={styles.metaPill}>{voiceLabel}</span>}
      </div>

      <div className={styles.actionsRow}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelBtn}
        >
          {isSpanish ? 'Volver al resumen' : 'Back to summary'}
        </button>
      </div>
    </div>
  );
}

export { WizardProcessingStep, type WizardProcessingStepProps };
export default WizardProcessingStep;
