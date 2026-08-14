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
  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('ai-bank-user');
    return raw ? JSON.parse(raw) : null;
  });

  async function loginWithGoogle(idToken: string) {
    const { data } = await api.post<{ token: string; user: UserProfile }>('/api/auth/google', { idToken });
    localStorage.setItem('ai-bank-token', data.token);
    localStorage.setItem('ai-bank-user', JSON.stringify(data.user));
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
      setToken(null);
      setUser(null);
    },
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
