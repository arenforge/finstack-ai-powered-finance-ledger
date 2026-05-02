export default function EmptyState({ title, message, icon }) {
  return (
    <div className="empty-state">
      {icon && <span style={{ fontSize: '42px', marginBottom: '16px' }}>{icon}</span>}
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
