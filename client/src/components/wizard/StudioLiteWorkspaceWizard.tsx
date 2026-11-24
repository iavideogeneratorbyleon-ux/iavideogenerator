import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import { WizardContainer, type WizardStepNumber } from './WizardContainer';
import { WizardProcessingStep } from './WizardProcessingStep';
import { WizardStep1 } from './WizardStep1';
import { WizardStep2, type PresetOption } from './WizardStep2';
import { WizardStep3, type VisualFormatOption } from './WizardStep3';
import { WizardStep4 } from './WizardStep4';
import { WizardStep5 } from './WizardStep5';
import {
  loadWizardState,
  saveWizardState,
  type PersistedWizardState,
  type PlanTier,
  type StudioLiteDraft,
} from './wizardStorage';
import styles from './StudioLiteWorkspaceWizard.module.css';

export interface StudioLiteWorkspaceWizardProps {
  initialPrompt?: string;
  isAuthenticated: boolean;
  planTier: PlanTier;
  presets?: PresetOption[];
  formats?: VisualFormatOption[];
  onRequireAuthAndPlan: (draft: StudioLiteDraft) => void;
  onLockedOption?: (optionId: string, step: 2 | 3) => void;
  onGenerationStarted?: (draft: StudioLiteDraft) => void;
  onGenerationCompleted?: (draft: StudioLiteDraft) => void;
}

const WORKSPACE_PRESETS: PresetOption[] = [
  {
    id: 'cinematic',
    label: { en: 'Cinematic', es: 'Cinematográfico' },
    description: {
      en: 'Dramatic pacing, rich lighting, and smooth story beats.',
      es: 'Ritmo dramático, iluminación envolvente y transiciones limpias.',
    },
  },
  {
    id: 'documentary',
    label: { en: 'Documentary', es: 'Documental' },
    description: {
      en: 'Clear narrative flow suited for real stories and explainers.',
      es: 'Narrativa clara ideal para historias reales y explicaciones.',
    },
  },
  {
    id: 'short-hook',
    label: { en: 'Fast Hook', es: 'Gancho Ágil' },
    description: {
      en: 'Punchy opening beats built for short-form retention.',
      es: 'Arranque directo y ritmo dinámico para clips cortos.',
    },
    requiresPaidPlan: true,
  },
];

const WORKSPACE_FORMATS: VisualFormatOption[] = [
  {
    id: 'cempasuchil-editorial',
    label: { en: 'Cempasúchil Editorial', es: 'Cempasúchil Editorial' },
    description: {
      en: 'Warm marigold accents over balanced dark or sand tones.',
      es: 'Acentos cempasúchil sobre tonos cálidos carbón o arena.',
    },
  },
  {
    id: 'comic',
    label: { en: 'Comic', es: 'Cómic' },
    description: {
      en: 'Bold ink contours and graphic panel look.',
      es: 'Contornos marcados y estética de viñeta gráfica.',
    },
  },
  {
    id: '3d-render',
    label: { en: '3D Render', es: '3D Render' },
    description: {
      en: 'Volumetric depth and sculpted lighting.',
      es: 'Profundidad volumétrica e iluminación con volumen.',
    },
    requiresPaidPlan: true,
  },
];

