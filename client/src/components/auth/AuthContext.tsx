import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  credits: number;
  plan: 'lite' | 'pro' | 'unlimited';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  setUserSession: (user: UserProfile) => void;
  logout: () => void;
  deductCredit: (amount?: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'cempa_user_session';
// Ajustado al puerto 3030 donde corre tu servidor de Express
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3030/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Permite establecer directamente la sesión si el formulario (ej. AuthModal) hace la llamada fetch
  const setUserSession = (userData: UserProfile) => {
    setUser(userData);
  };

  // 1. REGISTRO TRADICIONAL
  const register = async (email: string, password: string, confirmPassword: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar el usuario');
    }

    const loggedUser: UserProfile = {
      name: data.user.name,
      email: data.user.email,
      credits: data.user.credits,
      plan: data.user.plan,
    };

    setUser(loggedUser);
  };

  // 2. LOGIN TRADICIONAL
  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Credenciales inválidas');
    }

    const loggedUser: UserProfile = {
      name: data.user.name,
      email: data.user.email,
      credits: data.user.credits,
      plan: data.user.plan,
    };

    setUser(loggedUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const deductCredit = async (amount = 1): Promise<boolean> => {
    if (!user || user.credits < amount) return false;

    try {
      const response = await fetch(`${API_URL}/user/deduct-credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, amount }),
      });

      if (!response.ok) {
        console.error('No se pudo descontar el crédito en el servidor');
        return false;
      }

      setUser((prev) => (prev ? { ...prev, credits: prev.credits - amount } : null));
      return true;
    } catch (error) {
      console.error('Error de red al descontar crédito:', error);
      // Fallback local
      setUser((prev) => (prev ? { ...prev, credits: prev.credits - amount } : null));
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        setUserSession,
        logout,
        deductCredit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
