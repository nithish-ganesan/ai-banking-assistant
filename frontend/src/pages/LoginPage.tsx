import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Chrome, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [params] = useSearchParams();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    const message = params.get('error');
    if (message) setError(message);
  }, [params]);

  async function handleGoogleLogin() {
    setSubmitting(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (exception) {
      const message = exception instanceof Error && exception.message
        ? exception.message
        : 'Unable to sign in with Google. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
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
          <p className="mt-3 text-sm leading-6 text-slate-400">This POC uses Firebase Authentication for real Google sign-in and keeps the dashboard data static.</p>
          {error && <p className="mt-5 rounded-lg border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
          <button
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Chrome size={18} />}
            Continue with Google
          </button>
        </section>
      </motion.section>
    </main>
  );
}
