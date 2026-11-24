import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { type PlanTier } from '../components/wizard/wizardStorage';

export type AuthProviderType = 'email' | 'google';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  provider?: AuthProviderType;
}

interface StoredAuthSession {
  user: AuthUser | null;
  planTier: PlanTier;
  selectedPlanForAuth: PlanTier;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  planTier: PlanTier;
  selectedPlanForAuth: PlanTier;
  setSelectedPlanForAuth: (plan: PlanTier) => void;
  setPlanTier: (plan: PlanTier) => void;
  completeAuth: (userData: AuthUser, planOverride?: PlanTier) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'cempa_auth_session_v1';

const DEFAULT_AUTH_SESSION: StoredAuthSession = {
  user: null,
  planTier: 'free_trial',
  selectedPlanForAuth: 'free_trial',
};

function readStoredAuthSession(): StoredAuthSession {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_AUTH_SESSION;
    }

    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;
    return {
      user: parsed.user ?? null,
      planTier: parsed.planTier ?? 'free_trial',
      selectedPlanForAuth: parsed.selectedPlanForAuth ?? 'free_trial',
    };
  } catch {
    return DEFAULT_AUTH_SESSION;
  }
}

function writeStoredAuthSession(session: StoredAuthSession): void {
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignorar si el almacenamiento no está disponible
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const initialSession = useMemo(() => readStoredAuthSession(), []);

  const [user, setUser] = useState<AuthUser | null>(initialSession.user);
  const [planTier, setPlanTierState] = useState<PlanTier>(
    initialSession.planTier
  );
  const [selectedPlanForAuth, setSelectedPlanForAuthState] = useState<PlanTier>(
    initialSession.selectedPlanForAuth
  );

  useEffect(() => {
    writeStoredAuthSession({
      user,
      planTier,
      selectedPlanForAuth,
    });
  }, [user, planTier, selectedPlanForAuth]);

  const setSelectedPlanForAuth = useCallback((plan: PlanTier) => {
    setSelectedPlanForAuthState(plan);
  }, []);

  const setPlanTier = useCallback((plan: PlanTier) => {
    setPlanTierState(plan);
    setSelectedPlanForAuthState(plan);
  }, []);

  const completeAuth = useCallback(
    (userData: AuthUser, planOverride?: PlanTier) => {
      const resolvedPlan = planOverride ?? selectedPlanForAuth;
      setUser(userData);
      setPlanTierState(resolvedPlan);
      setSelectedPlanForAuthState(resolvedPlan);
    },
    [selectedPlanForAuth]
  );

  const logout = useCallback(() => {
    setUser(null);
    setPlanTierState('free_trial');
    setSelectedPlanForAuthState('free_trial');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      planTier,
      selectedPlanForAuth,
      setSelectedPlanForAuth,
      setPlanTier,
      completeAuth,
      logout,
    }),
    [
      user,
      planTier,
      selectedPlanForAuth,
      setSelectedPlanForAuth,
      setPlanTier,
      completeAuth,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export { AuthProvider, useAuth };
export default AuthContext;
