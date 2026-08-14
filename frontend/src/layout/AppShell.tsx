import { PropsWithChildren } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bot, LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AppShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-white/[0.04] px-5 py-6 backdrop-blur-xl lg:block">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-ocean shadow-glow">
            <Bot size={23} />
          </span>
          <span>
            <span className="block text-base font-semibold">AI Banking</span>
            <span className="text-xs text-slate-400">Assistant Console</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-2">
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem to="/profile" icon={<UserRound size={18} />} label="Profile" />
          <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-ink/82 px-4 backdrop-blur-xl sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">FinTech Workspace</p>
            <h1 className="text-lg font-semibold">Banking Assistant</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
            <button className="icon-button" onClick={logout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
          isActive ? 'bg-white/12 text-white' : 'text-slate-400 hover:bg-white/8 hover:text-white'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
