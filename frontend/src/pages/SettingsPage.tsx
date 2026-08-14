import { Bell, Moon, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';

export function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <section className="panel max-w-3xl">
      <h2 className="panel-title">Settings</h2>
      <div className="mt-5 space-y-3">
        <Setting icon={<Moon size={18} />} label="Dark mode" enabled={isDark} onToggle={toggleTheme} />
        <Setting icon={<ShieldCheck size={18} />} label="Fraud safety mode" enabled />
        <Setting icon={<Bell size={18} />} label="Notification center" enabled={false} />
      </div>
    </section>
  );
}

function Setting({ icon, label, enabled, onToggle }: { icon: ReactNode; label: string; enabled: boolean; onToggle?: () => void }) {
  return (
    <button className="setting-row" type="button" onClick={onToggle} disabled={!onToggle}>
      <div className="flex items-center gap-3 text-sm">{icon}{label}</div>
      <span className={`toggle ${enabled ? 'toggle-on' : ''}`}><span /></span>
    </button>
  );
}
