import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import SummaryCard from '../components/SummaryCard';
import Spinner from '../components/Spinner';
import { getAllSummary, getTransactions } from '../services/api';
import '../styles/dashboard.css';

const colors = ['#4f46e5', '#22c55e', '#ef4444', '#f59e0b', '#0ea5e9', '#8b5cf6', '#14b8a6', '#6b7280'];

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, net: 0, savingsRate: 0, categories: [] });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setSummary(await getAllSummary());
    setTransactions(await getTransactions({ limit: 300 }));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  window.financeRefresh = load;

  const monthly = useMemo(() => {
    const map = {};
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      map[date.toISOString().slice(0, 7)] = { month: date.toLocaleString('en-IN', { month: 'short' }), net: 0 };
    }
    transactions.forEach((item) => {
      const key = item.date.slice(0, 7);
      if (map[key]) map[key].net += item.type === 'income' ? item.amount : -item.amount;
    });
    return Object.values(map);
  }, [transactions]);

  const last7 = useMemo(() => {
    const map = {};
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      map[date.toISOString().slice(0, 10)] = { day: date.toLocaleDateString('en-IN', { weekday: 'short' }), spent: 0 };
    }
    transactions.filter((item) => item.type === 'expense').forEach((item) => {
      const key = item.date.slice(0, 10);
      if (map[key]) map[key].spent += item.amount;
    });
    return Object.values(map);
  }, [transactions]);

  if (loading) return <Spinner fullPage message="Crunching your numbers..." />;

  return (
    <main className="page dashboard-page">
      <section className="page-title"><h1>Dashboard</h1><p>All-time patterns from daily entries.</p></section>
      <section className="summary-grid">
        <SummaryCard label="Total Income" value={`₹${summary.totalIncome.toLocaleString('en-IN')}`} tone="success" />
        <SummaryCard label="Total Expenses" value={`₹${summary.totalExpense.toLocaleString('en-IN')}`} tone="danger" />
        <SummaryCard label="Net Balance" value={`₹${summary.net.toLocaleString('en-IN')}`} />
        <SummaryCard label="Savings Rate" value={`${summary.savingsRate}%`} />
      </section>
      <section className="chart-grid">
        <div className="chart-card"><h2>Monthly Net</h2><ResponsiveContainer width="100%" height={260}><LineChart data={monthly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="net" stroke="#4f46e5" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
        <div className="chart-card"><h2>Expense Categories</h2><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={summary.categories} dataKey="amount" nameKey="category" outerRadius={90} label>{summary.categories.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        <div className="chart-card wide"><h2>Last 7 Days Spending</h2><ResponsiveContainer width="100%" height={260}><BarChart data={last7}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="spent" fill="#ef4444" /></BarChart></ResponsiveContainer></div>
      </section>
      <section className="list-card"><h2>Recent Entries</h2>{transactions.slice(0, 10).map((item) => <div className="mini-row" key={item._id}><span>{new Date(item.date).toLocaleDateString('en-IN')}</span><strong>{item.description || item.category}</strong><b className={item.type}>{item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}</b></div>)}</section>
    </main>
  );
}
