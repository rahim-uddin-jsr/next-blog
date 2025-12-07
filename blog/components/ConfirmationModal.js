'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, isDanger = false }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="btn-close">×</button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
                    >
                        {isDanger ? 'Delete' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
