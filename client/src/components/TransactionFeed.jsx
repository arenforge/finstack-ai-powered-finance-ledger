import { deleteTransaction } from '../services/api';

const icons = {
  Food: '🍽',
  Transport: '↔',
  Rent: '⌂',
  Health: '+',
  Shopping: '◈',
  Entertainment: '♪',
  Salary: '₹',
  Freelance: '✎',
  Other: '•'
};

export default function TransactionFeed({ transactions, onEdit, onChanged, emptyText }) {
  const remove = async (id) => {
    await deleteTransaction(id);
    onChanged?.();
  };

  if (!transactions.length) {
    return <div className="empty-state">{emptyText || 'Nothing logged yet today. Hit + to add your first entry.'}</div>;
  }

  return (
    <div className="feed-list">
      {transactions.map((item) => (
        <div className="feed-item" key={item._id}>
          <div className="feed-icon">{icons[item.category] || '•'}</div>
          <div className="feed-copy">
            <strong>{item.description || item.category}</strong>
            <span>{item.category} · {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className={`feed-amount ${item.type}`}>
            {item.type === 'income' ? '+' : '-'}₹{Number(item.amount).toLocaleString('en-IN')}
          </div>
          <button className="icon-button" type="button" onClick={() => onEdit?.(item)} aria-label="Edit">✎</button>
          <button className="icon-button danger-text" type="button" onClick={() => remove(item._id)} aria-label="Delete">×</button>
        </div>
      ))}
    </div>
  );
}
