export default function SummaryCard({ label, value, tone }) {
  return (
    <div className={`summary-card ${tone || ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
