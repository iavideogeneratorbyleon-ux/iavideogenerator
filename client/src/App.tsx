import { useTheme } from './context/ThemeContext';
import { useTranslation } from './hooks/useTranslations';
import LandingPage from './pages/landing-page/LandingPage';
import Footer from './components/footer/Footer';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useTranslation();

  const handleStartWizard = () => {
    console.log('Abrir flujo de creación / Studio Lite');
  };

  const handleFooterNavigate = (target: string) => {
    console.log("Navigate desde footer hasta", target)
  }

  const handleSelectPlan = (planId: string) => {
    console.log('Plan seleccionado:', planId);
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
        <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-primary)' }}>
          Cempai.ai
        </strong>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
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

      <LandingPage
        onStartWizard={handleStartWizard}
        onSelectPlan={handleSelectPlan}
      />
      <Footer onNavigate={handleFooterNavigate}/>
    </>
  );
}

export default App;
