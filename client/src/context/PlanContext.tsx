import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { PLAN_POLICIES, type PlanKey, type PlanPolicy } from '../config/plans';

interface PlanContextValue {
  userPlan: PlanKey;
  setUserPlan: (plan: PlanKey) => void;
  planPolicy: PlanPolicy;
  isFreePlan: boolean;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
}

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [userPlan, setUserPlan] = useState<PlanKey>('free_trial');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const planPolicy = useMemo(
    () => PLAN_POLICIES[userPlan] || PLAN_POLICIES.free_trial,
    [userPlan]
  );

  const value = useMemo(
    () => ({
      userPlan,
      setUserPlan,
      planPolicy,
      isFreePlan: userPlan === 'free_trial',
      isUpgradeModalOpen,
      openUpgradeModal: () => setIsUpgradeModalOpen(true),
      closeUpgradeModal: () => setIsUpgradeModalOpen(false)
    }),
    [userPlan, planPolicy, isUpgradeModalOpen]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
