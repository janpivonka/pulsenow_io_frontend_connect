import React from 'react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, symbol }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[2rem] p-6 shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-200">
        <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          {/* Ikona koše nebo varování pro lepší UX */}
          <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="text-center text-sm font-black dark:text-white uppercase tracking-widest mb-2">Close {symbol} Position?</h3>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-6 leading-relaxed">
          Are you sure you want to exit all holdings at market price?<br/>
          <span className="text-rose-500/60 font-black italic">This action is irreversible.</span>
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-rose-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
          >
            Confirm Market Exit
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-[9px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 dark:hover:text-slate-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;