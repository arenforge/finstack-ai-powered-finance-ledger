import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import { createSharedBudget, getSharedBudgets } from '../services/api';
import '../styles/shared.css';

export default function SharedBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ email: '', budgetLimit: '', month: new Date().toISOString().slice(0, 7) });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setBudgets(await getSharedBudgets());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  window.financeRefresh = load;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.email.includes('@') || Number(form.budgetLimit) <= 0 || !form.month) return setError('Enter email, budget limit and month.');
    try {
      await createSharedBudget({ ...form, budgetLimit: Number(form.budgetLimit) });
      setForm({ email: '', budgetLimit: '', month: form.month });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not share budget.');
    }
  };

  return (
    <main className="page shared-page">
      <section className="page-title"><h1>Shared Budgets</h1><p>Invite a viewer into one monthly limit.</p></section>
      <form className="inline-form" onSubmit={submit}><input placeholder="Member email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input type="number" placeholder="Budget ₹" value={form.budgetLimit} onChange={(e) => setForm({ ...form, budgetLimit: e.target.value })} /><input type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /><button className="primary-button">Share</button></form>
      {error && <p className="form-error">{error}</p>}
      
      {!loading && budgets.length === 0 ? (
        <EmptyState 
          title="Solo journey?" 
          message="Managing finances with a partner or roommate? Invite them here to stay on the same page."
          icon="🤝"
        />
      ) : (
        <section className="card-grid">
          {budgets.map((budget) => (
            <div className="shared-card" key={budget._id}>
              <div className="shared-head"><h2>{budget.month}</h2><span className={`badge ${budget.role}`}>{budget.role === 'owner' ? 'Owner' : 'Viewer'}</span></div>
              <p>₹{budget.spent.toLocaleString('en-IN')} used of ₹{budget.budgetLimit.toLocaleString('en-IN')}</p>
              <ProgressBar value={budget.percentageUsed} />
              <strong>{budget.percentageUsed}% used</strong>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
