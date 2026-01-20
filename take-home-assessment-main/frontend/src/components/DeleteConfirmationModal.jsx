import React from 'react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, symbol, title, desc, btnText, isWarning = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[2rem] p-6 shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-200">
        <div className={`w-12 h-12 ${isWarning ? 'bg-rose-500/10' : 'bg-blue-500/10'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <svg className={`w-6 h-6 ${isWarning ? 'text-rose-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-center text-sm font-black dark:text-white uppercase tracking-widest mb-2">{title || `Update ${symbol}?`}</h3>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-6 leading-relaxed">
          {desc}
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className={`w-full py-4 ${isWarning ? 'bg-rose-500 shadow-rose-500/20' : 'bg-blue-600 shadow-blue-500/20'} text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg active:scale-95 transition-transform`}
          >
            {btnText || 'Confirm'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-[9px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;