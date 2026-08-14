import { UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();
  return (
    <section className="panel max-w-3xl">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-lg bg-ocean/80"><UserRound size={30} /></span>
        <div>
          <h2 className="text-2xl font-semibold">{user?.name}</h2>
          <p className="text-slate-400">{user?.email}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="result-row"><span>Role</span><strong>{user?.role}</strong></div>
        <div className="result-row"><span>Authentication</span><strong>JWT</strong></div>
      </div>
    </section>
  );
}
