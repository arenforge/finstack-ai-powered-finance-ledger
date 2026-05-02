export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = "Delete", danger = true }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div className="quick-modal confirm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
        </div>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onCancel}>Cancel</button>
          <button type="button" className={danger ? "primary-button danger" : "primary-button"} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
