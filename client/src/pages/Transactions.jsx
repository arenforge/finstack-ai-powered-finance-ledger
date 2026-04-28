import { useMemo, useState } from 'react';
import { deleteTransaction, updateTransaction } from '../services/api';
import { useTransactions } from '../hooks/useTransactions';
import '../styles/transactions.css';

const categories = ['', 'Food', 'Transport', 'Rent', 'Health', 'Shopping', 'Entertainment', 'Salary', 'Freelance', 'Other'];

export default function Transactions() {
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '', search: '' });
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const query = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), [filters]);
  const { transactions, refresh } = useTransactions(query);
  window.financeRefresh = refresh;

  const visible = transactions.slice((page - 1) * 10, page * 10);
  const pages = Math.max(1, Math.ceil(transactions.length / 10));
  const updateFilter = (field, value) => { setFilters({ ...filters, [field]: value }); setPage(1); };

  const remove = async (id) => { await deleteTransaction(id); refresh(); };
  const save = async (event) => {
    event.preventDefault();
    await updateTransaction(editing._id, { ...editing, amount: Number(editing.amount) });
    setEditing(null);
    refresh();
  };

  return (
    <main className="page transactions-page">
      <section className="page-title"><h1>Transactions</h1><p>Search, filter, edit, and tidy every entry.</p></section>
      <section className="filters">
        <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)}><option value="">All types</option><option value="expense">Expense</option><option value="income">Income</option></select>
        <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>{categories.map((c) => <option key={c} value={c}>{c || 'All categories'}</option>)}</select>
        <input type="date" value={filters.startDate} onChange={(e) => updateFilter('startDate', e.target.value)} />
        <input type="date" value={filters.endDate} onChange={(e) => updateFilter('endDate', e.target.value)} />
        <input placeholder="Search description" value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} />
      </section>
      <section className="table-card">
        <table>
          <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th><th></th></tr></thead>
          <tbody>{visible.map((item) => <tr key={item._id}><td>{new Date(item.date).toLocaleDateString('en-IN')}</td><td>{item.description || item.category}</td><td>{item.category}</td><td><span className={`badge ${item.type}`}>{item.type}</span></td><td className={item.type}>₹{item.amount.toLocaleString('en-IN')}</td><td><button className="icon-button" onClick={() => setEditing(item)}>✎</button><button className="icon-button danger-text" onClick={() => remove(item._id)}>×</button></td></tr>)}</tbody>
        </table>
      </section>
      <div className="pager"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button><span>{page} / {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button></div>
      {editing && <div className="modal-backdrop"><form className="quick-modal" onSubmit={save}><div className="modal-head"><h2>Edit</h2><button type="button" className="icon-button" onClick={() => setEditing(null)}>x</button></div><input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /><input type="number" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: e.target.value })} /><button className="primary-button">Save</button></form></div>}
    </main>
  );
}
