import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderConfirmation = ({ isOpen, onClose, onConfirm, details }) => {
  const navigate = useNavigate();
  const [tradeAmount, setTradeAmount] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | processing | success
  const [actionType, setActionType] = useState('buy');

  const [slPrice, setSlPrice] = useState('');
  const [tpPrice, setTpPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTradeAmount(details.amount || 0);
      setSlPrice(details.sl || '');
      setTpPrice(details.tp || '');
      setActionType(details.type || 'buy');
      setStatus('idle');
    }
  }, [details, isOpen]);

  if (!isOpen) return null;

  // --- VÝPOČTY RRR A RIZIKA ---
  const currentPrice = details.price;
  const parsedAmount = parseFloat(tradeAmount) || 0;
  const parsedSL = parseFloat(slPrice);
  const parsedTP = parseFloat(tpPrice);

  // Výpočet rizika a zisku v dolarech
  const potentialLoss = (parsedSL > 0 && parsedAmount > 0)
    ? Math.abs(currentPrice - parsedSL) * parsedAmount
    : 0;

  const potentialProfit = (parsedTP > 0 && parsedAmount > 0)
    ? Math.abs(parsedTP - currentPrice) * parsedAmount
    : 0;

  // Výpočet Risk Reward Ratio (RRR)
  const rrr = (potentialLoss > 0 && potentialProfit > 0)
    ? (potentialProfit / potentialLoss).toFixed(2)
    : null;

  const isModifyMode = details.isLiquidate;

  const handleExecute = async () => {
    try {
      setStatus('processing');
      await new Promise(resolve => setTimeout(resolve, 800));
      await onConfirm({
        ...details,
        type: actionType,
        amount: parsedAmount,
        sl: parsedSL || null,
        tp: parsedTP || null
      });
      setStatus('success');
    } catch (err) {
      setStatus('idle');
    }
  };

  // --- SUCCESS STATE VIEW ---
  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl scale-in-center">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-black italic dark:text-white mb-2 uppercase tracking-tighter">Order Placed</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Transaction confirmed by core</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { navigate('/portfolio'); onClose(); }}
              className="w-full py-5 bg-slate-900 dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-[1.02] transition-transform"
            >
              View Portfolio
            </button>

            <button
              onClick={() => {
                setStatus('idle'); // Reset stavu pro příští otevření
                onClose();        // Zavření modálu
              }}
              className="w-full py-4 bg-transparent border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Stay on Terminal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN FORM VIEW ---
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <div className="text-center space-y-6">
          <div className="flex justify-between items-start">
             <div className="text-left">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{isModifyMode ? 'Modify Position' : 'Trade Confirmation'}</h2>
                <p className="text-3xl font-black dark:text-white italic uppercase tracking-tighter">{details.symbol}</p>
             </div>
             {rrr && (
               <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl text-center">
                  <span className="text-[8px] font-black text-blue-500 uppercase block">RR Ratio</span>
                  <span className="text-lg font-black dark:text-blue-400">1 : {rrr}</span>
               </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border dark:border-slate-800">
            <button onClick={() => setActionType('buy')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${actionType === 'buy' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400'}`}>Open / Add</button>
            <button onClick={() => setActionType('sell')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${actionType === 'sell' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400'}`}>Close / Reduce</button>
          </div>

          <div className="grid grid-cols-1 gap-5 text-left">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Order Quantity</label>
              <input type="number" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-2xl px-5 py-4 text-base font-mono dark:text-white focus:outline-none" />
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[2rem] border dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1 flex justify-between">
                    Stop Loss <span>{potentialLoss > 0 && `-$${potentialLoss.toLocaleString()}`}</span>
                  </label>
                  <input type="number" placeholder="None" value={slPrice} onChange={(e) => setSlPrice(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-rose-500/20 rounded-xl px-4 py-3 text-sm font-mono text-rose-500 focus:outline-none focus:border-rose-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1 flex justify-between">
                    Take Profit <span>{potentialProfit > 0 && `+$${potentialProfit.toLocaleString()}`}</span>
                  </label>
                  <input type="number" placeholder="None" value={tpPrice} onChange={(e) => setTpPrice(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm font-mono text-emerald-500 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              {rrr && (
                <div className="pt-2">
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-rose-500" style={{ width: `${100 / (1 + parseFloat(rrr))}%` }} />
                    <div className="h-full bg-emerald-500" style={{ width: `${(parseFloat(rrr) * 100) / (1 + parseFloat(rrr))}%` }} />
                  </div>
                  <p className="text-[8px] font-black text-slate-400 uppercase mt-2 text-center tracking-widest">Risk vs Reward Distribution</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleExecute}
              disabled={status === 'processing'}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] text-white shadow-2xl transition-all ${
                status === 'processing' ? 'bg-slate-400 animate-pulse' :
                (actionType === 'buy' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-600/20')
              }`}
            >
              {status === 'processing' ? 'Processing...' : 'Confirm Transaction'}
            </button>
            <button onClick={onClose} className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;