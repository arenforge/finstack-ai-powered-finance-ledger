import { useCallback, useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ProgressBar from '../components/ProgressBar';
import SummaryCard from '../components/SummaryCard';
import Spinner from '../components/Spinner';
import { getMonthlySummary, getTransactions } from '../services/api';
import '../styles/monthly.css';

const colors = ['#4f46e5', '#22c55e', '#ef4444', '#f59e0b', '#0ea5e9', '#8b5cf6', '#14b8a6'];

export default function Monthly() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, net: 0, categories: [] });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setSummary(await getMonthlySummary(month));
    setTransactions(await getTransactions({ month }));
    setLoading(false);
  }, [month]);
  useEffect(() => { load(); }, [load]);
  window.financeRefresh = load;

  const grouped = useMemo(() => transactions.reduce((acc, item) => {
    const day = new Date(item.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' });
    acc[day] = acc[day] || [];
    acc[day].push(item);
    return acc;
  }, {}), [transactions]);

  const moveMonth = (delta) => {
    const date = new Date(`${month}-01T00:00:00`);
    date.setMonth(date.getMonth() + delta);
    setMonth(date.toISOString().slice(0, 7));
  };

  const savingsRate = summary.totalIncome ? Math.round((summary.net / summary.totalIncome) * 100) : 0;

  if (loading) return <Spinner fullPage />;

  return (
    <main className="page monthly-page">
      <section className="month-bar"><button onClick={() => moveMonth(-1)}>‹</button><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /><button onClick={() => moveMonth(1)}>›</button></section>
      <section className="summary-grid">
        <SummaryCard label="Income" value={`₹${summary.totalIncome.toLocaleString('en-IN')}`} tone="success" />
        <SummaryCard label="Expenses" value={`₹${summary.totalExpense.toLocaleString('en-IN')}`} tone="danger" />
        <SummaryCard label="Net" value={`₹${summary.net.toLocaleString('en-IN')}`} />
        <SummaryCard label="Savings Rate" value={`${savingsRate}%`} />
      </section>
      <section className="monthly-layout">
        <div className="list-card">
          <h2>Category Breakdown</h2>
          {summary.categories.map((item) => <div className="category-row" key={item.category}><span>{item.category}</span><strong>₹{item.amount.toLocaleString('en-IN')}</strong><em>{item.percentage}%</em><ProgressBar value={item.percentage} /></div>)}
        </div>
        <div className="chart-card"><h2>Month Split</h2><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={summary.categories} dataKey="amount" nameKey="category" outerRadius={90} label>{summary.categories.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </section>
      <section className="list-card"><h2>Entries by Day</h2>{Object.entries(grouped).map(([day, items]) => <div className="day-group" key={day}><h3>{day}</h3>{items.map((item) => <div className="mini-row" key={item._id}><strong>{item.description || item.category} · {item.category}</strong><b className={item.type}>{item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}</b></div>)}</div>)}</section>
    </main>
  );
}
