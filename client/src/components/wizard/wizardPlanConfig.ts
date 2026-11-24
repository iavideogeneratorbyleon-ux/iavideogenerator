export type PlanTier = 'free_trial' | 'pay_per_video' | 'pro' | 'unlimited';
export type AllowedDurationSec = 30 | 60 | 90;
export type AspectRatioOption = '9:16' | '16:9' | '1:1';
export type ResolutionOption = '720p' | '1080p';
export type WizardInputMode = 'idea' | 'custom_script';

export type PlanOptionAccessRule<T extends string> =
  | { mode: 'all'; locked?: T[] }
  | { mode: 'allowlist'; allowed: T[]; locked?: T[] };

export interface PlanWizardPolicy {
  tier: PlanTier;
  label: { en: string; es: string };
  allowedDurationsSec: AllowedDurationSec[];
  defaultDurationSec: AllowedDurationSec;
  presets: PlanOptionAccessRule<string>;
  defaultPresetId: string;
  styleFormats: PlanOptionAccessRule<string>;
  defaultStyleFormatId: string;
  allowedAspectRatios: AspectRatioOption[];
  defaultAspectRatio: AspectRatioOption;
  allowedResolutions: ResolutionOption[];
  defaultResolution: ResolutionOption;
  allowedModes: WizardInputMode[];
  allowCustomScript: boolean;
  allowProVoices: boolean;
  allowSubtitles: boolean;
  subtitleMode: 'static' | 'preset_styled';
  watermarkRequired: boolean;
  initialCredits: number;
  videoCreditCost: number;
  minCreditsToGenerate: number;
}

export interface GlobalAdminPlanConfig {
  version: number;
  updatedAt: string;
  creditRules: {
    freeTrialInitialCredits: number;
    videoCreditCost: number;
    minCreditsToGenerate: number;
  };
  plans: Record<PlanTier, PlanWizardPolicy>;
}

export const GLOBAL_ADMIN_PLAN_CONFIG: GlobalAdminPlanConfig = {
  version: 1,
  updatedAt: '2026-11-24T00:00:00.000Z',
  creditRules: {
    freeTrialInitialCredits: 50,
    videoCreditCost: 30,
    minCreditsToGenerate: 30,
  },
  plans: {
    free_trial: {
      tier: 'free_trial',
      label: { en: 'Free Trial', es: 'Prueba Gratuita' },
      allowedDurationsSec: [30],
      defaultDurationSec: 30,
      presets: {
        mode: 'allowlist',
        allowed: ['default', 'educational', 'minimalist', 'documentary'],
        locked: [
          'cinematic',
          'short-hook',
          'tiktok_viral',
          'mr_beast',
          'netflix',
          'luxury_brand',
          'tech_modern',
          'dark_mystery',
        ],
      },
      defaultPresetId: 'documentary',
      styleFormats: {
        mode: 'allowlist',
        allowed: [
          'cempasuchil-editorial',
          'comic',
          'realistic',
          'minimalist_flat',
        ],
        locked: [
          '3d-render',
          '3d_render',
          'cinematic_film',
          'anime',
          'retro_vintage',
          'surreal_editorial',
        ],
      },
      defaultStyleFormatId: 'cempasuchil-editorial',
      allowedAspectRatios: ['9:16', '16:9', '1:1'],
      defaultAspectRatio: '9:16',
      allowedResolutions: ['720p'],
      defaultResolution: '720p',
      allowedModes: ['idea'],
      allowCustomScript: false,
      allowProVoices: false,
      allowSubtitles: true,
      subtitleMode: 'static',
      watermarkRequired: true,
      initialCredits: 50,
      videoCreditCost: 30,
      minCreditsToGenerate: 30,
    },
    pay_per_video: {
      tier: 'pay_per_video',
      label: { en: 'Pay Per Video', es: 'Pago por Video' },
      allowedDurationsSec: [30, 60, 90],
      defaultDurationSec: 60,
      presets: {
        mode: 'all',
        locked: [],
      },
      defaultPresetId: 'documentary',
      styleFormats: {
        mode: 'all',
        locked: [],
      },
      defaultStyleFormatId: 'cempasuchil-editorial',
      allowedAspectRatios: ['9:16', '16:9', '1:1'],
      defaultAspectRatio: '9:16',
      allowedResolutions: ['720p', '1080p'],
      defaultResolution: '1080p',
      allowedModes: ['idea', 'custom_script'],
      allowCustomScript: true,
      allowProVoices: true,
      allowSubtitles: true,
      subtitleMode: 'preset_styled',
      watermarkRequired: false,
      initialCredits: 0,
      videoCreditCost: 30,
      minCreditsToGenerate: 30,
    },
    pro: {
      tier: 'pro',
      label: { en: 'Pro', es: 'Pro' },
      allowedDurationsSec: [30, 60, 90],
      defaultDurationSec: 60,
      presets: {
        mode: 'all',
        locked: [],
      },
      defaultPresetId: 'cinematic',
      styleFormats: {
        mode: 'all',
        locked: [],
      },
      defaultStyleFormatId: 'cempasuchil-editorial',
      allowedAspectRatios: ['9:16', '16:9', '1:1'],
      defaultAspectRatio: '9:16',
      allowedResolutions: ['720p', '1080p'],
      defaultResolution: '1080p',
      allowedModes: ['idea', 'custom_script'],
      allowCustomScript: true,
      allowProVoices: true,
      allowSubtitles: true,
      subtitleMode: 'preset_styled',
      watermarkRequired: false,
      initialCredits: 0,
      videoCreditCost: 30,
      minCreditsToGenerate: 30,
    },
    unlimited: {
      tier: 'unlimited',
      label: { en: 'Unlimited', es: 'Ilimitado' },
      allowedDurationsSec: [30, 60, 90],
      defaultDurationSec: 90,
      presets: {
        mode: 'all',
        locked: [],
      },
      defaultPresetId: 'cinematic',
      styleFormats: {
        mode: 'all',
        locked: [],
      },
      defaultStyleFormatId: 'cempasuchil-editorial',
      allowedAspectRatios: ['9:16', '16:9', '1:1'],
      defaultAspectRatio: '9:16',
      allowedResolutions: ['720p', '1080p'],
      defaultResolution: '1080p',
      allowedModes: ['idea', 'custom_script'],
      allowCustomScript: true,
      allowProVoices: true,
      allowSubtitles: true,
      subtitleMode: 'preset_styled',
      watermarkRequired: false,
      initialCredits: 0,
      videoCreditCost: 0,
      minCreditsToGenerate: 0,
    },
  },
};

