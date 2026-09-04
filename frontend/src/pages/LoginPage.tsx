import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Clipboard, ExternalLink, Landmark, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GOOGLE_SCRIPT_LOAD_TIMEOUT_MS = 10000;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string | number | boolean>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function isLinkedInInAppBrowser(userAgent: string) {
  return /linkedin|linkedinapp|librowser/i.test(userAgent);
}

export function LoginPage() {
  const [params] = useSearchParams();
  const [error, setError] = useState('');
  const [googleUnavailable, setGoogleUnavailable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const { loginWithGoogle } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const siteUrl = window.location.origin;
  const isIosLinkedInBrowser = /iP(hone|ad|od)/i.test(navigator.userAgent) && isLinkedInInAppBrowser(navigator.userAgent);

  useEffect(() => {
    const message = params.get('error');
    if (message) setError(message);
  }, [params]);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    let cancelled = false;
    let googleLoadTimer = 0;
    let layoutTimer = 0;
    let lastButtonWidth = 0;
    const clientId = googleClientId;

    function showBrowserFallback() {
      if (cancelled) return;
      setGoogleUnavailable(true);
      setError(
        isIosLinkedInBrowser
          ? 'LinkedIn on iPhone blocked Google sign-in. Copy this link and open it in Safari or Chrome.'
          : 'Unable to load Google sign-in. Open this site in your browser and try again.',
      );
    }

    async function handleGoogleCredential(idToken: string) {
      setSubmitting(true);
      setError('');
      try {
        await loginWithGoogle(idToken);
      } catch (exception) {
        let message = 'Unable to sign in with Google. Please try again.';
        if (axios.isAxiosError(exception)) {
          if (typeof exception.response?.data?.message === 'string') {
            message = exception.response.data.message;
          } else if (exception.code === 'ECONNABORTED') {
            message = 'Google sign-in is taking too long. Please try again.';
          } else if (exception.message) {
            message = `Google sign-in failed: ${exception.message}`;
          }
        } else if (exception instanceof Error && exception.message) {
          message = messageFromGoogleError(exception.message);
        }
        setError(message);
      } finally {
        setSubmitting(false);
      }
    }

    function getGoogleButtonWidth() {
      if (!googleButtonRef.current) return 240;
      const width = googleButtonRef.current.getBoundingClientRect().width;
      return Math.min(400, Math.max(240, Math.floor(width)));
    }

    function renderGoogleButton() {
      if (cancelled || !window.google || !googleButtonRef.current) return;
      window.clearTimeout(googleLoadTimer);
      setGoogleUnavailable(false);
      setError('');
      const buttonWidth = getGoogleButtonWidth();
      if (buttonWidth === lastButtonWidth && googleButtonRef.current.childElementCount > 0) return;
      lastButtonWidth = buttonWidth;
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) void handleGoogleCredential(response.credential);
          else setError('Google did not return a sign-in token. Please try again.');
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: buttonWidth,
      });
    }

    function renderGoogleButtonAfterLayout() {
      window.requestAnimationFrame(renderGoogleButton);
      window.clearTimeout(layoutTimer);
      layoutTimer = window.setTimeout(renderGoogleButton, 150);
    }

    const buttonResizeObserver = new ResizeObserver(renderGoogleButtonAfterLayout);
    buttonResizeObserver.observe(googleButtonRef.current);

    if (isIosLinkedInBrowser) {
      showBrowserFallback();
    }

    if (window.google) {
      renderGoogleButtonAfterLayout();
      window.addEventListener('resize', renderGoogleButtonAfterLayout);
      return () => {
        cancelled = true;
        window.clearTimeout(googleLoadTimer);
        window.clearTimeout(layoutTimer);
        buttonResizeObserver.disconnect();
        window.removeEventListener('resize', renderGoogleButtonAfterLayout);
      };
    }

    googleLoadTimer = window.setTimeout(showBrowserFallback, GOOGLE_SCRIPT_LOAD_TIMEOUT_MS);
    const existingScript = document.querySelector<HTMLScriptElement>("script[src='https://accounts.google.com/gsi/client']");
    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButtonAfterLayout, { once: true });
      existingScript.addEventListener('error', showBrowserFallback, { once: true });
      window.addEventListener('resize', renderGoogleButtonAfterLayout);
      return () => {
        cancelled = true;
        window.clearTimeout(googleLoadTimer);
        window.clearTimeout(layoutTimer);
        buttonResizeObserver.disconnect();
        existingScript.removeEventListener('load', renderGoogleButtonAfterLayout);
        existingScript.removeEventListener('error', showBrowserFallback);
        window.removeEventListener('resize', renderGoogleButtonAfterLayout);
      };
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', renderGoogleButtonAfterLayout, { once: true });
    script.addEventListener('error', showBrowserFallback, { once: true });
    document.head.appendChild(script);
    window.addEventListener('resize', renderGoogleButtonAfterLayout);

    return () => {
      cancelled = true;
      window.clearTimeout(googleLoadTimer);
      window.clearTimeout(layoutTimer);
      buttonResizeObserver.disconnect();
      script.removeEventListener('load', renderGoogleButtonAfterLayout);
      script.removeEventListener('error', showBrowserFallback);
      window.removeEventListener('resize', renderGoogleButtonAfterLayout);
    };
  }, [googleClientId, isIosLinkedInBrowser, loginWithGoogle]);

  async function copySiteLink() {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setError('Link copied. Open it in Safari or Chrome and sign in again.');
    } catch {
      setError(`Open this link in Safari or Chrome: ${siteUrl}`);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-8 text-slate-100">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid w-full max-w-5xl overflow-hidden rounded-[10px] border border-white/10 bg-white/[0.045] shadow-glow backdrop-blur-xl md:min-h-[640px] md:grid-cols-[360px_minmax(0,1fr)]"
      >
        <div
          className="relative grid min-h-[360px] content-between overflow-hidden bg-slate-900 p-8 text-white md:min-h-full"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(2, 6, 23, 0.18), rgba(2, 6, 23, 0.82)), url("https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80")',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="relative z-10 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-white/15 backdrop-blur"><Landmark size={19} /></span>
            <div>
              <h1 className="text-base font-semibold">AI Banking Assistant</h1>
              <p className="text-xs text-white/70">Fintech workspace</p>
            </div>
          </div>
          <div className="relative z-10 max-w-[280px]">
            <p className="text-2xl font-semibold leading-tight">"AI-powered banking insights for faster service conversations."</p>
            <div className="mt-5 border-l-2 border-white/60 pl-4">
              <p className="text-sm font-semibold">Transaction analytics</p>
              <p className="text-xs text-white/70">Savings coach and secure Gmail access</p>
            </div>
          </div>
        </div>

        <section className="grid content-center bg-[#111827] px-6 py-10 sm:px-12 lg:px-20">
          <div className="mx-auto w-full max-w-[430px]">
            <div className="mb-8 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-blue-500/15 text-[#60a5fa]"><ShieldCheck size={24} /></span>
              <h2 className="mt-5 text-2xl font-bold text-white">Welcome Back</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Continue with Gmail to access the AI banking dashboard, analytics, and savings coach.</p>
            </div>

            <div className="min-h-[44px] w-full overflow-hidden rounded-md border border-white/10 bg-white">
            {googleClientId ? (
              <div ref={googleButtonRef} className="w-full" aria-label="Continue with Google" />
            ) : (
              <p className="px-4 py-3 text-center text-sm text-slate-700">Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.</p>
            )}
            </div>

            {googleUnavailable && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <a className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-white/15" href={siteUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={17} />
                  Open site
                </a>
                <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-white/15" type="button" onClick={copySiteLink}>
                  <Clipboard size={17} />
                  Copy link
                </button>
              </div>
            )}
            {submitting && <p className="mt-4 text-center text-sm text-slate-300">Please wait...</p>}
            {error && <p className="mt-5 rounded-md border border-red-300/30 bg-red-500/10 p-3 text-sm font-medium text-red-100">{error}</p>}
          </div>
        </section>
      </motion.section>
    </main>
  );
}

function messageFromGoogleError(message: string) {
  if (/origin|client/i.test(message)) {
    return 'Google sign-in is blocked by OAuth client configuration. Add this site URL to the Google OAuth client Authorized JavaScript origins.';
  }
  return message;
}