function StudioLiteWorkspaceWizard({
  initialPrompt = '',
  isAuthenticated,
  planTier,
  presets = WORKSPACE_PRESETS,
  formats = WORKSPACE_FORMATS,
  onRequireAuthAndPlan,
  onLockedOption,
  onGenerationStarted,
  onGenerationCompleted,
}: StudioLiteWorkspaceWizardProps) {
  const { language } = useTranslation();
  const lang = language === 'es' ? 'es' : 'en';
  const isSpanish = lang === 'es';

  const [wizardState, setWizardState] = useState<PersistedWizardState>(() =>
    loadWizardState(initialPrompt)
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Si llega un prompt nuevo desde "Start Creating" en LandingPage, actualiza el Paso 1
  useEffect(() => {
    if (!initialPrompt.trim()) return;
    setWizardState((prev) => {
      const next: PersistedWizardState = {
        ...prev,
        draft: {
          ...prev.draft,
          prompt: initialPrompt,
          currentStep: 1,
        },
      };
      saveWizardState(next);
      return next;
    });
  }, [initialPrompt]);

  const updateDraft = useCallback(
    (updater: (prevDraft: StudioLiteDraft) => StudioLiteDraft) => {
      setWizardState((prev) => {
        const next: PersistedWizardState = {
          ...prev,
          draft: updater(prev.draft),
        };
        saveWizardState(next);
        return next;
      });
    },
    []
  );

  const triggerGenerationFlow = useCallback(
    (draftToRun: StudioLiteDraft) => {
      setWizardState((prev) => {
        const cleared: PersistedWizardState = {
          ...prev,
          draft: draftToRun,
          pendingGenerateAfterAuth: false,
        };
        saveWizardState(cleared);
        return cleared;
      });
      setIsProcessing(true);
      onGenerationStarted?.(draftToRun);
    },
    [onGenerationStarted]
  );

  // Al volver autenticado desde el registro / selección de plan, continúa directo a generar
  useEffect(() => {
    if (isAuthenticated && wizardState.pendingGenerateAfterAuth && !isProcessing) {
      triggerGenerationFlow(wizardState.draft);
    }
  }, [
    isAuthenticated,
    isProcessing,
    triggerGenerationFlow,
    wizardState.draft,
    wizardState.pendingGenerateAfterAuth,
  ]);

  const handleNextOrGenerate = () => {
    const step = wizardState.draft.currentStep;

    if (step < 5) {
      const nextStep = (step + 1) as WizardStepNumber;
      updateDraft((prev) => ({ ...prev, currentStep: nextStep }));
      return;
    }

    // Paso 5: Generar Video
    if (!isAuthenticated) {
      const pendingState: PersistedWizardState = {
        ...wizardState,
        pendingGenerateAfterAuth: true,
      };
      setWizardState(pendingState);
      saveWizardState(pendingState);
      onRequireAuthAndPlan(wizardState.draft);
      return;
    }

    triggerGenerationFlow(wizardState.draft);
  };

  const handleBack = () => {
    const step = wizardState.draft.currentStep;
    if (step <= 1) return;
    const prevStep = (step - 1) as WizardStepNumber;
    updateDraft((prev) => ({ ...prev, currentStep: prevStep }));
  };

  const selectedPreset = useMemo(
    () =>
      presets.find((p) => p.id === wizardState.draft.presetId) ?? presets[0],
    [presets, wizardState.draft.presetId]
  );

  const selectedFormat = useMemo(
    () =>
      formats.find((f) => f.id === wizardState.draft.visualFormatId) ??
      formats[0],
    [formats, wizardState.draft.visualFormatId]
  );

  const planLabel = isSpanish
    ? `Plan: ${planTier}`
    : `Plan: ${planTier}`;

  return (
    <div className={styles.wizardHost}>
      <WizardContainer
        currentStep={wizardState.draft.currentStep}
        planLabel={planLabel}
        isProcessing={isProcessing}
        onSelectStep={(step) =>
          updateDraft((prev) => ({ ...prev, currentStep: step }))
        }
        onBack={handleBack}
        onNextOrGenerate={handleNextOrGenerate}
      >
        {isProcessing ? (
          <WizardProcessingStep
            draft={wizardState.draft}
            onCancel={() => setIsProcessing(false)}
            onComplete={() => onGenerationCompleted?.(wizardState.draft)}
          />
        ) : (
          <>
            {wizardState.draft.currentStep === 1 && (
              <WizardStep1
                mode={wizardState.draft.mode}
                prompt={wizardState.draft.prompt}
                onModeChange={(mode) =>
                  updateDraft((prev) => ({ ...prev, mode }))
                }
                onPromptChange={(prompt) =>
                  updateDraft((prev) => ({ ...prev, prompt }))
                }
              />
            )}

            {wizardState.draft.currentStep === 2 && (
              <WizardStep2
                selectedPresetId={wizardState.draft.presetId}
                planTier={planTier}
                presets={presets}
                onSelectPreset={(presetId) =>
                  updateDraft((prev) => ({ ...prev, presetId }))
                }
                onLockedSelect={(id) => onLockedOption?.(id, 2)}
              />
            )}

            {wizardState.draft.currentStep === 3 && (
              <WizardStep3
                selectedFormatId={wizardState.draft.visualFormatId}
                planTier={planTier}
                formats={formats}
                onSelectFormat={(visualFormatId) =>
                  updateDraft((prev) => ({ ...prev, visualFormatId }))
                }
                onLockedSelect={(id) => onLockedOption?.(id, 3)}
              />
            )}

            {wizardState.draft.currentStep === 4 && (
              <WizardStep4
                aspectRatio={wizardState.draft.aspectRatio}
                voice={wizardState.draft.voice}
                durationSec={wizardState.draft.durationSec}
                planTier={planTier}
                onAspectRatioChange={(aspectRatio) =>
                  updateDraft((prev) => ({ ...prev, aspectRatio }))
                }
                onVoiceChange={(voice) =>
                  updateDraft((prev) => ({ ...prev, voice }))
                }
                onDurationChange={(durationSec) =>
                  updateDraft((prev) => ({ ...prev, durationSec }))
                }
              />
            )}

            {wizardState.draft.currentStep === 5 && (
              <WizardStep5
                draft={wizardState.draft}
                presetLabel={selectedPreset.label[lang]}
                visualFormatLabel={selectedFormat.label[lang]}
                isAuthenticated={isAuthenticated}
                onJumpToStep={(step) =>
                  updateDraft((prev) => ({ ...prev, currentStep: step }))
                }
              />
            )}
          </>
        )}
      </WizardContainer>
    </div>
  );
}

export {
  StudioLiteWorkspaceWizard,
  WORKSPACE_PRESETS,
  WORKSPACE_FORMATS,
};
export default StudioLiteWorkspaceWizard;
