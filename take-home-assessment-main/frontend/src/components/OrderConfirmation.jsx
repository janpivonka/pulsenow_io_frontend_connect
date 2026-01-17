import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderConfirmation = ({ isOpen, onClose, onConfirm, details }) => {
  const navigate = useNavigate();
  const [tradeAmount, setTradeAmount] = useState(details.amount || 0);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (isOpen) {
      setTradeAmount(details.amount);
      setStatus('idle');
    }
  }, [details.amount, isOpen]);

  if (!isOpen) return null;

  const isLiquidate = details.isLiquidate;
  const isBuy = details.type === 'buy';
  const realizedPL = (details.price - (details.avgPrice || 0)) * tradeAmount;

  const handleExecute = async () => {
    try {
      setStatus('processing');
      await new Promise(resolve => setTimeout(resolve, 800));
      // Zde posíláme aktuální tradeAmount (z inputu/slideru) a aktuální cenu pro historii
      await onConfirm({ ...details, amount: parseFloat(tradeAmount), price: details.price });
      setStatus('success');
    } catch (err) {
      console.error("Order failed", err);
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black italic dark:text-white mb-2 uppercase tracking-tight">Confirmed</h2>
          <p className="text-slate-500 text-[10px] mb-8 font-black uppercase tracking-widest opacity-60">Trade recorded in history</p>
          <div className="space-y-3">
            <button
              onClick={() => { navigate('/portfolio'); onClose(); }}
              className="w-full py-4 bg-slate-900 dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:opacity-90 transition-all"
            >
              View History & Portfolio
            </button>
            <button onClick={onClose} className="w-full py-3 text-slate-400 font-black uppercase text-[9px] tracking-widest">Back to Terminal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl scale-in-center transition-all">
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            status === 'processing' ? 'bg-slate-100 dark:bg-slate-800 animate-pulse' :
            isLiquidate ? 'bg-amber-500/10 text-amber-500' :
            (isBuy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')
          }`}>
            <span className="text-2xl font-black">
              {status === 'processing' ? '...' : (isLiquidate ? '◒' : (isBuy ? '↑' : '↓'))}
            </span>
          </div>

          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
             {isLiquidate ? 'Position Exit' : 'Execution Details'}
          </h2>

          <p className="text-2xl font-black dark:text-white italic uppercase tracking-tighter">
            {isLiquidate ? 'Liquidate Position' : `${details.type} ${details.symbol}`}
          </p>

          {isLiquidate ? (
            <div className="space-y-4 py-2 text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contracts to close</label>
                   <span className="text-[10px] font-bold dark:text-white font-mono">{tradeAmount} / {details.totalHeld}</span>
                </div>

                {/* ČÍSELNÝ INPUT PRO PŘESNÉ ZADÁNÍ */}
                <input
                  type="number"
                  value={tradeAmount}
                  max={details.totalHeld}
                  min={0}
                  onChange={(e) => setTradeAmount(Math.min(parseFloat(e.target.value || "0"), details.totalHeld))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-mono dark:text-white focus:outline-none"
                />

                <input
                  type="range" min="0" max={details.totalHeld} step={details.totalHeld / 100}
                  value={tradeAmount} onChange={(e) => setTradeAmount(parseFloat(e.target.value))}
                  disabled={status === 'processing'}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-30"
                />
              </div>

              <div className={`p-4 rounded-2xl border-2 ${realizedPL >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Realized P/L</span>
                  <span className={`font-mono font-black ${realizedPL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {realizedPL >= 0 ? '+' : ''}${realizedPL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-[8px] text-right font-bold text-slate-400 mt-1 uppercase">Exit Price: ${details.price?.toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <span>Total Execution Value</span>
                <span className="text-sm dark:text-white font-mono font-bold">
                  ${(details.amount * details.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleExecute}
              disabled={status === 'processing' || tradeAmount <= 0}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-xl transition-all active:scale-95 ${
                status === 'processing' ? 'bg-slate-400 animate-pulse' :
                isLiquidate ? 'bg-amber-500 shadow-amber-500/20' : (isBuy ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20')
              }`}
            >
              {status === 'processing' ? 'Processing...' : (isLiquidate ? `Confirm Exit (${tradeAmount})` : 'Authorize Trade')}
            </button>
            {status !== 'processing' && (
              <button onClick={onClose} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;