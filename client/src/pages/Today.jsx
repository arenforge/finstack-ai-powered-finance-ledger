import { useCallback, useEffect, useMemo, useState } from 'react';
import SummaryCard from '../components/SummaryCard';
import TransactionFeed from '../components/TransactionFeed';
import Spinner from '../components/Spinner';
import { getDailySummary, updateTransaction } from '../services/api';
import { useTransactions } from '../hooks/useTransactions';
import '../styles/today.css';

const today = () => new Date().toISOString().slice(0, 10);

export default function Today() {
  const date = useMemo(today, []);
  const { transactions, refresh } = useTransactions({ date });
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, net: 0 });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getDailySummary(date);
    setSummary(data);
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const refreshAll = async () => {
    setLoading(true);
    await refresh();
    await load();
    setLoading(false);
  };

  window.financeRefresh = refreshAll;

  const saveEdit = async (event) => {
    event.preventDefault();
    await updateTransaction(editing._id, { ...editing, amount: Number(editing.amount) });
    setEditing(null);
    refreshAll();
  };

  if (loading) return <Spinner fullPage />;

  return (
    <main className="page today-page">
      <section className="page-title">
        <h1>Today</h1>
        <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </section>
      <section className="summary-grid">
        <SummaryCard label="Today's Income" value={`₹${summary.totalIncome.toLocaleString('en-IN')}`} tone="success" />
        <SummaryCard label="Today's Expenses" value={`₹${summary.totalExpense.toLocaleString('en-IN')}`} tone="danger" />
        <SummaryCard label="Today's Net" value={`₹${summary.net.toLocaleString('en-IN')}`} tone={summary.net >= 0 ? 'success' : 'danger'} />
      </section>
      <TransactionFeed transactions={transactions} onEdit={setEditing} onChanged={refreshAll} />
      <div className="today-total">Today's Total <strong>₹{summary.net.toLocaleString('en-IN')}</strong></div>

      {editing && (
        <div className="modal-backdrop">
          <form className="quick-modal" onSubmit={saveEdit}>
            <div className="modal-head"><h2>Edit Entry</h2><button type="button" className="icon-button" onClick={() => setEditing(null)}>x</button></div>
            <input type="number" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: e.target.value })} />
            <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <button className="primary-button" type="submit">Save</button>
          </form>
        </div>
      )}
    </main>
  );
}
