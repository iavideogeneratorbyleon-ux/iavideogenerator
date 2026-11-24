import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslations';
import { TermsModal, type LegalDocType } from '../terms-modal/TermsModal';
import WizardContainer, { type WizardStepNumber } from './WizardContainer';
import WizardProcessingStep from './WizardProcessingStep';
import WizardStep1 from './WizardStep1';
import WizardStep2 from './WizardStep2';
import WizardStep3 from './WizardStep3';
import WizardStep4 from './WizardStep4';
import WizardStep5 from './WizardStep5';
import {
  getOptionAccessState,
  getPlanWizardPolicy,
  normalizePlanTier,
  type AllowedDurationSec,
  type PlanTier,
} from './wizardPlanConfig';
import {
  loadWizardState,
  saveWizardState,
  type PersistedWizardState,
  type StudioLiteDraft,
  type WizardAspectRatio,
  type WizardInputMode,
} from './wizardStorage';
import styles from './StudioLiteWorkspaceWizard.module.css';

interface StudioLiteWorkspaceWizardProps {
  initialPrompt?: string;
  onRequireAuth?: (draft: StudioLiteDraft) => void;
  onGenerationCompleted?: (result: {
    title: string;
    prompt: string;
    presetId: string;
    styleFormatId: string;
    aspectRatio: string;
    resolution: string;
    durationSec: number;
    voice: string;
    creditsRemaining?: number;
  }) => void;
  onBackToDashboard?: () => void;
}

export interface PresetOptionItem {
  id: string;
  badge: { en: string; es: string };
  label: { en: string; es: string };
  description: { en: string; es: string };
  isPaidOnly?: boolean;
}

export interface VisualFormatItem {
  id: string;
  badge: { en: string; es: string };
  label: { en: string; es: string };
  description: { en: string; es: string };
  isPaidOnly?: boolean;
}

export const PRESET_OPTIONS: PresetOptionItem[] = [
  {
    id: 'default',
    badge: { en: 'Core', es: 'Base' },
    label: { en: 'Standard Creator', es: 'Creador Estándar' },
    description: {
      en: 'Balanced pacing, clear narration, and clean visual transitions.',
      es: 'Ritmo equilibrado, narración clara y transiciones limpias.',
    },
  },
  {
    id: 'educational',
    badge: { en: 'Core', es: 'Base' },
    label: { en: 'Educational Explainer', es: 'Explicativo Educativo' },
    description: {
      en: 'Structured step-by-step explanation designed for learning.',
      es: 'Explicación estructurada paso a paso pensada para enseñar.',
    },
  },
  {
    id: 'minimalist',
    badge: { en: 'Core', es: 'Base' },
    label: { en: 'Minimalist Focus', es: 'Enfoque Minimalista' },
    description: {
      en: 'Calm, uncluttered visual rhythm with direct messaging.',
      es: 'Ritmo visual sereno, sin saturación y con mensaje directo.',
    },
  },
  {
    id: 'documentary',
    badge: { en: 'Core', es: 'Base' },
    label: { en: 'Documentary Narrative', es: 'Narrativa Documental' },
    description: {
      en: 'Story-driven pacing with grounded, authentic tone.',
      es: 'Ritmo narrativo de historia con tono auténtico y cercano.',
    },
  },
  {
    id: 'cinematic',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'Cinematic Trailer', es: 'Tráiler Cinematográfico' },
    description: {
      en: 'Dramatic tension, wider visual beats, and high-impact hooks.',
      es: 'Tensión dramática, golpes visuales amplios y ganchos intensos.',
    },
    isPaidOnly: true,
  },
  {
    id: 'short-hook',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'Fast Hook / Short', es: 'Gancho Rápido / Short' },
    description: {
      en: 'Punchy opening seconds built for vertical short-form feeds.',
      es: 'Segundos iniciales directos pensados para formatos cortos verticales.',
    },
    isPaidOnly: true,
  },
  {
    id: 'tiktok_viral',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'Viral Short Pace', es: 'Ritmo Viral Corto' },
    description: {
      en: 'High-retention cuts and snappy scene shifts.',
      es: 'Cortes de alta retención y cambios de escena ágiles.',
    },
    isPaidOnly: true,
  },
  {
    id: 'mr_beast',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'High-Energy Challenge', es: 'Reto de Alta Energía' },
    description: {
      en: 'Fast momentum, curiosity loops, and bold scene progression.',
      es: 'Impulso rápido, bucles de curiosidad y progresión dinámica.',
    },
    isPaidOnly: true,
  },
  {
    id: 'netflix',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'Series Docuseries', es: 'Docuserie de Plataforma' },
    description: {
      en: 'Atmospheric pacing inspired by modern streaming documentaries.',
      es: 'Ritmo atmosférico inspirado en documentales de plataforma.',
    },
    isPaidOnly: true,
  },
  {
    id: 'luxury_brand',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'Luxury Editorial', es: 'Editorial de Lujo' },
    description: {
      en: 'Refined, deliberate framing suited for premium brands.',
      es: 'Encuadre refinado y pausado ideal para marcas premium.',
    },
    isPaidOnly: true,
  },
  {
    id: 'tech_modern',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'Modern Tech Showcase', es: 'Vitrina Tech Moderna' },
    description: {
      en: 'Crisp product and concept storytelling with sleek transitions.',
      es: 'Narrativa clara de conceptos y productos con transiciones limpias.',
    },
    isPaidOnly: true,
  },
  {
    id: 'dark_mystery',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'Mystery & Suspense', es: 'Misterio y Suspenso' },
    description: {
      en: 'Moody pacing and intrigue built around unfolding clues.',
      es: 'Ritmo envolvente e intriga construida alrededor de pistas.',
    },
    isPaidOnly: true,
  },
];

