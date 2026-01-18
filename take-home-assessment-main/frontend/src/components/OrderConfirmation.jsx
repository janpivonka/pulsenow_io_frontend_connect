import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderConfirmation = ({ isOpen, onClose, onConfirm, details }) => {
  const navigate = useNavigate();
  const [tradeAmount, setTradeAmount] = useState(0);
  const [status, setStatus] = useState('idle');
  const [actionType, setActionType] = useState('buy');
  const [slPrice, setSlPrice] = useState('');
  const [tpPrice, setTpPrice] = useState('');
  const [sliderVal, setSliderVal] = useState(0);

  const entryPrice = details.price || 0;
  const livePrice = details.livePrice || details.price || 0;
  const maxAvailable = details.amount || 0;
  const isModifyMode = details.isLiquidate;

  useEffect(() => {
    if (isOpen) {
      if (isModifyMode) {
        setActionType('sell');
        setTradeAmount(0);
        setSliderVal(0);
      } else {
        setActionType(details.type || 'buy');
        setTradeAmount(details.amount || 0);
      }
      setSlPrice(details.sl || '');
      setTpPrice(details.tp || '');
      setStatus('idle');
    }
  }, [details, isOpen, isModifyMode]);

  if (!isOpen) return null;

  const round3 = (num) => Math.round(num * 1000) / 1000;

  const handleAmountChange = (val) => {
    let num = parseFloat(val) || 0;
    if (isModifyMode && actionType === 'sell' && num > maxAvailable) {
      num = maxAvailable;
    }
    const rounded = round3(num);
    setTradeAmount(rounded);

    if (isModifyMode && actionType === 'sell' && maxAvailable > 0) {
      setSliderVal((rounded / maxAvailable) * 100);
    }
  };

  const handleSliderChange = (pct) => {
    setSliderVal(pct);
    const calculated = round3(maxAvailable * (pct / 100));
    setTradeAmount(calculated);
  };

  const isShort = details.type === 'sell';
  const priceDiff = isShort ? (entryPrice - livePrice) : (livePrice - entryPrice);
  const currentPL = (isModifyMode && actionType === 'sell')
    ? (parseFloat(tradeAmount) || 0) * priceDiff
    : 0;

  const potentialLoss = (parseFloat(slPrice) > 0 && tradeAmount > 0)
    ? Math.abs(livePrice - parseFloat(slPrice)) * tradeAmount : 0;
  const potentialProfit = (parseFloat(tpPrice) > 0 && tradeAmount > 0)
    ? Math.abs(parseFloat(tpPrice) - livePrice) * tradeAmount : 0;
  const rrr = (potentialLoss > 0 && potentialProfit > 0) ? (potentialProfit / potentialLoss).toFixed(2) : null;

  const handleExecute = async () => {
    setStatus('processing');
    await new Promise(r => setTimeout(r, 800));
    await onConfirm({
      ...details,
      type: actionType,
      amount: round3(tradeAmount),
      sl: actionType === 'buy' ? parseFloat(slPrice) : details.sl,
      tp: actionType === 'buy' ? parseFloat(tpPrice) : details.tp,
      realizedPL: actionType === 'sell' ? currentPL : 0
    });
    setStatus('success');
  };

  // --- VYLEPŠENÝ SUCCESS SCREEN ---
  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
        <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 font-black text-2xl italic">✓</div>
          <h2 className="text-2xl font-black italic dark:text-white mb-2 uppercase tracking-tighter">Trade Executed</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">The market order was successful</p>

          <div className="space-y-3">
            <button
              onClick={() => { setStatus('idle'); onClose(); }}
              className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
            >
              Stay on Chart
            </button>
            <button
              onClick={() => { setStatus('idle'); onClose(); navigate('/portfolio'); }}
              className="w-full py-5 bg-slate-100 dark:bg-slate-800 dark:text-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Go to Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md text-left animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
             <div>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{isModifyMode ? 'Position Management' : 'New Order'}</h2>
                <p className="text-3xl font-black dark:text-white italic uppercase tracking-tighter">{details.symbol}</p>
             </div>
             {rrr && actionType === 'buy' && (
               <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl text-center">
                  <span className="text-[8px] font-black text-blue-500 uppercase block tracking-widest">RR Ratio</span>
                  <span className="text-lg font-black dark:text-blue-400">1 : {rrr}</span>
               </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border dark:border-slate-800">
            <button onClick={() => setActionType('buy')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${actionType === 'buy' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400'}`}>Open / Add</button>
            <button onClick={() => setActionType('sell')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${actionType === 'sell' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400'}`}>Close / Reduce</button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-end ml-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantity</label>
                {isModifyMode && actionType === 'sell' && (
                   <span className={`text-[11px] font-black italic ${currentPL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                     Est. P/L: {currentPL >= 0 ? '+' : ''}${currentPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                )}
              </div>
              <input
                type="number" step="0.001" value={tradeAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-2xl px-5 py-4 text-lg font-mono dark:text-white outline-none focus:ring-2 ring-blue-500/20 transition-all"
              />

              {isModifyMode && actionType === 'sell' && (
                <div className="pt-2 px-1">
                  <input
                    type="range" min="0" max="100" step="1" value={sliderVal}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-2">
                    {[0, 25, 50, 75, 100].map(pct => (
                      <button key={pct} onClick={() => handleSliderChange(pct)} className="text-[8px] font-black text-slate-400 hover:text-blue-500 uppercase">{pct}%</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {actionType === 'buy' && (
              <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-[2rem] border dark:border-slate-800 space-y-4 animate-in fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1">Stop Loss</label>
                    <input type="number" value={slPrice} onChange={(e) => setSlPrice(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-rose-500/20 rounded-xl px-4 py-3 text-sm font-mono text-rose-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">Take Profit</label>
                    <input type="number" value={tpPrice} onChange={(e) => setTpPrice(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm font-mono text-emerald-500 outline-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleExecute}
              disabled={status === 'processing' || tradeAmount <= 0}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-2xl transition-all transform active:scale-95 ${
                status === 'processing' ? 'bg-slate-400' : (actionType === 'buy' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20')
              }`}
            >
              {status === 'processing' ? 'Processing...' : (actionType === 'buy' ? 'Confirm Addition' : 'Confirm Reduction')}
            </button>
            <button onClick={onClose} className="w-full py-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;