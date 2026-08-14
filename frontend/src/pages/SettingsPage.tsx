import { Bell, Moon, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

export function SettingsPage() {
  return (
    <section className="panel max-w-3xl">
      <h2 className="panel-title">Settings</h2>
      <div className="mt-5 space-y-3">
        <Setting icon={<Moon size={18} />} label="Dark mode" enabled />
        <Setting icon={<ShieldCheck size={18} />} label="Fraud safety mode" enabled />
        <Setting icon={<Bell size={18} />} label="Notification center" enabled={false} />
      </div>
    </section>
  );
}

function Setting({ icon, label, enabled }: { icon: ReactNode; label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-3 text-sm">{icon}{label}</div>
      <span className={`toggle ${enabled ? 'toggle-on' : ''}`}><span /></span>
    </div>
  );
}
