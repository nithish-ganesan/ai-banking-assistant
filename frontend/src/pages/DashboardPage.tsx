import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BellRing, CreditCard, Download, PiggyBank, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { TransactionInput } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import financialHealthChart from '../assets/financial-health-3d-chart.png';

const sampleTransactions: TransactionInput[] = [
  { date: '2026-08-01', description: 'Salary credit', category: 'Income', amount: 120000, type: 'credit' },
  { date: '2026-08-02', description: 'Rent payment', category: 'Housing', amount: 28000, type: 'debit' },
  { date: '2026-08-04', description: 'Grocery store', category: 'Groceries', amount: 7200, type: 'debit' },
  { date: '2026-08-05', description: 'UPI dining', category: 'Dining', amount: 3600, type: 'debit' },
  { date: '2026-08-06', description: 'Mutual fund SIP', category: 'Investments', amount: 15000, type: 'debit' },
  { date: '2026-07-01', description: 'Salary credit', category: 'Income', amount: 118000, type: 'credit' },
  { date: '2026-07-02', description: 'Rent payment', category: 'Housing', amount: 28000, type: 'debit' },
  { date: '2026-07-04', description: 'Supermarket', category: 'Groceries', amount: 8200, type: 'debit' },
  { date: '2026-07-09', description: 'Weekend dining', category: 'Dining', amount: 5400, type: 'debit' },
  { date: '2026-07-15', description: 'SIP investment', category: 'Investments', amount: 14000, type: 'debit' },
  { date: '2026-07-20', description: 'Flight booking', category: 'Travel', amount: 12500, type: 'debit' },
  { date: '2026-06-01', description: 'Salary credit', category: 'Income', amount: 116000, type: 'credit' },
  { date: '2026-06-02', description: 'Rent payment', category: 'Housing', amount: 27500, type: 'debit' },
  { date: '2026-06-05', description: 'Groceries', category: 'Groceries', amount: 7600, type: 'debit' },
  { date: '2026-06-12', description: 'Dining and coffee', category: 'Dining', amount: 4300, type: 'debit' },
  { date: '2026-06-16', description: 'SIP investment', category: 'Investments', amount: 13000, type: 'debit' },
  { date: '2026-06-23', description: 'Utility bills', category: 'Utilities', amount: 6200, type: 'debit' },
  { date: '2026-05-01', description: 'Salary credit', category: 'Income', amount: 112000, type: 'credit' },
  { date: '2026-05-02', description: 'Rent payment', category: 'Housing', amount: 27500, type: 'debit' },
  { date: '2026-05-03', description: 'Grocery store', category: 'Groceries', amount: 6900, type: 'debit' },
  { date: '2026-05-11', description: 'Family dinner', category: 'Dining', amount: 6100, type: 'debit' },
  { date: '2026-05-15', description: 'Mutual fund SIP', category: 'Investments', amount: 12000, type: 'debit' },
  { date: '2026-05-19', description: 'Shopping', category: 'Shopping', amount: 9800, type: 'debit' },
  { date: '2026-04-01', description: 'Salary credit', category: 'Income', amount: 110000, type: 'credit' },
  { date: '2026-04-02', description: 'Rent payment', category: 'Housing', amount: 27000, type: 'debit' },
  { date: '2026-04-05', description: 'Groceries', category: 'Groceries', amount: 7100, type: 'debit' },
  { date: '2026-04-08', description: 'Dining', category: 'Dining', amount: 3900, type: 'debit' },
  { date: '2026-04-15', description: 'SIP investment', category: 'Investments', amount: 10000, type: 'debit' },
  { date: '2026-04-22', description: 'Electricity and phone', category: 'Utilities', amount: 5400, type: 'debit' },
];

const chartColors = ['#60a5fa', '#6ee7b7', '#f7c948', '#f472b6', '#a78bfa'];
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const reductionRates: Record<string, number> = {
  dining: 0.25,
  shopping: 0.22,
  entertainment: 0.2,
  travel: 0.16,
  subscriptions: 0.15,
  groceries: 0.1,
  utilities: 0.08,
  housing: 0.04,
  investments: 0,
};

const creditCardLimit = 100000;
const creditCardExpenses = [
  { date: '2026-08-02', merchant: 'Amazon India', category: 'Shopping', amount: 18500, month: '2026-08' },
  { date: '2026-08-04', merchant: 'IndiGo', category: 'Travel', amount: 14200, month: '2026-08' },
  { date: '2026-08-06', merchant: 'Swiggy', category: 'Dining', amount: 4200, month: '2026-08' },
  { date: '2026-08-09', merchant: 'Croma', category: 'Electronics', amount: 22500, month: '2026-08' },
  { date: '2026-08-12', merchant: 'Netflix', category: 'Subscriptions', amount: 649, month: '2026-08' },
  { date: '2026-08-16', merchant: 'Fuel Station', category: 'Fuel', amount: 5200, month: '2026-08' },
  { date: '2026-07-03', merchant: 'BigBasket', category: 'Groceries', amount: 7600, month: '2026-07' },
  { date: '2026-07-07', merchant: 'Myntra', category: 'Shopping', amount: 9800, month: '2026-07' },
  { date: '2026-07-11', merchant: 'Zomato', category: 'Dining', amount: 3600, month: '2026-07' },
  { date: '2026-07-19', merchant: 'BookMyShow', category: 'Entertainment', amount: 2400, month: '2026-07' },
  { date: '2026-07-24', merchant: 'Fuel Station', category: 'Fuel', amount: 4800, month: '2026-07' },
];

