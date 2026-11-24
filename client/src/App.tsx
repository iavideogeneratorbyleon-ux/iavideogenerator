import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/landing-page/LandingPage';
import Footer from './components/footer/Footer';
import Navbar, { type ProductMenuItem } from './components/navbar/Navbar';
import ProductDetailModal from './components/product-detail-modal/ProductDetailModal';
import Dashboard, {
  type WorkspaceSection,
} from './pages/dashboard/Dashboard';
import UpgrateModal from './components/upgrate-modal/UpgrateModal';
import AuthModal from './components/auth/AuthModal';
import { getPlanWizardPolicy } from './components/wizard/wizardPlanConfig';
import {
  loadWizardState,
  saveWizardState,
  type PlanTier,
  type StudioLiteDraft,
} from './components/wizard/wizardStorage';

function normalizePlanTier(planId: string): PlanTier {
  if (planId === 'pay_per_video' || planId === 'pay-per-video') {
    return 'pay_per_video';
  }
  if (planId === 'pro') return 'pro';
  if (planId === 'unlimited') return 'unlimited';
  return 'free_trial';
}

function App() {
  const {
    user,
    isAuthenticated,
    planTier,
    selectedPlanForAuth,
    setSelectedPlanForAuth,
    logout,
  } = useAuth();

  const [activeView, setActiveView] = useState<'landing' | 'workspace'>(
    'landing'
  );
  const [workspaceSection, setWorkspaceSection] =
    useState<WorkspaceSection>('studio-lite');
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>(
    'signup'
  );
  const [selectedProduct, setSelectedProduct] = useState<ProductMenuItem | null>(
    null
  );

  const initialPolicy = getPlanWizardPolicy(planTier);
  const [credits, setCredits] = useState<number>(
    typeof (user as { credits?: number } | null)?.credits === 'number'
      ? (user as { credits?: number }).credits!
      : initialPolicy.initialCredits
  );

  useEffect(() => {
    const userCredits = (user as { credits?: number } | null)?.credits;
    if (typeof userCredits === 'number') {
      setCredits(userCredits);
    } else if (!isAuthenticated && normalizePlanTier(planTier) === 'free_trial') {
      setCredits(getPlanWizardPolicy('free_trial').initialCredits);
    }
  }, [isAuthenticated, planTier, user]);

  useEffect(() => {
    const handleCreditsEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ credits?: number }>;
      if (typeof customEvent.detail?.credits === 'number') {
        setCredits(customEvent.detail.credits);
      }
    };
    window.addEventListener('cempa:credits-updated', handleCreditsEvent);
    return () =>
      window.removeEventListener('cempa:credits-updated', handleCreditsEvent);
  }, []);

  // Si el usuario completa el login/registro por email o Google, lo llevamos al Workspace
  useEffect(() => {
    if (isAuthenticated && authModalOpen) {
      setAuthModalOpen(false);
      setActiveView('workspace');
      setWorkspaceSection('studio-lite');
    }
  }, [isAuthenticated, authModalOpen]);

  const handleStartWizard = (promptText?: string) => {
    if (typeof promptText === 'string') {
      setInitialPrompt(promptText);
      const current = loadWizardState(promptText);
      saveWizardState({
        ...current,
        draft: {
          ...current.draft,
          prompt: promptText,
        },
      });
    }
    setWorkspaceSection('studio-lite');
    setActiveView('workspace');
  };

  const handleSelectPlanFromLanding = (planId: string) => {
    const normalized = normalizePlanTier(planId);
    setSelectedPlanForAuth(normalized);
    setUpgradeModalOpen(true);
  };

  const handleRequireAuthFromWizard = (draft: StudioLiteDraft) => {
    const current = loadWizardState();
    saveWizardState({
      ...current,
      draft,
      pendingGenerateAfterAuth: true,
    });
    setUpgradeModalOpen(true);
  };

  const handleSelectPlanAndContinueToAuth = (plan: PlanTier) => {
    setSelectedPlanForAuth(plan);
    setUpgradeModalOpen(false);
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setAuthModalOpen(false);
    setActiveView('workspace');
    setWorkspaceSection('studio-lite');
  };

  const handleNavbarSection = (section: 'products' | 'plans' | 'pricing') => {
    if (section === 'plans' || section === 'pricing') {
      setUpgradeModalOpen(true);
      return;
    }

    if (activeView !== 'landing') {
      setActiveView('landing');
      window.setTimeout(() => {
        const el =
          document.getElementById('products') ||
          document.getElementById('features');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }

    const el =
      document.getElementById('products') || document.getElementById('features');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGoToProductSection = (product: ProductMenuItem) => {
    setSelectedProduct(null);

    if (product.id === 'studio-lite') {
      setWorkspaceSection('studio-lite');
      setActiveView('workspace');
      return;
    }

    if (product.id === 'text-to-speech') {
      setWorkspaceSection('text-to-speech');
      setActiveView('workspace');
      return;
    }

    setWorkspaceSection('studio-lite');
    setActiveView('workspace');
  };

  const handleFooterNavigate = (target: string) => {
    if (target === 'studio-lite' || target === 'wizard') {
      setWorkspaceSection('studio-lite');
      setActiveView('workspace');
      return;
    }
    if (target === 'dashboard') {
      setWorkspaceSection('dashboard');
      setActiveView('workspace');
      return;
    }
    if (target === 'text-to-speech') {
      setWorkspaceSection('text-to-speech');
      setActiveView('workspace');
      return;
    }
    if (target === 'plans' || target === 'pricing') {
      setUpgradeModalOpen(true);
      return;
    }

    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navbar
        activeView={activeView}
        credits={credits}
        onSelectBrand={() => setActiveView('landing')}
        onToggleView={() =>
          setActiveView((prev) =>
            prev === 'landing' ? 'workspace' : 'landing'
          )
        }
        onNavigateSection={handleNavbarSection}
        onSelectProduct={(product) => setSelectedProduct(product)}
        onOpenLogin={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
        onOpenSignup={() => {
          setAuthModalMode('signup');
          setAuthModalOpen(true);
        }}
        onOpenPlansModal={() => setUpgradeModalOpen(true)}
        onSignOut={logout}
      />

      {activeView === 'landing' ? (
        <LandingPage
          onStartWizard={handleStartWizard}
          onSelectPlan={handleSelectPlanFromLanding}
        />
      ) : (
        <Dashboard
          initialSection={workspaceSection}
          initialPrompt={initialPrompt}
          onRequireAuthFromWizard={handleRequireAuthFromWizard}
          onBackToLanding={() => setActiveView('landing')}
        />
      )}

      <Footer onNavigate={handleFooterNavigate} />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onGoToSection={handleGoToProductSection}
      />

      <UpgrateModal
        isOpen={upgradeModalOpen}
        initialPlan={selectedPlanForAuth || planTier}
        onClose={() => setUpgradeModalOpen(false)}
        onSelectPlanAndAuth={handleSelectPlanAndContinueToAuth}
      />

      <AuthModal
        isOpen={authModalOpen}
        mode={authModalMode}
        selectedPlan={selectedPlanForAuth}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default App;
