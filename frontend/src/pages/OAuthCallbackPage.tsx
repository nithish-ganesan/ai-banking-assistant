import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const [failed, setFailed] = useState(false);
  const { token, completeOAuthLogin } = useAuth();

  useEffect(() => {
    const oauthToken = params.get('token');
    if (!oauthToken) {
      setFailed(true);
      return;
    }

    completeOAuthLogin(oauthToken).catch(() => setFailed(true));
  }, [completeOAuthLogin, params]);

  if (token) return <Navigate to="/" replace />;
  if (failed) return <Navigate to="/login?error=Google%20login%20failed" replace />;

  return (
    <main className="grid min-h-screen place-items-center bg-ink text-slate-100">
      <LoaderCircle className="animate-spin" size={32} />
    </main>
  );
}
