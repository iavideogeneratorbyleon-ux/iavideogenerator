import { type WizardStepNumber } from './WizardContainer';
import { type AllowedDurationSec, type PlanTier } from './wizardPlanConfig';

export type WizardInputMode = 'idea' | 'script';
export type WizardAspectRatio = '16:9' | '9:16' | '1:1';
export type { PlanTier, AllowedDurationSec };

export interface StudioLiteDraft {
  currentStep: WizardStepNumber;
  mode: WizardInputMode;
  prompt: string;
  presetId: string;
  visualFormatId: string;
  aspectRatio: WizardAspectRatio;
  voice: string;
  durationSec: number;
}

export interface PersistedWizardState {
  draft: StudioLiteDraft;
  pendingGenerateAfterAuth: boolean;
  updatedAt: number;
}

const STORAGE_KEY = 'cempa_studio_lite_wizard_v1';

export const DEFAULT_WIZARD_DRAFT: StudioLiteDraft = {
  currentStep: 1,
  mode: 'idea',
  prompt: '',
  presetId: 'cinematic',
  visualFormatId: 'cempasuchil-editorial',
  aspectRatio: '16:9',
  voice: 'Warm Narrator',
  durationSec: 30,
};

export function createInitialWizardState(
  initialPrompt = ''
): PersistedWizardState {
  return {
    draft: {
      ...DEFAULT_WIZARD_DRAFT,
      currentStep: 1,
      prompt: initialPrompt,
    },
    pendingGenerateAfterAuth: false,
    updatedAt: Date.now(),
  };
}

export function loadWizardState(fallbackPrompt = ''): PersistedWizardState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialWizardState(fallbackPrompt);
    }

    const parsed = JSON.parse(raw) as Partial<PersistedWizardState>;
    const mergedDraft: StudioLiteDraft = {
      ...DEFAULT_WIZARD_DRAFT,
      ...(parsed.draft ?? {}),
      currentStep: (parsed.draft?.currentStep as WizardStepNumber) || 1,
      prompt:
        fallbackPrompt && !parsed.draft?.prompt
          ? fallbackPrompt
          : parsed.draft?.prompt ?? fallbackPrompt,
    };

    return {
      draft: mergedDraft,
      pendingGenerateAfterAuth: Boolean(parsed.pendingGenerateAfterAuth),
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return createInitialWizardState(fallbackPrompt);
  }
}

export function saveWizardState(state: PersistedWizardState): void {
  try {
    const payload: PersistedWizardState = {
      ...state,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignorar errores de cuota o almacenamiento restringido en modo privado
  }
}

export function clearWizardStorage(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignorar errores de almacenamiento
  }
}