export const VISUAL_FORMATS: VisualFormatItem[] = [
  {
    id: 'cempasuchil-editorial',
    badge: { en: 'Signature', es: 'Distintivo' },
    label: { en: 'Cempasúchil Editorial', es: 'Editorial Cempasúchil' },
    description: {
      en: 'Warm marigold tones, crisp contrast, and editorial composition.',
      es: 'Tonos cálidos cempasúchil, contraste limpio y composición editorial.',
    },
  },
  {
    id: 'comic',
    badge: { en: 'Core', es: 'Base' },
    label: { en: 'Graphic Comic', es: 'Cómic Gráfico' },
    description: {
      en: 'Illustrated panel energy with defined ink contours.',
      es: 'Energía de viñeta ilustrada con contornos definidos.',
    },
  },
  {
    id: 'realistic',
    badge: { en: 'Core', es: 'Base' },
    label: { en: 'Photorealistic', es: 'Fotorrealista' },
    description: {
      en: 'Natural lighting and lifelike photographic textures.',
      es: 'Iluminación natural y texturas de aspecto fotográfico.',
    },
  },
  {
    id: 'minimalist_flat',
    badge: { en: 'Core', es: 'Base' },
    label: { en: 'Clean Flat Vector', es: 'Vector Plano Limpio' },
    description: {
      en: 'Simple geometric shapes and high-legibility visual blocks.',
      es: 'Formas geométricas simples y bloques visuales de alta lectura.',
    },
  },
  {
    id: '3d-render',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: '3D Studio Render', es: 'Render 3D de Estudio' },
    description: {
      en: 'Depth, volumetric lighting, and sculpted 3D surfaces.',
      es: 'Profundidad, iluminación volumétrica y superficies 3D.',
    },
    isPaidOnly: true,
  },
  {
    id: 'cinematic_film',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'Anamorphic Film', es: 'Cine Anamórfico' },
    description: {
      en: 'Widescreen film grain, rich shadows, and cinema color grading.',
      es: 'Grano cinematográfico, sombras ricas y color de cine.',
    },
    isPaidOnly: true,
  },
  {
    id: 'anime',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'Anime Illustration', es: 'Ilustración Anime' },
    description: {
      en: 'Expressive character framing and vibrant anime color palette.',
      es: 'Encuadre expresivo y paleta cromática estilo anime.',
    },
    isPaidOnly: true,
  },
  {
    id: 'retro_vintage',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'Retro Analog', es: 'Analógico Retro' },
    description: {
      en: 'Nostalgic print warmth and classic analog character.',
      es: 'Calidez impresa nostálgica y carácter analógico clásico.',
    },
    isPaidOnly: true,
  },
  {
    id: 'surreal_editorial',
    badge: { en: 'Pro', es: 'Pro' },
    label: { en: 'Surreal Concept', es: 'Concepto Surrealista' },
    description: {
      en: 'Imaginative visual metaphors and dreamlike compositions.',
      es: 'Metáforas visuales imaginativas y composiciones oníricas.',
    },
    isPaidOnly: true,
  },
];

