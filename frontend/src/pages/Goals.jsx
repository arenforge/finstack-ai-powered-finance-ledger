import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import { createGoal, getGoals, updateGoal, deleteGoal } from '../services/api';
import '../styles/goals.css';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ title: '', targetAmount: '', deadline: '' });
  const [add, setAdd] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setGoals(await getGoals());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  window.financeRefresh = load;

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title || Number(form.targetAmount) <= 0 || !form.deadline) return;
    await createGoal({ ...form, targetAmount: Number(form.targetAmount) });
    setForm({ title: '', targetAmount: '', deadline: '' });
    load();
  };

  const addSavings = async (goal) => {
    const amount = Number(add[goal._id]);
    if (!amount || amount <= 0) return;
    await updateGoal(goal._id, { savedAmount: goal.savedAmount + amount });
    setAdd({ ...add, [goal._id]: '' });
    load();
  };

  const countdown = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
    return days >= 0 ? `${days} days left` : `Overdue by ${Math.abs(days)} days`;
  };

  return (
    <main className="page goals-page">
      <section className="page-title"><h1>Goals</h1><p>Small daily savings, visible progress.</p></section>
      <form className="inline-form" onSubmit={submit}><input placeholder="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><input type="number" placeholder="Target ₹" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} /><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /><button className="primary-button">Add Goal</button></form>
      
      {!loading && goals.length === 0 ? (
        <EmptyState 
          title="No goals set" 
          message="What are you saving for? A new gadget, a trip, or just a rainy day? Start tracking here."
          icon="🎯"
        />
      ) : (
        <section className="card-grid">
          {goals.map((goal) => { 
            const pct = goal.targetAmount ? Math.round((goal.savedAmount / goal.targetAmount) * 100) : 0; 
            const overdue = new Date(goal.deadline) < new Date(); 
            return <div className="goal-card" key={goal._id}><button className="icon-button delete-card" onClick={() => deleteGoal(goal._id).then(load)}>×</button><h2>{goal.title}</h2><ProgressBar value={pct} /><p>₹{goal.savedAmount.toLocaleString('en-IN')} / ₹{goal.targetAmount.toLocaleString('en-IN')} ({pct}%)</p><span className={overdue ? 'overdue' : ''}>{countdown(goal.deadline)}</span><div className="save-row"><input type="number" placeholder="Add ₹" value={add[goal._id] || ''} onChange={(e) => setAdd({ ...add, [goal._id]: e.target.value })} /><button onClick={() => addSavings(goal)}>Add to Savings</button></div></div>; 
          })}
        </section>
      )}
    </main>
  );
}
