import { X } from 'lucide-react';

import Button from './Button.jsx';

export default function Modal({ title, children, open, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2>{title}</h2>
          <Button variant="ghost" className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} aria-hidden="true" />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
