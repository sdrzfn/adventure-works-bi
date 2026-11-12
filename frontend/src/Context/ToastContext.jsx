import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', duration = 3500) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const hideToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, hideToast, toasts }}>
            {children}
            <ToastContainer toasts={toasts} onHide={hideToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastContainer = ({ toasts, onHide }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onHide={onHide} />
            ))}
        </div>
    );
};

const Toast = ({ toast, onHide }) => {
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    // Class disesuaikan dengan globals.css: ".toast.success", bukan ".toast-success"
    return (
        <div
            className={`toast ${toast.type}`}
            role="alert"
            onClick={() => onHide(toast.id)}
        >
            <span className="toast-icon" aria-hidden="true">{icons[toast.type] || icons.info}</span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={(e) => { e.stopPropagation(); onHide(toast.id); }} aria-label="Close">
                ×
            </button>
        </div>
    );
};