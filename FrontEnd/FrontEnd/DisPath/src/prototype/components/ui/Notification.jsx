import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export const Notification = ({
                                 type,
                                 message,
                                 isVisible,
                                 onClose,
                                 autoClose = true,
                             }) => {
    useEffect(() => {
        if (isVisible && autoClose) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoClose, onClose]);

    if (!isVisible) return null;

    const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertCircle,
    };

    const colors = {
        success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        warning: 'bg-amber-50 text-amber-800 border-amber-200',
    };

    const Icon = icons[type];

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${colors[type]} flex items-center gap-3 min-w-80 animate-in slide-in-from-right duration-300`}>
            <Icon size={20} />
            <span className="flex-1">{message}</span>
            <button
                onClick={onClose}
                className="text-current hover:opacity-70 transition-opacity"
            >
                <X size={16} />
            </button>
        </div>
    );
};