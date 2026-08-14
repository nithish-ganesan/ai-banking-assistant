import { PropsWithChildren } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bot, LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function AppShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  return (
    <div className={`app-shell ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <aside className="app-sidebar">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-ocean shadow-glow">
            <Bot size={23} />
          </span>
          <span>
            <span className="block text-base font-semibold">AI Banking</span>
            <span className="muted-text text-xs">Assistant Console</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-2">
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem to="/profile" icon={<UserRound size={18} />} label="Profile" />
          <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="app-header">
          <div>
            <p className="muted-text text-xs uppercase tracking-[0.18em]">FinTech Workspace</p>
            <h1 className="text-lg font-semibold">Banking Assistant</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="muted-text text-xs">{user?.role}</p>
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
        `nav-item ${isActive ? 'nav-item-active' : ''}`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
