import { useEffect, useState } from 'react';
import { createBill, deleteBill, getBills, updateBill } from '../services/api';
import '../styles/bills.css';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', dueDate: '' });
  const load = async () => setBills(await getBills());
  useEffect(() => { load(); }, []);
  window.financeRefresh = load;

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title || Number(form.amount) <= 0 || !form.dueDate) return;
    await createBill({ ...form, amount: Number(form.amount) });
    setForm({ title: '', amount: '', dueDate: '' });
    load();
  };

  const statusClass = (bill) => {
    const days = Math.ceil((new Date(bill.dueDate) - new Date()) / 86400000);
    if (bill.isPaid) return 'paid';
    if (days < 0) return 'overdue';
    if (days <= 3) return 'soon';
    return '';
  };

  return (
    <main className="page bills-page">
      <section className="page-title"><h1>Bills</h1><p>Due dates you can scan quickly.</p></section>
      <form className="inline-form" onSubmit={submit}><input placeholder="Bill title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><input type="number" placeholder="Amount ₹" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /><button className="primary-button">Add Bill</button></form>
      <section className="bill-list">{bills.map((bill) => <div className={`bill-card ${statusClass(bill)}`} key={bill._id}><div><h2>{bill.title}</h2><p>Due {new Date(bill.dueDate).toLocaleDateString('en-IN')}</p></div><strong>₹{bill.amount.toLocaleString('en-IN')}</strong><button onClick={() => updateBill(bill._id, { isPaid: true }).then(load)} disabled={bill.isPaid}>{bill.isPaid ? 'Paid' : 'Mark as paid'}</button><button className="icon-button danger-text" onClick={() => deleteBill(bill._id).then(load)}>×</button></div>)}</section>
    </main>
  );
}
