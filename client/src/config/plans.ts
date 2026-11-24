// client/src/config/plans.ts
export type PlanKey = 'free_trial' | 'pay_per_video' | 'pro' | 'unlimited';
export type ProductKey = 'studio_lite' | 'director_studio' | 'blueprints' | 'memories';

export interface PlanPolicy {
  key: PlanKey;
  allowProVoices: boolean;
  allowCustomOverrides: boolean;
  allowCustomScript: boolean;
  maxDurationSeconds: number;
  defaultDurationSeconds: number;
  sceneRange: string;
}

export const PLAN_POLICIES: Record<PlanKey, PlanPolicy> = {
  free_trial: {
    key: 'free_trial',
    allowProVoices: false,
    allowCustomOverrides: false,
    allowCustomScript: false,
    maxDurationSeconds: 30,
    defaultDurationSeconds: 28,
    sceneRange: '4 to 5'
  },
  pay_per_video: {
    key: 'pay_per_video',
    allowProVoices: true,
    allowCustomOverrides: false,
    allowCustomScript: true,
    maxDurationSeconds: 60,
    defaultDurationSeconds: 45,
    sceneRange: '6 to 8'
  },
  pro: {
    key: 'pro',
    allowProVoices: true,
    allowCustomOverrides: true,
    allowCustomScript: true,
    maxDurationSeconds: 70,
    defaultDurationSeconds: 50,
    sceneRange: '8 to 10'
  },
  unlimited: {
    key: 'unlimited',
    allowProVoices: true,
    allowCustomOverrides: true,
    allowCustomScript: true,
    maxDurationSeconds: 90,
    defaultDurationSeconds: 60,
    sceneRange: '8 to 12'
  }
};
