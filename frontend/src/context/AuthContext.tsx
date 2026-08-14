import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { UserProfile } from '../types';

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
};

type GoogleIdTokenPayload = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return decodeURIComponent(
    Array.from(atob(padded))
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );
}

function decodeGoogleToken(idToken: string): GoogleIdTokenPayload {
  const payload = idToken.split('.')[1];
  if (!payload) throw new Error('Google did not return a valid sign-in token.');
  return JSON.parse(decodeBase64Url(payload)) as GoogleIdTokenPayload;
}

function stableId(value: string) {
  return Array.from(value).reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState(() => localStorage.getItem('ai-bank-token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('ai-bank-user');
    return raw ? JSON.parse(raw) : null;
  });

  async function loginWithGoogle(idToken: string) {
    const payload = decodeGoogleToken(idToken);
    const email = String(payload.email || '').trim().toLowerCase();
    const subject = String(payload.sub || '').trim();

    if (!email || !subject) throw new Error('Google did not return a complete account profile.');
    if (payload.email_verified !== true) throw new Error('Please use a verified Google account.');
    if (!email.endsWith('@gmail.com')) throw new Error('Please continue with a Gmail account.');

    const profile: UserProfile = {
      id: Math.abs(stableId(subject)),
      name: payload.name || email.split('@')[0],
      email,
      role: 'USER',
    };

    localStorage.setItem('ai-bank-token', idToken);
    localStorage.setItem('ai-bank-user', JSON.stringify(profile));
    setToken(idToken);
    setUser(profile);
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
