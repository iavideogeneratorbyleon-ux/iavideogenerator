import { type ReactNode } from 'react';
import { LanguageProvider } from './LanguageContext';
import { AuthProvider } from './AuthContext';
import { PlanProvider } from './PlanContext';
import { StudioLiteProvider } from './StudioLiteContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <PlanProvider>
          <StudioLiteProvider>{children}</StudioLiteProvider>
        </PlanProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export * from './LanguageContext';
export * from './AuthContext';
export * from './PlanContext';
export * from './StudioLiteContext';
