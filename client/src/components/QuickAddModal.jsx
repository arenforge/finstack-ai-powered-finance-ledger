import { useEffect, useRef, useState } from 'react';
import { createTransaction } from '../services/api';

const categories = ['Food', 'Transport', 'Rent', 'Health', 'Shopping', 'Entertainment', 'Salary', 'Freelance', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);

export default function QuickAddModal({ open, onClose, onAdded }) {
  const amountRef = useRef(null);
  const [form, setForm] = useState({ amount: '', type: 'expense', category: 'Food', description: '', date: today() });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ amount: '', type: 'expense', category: 'Food', description: '', date: today() });
      setError('');
      setTimeout(() => amountRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    if (!form.category) {
      setError('Choose a category.');
      return;
    }

    setSaving(true);
    await createTransaction({ ...form, amount: Number(form.amount) });
    setSaving(false);
    onAdded?.();
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="quick-modal" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>Quick Add</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">x</button>
        </div>
        <input ref={amountRef} type="number" min="1" step="0.01" placeholder="Amount in ₹" value={form.amount} onChange={(e) => update('amount', e.target.value)} />
        <div className="segmented">
          <button type="button" className={form.type === 'expense' ? 'active danger' : ''} onClick={() => update('type', 'expense')}>Expense</button>
          <button type="button" className={form.type === 'income' ? 'active success' : ''} onClick={() => update('type', 'income')}>Income</button>
        </div>
        <select value={form.category} onChange={(e) => update('category', e.target.value)}>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <input type="text" placeholder="Description (optional)" value={form.description} onChange={(e) => update('description', e.target.value)} />
        <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Entry'}</button>
      </form>
    </div>
  );
}