export function DashboardPage() {
  const format = useCurrency();
  const [summary, setSummary] = useState<any>(null);
  const [coachSalary, setCoachSalary] = useState('120000');
  const [coachExpenses, setCoachExpenses] = useState('Rent 28000, groceries 7200, dining 3600, shopping 9000, subscriptions 1800, utilities 5500, SIP investment 15000');
  const [coachResult, setCoachResult] = useState<SavingsCoachResult | null>(null);
  const months = useMemo(() => Array.from(new Set(sampleTransactions.map((tx) => tx.date.slice(0, 7)))).sort().reverse(), []);
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const monthlySnapshots = useMemo(() => months.map((month) => {
    const transactions = sampleTransactions.filter((tx) => tx.date.startsWith(month));
    const income = transactions.filter((tx) => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions.filter((tx) => tx.type === 'debit').reduce((sum, tx) => sum + tx.amount, 0);
    return {
      month,
      label: monthFormatter.format(new Date(`${month}-01T00:00:00`)),
      transactions,
      income,
      expense,
      savings: income - expense,
    };
  }), [months]);

  const selectedSnapshot = monthlySnapshots.find((item) => item.month === selectedMonth) ?? monthlySnapshots[0];
  const previousSnapshot = monthlySnapshots[monthlySnapshots.findIndex((item) => item.month === selectedMonth) + 1] ?? null;
  const creditCardSnapshot = useMemo(() => createCreditCardSnapshot(selectedMonth), [selectedMonth]);
  const averages = useMemo(() => {
    const count = monthlySnapshots.length || 1;
    return {
      income: monthlySnapshots.reduce((sum, item) => sum + item.income, 0) / count,
      expense: monthlySnapshots.reduce((sum, item) => sum + item.expense, 0) / count,
      savings: monthlySnapshots.reduce((sum, item) => sum + item.savings, 0) / count,
    };
  }, [monthlySnapshots]);

  const expenseBreakdown = useMemo(() => {
    const categories = selectedSnapshot.transactions
      .filter((tx) => tx.type === 'debit')
      .reduce<Record<string, number>>((items, tx) => {
        items[tx.category] = (items[tx.category] ?? 0) + tx.amount;
        return items;
      }, {});

    return Object.entries(categories)
      .map(([category, amount], index) => ({
        category,
        amount,
        color: chartColors[index % chartColors.length],
        percentage: selectedSnapshot.expense ? Math.round((amount / selectedSnapshot.expense) * 100) : 0,
      }))
      .sort((first, second) => second.amount - first.amount);
  }, [selectedSnapshot]);

  async function summarizeTransactions() {
    const { data } = await api.post('/banking/transactions/summary', { transactions: selectedSnapshot.transactions });
    setSummary(data);
  }

  function analyzeSavings() {
    const salary = Number(coachSalary);
    if (!salary || !coachExpenses.trim()) {
      setCoachResult(null);
      return;
    }

    setCoachResult(createSavingsPlan(salary, coachExpenses));
  }

  function updateCoachSalary(value: string) {
    setCoachSalary(value);
    if (!value.trim() || !coachExpenses.trim()) {
      setCoachResult(null);
    }
  }

  function updateCoachExpenses(value: string) {
    setCoachExpenses(value);
    if (!value.trim() || !coachSalary.trim()) {
      setCoachResult(null);
    }
  }

  function downloadTransactionAnalyticsPdf() {
    downloadPdfReport(
      `${selectedSnapshot.label} Transaction Analytics`,
      transactionAnalyticsReportHtml(selectedSnapshot, previousSnapshot, averages, expenseBreakdown, format),
    );
  }

  function downloadSavingsCoachPdf() {
    if (!coachResult) return;
    downloadPdfReport('Savings Coach Report', savingsCoachReportHtml(coachResult, coachExpenses, format));
  }

  const incomeTargetProgress = Math.min(100, Math.round((selectedSnapshot.income / 120000) * 100));
  const savingsRate = selectedSnapshot.income ? Math.round((selectedSnapshot.savings / selectedSnapshot.income) * 100) : 0;
  const riskScore = Math.max(0, Math.min(100, 100 - Math.round((selectedSnapshot.expense / Math.max(selectedSnapshot.income, 1)) * 100)));

  return (
    <div className="space-y-6">
      <section className="metric-dashboard-grid">
        <Metric
          title="Income Monitor"
          label="Monthly Income"
          value={format(selectedSnapshot.income)}
          progress={incomeTargetProgress}
          tone="violet"
          primaryLabel="Target"
          dailyLabel="Month"
          dailyValue={selectedSnapshot.income}
          dailyMax={120000}
          monthlyLabel="Average"
          monthlyValue={averages.income}
          monthlyMax={120000}
          format={format}
        />
        <Metric
          title="Savings Monitor"
          label="Savings Rate"
          value={format(selectedSnapshot.savings)}
          progress={savingsRate}
          tone="cyan"
          primaryLabel="Saved"
          dailyLabel="Target"
          dailyValue={selectedSnapshot.savings}
          dailyMax={selectedSnapshot.income * 0.2}
          monthlyLabel="Income"
          monthlyValue={selectedSnapshot.savings}
          monthlyMax={selectedSnapshot.income}
          format={format}
        />
        <Metric
          title="Risk Monitor"
          label="Risk Watch"
          value="Low"
          progress={riskScore}
          tone="gold"
          primaryLabel="Safe"
          dailyLabel="Expenses"
          dailyValue={selectedSnapshot.expense}
          dailyMax={selectedSnapshot.income}
          monthlyLabel="Buffer"
          monthlyValue={selectedSnapshot.savings}
          monthlyMax={selectedSnapshot.income}
          format={format}
        />
      </section>

      <section className="dashboard-masonry">
        <SavingsCoachPanel
          salary={coachSalary}
          expenses={coachExpenses}
          result={coachResult}
          format={format}
          onSalaryChange={updateCoachSalary}
          onExpensesChange={updateCoachExpenses}
          onAnalyze={analyzeSavings}
          onDownload={downloadSavingsCoachPdf}
        />

        <CreditCardExpenseTracker data={creditCardSnapshot} format={format} />

        <TransactionAnalyticsPanel
          selectedMonth={selectedMonth}
          monthlySnapshots={monthlySnapshots}
          selectedSnapshot={selectedSnapshot}
          previousSnapshot={previousSnapshot}
          averages={averages}
          expenseBreakdown={expenseBreakdown}
          summary={summary}
          format={format}
          onMonthChange={(month) => { setSelectedMonth(month); setSummary(null); }}
          onDownload={downloadTransactionAnalyticsPdf}
          onSummarize={summarizeTransactions}
        />

        <FinancialHealthCard savings={selectedSnapshot.savings} expense={selectedSnapshot.expense} format={format} />
      </section>
    </div>
  );
}

function TransactionAnalyticsPanel({
  selectedMonth,
  monthlySnapshots,
  selectedSnapshot,
  previousSnapshot,
  averages,
  expenseBreakdown,
  summary,
  format,
  onMonthChange,
  onDownload,
  onSummarize,
}: {
  selectedMonth: string;
  monthlySnapshots: Array<{ month: string; label: string; transactions: TransactionInput[]; income: number; expense: number; savings: number }>;
  selectedSnapshot: { label: string; transactions: TransactionInput[]; income: number; expense: number; savings: number };
  previousSnapshot: { income: number; expense: number; savings: number } | null;
  averages: { income: number; expense: number; savings: number };
  expenseBreakdown: Array<{ category: string; amount: number; color: string; percentage: number }>;
  summary: any;
  format: (value: number) => string;
  onMonthChange: (month: string) => void;
  onDownload: () => void;
  onSummarize: () => void;
}) {
  return (
    <section className="panel dashboard-card card-analytics">
      <div className="flex flex-col justify-between gap-3">
        <div>
          <h2 className="panel-title">Transaction Analytics</h2>
          <p className="panel-subtitle">Monthly summary, category split, savings trend, and past-month averages</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <select className="month-select" value={selectedMonth} onChange={(event) => onMonthChange(event.target.value)}>
            {monthlySnapshots.map((item) => <option key={item.month} value={item.month}>{item.label}</option>)}
          </select>
          <button className="secondary-button" type="button" onClick={onDownload}><Download size={18} /> PDF</button>
          <button className="secondary-button" onClick={onSummarize}><Sparkles size={18} /> Summarize</button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <ComparisonCard label="Expenses" value={selectedSnapshot.expense} average={averages.expense} previous={previousSnapshot?.expense} format={format} lowerIsBetter />
        <ComparisonCard label="Savings" value={selectedSnapshot.savings} average={averages.savings} previous={previousSnapshot?.savings} format={format} />
        <ComparisonCard label="Income" value={selectedSnapshot.income} average={averages.income} previous={previousSnapshot?.income} format={format} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <ExpensePieChart items={expenseBreakdown} total={selectedSnapshot.expense} format={format} month={selectedSnapshot.label} />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr></thead>
            <tbody>
              {selectedSnapshot.transactions.map((tx) => (
                <tr key={`${tx.date}-${tx.description}`}>
                  <td>{tx.date}</td><td>{tx.description}</td><td>{tx.category}</td><td>{tx.type}</td><td>{format(tx.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {summary && (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Result label="Income" value={format(summary.income)} />
          <Result label="Expense" value={format(summary.expense)} />
          <Result label="Savings" value={format(summary.netSavings)} />
        </div>
      )}
    </section>
  );
}

function FinancialHealthCard({ savings, expense, format }: { savings: number; expense: number; format: (value: number) => string }) {
  const [selectedRange, setSelectedRange] = useState('1d');
  const [syncCount, setSyncCount] = useState(0);
  const bufferRatio = expense ? Math.round((savings / expense) * 100) : 0;

  return (
    <div className="panel dashboard-card finance-visual-card card-health balance-card">
      <div className="balance-chart-shell balance-image-shell" aria-label={`Account balance market dashboard with ${bufferRatio}% expense coverage`}>
        <img className="balance-chart-image" src={financialHealthChart} alt="" aria-hidden="true" />
        <div className="balance-topbar">
          <div className="balance-title">
            <span className="balance-icon">Rs</span>
            <span>Balance</span>
            <strong>{format(38154)}</strong>
            <em>INR</em>
          </div>
          <div className="balance-controls">
            <button className={selectedRange === '1d' ? 'active' : ''} type="button" onClick={() => setSelectedRange('1d')}>1D</button>
            <button type="button" onClick={() => setSyncCount((count) => count + 1)}>Sync{syncCount ? ` ${syncCount}` : ''}</button>
            <button className={selectedRange === '7w' ? 'active' : ''} type="button" onClick={() => setSelectedRange('7w')}>7 Days</button>
          </div>
        </div>
        <div className="balance-ranges" aria-label="Chart range">
          {['1s', '15m', '1h', '4h', '1d', '7w'].map((range) => (
            <button
              className={range === selectedRange ? 'active' : ''}
              type="button"
              key={range}
              onClick={() => setSelectedRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="balance-image-tooltip">
          <strong>{format(47664)}</strong>
          <span>8 Apr 2026</span>
        </div>
        <div className="balance-image-axis" aria-hidden="true">
          {['8:00AM', '9:00AM', '10:00AM', '11:00AM', '12:00PM', '01:00PM', '02:00PM'].map((label) => <span key={label}>{label}</span>)}
        </div>
      </div>
    </div>
  );
}

function LegacyFinancialHealthCard({ savings, expense, format }: { savings: number; expense: number; format: (value: number) => string }) {
  const [selectedRange, setSelectedRange] = useState('1d');
  const [syncCount, setSyncCount] = useState(0);
  const bufferRatio = expense ? Math.round((savings / expense) * 100) : 0;
  const balancePoints = [
    { label: '8:00AM', value: 28850 },
    { label: '8:30AM', value: 29600 },
    { label: '9:00AM', value: 28200 },
    { label: '9:30AM', value: 25750 },
    { label: '10:00AM', value: 29350 },
    { label: '10:30AM', value: 28100 },
    { label: '11:00AM', value: 34350 },
    { label: '11:30AM', value: 22400 },
    { label: '12:00PM', value: 31050 },
    { label: '12:30PM', value: 33100 },
    { label: '1:00PM', value: 47664 },
    { label: '1:30PM', value: 42050 },
    { label: '2:00PM', value: 49300 },
  ];
  const width = 1440;
  const height = 640;
  const left = 108;
  const right = 1372;
  const top = 72;
  const bottom = 514;
  const minValue = 18000;
  const maxValue = 50000;
  const xStep = (right - left) / (balancePoints.length - 1);
  const yFor = (value: number) => bottom - ((value - minValue) / (maxValue - minValue)) * (bottom - top);
  const linePoints = balancePoints.map((item, index) => `${left + index * xStep},${yFor(item.value)}`).join(' ');
  const areaPoints = `${left},${bottom} ${linePoints} ${right},${bottom}`;
  const candlePoints = balancePoints.map((item, index) => {
    const open = index === 0 ? item.value - 850 : balancePoints[index - 1].value;
    const close = item.value;
    const high = Math.min(maxValue, Math.max(open, close) + 1800 + (index % 3) * 480);
    const low = Math.max(minValue, Math.min(open, close) - 1500 - (index % 2) * 620);
    return { ...item, open, close, high, low, x: left + index * xStep };
  });
  const waveOnePoints = balancePoints.map((item, index) => {
    const drift = Math.sin(index * 0.92) * 4800 + Math.cos(index * 0.38) * 1900;
    return `${left + index * xStep},${yFor(Math.max(minValue, Math.min(maxValue, item.value + drift)))}`;
  }).join(' ');
  const waveTwoPoints = balancePoints.map((item, index) => {
    const drift = Math.cos(index * 0.72) * 4200 - Math.sin(index * 0.45) * 1400;
    return `${left + index * xStep},${yFor(Math.max(minValue, Math.min(maxValue, item.value + drift)))}`;
  }).join(' ');
  const activeIndex = 10;
  const activePoint = balancePoints[activeIndex];
  const activeX = left + activeIndex * xStep;
  const activeY = yFor(activePoint.value);

  return (
    <div className="panel dashboard-card finance-visual-card card-health balance-card">
      <div className="balance-chart-shell" aria-label={`Account balance line graph with ${bufferRatio}% expense coverage`}>
        <div className="balance-topbar">
          <div className="balance-title">
            <span className="balance-icon">₹</span>
            <span>Balance</span>
            <strong>{format(38154)}</strong>
            <em>INR</em>
          </div>
          <div className="balance-controls">
            <button className={selectedRange === '1d' ? 'active' : ''} type="button" onClick={() => setSelectedRange('1d')}>1D</button>
            <button type="button" onClick={() => setSyncCount((count) => count + 1)}>Sync{syncCount ? ` ${syncCount}` : ''}</button>
            <button className={selectedRange === '7w' ? 'active' : ''} type="button" onClick={() => setSelectedRange('7w')}>7 Days</button>
          </div>
        </div>
        <div className="balance-ranges" aria-label="Chart range">
          {['1s', '15m', '1h', '4h', '1d', '7w'].map((range) => (
            <button
              className={range === selectedRange ? 'active' : ''}
              type="button"
              key={range}
              onClick={() => setSelectedRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
        <svg className="balance-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Account balance line chart">
          <defs>
            <linearGradient id="balanceArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.36" />
              <stop offset="45%" stopColor="#2563eb" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="marketWaveOne" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.62" />
              <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.68" />
            </linearGradient>
            <linearGradient id="marketWaveTwo" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.52" />
              <stop offset="48%" stopColor="#bef264" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.62" />
            </linearGradient>
            <filter id="balanceGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="balanceDotGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="16" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="marketSoftGlow" x="-30%" y="-80%" width="160%" height="260%">
              <feGaussianBlur stdDeviation="11" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {[40000, 35000, 30000, 25000, 20000].map((value) => {
            const y = yFor(value);
            return (
              <g key={value}>
                <line className="balance-grid-line" x1={left} y1={y} x2={right} y2={y} />
                <text className="balance-axis-label" x="36" y={y + 8}>{`${value / 1000}k`}</text>
              </g>
            );
          })}
          {[0, 1, 2, 3, 4, 5].map((line) => {
            const x = left + line * ((right - left) / 5);
            return <line key={`v-${line}`} className="balance-grid-line balance-grid-vertical" x1={x} y1={top} x2={x} y2={bottom} />;
          })}
          <line className="balance-top-dash" x1={left} y1={activeY} x2={right} y2={activeY} />
          <polyline className="market-wave market-wave-blue" points={waveOnePoints} filter="url(#marketSoftGlow)" />
          <polyline className="market-wave market-wave-green" points={waveTwoPoints} filter="url(#marketSoftGlow)" />
          <g className="market-candles">
            {candlePoints.map((candle, index) => {
              const up = candle.close >= candle.open;
              const bodyTop = yFor(Math.max(candle.open, candle.close));
              const bodyBottom = yFor(Math.min(candle.open, candle.close));
              const bodyHeight = Math.max(16, bodyBottom - bodyTop);
              return (
                <g className={up ? 'market-candle market-candle-up' : 'market-candle market-candle-down'} key={`${candle.label}-${candle.value}`}>
                  <line x1={candle.x} y1={yFor(candle.high)} x2={candle.x} y2={yFor(candle.low)} />
                  <rect x={candle.x - 8} y={bodyTop} width="16" height={bodyHeight} rx="4" />
                  {index % 4 === 0 && <circle cx={candle.x} cy={bodyTop} r="3" />}
                </g>
              );
            })}
          </g>
          <polyline className="balance-area" points={areaPoints} />
          <polyline className="balance-line" points={linePoints} filter="url(#balanceGlow)" />
          <line className="balance-guide" x1={activeX} y1={top} x2={activeX} y2={bottom + 8} />
          <circle className="balance-point-halo" cx={activeX} cy={activeY} r="44" filter="url(#balanceDotGlow)" />
          <circle className="balance-point" cx={activeX} cy={activeY} r="15" />
          <g className="balance-tooltip" transform={`translate(${Math.min(activeX - 62, right - 270)} ${Math.max(activeY + 112, top + 20)})`}>
            <rect width="260" height="108" rx="16" />
            <text x="24" y="42">{format(activePoint.value)}</text>
            <text x="24" y="82">8 Apr 2026</text>
          </g>
          {['8:00AM', '9:00AM', '10:00AM', '11:00AM', '12:00PM', '01:00PM', '02:00PM'].map((label, index) => {
            const x = left + index * ((right - left) / 6);
            return <text className="balance-time-label" x={x} y="592" key={label}>{label}</text>;
          })}
        </svg>
      </div>
    </div>
  );
}

function SavingsCoachPanel({
  salary,
  expenses,
  result,
  format,
  onSalaryChange,
  onExpensesChange,
  onAnalyze,
  onDownload,
}: {
  salary: string;
  expenses: string;
  result: SavingsCoachResult | null;
  format: (value: number) => string;
  onSalaryChange: (value: string) => void;
  onExpensesChange: (value: string) => void;
  onAnalyze: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="panel dashboard-card card-coach">
      <div className="flex items-start gap-3">
        <span className="metric-icon bg-emerald-400/15 text-mint"><PiggyBank size={21} /></span>
        <div>
          <h2 className="panel-title">Savings Coach</h2>
          <p className="panel-subtitle">Enter salary and monthly expenses in plain text</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <label className="field compact">
          <span>Monthly Salary</span>
          <input type="number" value={salary} onChange={(event) => onSalaryChange(event.target.value)} />
        </label>
        <label className="field compact">
          <span>Monthly Expenses</span>
          <textarea
            className="coach-textarea"
            value={expenses}
            onChange={(event) => onExpensesChange(event.target.value)}
            placeholder="Rent 28000, groceries 7000, dining 5000..."
          />
        </label>
        <button className="primary-button" type="button" onClick={onAnalyze}>
          <Sparkles size={18} /> Continue
        </button>
      </div>
      {result && <SavingsCoachOutput result={result} format={format} onDownload={onDownload} />}
    </div>
  );
}

type ParsedExpense = {
  name: string;
  amount: number;
  category: string;
  reducibleAmount: number;
  suggestion: string;
};

type CreditCardExpense = {
  date: string;
  merchant: string;
  category: string;
  amount: number;
  month: string;
};

type CreditCardSnapshot = {
  monthLabel: string;
  currentTotal: number;
  previousTotal: number;
  delta: number;
  deltaPercent: number;
  utilization: number;
  expenses: CreditCardExpense[];
  categoryTotals: Array<{ category: string; amount: number; percentage: number }>;
  alertLevel: 'high' | 'watch' | 'normal';
};

function createCreditCardSnapshot(month: string): CreditCardSnapshot {
  const current = creditCardExpenses.filter((expense) => expense.month === month);
  const previousMonth = previousMonthKey(month);
  const previous = creditCardExpenses.filter((expense) => expense.month === previousMonth);
  const currentTotal = current.reduce((sum, expense) => sum + expense.amount, 0);
  const previousTotal = previous.reduce((sum, expense) => sum + expense.amount, 0);
  const delta = currentTotal - previousTotal;
  const deltaPercent = previousTotal ? Math.round((delta / previousTotal) * 100) : currentTotal ? 100 : 0;
  const utilization = Math.round((currentTotal / creditCardLimit) * 100);
  const categoryTotals = Object.entries(current.reduce<Record<string, number>>((items, expense) => {
    items[expense.category] = (items[expense.category] ?? 0) + expense.amount;
    return items;
  }, {}))
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: currentTotal ? Math.round((amount / currentTotal) * 100) : 0,
    }))
    .sort((first, second) => second.amount - first.amount);

  return {
    monthLabel: monthFormatter.format(new Date(`${month}-01T00:00:00`)),
    currentTotal,
    previousTotal,
    delta,
    deltaPercent,
    utilization,
    expenses: current.sort((first, second) => second.amount - first.amount),
    categoryTotals,
    alertLevel: utilization >= 60 || deltaPercent >= 35 ? 'high' : utilization >= 40 || delta > 0 ? 'watch' : 'normal',
  };
}

function previousMonthKey(month: string) {
  const date = new Date(`${month}-01T00:00:00`);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
}

function CreditCardExpenseTracker({ data, format }: { data: CreditCardSnapshot; format: (value: number) => string }) {
  const usageIsHigher = data.delta > 0;
  const alertText = data.alertLevel === 'high'
    ? 'High usage alert'
    : data.alertLevel === 'watch'
      ? 'Usage watch'
      : 'Usage normal';

  return (
    <section className={`panel dashboard-card card-credit-tracker credit-tracker credit-tracker-${data.alertLevel}`}>
      <div className="credit-tracker-header">
        <div>
          <p className="panel-subtitle">Credit Card Expenses</p>
          <h2 className="panel-title">{data.monthLabel} Tracking</h2>
        </div>
        <span className="credit-alert-chip">
          {data.alertLevel === 'normal' ? <CreditCard size={18} /> : <BellRing size={18} />}
          {alertText}
        </span>
      </div>

      <div className="credit-tracker-grid">
        <div className="credit-usage-block">
          <div className="credit-ring" style={{ '--credit-progress': `${Math.min(100, data.utilization)}%` } as CSSProperties}>
            <div>
              <strong>{data.utilization}%</strong>
              <span>Limit Used</span>
            </div>
          </div>
          <div className="credit-usage-copy">
            <span>Current usage</span>
            <strong>{format(data.currentTotal)}</strong>
            <p>Limit {format(creditCardLimit)}</p>
          </div>
        </div>

        <div className="credit-alert-box">
          <AlertTriangle size={20} />
          <div>
            <strong>{usageIsHigher ? 'Spending is higher than previous month' : 'Spending is lower than previous month'}</strong>
            <span>
              {usageIsHigher ? '+' : ''}{format(data.delta)} ({usageIsHigher ? '+' : ''}{data.deltaPercent}%) vs previous month
            </span>
          </div>
        </div>

        <div className="credit-category-list">
          {data.categoryTotals.map((category) => (
            <div className="credit-category-row" key={category.category}>
              <span>{category.category}</span>
              <div><i style={{ width: `${category.percentage}%` }} /></div>
              <strong>{format(category.amount)}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="credit-expense-table">
        {data.expenses.map((expense) => (
          <div key={`${expense.date}-${expense.merchant}`}>
            <span>{expense.date}</span>
            <strong>{expense.merchant}</strong>
            <em>{expense.category}</em>
            <b>{format(expense.amount)}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

type SavingsCoachResult = {
  salary: number;
  totalExpense: number;
  currentSavings: number;
  targetSavings: number;
  suggestedMonthlySaving: number;
  recommendedExpenses: ParsedExpense[];
  message: string;
};

function SavingsCoachOutput({
  result,
  format,
  onDownload,
}: {
  result: SavingsCoachResult;
  format: (value: number) => string;
  onDownload: () => void;
}) {
  return (
    <div className="coach-output">
      <button className="secondary-button justify-self-start" type="button" onClick={onDownload}>
        <Download size={18} /> Download PDF
      </button>
      <div className="grid gap-2 text-sm">
        <Result label="Current Savings" value={format(result.currentSavings)} />
        <Result label="Suggested Extra Saving" value={format(result.suggestedMonthlySaving)} />
        <Result label="Target Monthly Savings" value={format(result.targetSavings)} />
      </div>
      <p className="coach-message">{result.message}</p>
      <div className="grid gap-2">
        {result.recommendedExpenses.map((expense) => (
          <div className="coach-action" key={`${expense.name}-${expense.amount}`}>
            <div>
              <strong>{expense.name}</strong>
              <span>{expense.suggestion}</span>
            </div>
            <p>{format(expense.reducibleAmount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function createSavingsPlan(salary: number, input: string): SavingsCoachResult {
  const expenses = parseExpenses(input);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const currentSavings = salary - totalExpense;
  const targetSavings = Math.max(salary * 0.2, currentSavings);
  const savingsGap = Math.max(0, targetSavings - currentSavings);
  const recommendedExpenses = expenses
    .map((expense) => {
      const rate = reductionRates[expense.category] ?? 0.12;
      return {
        ...expense,
        reducibleAmount: Math.round(expense.amount * rate),
        suggestion: savingSuggestion(expense.category),
      };
    })
    .filter((expense) => expense.reducibleAmount > 0)
    .sort((first, second) => second.reducibleAmount - first.reducibleAmount)
    .slice(0, 4);

  const suggestedMonthlySaving = Math.min(
    recommendedExpenses.reduce((sum, item) => sum + item.reducibleAmount, 0),
    savingsGap || salary * 0.08,
  );

  return {
    salary,
    totalExpense,
    currentSavings,
    targetSavings,
    suggestedMonthlySaving,
    recommendedExpenses,
    message: currentSavings >= salary * 0.2
      ? 'You are already saving at least 20% of salary. Keep this base strong and trim flexible spends to increase investments.'
      : 'Your savings are below the 20% salary target. Start with flexible expenses first before touching essentials.',
  };
}

function parseExpenses(input: string): ParsedExpense[] {
  return input
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const amountMatch = part.match(/(?:rs\.?|inr|₹)?\s*(\d[\d,]*(?:\.\d+)?)/i);
      const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : 0;
      const name = part.replace(amountMatch?.[0] ?? '', '').replace(/[-:]/g, ' ').trim() || 'Expense';
      const category = inferExpenseCategory(name);
      return { name: titleCase(name), amount, category, reducibleAmount: 0, suggestion: '' };
    })
    .filter((item) => item.amount > 0);
}

function inferExpenseCategory(name: string) {
  const normalized = name.toLowerCase();
  if (/rent|home|housing|emi/.test(normalized)) return 'housing';
  if (/grocery|groceries|supermarket|food/.test(normalized)) return 'groceries';
  if (/dining|restaurant|coffee|swiggy|zomato/.test(normalized)) return 'dining';
  if (/shop|amazon|flipkart|clothes|marketplace/.test(normalized)) return 'shopping';
  if (/netflix|spotify|subscription|prime|ott/.test(normalized)) return 'subscriptions';
  if (/travel|flight|hotel|cab|uber|ola/.test(normalized)) return 'travel';
  if (/electric|utility|phone|internet|bill/.test(normalized)) return 'utilities';
  if (/sip|mutual|investment|invest/.test(normalized)) return 'investments';
  return 'other';
}

function savingSuggestion(category: string) {
  const suggestions: Record<string, string> = {
    dining: 'Reduce outside food frequency and set a weekly dining cap.',
    shopping: 'Delay non-essential purchases by 7 days and use a fixed monthly limit.',
    entertainment: 'Keep only high-use entertainment spends.',
    travel: 'Book earlier and cap impulse local travel.',
    subscriptions: 'Cancel duplicate or low-use subscriptions.',
    groceries: 'Plan weekly purchases and avoid small repeat orders.',
    utilities: 'Review plans and reduce avoidable usage.',
    housing: 'Keep this mostly stable; reduce only if there is a cheaper safe option.',
    other: 'Set a fixed cap and review this category weekly.',
  };
  return suggestions[category] ?? suggestions.other;
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function ExpensePieChart({
  items,
  total,
  format,
  month,
}: {
  items: Array<{ category: string; amount: number; color: string; percentage: number }>;
  total: number;
  format: (value: number) => string;
  month: string;
}) {
  let startAngle = -90;

  return (
    <div className="pie-panel">
      <div>
        <h3 className="pie-heading">Expense Split</h3>
        <p className="panel-subtitle">{month}</p>
      </div>
      <div className="pie-chart-wrap">
        <svg className="pie-chart" viewBox="0 0 220 220" role="img" aria-label="Expense category pie chart">
          {items.map((item) => {
            const angle = total ? (item.amount / total) * 360 : 0;
            const path = describeArc(110, 110, 86, startAngle, startAngle + angle);
            startAngle += angle;
            return <path key={item.category} d={path} fill={item.color} />;
          })}
          <circle cx="110" cy="110" r="48" fill="#111827" />
          <text x="110" y="104" textAnchor="middle" className="pie-total-label">Expenses</text>
          <text x="110" y="127" textAnchor="middle" className="pie-total-value">{format(total)}</text>
        </svg>
      </div>
      <div className="pie-legend">
        {items.map((item) => (
          <div className="pie-legend-row" key={item.category}>
            <span className="pie-swatch" style={{ backgroundColor: item.color }} />
            <span className="pie-name">{item.category}</span>
            <strong>{item.percentage}%</strong>
            <span className="pie-amount">{format(item.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonCard({
  label,
  value,
  average,
  previous,
  format,
  lowerIsBetter = false,
}: {
  label: string;
  value: number;
  average: number;
  previous?: number;
  format: (value: number) => string;
  lowerIsBetter?: boolean;
}) {
  const monthDelta = previous == null ? 0 : value - previous;
  const averageDelta = value - average;
  const improved = lowerIsBetter ? monthDelta <= 0 : monthDelta >= 0;
  const TrendIcon = improved ? TrendingUp : TrendingDown;

  return (
    <div className="comparison-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="comparison-label">{label}</p>
          <strong>{format(value)}</strong>
        </div>
        <span className={`comparison-icon ${improved ? 'comparison-good' : 'comparison-watch'}`}><TrendIcon size={17} /></span>
      </div>
      <div className="comparison-lines">
        <span>{monthDelta >= 0 ? '+' : ''}{format(monthDelta)} vs previous month</span>
        <span>{averageDelta >= 0 ? '+' : ''}{format(averageDelta)} vs {format(average)} average</span>
      </div>
    </div>
  );
}

function Metric({
  title,
  label,
  value,
  progress,
  tone,
  primaryLabel,
  dailyLabel,
  dailyValue,
  dailyMax,
  monthlyLabel,
  monthlyValue,
  monthlyMax,
  format,
}: {
  title: string;
  label: string;
  value: string;
  progress: number;
  tone: 'violet' | 'cyan' | 'gold';
  primaryLabel: string;
  dailyLabel: string;
  dailyValue: number;
  dailyMax: number;
  monthlyLabel: string;
  monthlyValue: number;
  monthlyMax: number;
  format: (value: number) => string;
}) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const dailyProgress = dailyMax > 0 ? Math.max(0, Math.min(100, Math.round((dailyValue / dailyMax) * 100))) : 0;
  const monthlyProgress = monthlyMax > 0 ? Math.max(0, Math.min(100, Math.round((monthlyValue / monthlyMax) * 100))) : 0;

  return (
    <div className={`metric metric-${tone}`} style={{ '--metric-progress': `${clampedProgress}%` } as CSSProperties}>
      <h2>{title}</h2>
      <div className="metric-ring-wrap">
        <div className="metric-ring">
          <div className="metric-ring-core">
            <strong>{clampedProgress}%</strong>
            <span>{label}</span>
            <em>{primaryLabel}</em>
          </div>
        </div>
      </div>
      <p className="metric-value">{value}</p>
      <MetricLimit label={dailyLabel} value={dailyValue} max={dailyMax} progress={dailyProgress} format={format} />
      <MetricLimit label={monthlyLabel} value={monthlyValue} max={monthlyMax} progress={monthlyProgress} format={format} />
    </div>
  );
}

function MetricLimit({
  label,
  value,
  max,
  progress,
  format,
}: {
  label: string;
  value: number;
  max: number;
  progress: number;
  format: (value: number) => string;
}) {
  return (
    <div className="metric-limit">
      <div className="metric-limit-label">{label}</div>
      <div className="metric-limit-row">
        <span>{format(0)}</span>
        <div className="metric-track" style={{ '--metric-track-progress': `${progress}%` } as CSSProperties}>
          <i />
        </div>
        <span>{format(max)}</span>
      </div>
      <strong>{format(value)}</strong>
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return <div className="result-row"><span>{label}</span><strong>{value}</strong></div>;
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const angleInRadians = (angle * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function transactionAnalyticsReportHtml(
  snapshot: {
    label: string;
    transactions: TransactionInput[];
    income: number;
    expense: number;
    savings: number;
  },
  previous: { income: number; expense: number; savings: number } | null,
  averages: { income: number; expense: number; savings: number },
  breakdown: Array<{ category: string; amount: number; percentage: number; color: string }>,
  format: (value: number) => string,
) {
  const comparisonRows = [
    ['Income', snapshot.income, previous?.income, averages.income],
    ['Expenses', snapshot.expense, previous?.expense, averages.expense],
    ['Savings', snapshot.savings, previous?.savings, averages.savings],
  ];

  return `
    <section>
      <h2>${escapeHtml(snapshot.label)} Summary</h2>
      <div class="metrics">
        <div><span>Income</span><strong>${escapeHtml(format(snapshot.income))}</strong></div>
        <div><span>Expenses</span><strong>${escapeHtml(format(snapshot.expense))}</strong></div>
        <div><span>Savings</span><strong>${escapeHtml(format(snapshot.savings))}</strong></div>
      </div>
    </section>
    <section>
      <h2>Expense Split</h2>
      <table>
        <thead><tr><th>Category</th><th>Amount</th><th>Share</th></tr></thead>
        <tbody>${breakdown.map((item) => `
          <tr>
            <td><i style="background:${item.color}"></i>${escapeHtml(item.category)}</td>
            <td>${escapeHtml(format(item.amount))}</td>
            <td>${item.percentage}%</td>
          </tr>
        `).join('')}</tbody>
      </table>
    </section>
    <section>
      <h2>Monthly Comparison</h2>
      <table>
        <thead><tr><th>Metric</th><th>Selected Month</th><th>Previous Month</th><th>Average</th></tr></thead>
        <tbody>${comparisonRows.map(([label, value, prev, avg]) => `
          <tr>
            <td>${label}</td>
            <td>${escapeHtml(format(Number(value)))}</td>
            <td>${prev == null ? 'N/A' : escapeHtml(format(Number(prev)))}</td>
            <td>${escapeHtml(format(Number(avg)))}</td>
          </tr>
        `).join('')}</tbody>
      </table>
    </section>
    <section>
      <h2>Transactions</h2>
      <table>
        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr></thead>
        <tbody>${snapshot.transactions.map((tx) => `
          <tr>
            <td>${escapeHtml(tx.date)}</td>
            <td>${escapeHtml(tx.description)}</td>
            <td>${escapeHtml(tx.category)}</td>
            <td>${escapeHtml(tx.type)}</td>
            <td>${escapeHtml(format(tx.amount))}</td>
          </tr>
        `).join('')}</tbody>
      </table>
    </section>
  `;
}

function savingsCoachReportHtml(result: SavingsCoachResult, rawExpenses: string, format: (value: number) => string) {
  return `
    <section>
      <h2>Savings Summary</h2>
      <div class="metrics">
        <div><span>Monthly Salary</span><strong>${escapeHtml(format(result.salary))}</strong></div>
        <div><span>Total Expenses</span><strong>${escapeHtml(format(result.totalExpense))}</strong></div>
        <div><span>Current Savings</span><strong>${escapeHtml(format(result.currentSavings))}</strong></div>
        <div><span>Suggested Extra Saving</span><strong>${escapeHtml(format(result.suggestedMonthlySaving))}</strong></div>
        <div><span>Target Monthly Savings</span><strong>${escapeHtml(format(result.targetSavings))}</strong></div>
      </div>
      <p class="callout">${escapeHtml(result.message)}</p>
    </section>
    <section>
      <h2>Recommended Reductions</h2>
      <table>
        <thead><tr><th>Expense</th><th>Monthly Reduction</th><th>Action</th></tr></thead>
        <tbody>${result.recommendedExpenses.map((expense) => `
          <tr>
            <td>${escapeHtml(expense.name)}</td>
            <td>${escapeHtml(format(expense.reducibleAmount))}</td>
            <td>${escapeHtml(expense.suggestion)}</td>
          </tr>
        `).join('')}</tbody>
      </table>
    </section>
    <section>
      <h2>Customer Input</h2>
      <p>${escapeHtml(rawExpenses)}</p>
    </section>
  `;
}

function downloadPdfReport(title: string, body: string) {
  const text = htmlToReportText(body);
  const pdf = createSimplePdf([title, 'AI Banking Assistant report', '', ...text]);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function htmlToReportText(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;

  const lines: string[] = [];
  template.content.querySelectorAll('section').forEach((section) => {
    const heading = section.querySelector('h2')?.textContent?.trim();
    if (heading) lines.push(heading);

    section.querySelectorAll('.metrics div').forEach((metric) => {
      const label = metric.querySelector('span')?.textContent?.trim();
      const value = metric.querySelector('strong')?.textContent?.trim();
      if (label && value) lines.push(`${label}: ${value}`);
    });

    section.querySelectorAll('table').forEach((table) => {
      table.querySelectorAll('tr').forEach((row) => {
        const cells = Array.from(row.querySelectorAll('th, td')).map((cell) => cell.textContent?.trim() ?? '');
        if (cells.length) lines.push(cells.join(' | '));
      });
    });

    section.querySelectorAll('p').forEach((paragraph) => {
      const value = paragraph.textContent?.trim();
      if (value) lines.push(value);
    });
    lines.push('');
  });

  return lines;
}

function createSimplePdf(lines: string[]) {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 42;
  const lineHeight = 15;
  const maxChars = 88;
  const pages: string[][] = [[]];

  lines.flatMap((line) => wrapPdfLine(line, maxChars)).forEach((line) => {
    const currentPage = pages[pages.length - 1];
    if (currentPage.length >= Math.floor((pageHeight - margin * 2) / lineHeight)) {
      pages.push([]);
    }
    pages[pages.length - 1].push(line);
  });

  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const fontObjectId = 3 + pages.length * 2;
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('');

  pages.forEach((pageLines) => {
    const content = pageLines.map((line, index) => {
      const y = pageHeight - margin - index * lineHeight;
      return `BT /F1 10 Tf ${margin} ${y} Td (${escapePdfText(line)}) Tj ET`;
    }).join('\n');
    const contentId = objects.length + 1;
    const pageId = objects.length + 2;
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageObjectIds.push(pageId);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`;
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function wrapPdfLine(line: string, maxChars: number) {
  const normalized = line.replace(/₹/g, 'Rs.').replace(/\s+/g, ' ').trim();
  if (!normalized) return [''];
  const words = normalized.split(' ');
  const lines: string[] = [];
  let current = '';
  words.forEach((word) => {
    if (`${current} ${word}`.trim().length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  });
  if (current) lines.push(current);
  return lines;
}

function escapePdfText(value: string) {
  return value
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
