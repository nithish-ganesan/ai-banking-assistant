import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { UserProfile } from '../types';

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

declare global {
  interface Window {
    firebase?: {
      apps?: unknown[];
      initializeApp: (config: Record<string, string | undefined>) => unknown;
      auth: {
        GoogleAuthProvider: new () => unknown;
      } & (() => {
        signInWithPopup: (provider: unknown) => Promise<{
          user?: {
            uid: string;
            displayName: string | null;
            email: string | null;
            emailVerified: boolean;
            getIdToken: () => Promise<string>;
          } | null;
        }>;
        signOut: () => Promise<void>;
      });
    };
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Unable to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Unable to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

async function ensureFirebaseAuth() {
  if (!window.firebase?.auth) {
    await loadScript('/__/firebase/10.12.4/firebase-app-compat.js');
    await loadScript('/__/firebase/10.12.4/firebase-auth-compat.js');
  }

  if (!window.firebase) {
    throw new Error('Firebase Authentication is not available.');
  }

  if (!window.firebase.apps?.length) {
    try {
      await loadScript('/__/firebase/init.js');
    } catch {
      window.firebase.initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      });
    }
  }
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

  async function signInWithGoogle() {
    await ensureFirebaseAuth();
    const provider = new window.firebase!.auth.GoogleAuthProvider();
    const result = await window.firebase!.auth().signInWithPopup(provider);
    const firebaseUser = result.user;

    if (!firebaseUser?.email) {
      throw new Error('Google did not return an email address. Please try again.');
    }

    if (!firebaseUser.emailVerified) {
      throw new Error('Please use a verified Gmail account.');
    }

    const email = firebaseUser.email.toLowerCase();
    if (!email.endsWith('@gmail.com')) {
      throw new Error('Please continue with a Gmail account.');
    }

    const idToken = await firebaseUser.getIdToken();
    const profile: UserProfile = {
      id: Math.abs(stableId(firebaseUser.uid || email)),
      name: firebaseUser.displayName || email.split('@')[0],
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
    loginWithGoogle: signInWithGoogle,
    logout: () => {
      void window.firebase?.auth?.().signOut();
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
