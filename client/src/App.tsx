import { useEffect, useState } from 'react';
import { useTheme } from './context/ThemeContext';
import { useTranslation } from './hooks/useTranslations';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/landing-page/LandingPage';
import Footer from './components/footer/Footer';
import Dashboard, { type WorkspaceSection } from './components/dashboard/Dashboard';
import UpgrateModal from './components/upgrate-modal/UpgrateModal';
import AuthModal from './components/auth/AuthModal';
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
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useTranslation();
  const {
    isAuthenticated,
    planTier,
    selectedPlanForAuth,
    setSelectedPlanForAuth,
  } = useAuth();

  const [activeView, setActiveView] = useState<'landing' | 'workspace'>('landing');
  const [workspaceSection, setWorkspaceSection] =
    useState<WorkspaceSection>('studio-lite');
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

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
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setAuthModalOpen(false);
    setActiveView('workspace');
    setWorkspaceSection('studio-lite');
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
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--bg-prompt)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveView('landing')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.05rem',
            color: 'var(--brand-primary)',
          }}
        >
          Cempai.ai
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() =>
              setActiveView((prev) =>
                prev === 'landing' ? 'workspace' : 'landing'
              )
            }
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-accent)',
              backgroundColor: 'var(--bg-section-alt)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
            }}
          >
            {activeView === 'landing' ? 'Workspace' : 'Landing'}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-accent)',
              backgroundColor: 'var(--bg-section-alt)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
            }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          <button
            type="button"
            onClick={toggleLanguage}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-accent)',
              backgroundColor: 'var(--bg-section-alt)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
            }}
          >
            {language === 'en' ? 'ES' : 'EN'}
          </button>
        </div>
      </header>

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

      <UpgrateModal
        isOpen={upgradeModalOpen}
        initialPlan={selectedPlanForAuth || planTier}
        onClose={() => setUpgradeModalOpen(false)}
        onSelectPlanAndAuth={handleSelectPlanAndContinueToAuth}
      />

      <AuthModal
        isOpen={authModalOpen}
        mode="signup"
        selectedPlan={selectedPlanForAuth}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default App;
