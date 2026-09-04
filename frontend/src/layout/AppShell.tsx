import { FormEvent, PropsWithChildren, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Bot, Calculator, CreditCard, Eraser, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { useCurrency } from '../hooks/useCurrency';
import type { ChatMessage } from '../types';
import userAvatar3d from '../assets/user-avatar-3d.png';
import logout3d from '../assets/logout-3d.png';
import navDashboard3d from '../assets/nav-dashboard-3d.png';
import navAiAssistant3d from '../assets/nav-ai-assistant-3d.png';
import navEmiCalculator3d from '../assets/nav-emi-calculator-3d.png';
import navCardRecommendation3d from '../assets/nav-card-recommendation-3d.png';
import navProfile3d from '../assets/nav-profile-3d.png';
import navSettings3d from '../assets/nav-settings-3d.png';
import brandNs3d from '../assets/brand-ns-3d.png';

export function AppShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [emiOpen, setEmiOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem('ai-bank-welcome-pending') === 'true') {
      setWelcomeOpen(true);
    }
  }, [user]);

  function closeWelcome() {
    sessionStorage.removeItem('ai-bank-welcome-pending');
    setWelcomeOpen(false);
  }

  return (
    <div className={`app-shell ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <aside className="app-sidebar">
        <Link to="/" className="flex items-center gap-3">
          <img className="brand-logo-3d" src={brandNs3d} alt="NS" />
          <span>
            <span className="block text-base font-semibold">AI Banking</span>
            <span className="muted-text text-xs">Assistant Console</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-2">
          <NavItem to="/" icon={navDashboard3d} label="Dashboard" />
          <button className="nav-item nav-action" type="button" onClick={() => setAssistantOpen(true)}>
            <NavIcon src={navAiAssistant3d} alt="" />
            AI Assistant
          </button>
          <button className="nav-item nav-action" type="button" onClick={() => setEmiOpen(true)}>
            <NavIcon src={navEmiCalculator3d} alt="" />
            EMI Calculator
          </button>
          <button className="nav-item nav-action" type="button" onClick={() => setCardOpen(true)}>
            <NavIcon src={navCardRecommendation3d} alt="" />
            Card Recommendation
          </button>
          <NavItem to="/settings" icon={navSettings3d} label="Settings" />
          <NavItem to="/profile" icon={navProfile3d} label="Profile" />
          <button className="nav-item nav-action nav-logout" type="button" onClick={logout}>
            <NavIcon src={logout3d} alt="" />
            Logout
          </button>
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="app-header">
          <div>
            <p className="muted-text text-xs uppercase tracking-[0.18em]">FinTech Workspace</p>
            <h1 className="text-lg font-semibold">Banking Assistant</h1>
          </div>
          <div className="account-widget" aria-label="Signed in user">
            <img className="account-avatar-3d" src={userAvatar3d} alt="" aria-hidden="true" />
            <div className="account-copy">
              <p>{user?.name ?? 'Banking User'}</p>
              <span>{user?.role ?? 'USER'}</span>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </main>
      {assistantOpen && <AssistantDialog onClose={() => setAssistantOpen(false)} />}
      {emiOpen && <EmiDialog onClose={() => setEmiOpen(false)} />}
      {cardOpen && <CardRecommendationDialog onClose={() => setCardOpen(false)} />}
      {welcomeOpen && user && <WelcomeDialog userName={user.name} onClose={closeWelcome} />}
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-item ${isActive ? 'nav-item-active' : ''}`
      }
    >
      <NavIcon src={icon} alt="" />
      {label}
    </NavLink>
  );
}

function NavIcon({ src, alt }: { src: string; alt: string }) {
  return <img className="nav-icon-3d" src={src} alt={alt} aria-hidden="true" />;
}

function WelcomeDialog({ userName, onClose }: { userName: string; onClose: () => void }) {
  const firstName = userName?.trim().split(/\s+/)[0] || 'there';

  return (
    <div className="welcome-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button welcome-close" type="button" onClick={onClose} title="Close welcome">
          <X size={18} />
        </button>
        <img className="welcome-avatar-3d" src={userAvatar3d} alt="" aria-hidden="true" />
        <span className="welcome-kicker">Welcome back</span>
        <h2 id="welcome-dialog-title">Hi {firstName}, your banking workspace is ready.</h2>
        <p>
          Glad to have you here. Your dashboard is prepared with transaction insights,
          savings signals, credit card tracking, and calm guidance whenever you need it.
        </p>
        <button className="primary-button" type="button" onClick={onClose}>
          Continue to Dashboard
        </button>
      </section>
    </div>
  );
}

