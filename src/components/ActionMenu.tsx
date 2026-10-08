import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Ban, Flag, X, ShieldAlert } from 'lucide-react';

interface ActionMenuProps {
  petName: string;
  onBlock: () => void;
  onReport: (reason: string, details?: string) => void;
  buttonClassName?: string;
  align?: 'left' | 'right';
  iconColor?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  petName,
  onBlock,
  onReport,
  buttonClassName = '',
  align = 'right',
  iconColor = 'text-white',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Contenu inapproprié');
  const [reportDetails, setReportDetails] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleConfirmReport = (e: React.FormEvent) => {
    e.preventDefault();
    onReport(reportReason, reportDetails);
    setIsReportModalOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger Button « ⋯ » */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label={`Options et sécurité pour ${petName}`}
        title="Options (Bloquer, Signaler)"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer ${buttonClassName}`}
      >
        <MoreVertical className={`w-5 h-5 ${iconColor}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-full mt-2 z-50 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/80 p-1.5 flex flex-col gap-1 text-xs select-none ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Option 1: Bloquer */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onBlock();
            }}
            className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <Ban className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Bloquer {petName}</span>
          </button>

          {/* Option 2: Signaler */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setIsReportModalOpen(true);
            }}
            className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-amber-50 text-amber-800 font-bold flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <Flag className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Signaler ce profil</span>
          </button>
        </div>
      )}

      {/* Reporting Modal */}
      {isReportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) setIsReportModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 text-stone-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold">Signaler {petName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReport} className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-700">Motif du signalement</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Contenu inapproprié">Contenu ou photo inapproprié(e)</option>
                  <option value="Faux profil / Arnaque">Faux profil ou usurpation d'identité</option>
                  <option value="Comportement agressif">Comportement suspect ou agressif</option>
                  <option value="Maltraite animale">Maltraite animale ou danger</option>
                  <option value="Autre">Autre motif</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-700">Détails (facultatif)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Expliquez brièvement le problème..."
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
