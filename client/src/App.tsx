import { useState } from 'react';
import LandingPage from './components/landing/LandingPage';
import WizardContainer from './components/wizard/WizardContainer';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'wizard'>('landing');

  return (
    <>
      {currentView === 'landing' ? (
        <LandingPage onStartWizard={() => setCurrentView('wizard')} />
      ) : (
        <WizardContainer />
      )}
    </>
  );
}