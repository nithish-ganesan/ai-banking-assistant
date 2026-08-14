import { Bell, Moon, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const [fraudSafetyEnabled, setFraudSafetyEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <section className="panel max-w-3xl">
      <h2 className="panel-title">Settings</h2>
      <div className="mt-5 space-y-3">
        <Setting icon={<Moon size={18} />} label="Dark mode" enabled={isDark} onToggle={toggleTheme} />
        <Setting
          icon={<ShieldCheck size={18} />}
          label="Fraud safety mode"
          enabled={fraudSafetyEnabled}
          onToggle={() => setFraudSafetyEnabled((enabled) => !enabled)}
        />
        <Setting
          icon={<Bell size={18} />}
          label="Notification center"
          enabled={notificationsEnabled}
          onToggle={() => setNotificationsEnabled((enabled) => !enabled)}
        />
      </div>
    </section>
  );
}

function Setting({ icon, label, enabled, onToggle }: { icon: ReactNode; label: string; enabled: boolean; onToggle?: () => void }) {
  return (
    <button className="setting-row" type="button" onClick={onToggle} aria-pressed={enabled}>
      <div className="flex items-center gap-3 text-sm">{icon}{label}</div>
      <span className={`toggle ${enabled ? 'toggle-on' : ''}`}><span /></span>
    </button>
  );
}
