import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: string; // e.g. "bg-emerald-50 text-emerald-600 border-emerald-100"
  children: React.ReactNode;
  maxWidth?: string; // e.g. "max-w-md", "max-w-lg", "max-w-xl"
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconBg = 'bg-sky-50 text-sky-600 border-sky-100',
  children,
  maxWidth = 'max-w-md'
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Card */}
      <div className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200 my-8`}>
        {/* Subtle top ambient gradient line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500"></div>

        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-center space-x-3.5">
            {icon && (
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${iconBg}`}>
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-snug tracking-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition duration-150 cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
