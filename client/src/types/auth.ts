import { type PlanKey } from './common';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  plan: PlanKey;
  creditsRemaining?: number;
}
