import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string | number | boolean>) => void;
        };
      };
    };
  }
}

export function LoginPage() {
  const [params] = useSearchParams();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const { loginWithGoogle } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    const message = params.get('error');
    if (message) setError(message);
  }, [params]);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    let cancelled = false;
    const clientId = googleClientId;

    function renderGoogleButton() {
      if (cancelled || !window.google || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential) {
            setError('Google did not return a sign-in token. Please try again.');
            return;
          }
          setError('');
          try {
            await loginWithGoogle(response.credential);
          } catch {
            setError('Gmail sign-in failed. Check the configured Google client id.');
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: Math.min(400, Math.max(240, Math.floor(googleButtonRef.current.getBoundingClientRect().width || 320))),
      });
    }

    if (window.google) {
      renderGoogleButton();
      return () => { cancelled = true; };
    }

    const existingScript = document.querySelector<HTMLScriptElement>("script[src='https://accounts.google.com/gsi/client']");
    const script = existingScript ?? document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', renderGoogleButton, { once: true });
    script.addEventListener('error', () => setError('Unable to load Google sign-in. Please try again.'), { once: true });
    if (!existingScript) document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener('load', renderGoogleButton);
    };
  }, [googleClientId, loginWithGoogle]);

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 text-slate-100">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] shadow-glow backdrop-blur-xl md:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="relative min-h-[440px] bg-[radial-gradient(circle_at_30%_20%,rgba(110,231,183,0.22),transparent_35%),linear-gradient(135deg,#0f5fa8,#07111f_62%)] p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-white/15"><Bot /></span>
            <div>
              <h1 className="text-2xl font-semibold">AI Banking Assistant</h1>
              <p className="text-sm text-slate-200">Secure retail banking intelligence</p>
            </div>
          </div>
          <div className="mt-16 max-w-md">
            <p className="text-4xl font-semibold leading-tight">Premium banking dashboard with AI at the service desk.</p>
            <p className="mt-5 text-sm leading-6 text-slate-200">Use your Gmail account to access the static POC dashboard, savings coach, analytics, and banking assistant.</p>
          </div>
        </div>

        <section className="grid content-center p-8">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Gmail sign-in</p>
          <h2 className="mt-3 text-2xl font-semibold">Continue securely</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">This POC verifies your Gmail with Google and uses static dashboard data. No user profile is saved to a database.</p>
          {error && <p className="mt-5 rounded-lg border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
          <div className="mt-6 min-h-[44px] w-full overflow-hidden rounded-lg bg-white">
            {googleClientId ? (
              <div ref={googleButtonRef} className="w-full" aria-label="Continue with Google" />
            ) : (
              <p className="px-4 py-3 text-center text-sm text-slate-700">Set VITE_GOOGLE_CLIENT_ID to enable Gmail sign-in.</p>
            )}
          </div>
        </section>
      </motion.section>
    </main>
  );
}