export function normalizePlanTier(rawPlan?: string | null): PlanTier {
  const normalized = String(rawPlan || 'free_trial').trim().toLowerCase();
  if (
    normalized === 'free_trial' ||
    normalized === 'pay_per_video' ||
    normalized === 'pro' ||
    normalized === 'unlimited'
  ) {
    return normalized;
  }
  return 'free_trial';
}

export function getPlanWizardPolicy(
  rawPlan?: string | null,
  config: GlobalAdminPlanConfig = GLOBAL_ADMIN_PLAN_CONFIG
): PlanWizardPolicy {
  const tier = normalizePlanTier(rawPlan);
  return config.plans[tier] ?? config.plans.free_trial;
}

export function getOptionAccessState<T extends string>(
  rule: PlanOptionAccessRule<T>,
  optionId: T,
  explicitPaidFlag?: boolean
): { enabled: boolean; locked: boolean } {
  const lockedSet = new Set(rule.locked ?? []);
  if (lockedSet.has(optionId)) {
    return { enabled: false, locked: true };
  }

  if (rule.mode === 'all') {
    return { enabled: true, locked: false };
  }

  const allowedSet = new Set(rule.allowed);
  const inAllowlist = allowedSet.has(optionId);
  if (explicitPaidFlag) {
    return { enabled: false, locked: true };
  }
  return { enabled: inAllowlist, locked: !inAllowlist };
}

export function evaluateCreditGate(params: {
  rawPlan?: string | null;
  credits?: number | null;
  config?: GlobalAdminPlanConfig;
}): {
  canGenerate: boolean;
  planTier: PlanTier;
  remainingCredits: number;
  requiredCredits: number;
  videoCreditCost: number;
} {
  const cfg = params.config ?? GLOBAL_ADMIN_PLAN_CONFIG;
  const policy = getPlanWizardPolicy(params.rawPlan, cfg);
  const remainingCredits =
    typeof params.credits === 'number' ? params.credits : 0;
  const requiredCredits = policy.minCreditsToGenerate;
  const videoCreditCost = policy.videoCreditCost;

  if (policy.tier === 'unlimited' && requiredCredits === 0) {
    return {
      canGenerate: true,
      planTier: policy.tier,
      remainingCredits,
      requiredCredits: 0,
      videoCreditCost,
    };
  }

  return {
    canGenerate: remainingCredits >= requiredCredits,
    planTier: policy.tier,
    remainingCredits,
    requiredCredits,
    videoCreditCost,
  };
}
