interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="confirm-overlay"
      onClick={onCancel}
    >
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