export const VOICE_OPTIONS = [
  { id: 'alloy', label: { en: 'Alloy (Balanced)', es: 'Alloy (Equilibrada)' } },
  { id: 'nova', label: { en: 'Nova (Warm)', es: 'Nova (Cálida)' } },
  { id: 'echo', label: { en: 'Echo (Clear)', es: 'Echo (Clara)' } },
  { id: 'onyx', label: { en: 'Onyx (Deep)', es: 'Onyx (Profunda)' } },
];

function sanitizeDraftForPolicy(
  draft: StudioLiteDraft,
  planTier: PlanTier
): StudioLiteDraft {
  const policy = getPlanWizardPolicy(planTier);

  const nextMode: WizardInputMode = draft.mode === 'script' ? 'script' : 'idea';

  const presetAccess = getOptionAccessState(
    policy.presets,
    draft.presetId,
    PRESET_OPTIONS.find((p) => p.id === draft.presetId)?.isPaidOnly
  );
  const nextPresetId = presetAccess.enabled
    ? draft.presetId
    : policy.defaultPresetId;

  const formatAccess = getOptionAccessState(
    policy.styleFormats,
    draft.visualFormatId,
    VISUAL_FORMATS.find((f) => f.id === draft.visualFormatId)?.isPaidOnly
  );
  const nextVisualFormatId = formatAccess.enabled
    ? draft.visualFormatId
    : policy.defaultStyleFormatId;

  const nextAspectRatio: WizardAspectRatio = policy.allowedAspectRatios.includes(
    draft.aspectRatio
  )
    ? draft.aspectRatio
    : (policy.defaultAspectRatio as WizardAspectRatio);

  const nextDurationSec: AllowedDurationSec = policy.allowedDurationsSec.includes(
    draft.durationSec as AllowedDurationSec
  )
    ? (draft.durationSec as AllowedDurationSec)
    : policy.defaultDurationSec;

  return {
    ...draft,
    mode: nextMode,
    presetId: nextPresetId,
    visualFormatId: nextVisualFormatId,
    aspectRatio: nextAspectRatio,
    durationSec: nextDurationSec,
  };
}

