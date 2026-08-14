import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Clipboard, ExternalLink } from 'lucide-react';
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
        const message = exception instanceof Error && exception.message
          ? messageFromGoogleError(exception.message)
          : 'Unable to sign in with Google. Please try again.';
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

    googleLoadTimer = window.setTimeout(showBrowserFallback, 3500);
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
          <p className="mt-3 text-sm leading-6 text-slate-400">This POC uses the same Google sign-in setup as NiSa and keeps the login session in the browser.</p>
          <div className="mt-6 min-h-[44px] w-full overflow-hidden rounded-lg bg-white">
            {googleClientId ? (
              <div ref={googleButtonRef} className="w-full" aria-label="Continue with Google" />
            ) : (
              <p className="px-4 py-3 text-center text-sm text-slate-700">Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.</p>
            )}
          </div>
          {googleUnavailable && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-white/15" href={siteUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={17} />
                Open site
              </a>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-white/15" type="button" onClick={copySiteLink}>
                <Clipboard size={17} />
                Copy link
              </button>
            </div>
          )}
          {submitting && <p className="mt-4 text-sm text-slate-300">Please wait...</p>}
          {error && <p className="mt-5 rounded-lg border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
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
