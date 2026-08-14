import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_EXPIRED_EVENT, api } from '../services/api';
import { UserProfile } from '../types';

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  completeOAuthLogin: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState(() => localStorage.getItem('ai-bank-token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('ai-bank-user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    function clearAuth() {
      setToken(null);
      setUser(null);
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, clearAuth);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, clearAuth);
  }, []);

  async function persistAuth(endpoint: '/api/auth/login' | '/api/auth/register' | '/api/auth/google', payload: unknown) {
    const { data } = await api.post(endpoint, payload);
    localStorage.setItem('ai-bank-token', data.token);
    localStorage.setItem('ai-bank-user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function completeOAuthLogin(oauthToken: string) {
    const { data } = await api.post('/api/auth/oauth/token', { token: oauthToken });
    localStorage.setItem('ai-bank-token', data.token);
    localStorage.setItem('ai-bank-user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    login: (email, password) => persistAuth('/api/auth/login', { email, password }),
    register: (name, email, password) => persistAuth('/api/auth/register', { name, email, password }),
    loginWithGoogle: (idToken) => persistAuth('/api/auth/google', { idToken }),
    completeOAuthLogin,
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