function StudioLiteWorkspaceWizard({
  initialPrompt = '',
  onRequireAuth,
  onGenerationCompleted,
  onBackToDashboard,
}: StudioLiteWorkspaceWizardProps) {
  const { language } = useTranslation();
  const { isAuthenticated, planTier, user } = useAuth();
  const lang = language === 'es' ? 'es' : 'en';
  const normalizedPlan = normalizePlanTier(planTier);
  const planPolicy = useMemo(
    () => getPlanWizardPolicy(normalizedPlan),
    [normalizedPlan]
  );

  const [wizardState, setWizardState] = useState<PersistedWizardState>(() => {
    const loaded = loadWizardState(initialPrompt);
    return {
      ...loaded,
      draft: sanitizeDraftForPolicy(loaded.draft, normalizePlanTier(planTier)),
      updatedAt: Date.now(),
    };
  });

  const [validationError, setValidationError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [showTermsError, setShowTermsError] = useState<boolean>(false);
  const [termsModalType, setTermsModalType] = useState<LegalDocType>('terms');
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  const updateDraft = useCallback(
    (updater: (prev: StudioLiteDraft) => StudioLiteDraft) => {
      setWizardState((prev) => {
        const nextDraft = sanitizeDraftForPolicy(
          updater(prev.draft),
          normalizedPlan
        );
        const nextState: PersistedWizardState = {
          ...prev,
          draft: nextDraft,
          updatedAt: Date.now(),
        };
        saveWizardState(nextState);
        return nextState;
      });
      setValidationError('');
    },
    [normalizedPlan]
  );

  useEffect(() => {
    setWizardState((prev) => {
      const sanitized = sanitizeDraftForPolicy(prev.draft, normalizedPlan);
      const nextState: PersistedWizardState = {
        ...prev,
        draft: sanitized,
        updatedAt: Date.now(),
      };
      saveWizardState(nextState);
      return nextState;
    });
  }, [normalizedPlan]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      updateDraft((prev) => ({
        ...prev,
        prompt: prev.prompt.trim().length > 0 ? prev.prompt : initialPrompt,
      }));
    }
  }, [initialPrompt, updateDraft]);

  const startGenerationFlow = useCallback(
    async (draftToRun: StudioLiteDraft) => {
      setIsProcessing(true);
      setValidationError('');

      const videoTitle =
        draftToRun.prompt.trim().slice(0, 48) ||
        (lang === 'es' ? 'Video Studio Lite' : 'Studio Lite Video');
      const resolvedResolution = planPolicy.defaultResolution || '720p';

      try {
        const token = localStorage.getItem('cempa_token');
        const userId =
          (user as { id?: string; _id?: string } | null)?.id ||
          (user as { id?: string; _id?: string } | null)?._id;

        if (token) {
          const response = await fetch('/api/studio-lite/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId,
              prompt: draftToRun.prompt.trim(),
              mode: draftToRun.mode,
              preset: draftToRun.presetId,
              styleFormat: draftToRun.visualFormatId,
              aspectRatio: draftToRun.aspectRatio,
              resolution: resolvedResolution,
              durationSec: draftToRun.durationSec,
              voice: draftToRun.voice,
              plan: normalizedPlan,
              acceptedTerms: true,
            }),
          });

          if (response.ok) {
            const data = await response.json().catch(() => ({}));
            const updatedCredits =
              typeof data?.creditsRemaining === 'number'
                ? data.creditsRemaining
                : typeof data?.credits === 'number'
                ? data.credits
                : undefined;

            const resetState: PersistedWizardState = {
              draft: {
                ...loadWizardState().draft,
                currentStep: 1,
                prompt: '',
              },
              pendingGenerateAfterAuth: false,
              updatedAt: Date.now(),
            };
            saveWizardState(resetState);

            setIsProcessing(false);
            onGenerationCompleted?.({
              title: data?.title || videoTitle,
              prompt: draftToRun.prompt.trim(),
              presetId: draftToRun.presetId,
              styleFormatId: draftToRun.visualFormatId,
              aspectRatio: draftToRun.aspectRatio,
              resolution: resolvedResolution,
              durationSec: draftToRun.durationSec,
              voice: draftToRun.voice,
              creditsRemaining: updatedCredits,
            });
            return;
          }
        }
      } catch {
        // Fallback local limpio si el backend aún no responde o está en modo demo
      }

      window.setTimeout(() => {
        const resetState: PersistedWizardState = {
          draft: {
            ...loadWizardState().draft,
            currentStep: 1,
            prompt: '',
          },
          pendingGenerateAfterAuth: false,
          updatedAt: Date.now(),
        };
        saveWizardState(resetState);

        setIsProcessing(false);
        onGenerationCompleted?.({
          title: videoTitle,
          prompt: draftToRun.prompt.trim(),
          presetId: draftToRun.presetId,
          styleFormatId: draftToRun.visualFormatId,
          aspectRatio: draftToRun.aspectRatio,
          resolution: resolvedResolution,
          durationSec: draftToRun.durationSec,
          voice: draftToRun.voice,
        });
      }, 1400);
    },
    [lang, normalizedPlan, onGenerationCompleted, planPolicy.defaultResolution, user]
  );

  useEffect(() => {
    if (isAuthenticated && wizardState.pendingGenerateAfterAuth && !isProcessing) {
      const draftSnapshot = wizardState.draft;
      const clearedPendingState: PersistedWizardState = {
        ...wizardState,
        pendingGenerateAfterAuth: false,
        updatedAt: Date.now(),
      };
      saveWizardState(clearedPendingState);
      setWizardState(clearedPendingState);
      void startGenerationFlow(draftSnapshot);
    }
  }, [isAuthenticated, isProcessing, startGenerationFlow, wizardState]);

  const currentStep = wizardState.draft.currentStep;

  const handleStepSelect = (targetStep: WizardStepNumber) => {
    if (targetStep <= currentStep) {
      setValidationError('');
      updateDraft((prev) => ({ ...prev, currentStep: targetStep }));
    }
  };

  const handleBack = () => {
    setValidationError('');
    if (currentStep > 1) {
      const prevStep = (currentStep - 1) as WizardStepNumber;
      updateDraft((prev) => ({ ...prev, currentStep: prevStep }));
    } else {
      onBackToDashboard?.();
    }
  };

  const handleNextOrGenerate = () => {
    if (currentStep === 1 && !wizardState.draft.prompt.trim()) {
      setValidationError(
        lang === 'es'
          ? 'Escribe una idea o guion breve antes de pasar al Paso 2.'
          : 'Enter a brief idea or script before moving to Step 2.'
      );
      return;
    }

    if (currentStep < 5) {
      setValidationError('');
      const nextStep = (currentStep + 1) as WizardStepNumber;
      updateDraft((prev) => ({ ...prev, currentStep: nextStep }));
      return;
    }

    if (!acceptedTerms) {
      setShowTermsError(true);
      setValidationError(
        lang === 'es'
          ? 'Debes aceptar los Términos de Servicio y la Política de Generación de Contenido con IA antes de generar.'
          : 'You must accept the Terms of Service and AI Content Generation Policy before generating.'
      );
      return;
    }

    if (!isAuthenticated) {
      const currentSaved = loadWizardState();
      saveWizardState({
        ...currentSaved,
        draft: wizardState.draft,
        pendingGenerateAfterAuth: true,
        updatedAt: Date.now(),
      });
      onRequireAuth?.(wizardState.draft);
      return;
    }

    void startGenerationFlow(wizardState.draft);
  };

  const selectedPreset =
    PRESET_OPTIONS.find((item) => item.id === wizardState.draft.presetId) ||
    PRESET_OPTIONS.find((item) => item.id === planPolicy.defaultPresetId) ||
    PRESET_OPTIONS[0];

  const selectedFormat =
    VISUAL_FORMATS.find(
      (item) => item.id === wizardState.draft.visualFormatId
    ) ||
    VISUAL_FORMATS.find(
      (item) => item.id === planPolicy.defaultStyleFormatId
    ) ||
    VISUAL_FORMATS[0];

  return (
    <div className={styles.wizardShell}>
      <WizardContainer
        currentStep={currentStep}
        planLabel={planPolicy.label[lang]}
        isProcessing={isProcessing}
        onSelectStep={handleStepSelect}
        onBack={handleBack}
        onNextOrGenerate={handleNextOrGenerate}
      >
        {isProcessing ? (
          <WizardProcessingStep
            draft={wizardState.draft}
            onCancel={() => setIsProcessing(false)}
          />
        ) : (
          <>
            {validationError && (
              <p className={styles.validationBanner} role="alert">
                {validationError}
              </p>
            )}

            {currentStep === 1 && (
              <WizardStep1
                mode={wizardState.draft.mode}
                prompt={wizardState.draft.prompt}
                planTier={normalizedPlan}
                onModeChange={(mode) =>
                  updateDraft((prev) => ({ ...prev, mode }))
                }
                onPromptChange={(prompt) =>
                  updateDraft((prev) => ({ ...prev, prompt }))
                }
                onLockedScriptMode={() =>
                  setValidationError(
                    lang === 'es'
                      ? 'El modo guion personalizado requiere un plan superior.'
                      : 'Custom script mode requires a higher plan.'
                  )
                }
              />
            )}

            {currentStep === 2 && (
              <WizardStep2
                selectedPresetId={wizardState.draft.presetId}
                planTier={normalizedPlan}
                presets={PRESET_OPTIONS}
                onSelectPreset={(presetId) =>
                  updateDraft((prev) => ({ ...prev, presetId }))
                }
              />
            )}

            {currentStep === 3 && (
              <WizardStep3
                selectedFormatId={wizardState.draft.visualFormatId}
                planTier={normalizedPlan}
                formats={VISUAL_FORMATS}
                onSelectFormat={(visualFormatId) =>
                  updateDraft((prev) => ({ ...prev, visualFormatId }))
                }
              />
            )}

            {currentStep === 4 && (
              <WizardStep4
                aspectRatio={wizardState.draft.aspectRatio}
                voice={wizardState.draft.voice}
                durationSec={wizardState.draft.durationSec}
                planTier={normalizedPlan}
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

            {currentStep === 5 && (
              <WizardStep5
                draft={wizardState.draft}
                presetLabel={selectedPreset.label[lang]}
                visualFormatLabel={selectedFormat.label[lang]}
                planTier={normalizedPlan}
                isAuthenticated={isAuthenticated}
                acceptedTerms={acceptedTerms}
                showTermsError={showTermsError}
                onAcceptedTermsChange={(checked) => {
                  setAcceptedTerms(checked);
                  if (checked) {
                    setShowTermsError(false);
                    setValidationError('');
                  }
                }}
                onOpenLegalDoc={(docType) => {
                  setTermsModalType(docType);
                  setIsTermsModalOpen(true);
                }}
                onJumpToStep={(step) =>
                  updateDraft((prev) => ({ ...prev, currentStep: step }))
                }
              />
            )}
          </>
        )}
      </WizardContainer>

      <TermsModal
        isOpen={isTermsModalOpen}
        type={termsModalType}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => {
          setAcceptedTerms(true);
          setShowTermsError(false);
          setValidationError('');
        }}
      />
    </div>
  );
}

export { StudioLiteWorkspaceWizard };
export default StudioLiteWorkspaceWizard;
