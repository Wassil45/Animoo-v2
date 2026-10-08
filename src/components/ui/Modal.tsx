import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full ${maxWidths[maxWidth]} bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200/80 transition-transform animate-scaleIn`}
      >
        {/* Header if title or close button */}
        {(title || showCloseButton) && (
          <div className="bg-gradient-to-r from-primary to-[#FF5E62] p-5 text-white relative">
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer la boîte de dialogue"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
            {title && <div className="text-lg font-black">{title}</div>}
            {subtitle && <p className="text-xs text-rose-100 mt-1">{subtitle}</p>}
          </div>
        )}

        {/* Modal Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
