import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="confirm-dialog">
        <p>{message}</p>
        <div className="form-actions">
          <Button variant="secondary" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" disabled={loading} onClick={onConfirm}>
            {loading ? 'Deleting' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
