import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string | null;
  onClose?: () => void;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  type = 'info',
  duration = 3000,
}) => {
  useEffect(() => {
    if (!message || !onClose || duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-amber-400 shrink-0" />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 inset-x-6 max-w-sm mx-auto z-50 p-3 bg-stone-900/95 backdrop-blur-md text-white rounded-2xl text-xs font-bold shadow-2xl flex items-center justify-between gap-2.5 animate-bounce"
    >
      <div className="flex items-center gap-2 min-w-0">
        {icons[type]}
        <span className="truncate">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Fermer la notification"
          className="text-stone-400 hover:text-white transition-colors cursor-pointer p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
