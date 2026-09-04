import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { api } from '../services/api';
import { UserProfile } from '../types';

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState(() => localStorage.getItem('ai-bank-token'));
  const [user, setUser] = useState<UserProfile | null>(() => readStoredUser());

  async function loginWithGoogle(idToken: string) {
    const { data } = await api.post<{ token: string; user: UserProfile }>('/auth/google', { idToken });
    localStorage.setItem('ai-bank-token', data.token);
    localStorage.setItem('ai-bank-user', JSON.stringify(data.user));
    sessionStorage.setItem('ai-bank-welcome-pending', 'true');
    setToken(data.token);
    setUser(data.user);
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loginWithGoogle,
    logout: () => {
      localStorage.removeItem('ai-bank-token');
      localStorage.removeItem('ai-bank-user');
      sessionStorage.removeItem('ai-bank-welcome-pending');
      setToken(null);
      setUser(null);
    },
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function readStoredUser() {
  const raw = localStorage.getItem('ai-bank-user');
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    if (typeof parsed.name === 'string' && typeof parsed.email === 'string' && typeof parsed.role === 'string') {
      return parsed as UserProfile;
    }
  } catch {
    localStorage.removeItem('ai-bank-user');
  }

  return null;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
