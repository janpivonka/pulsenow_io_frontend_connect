import React from 'react';

const OrderConfirmation = ({ isOpen, onClose, onConfirm, details }) => {
  if (!isOpen) return null;

  const isBuy = details.type === 'buy';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl scale-in-center transition-all">
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isBuy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            <span className="text-2xl font-black">{isBuy ? '↑' : '↓'}</span>
          </div>

          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Confirm Execution</h2>

          <div className="py-4">
            <p className="text-2xl font-black dark:text-white italic uppercase tracking-tighter">
              {isBuy ? 'Purchase' : 'Sell'} {details.amount} {details.symbol}
            </p>
            <p className="text-sm font-bold text-slate-400 mt-1">
              at ${details.price?.toLocaleString()} per unit
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Total Value</span>
              <span className="text-blue-600 dark:text-blue-400 text-sm">
                ${(details.amount * details.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-xl transition-all active:scale-95 ${
                isBuy ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'
              }`}
            >
              Authorize Transaction
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;