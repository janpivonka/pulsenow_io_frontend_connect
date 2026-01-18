import React, { useState } from 'react';

const MarketOrderModal = ({ isOpen, onClose, onConfirm, data }) => {
  const [amount, setAmount] = useState('1.0');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      symbol: data.symbol,
      amount: parseFloat(amount),
      price: data.price,
      type: data.type, // 'buy' nebo 'sell' (pro short)
      sl: sl ? parseFloat(sl) : null,
      tp: tp ? parseFloat(tp) : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-200">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">New Market Entry</h2>
        <div className="flex justify-between items-baseline mb-6">
          <p className="text-3xl font-black dark:text-white italic uppercase tracking-tighter">{data.symbol}</p>
          <p className="font-mono font-bold text-blue-500">${data.price.toLocaleString()}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-2xl px-5 py-4 text-lg font-mono dark:text-white outline-none focus:ring-2 ring-blue-500/20" />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800">
            <div>
              <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1">Stop Loss</label>
              <input type="number" value={sl} onChange={e => setSl(e.target.value)} placeholder="None" className="w-full bg-transparent border-b border-rose-500/20 py-2 font-mono text-rose-500 outline-none" />
            </div>
            <div>
              <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">Take Profit</label>
              <input type="number" value={tp} onChange={e => setTp(e.target.value)} placeholder="None" className="w-full bg-transparent border-b border-emerald-500/20 py-2 font-mono text-emerald-500 outline-none" />
            </div>
          </div>

          <button onClick={handleConfirm} className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl ${data.type === 'buy' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
            Open {data.type === 'buy' ? 'Long' : 'Short'} Position
          </button>
          <button onClick={onClose} className="w-full py-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default MarketOrderModal;