function AssistantDialog({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('Why was Rs 2,500 debited yesterday?');
  const [loading, setLoading] = useState(false);
  const hasStarted = messages.length > 0;

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) return;
    const nextPrompt = prompt.trim();
    setMessages((current) => [...current, { role: 'user', content: nextPrompt }]);
    setPrompt('');
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: nextPrompt });
      setMessages((current) => [...current, { role: 'assistant', content: data.answer }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: 'I could not reach the assistant API. Please check the backend server.' }]);
    } finally {
      setLoading(false);
    }
  }

  function startAssistant() {
    setMessages([
      { role: 'assistant', content: 'Welcome. I can help with transactions, EMI planning, fraud safety, credit card expenses, and savings decisions.' },
    ]);
  }

  return (
    <div className="assistant-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="assistant-dialog" role="dialog" aria-modal="true" aria-labelledby="assistant-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="assistant-dialog-header">
          <div>
            <span><Sparkles size={18} /></span>
            <div>
              <h2 id="assistant-dialog-title">AI Chat Assistant</h2>
              <p>Fraud-safe banking guidance and dashboard insights</p>
            </div>
          </div>
          <div className="assistant-dialog-actions">
            {hasStarted && (
              <button className="icon-button" type="button" onClick={() => setMessages([])} title="Clear chat">
                <Eraser size={18} />
              </button>
            )}
            <button className="icon-button" type="button" onClick={onClose} title="Close assistant">
              <X size={18} />
            </button>
          </div>
        </header>

        {!hasStarted ? (
          <div className="assistant-welcome">
            <span><Bot size={34} /></span>
            <strong>Welcome to your banking assistant</strong>
            <p>Ask about a debit, credit card usage, EMI planning, savings, or suspicious messages. I will keep the guidance practical and safety-first.</p>
            <button className="primary-button" type="button" onClick={startAssistant}>
              <MessageCircle size={18} /> Start Chat
            </button>
          </div>
        ) : (
          <>
            <div className="chat-window assistant-chat-window">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role === 'user' ? 'chat-user' : 'chat-assistant'}`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ))}
              {loading && <div className="typing"><span /><span /><span /></div>}
            </div>
            <form onSubmit={sendMessage} className="assistant-chat-form">
              <input className="chat-input" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
              <button className="primary-button shrink-0" type="submit" disabled={loading}>
                <Send size={18} /> Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function EmiDialog({ onClose }: { onClose: () => void }) {
  const format = useCurrency();
  const [emi, setEmi] = useState({ loanAmount: 750000, annualInterestRate: 9.2, tenureMonths: 60 });
  const [emiResult, setEmiResult] = useState<{ monthlyEmi: number; totalInterest: number; totalPayable: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function calculateEmi(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/banking/emi', emi);
      setEmiResult(data);
    } catch {
      setEmiResult(null);
      setError('Unable to calculate EMI. Please check the backend server and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="assistant-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="assistant-dialog emi-dialog" role="dialog" aria-modal="true" aria-labelledby="emi-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="assistant-dialog-header">
          <div>
            <span><Calculator size={18} /></span>
            <div>
              <h2 id="emi-dialog-title">EMI Calculator</h2>
              <p>Estimate monthly repayment, total interest, and total payable</p>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose} title="Close EMI calculator">
            <X size={18} />
          </button>
        </header>

        <form className="emi-dialog-body" onSubmit={calculateEmi}>
          <div className="emi-input-grid">
            <NumberInput label="Loan Amount" value={emi.loanAmount} onChange={(loanAmount) => setEmi({ ...emi, loanAmount })} />
            <NumberInput label="Interest Rate" value={emi.annualInterestRate} onChange={(annualInterestRate) => setEmi({ ...emi, annualInterestRate })} />
            <NumberInput label="Tenure Months" value={emi.tenureMonths} onChange={(tenureMonths) => setEmi({ ...emi, tenureMonths })} />
          </div>
          <button className="primary-button" type="submit" disabled={loading}>
            <Calculator size={18} /> {loading ? 'Calculating...' : 'Calculate EMI'}
          </button>
        </form>

        {error && <p className="dialog-error">{error}</p>}
        {emiResult && (
          <div className="emi-result-grid">
            <Result label="Monthly EMI" value={format(emiResult.monthlyEmi)} />
            <Result label="Total Interest" value={format(emiResult.totalInterest)} />
            <Result label="Total Payable" value={format(emiResult.totalPayable)} />
          </div>
        )}
      </section>
    </div>
  );
}

function CardRecommendationDialog({ onClose }: { onClose: () => void }) {
  const format = useCurrency();
  const [card, setCard] = useState<{ cardName: string; reasons: string[]; cautions: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function recommendCard() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/banking/cards/recommend', {
        salary: 120000,
        spendingHabits: 'online shopping, dining, groceries',
        travelFrequency: 'monthly domestic travel',
        shoppingPreference: 'cashback and marketplace offers',
      });
      setCard(data);
    } catch {
      setCard(null);
      setError('Could not load a recommendation. Please log in again and retry.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="assistant-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="assistant-dialog card-dialog" role="dialog" aria-modal="true" aria-labelledby="card-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="assistant-dialog-header">
          <div>
            <span><CreditCard size={18} /></span>
            <div>
              <h2 id="card-dialog-title">Credit Card Recommendation</h2>
              <p>Based on salary, shopping, dining, and travel profile</p>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose} title="Close card recommendation">
            <X size={18} />
          </button>
        </header>

        <div className="card-dialog-body">
          <div className="card-profile-summary">
            <div><span>Salary</span><strong>{format(120000)}</strong></div>
            <div><span>Spends</span><strong>Shopping + Dining</strong></div>
            <div><span>Travel</span><strong>Monthly</strong></div>
          </div>
          <button className="primary-button" type="button" onClick={recommendCard} disabled={loading}>
            <CreditCard size={18} /> {loading ? 'Checking...' : 'Recommend Card'}
          </button>
        </div>

        {error && <p className="dialog-error">{error}</p>}
        {card && (
          <div className="card-recommendation-result">
            <strong>{card.cardName}</strong>
            <div>
              <span>Why it fits</span>
              <ul>{card.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
            </div>
            <div>
              <span>Before applying</span>
              <ul>{card.cautions.map((caution) => <li key={caution}>{caution}</li>)}</ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="field compact">
      <span>{label}</span>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return <div className="result-row"><span>{label}</span><strong>{value}</strong></div>;
}
