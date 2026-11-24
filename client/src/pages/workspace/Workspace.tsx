import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslations';
import UpgrateModal from '../../components/upgrate-modal/UpgrateModal';
import StudioLiteWorkspaceWizard from '../../components/wizard/StudioLiteWorkspaceWizard';
import RouteErrorPage from '../route-error/RouteErrorPage';
import {
  evaluateCreditGate,
  getPlanWizardPolicy,
  normalizePlanTier,
} from '../../components/wizard/wizardPlanConfig';
import {
  clearWizardStorage,
  type PlanTier,
  type StudioLiteDraft,
} from '../../components/wizard/wizardStorage';
import type { AppRouteId } from '../../navigation/appRoutes';
import type { CompletedGenerationResult } from '../dashboard/Dashboard';
import styles from './Workspace.module.css';

interface WorkspaceProps {
  activeRoute: AppRouteId;
  initialPrompt?: string;
  onGoToStudioLite: () => void;
  onGoToDashboard: () => void;
  onGoToLanding: () => void;
  onRequireAuthFromWizard?: (draft: StudioLiteDraft) => void;
  onCreditsChange?: (credits: number) => void;
}

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || 'http://localhost:3030';

export default function Workspace({
  activeRoute,
  initialPrompt = '',
  onGoToStudioLite,
  onGoToDashboard,
  onGoToLanding,
  onRequireAuthFromWizard,
  onCreditsChange,
}: WorkspaceProps) {
  const {
    user,
    isAuthenticated,
    planTier,
    setPlanTier,
    setSelectedPlanForAuth,
  } = useAuth();
  const { language } = useTranslation();
  const isEn = language === 'en';

  const normalizedPlan = normalizePlanTier(planTier);
  const planPolicy = getPlanWizardPolicy(normalizedPlan);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(
    typeof (user as { credits?: number } | null)?.credits === 'number'
      ? (user as { credits?: number }).credits!
      : planPolicy.initialCredits
  );
  const [creditNotice, setCreditNotice] = useState<{
    type: 'info' | 'warning';
    text: string;
  } | null>(null);

  const syncCredits = useCallback(
    (nextCredits: number) => {
      const safeCredits = Math.max(0, nextCredits);
      setCredits(safeCredits);
      onCreditsChange?.(safeCredits);
    },
    [onCreditsChange]
  );

  useEffect(() => {
    const userCredits = (user as { credits?: number } | null)?.credits;
    if (typeof userCredits === 'number') {
      syncCredits(userCredits);
    } else if (!isAuthenticated && normalizedPlan === 'free_trial') {
      syncCredits(planPolicy.initialCredits);
    }
  }, [
    isAuthenticated,
    normalizedPlan,
    planPolicy.initialCredits,
    syncCredits,
    user,
  ]);

  const handleSelectPlanInModal = (plan: PlanTier) => {
    const nextTier = normalizePlanTier(plan);
    const nextPolicy = getPlanWizardPolicy(nextTier);
    setPlanTier(nextTier);
    setSelectedPlanForAuth(nextTier);
    if (nextTier === 'free_trial' && credits < nextPolicy.initialCredits) {
      syncCredits(nextPolicy.initialCredits);
    }
    setCreditNotice(null);
    setIsUpgradeModalOpen(false);
  };

  const handleWizardRequireAuth = (draft: StudioLiteDraft) => {
    if (onRequireAuthFromWizard) {
      onRequireAuthFromWizard(draft);
      return;
    }
    setIsUpgradeModalOpen(true);
  };

  const handleGenerationCompleted = async (
    result: CompletedGenerationResult
  ) => {
    const creditGate = evaluateCreditGate({
      rawPlan: normalizedPlan,
      credits,
    });

    if (!creditGate.canGenerate) {
      setCreditNotice({
        type: 'warning',
        text: isEn
          ? `Insufficient credits (${creditGate.remainingCredits}/${creditGate.requiredCredits} required). Upgrade your plan to unlock more videos.`
          : `Créditos insuficientes (${creditGate.remainingCredits}/${creditGate.requiredCredits} requeridos). Mejora tu plan para generar más videos.`,
      });
      setIsUpgradeModalOpen(true);
      return;
    }

    try {
      if (user?.email) {
        const res = await fetch(`${API_BASE_URL}/api/videos/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            userId:
              (user as { id?: string; _id?: string }).id ||
              (user as { id?: string; _id?: string })._id,
            title:
              result.title.trim().slice(0, 60) ||
              result.prompt.trim().slice(0, 60) ||
              (isEn ? 'Studio Lite Video' : 'Video Studio Lite'),
            mode: 'idea',
            aspectRatio: result.aspectRatio,
            parameters: {
              planTier: normalizedPlan,
              presetId: result.presetId,
              visualFormatId: result.styleFormatId,
              aspectRatio: result.aspectRatio,
              resolution: result.resolution,
              voice: result.voice,
              durationSec: result.durationSec,
              subtitlesEnabled: result.subtitlesEnabled ?? true,
              subtitleStyle:
                normalizedPlan === 'free_trial'
                  ? 'auto'
                  : result.subtitleStyle || 'auto',
            },
          }),
        });

        const data = await res.json();

        if (res.status === 403 && data?.needsUpgrade) {
          const remaining =
            typeof data.remainingCredits === 'number'
              ? data.remainingCredits
              : credits;
          syncCredits(remaining);
          setCreditNotice({
            type: 'warning',
            text: isEn
              ? `You have ${remaining} credits remaining. Upgrade your plan to generate another video.`
              : `Te quedan ${remaining} créditos. Mejora tu plan para generar otro video.`,
          });
          setIsUpgradeModalOpen(true);
          return;
        }

        if (res.ok && data.success) {
          const updatedCredits =
            typeof data.remainingCredits === 'number'
              ? data.remainingCredits
              : typeof result.creditsRemaining === 'number'
              ? result.creditsRemaining
              : Math.max(0, credits - creditGate.videoCreditCost);

          syncCredits(updatedCredits);
          clearWizardStorage();
          onGoToDashboard();
          return;
        }
      }

      const nextLocalCredits =
        typeof result.creditsRemaining === 'number'
          ? result.creditsRemaining
          : Math.max(0, credits - creditGate.videoCreditCost);
      syncCredits(nextLocalCredits);
      clearWizardStorage();
      onGoToDashboard();
    } catch (err) {
      console.error('Error saving video after generation:', err);
      onGoToDashboard();
    }
  };

  return (
    <div className={styles.workspacePage}>
      <main className={styles.workspaceContainer}>
        {creditNotice && (
          <div
            className={`${styles.noticeBanner} ${
              creditNotice.type === 'warning' ? styles.noticeWarning : ''
            }`}
            role="status"
          >
            <p className={styles.noticeText}>{creditNotice.text}</p>
            {creditNotice.type === 'warning' && (
              <button
                type="button"
                className={styles.noticeActionBtn}
                onClick={() => setIsUpgradeModalOpen(true)}
              >
                {isEn ? 'See Plans' : 'Ver Planes'}
              </button>
            )}
          </div>
        )}

        {activeRoute === 'studio-lite' ? (
          <StudioLiteWorkspaceWizard
            initialPrompt={initialPrompt}
            onRequireAuth={handleWizardRequireAuth}
            onGenerationCompleted={handleGenerationCompleted}
            onBackToDashboard={onGoToDashboard}
          />
        ) : (
          <RouteErrorPage
            routeId={activeRoute}
            isEn={isEn}
            onGoToStudio={onGoToStudioLite}
            onGoToLanding={onGoToLanding}
          />
        )}
      </main>

      <UpgrateModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSelectPlanAndAuth={handleSelectPlanInModal}
      />
    </div>
  );
}
