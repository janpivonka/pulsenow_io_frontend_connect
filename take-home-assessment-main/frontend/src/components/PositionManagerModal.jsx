import React, { useState, useEffect, useRef } from 'react';
import { useTrading } from '../services/TradingContext';
import { useRealTimeData } from '../services/useRealTimeData';

// --- UNIVERZÁLNÍ POTVRZOVACÍ MODAL ---
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
        <h3 className="text-center text-sm font-black dark:text-white uppercase tracking-widest mb-2">{title}</h3>
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-6 leading-relaxed">{desc}</p>
        <div className="flex flex-col gap-2">
          <button onClick={onConfirm} className={`w-full py-4 ${isWarning ? 'bg-rose-500 shadow-rose-500/20' : 'bg-blue-600 shadow-blue-500/20'} text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg active:scale-95 transition-transform`}>
            {btnText}
          </button>
          <button onClick={onClose} className="w-full py-3 text-[9px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600">Go Back</button>
        </div>
      </div>
    </div>
  );
};

const PositionManagerModal = ({ isOpen, onClose, onConfirm, data, onOpenAdvanced }) => {
  const { closePosition, positions, updatePosition } = useTrading();
  const { stocks, crypto } = useRealTimeData();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [activeTab, setActiveTab] = useState('manage');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPartialConfirm, setShowPartialConfirm] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  const [tradeAmount, setTradeAmount] = useState(0);
  const [sliderVal, setSliderVal] = useState(0);
  const [addAmount, setAddAmount] = useState(0);
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');

  // Sledování aktuální pozice z kontextu pro realtime synchronizaci
  const currentPosFromCtx = positions.find(p => p.id === data?.id);

  useEffect(() => {
    if (isOpen && data) {
      setSl(currentPosFromCtx?.sl || '');
      setTp(currentPosFromCtx?.tp || '');
      setPosition({ x: data.initialX, y: data.initialY });

      if (data.initialTab === 'add') setActiveTab('add');
      else if (data.initialTab === 'close') setActiveTab('manage');
    }
  }, [isOpen, data?.id]); // Reagujeme jen na změnu ID nebo otevření

  const liveItem = stocks?.find(s => s.symbol === data?.symbol) || crypto?.find(c => c.symbol === data?.symbol);
  const currentPrice = liveItem?.liveTicks?.length
    ? liveItem.liveTicks[liveItem.liveTicks.length - 1].close
    : (liveItem?.currentPrice || data?.currentPrice || 0);

  if (!isOpen || !data) return null;

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const round3 = (num) => Math.round(num * 1000) / 1000;
  const buyQtyNum = parseFloat(addAmount || 0);
  const newTotalQty = (currentPosFromCtx?.amount || data.amount) + buyQtyNum;
  const newAvgPrice = newTotalQty > 0 ? (((currentPosFromCtx?.price || data.price) * (currentPosFromCtx?.amount || data.amount)) + (currentPrice * buyQtyNum)) / newTotalQty : currentPrice;
  const priceShift = newAvgPrice - (currentPosFromCtx?.price || data.price);

  const calculateRRR = () => {
    const stopLoss = parseFloat(sl);
    const takeProfit = parseFloat(tp);
    const entry = (activeTab === 'add' && buyQtyNum > 0) ? newAvgPrice : (currentPosFromCtx?.price || data.price);
    if (!stopLoss || !takeProfit || isNaN(stopLoss) || isNaN(takeProfit)) return null;
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(takeProfit - entry);
    return (risk <= 0 || reward <= 0) ? "INVALID" : round3(reward / risk);
  };

  const rrrValue = calculateRRR();
  const rrrColor = (rrrValue === "INVALID" || rrrValue < 1) ? 'text-rose-500' : 'text-emerald-500';

  const handleMainConfirm = () => {
    const sellQty = parseFloat(tradeAmount || 0);
    const finalAmount = activeTab === 'manage' ? (data.amount - sellQty) : (data.amount + buyQtyNum);

    // Vytvoření levels pole pro synchronizaci s Advanced Modalem a "Next Targets"
    const syncLevels = [];
    if (sl !== '' && !isNaN(parseFloat(sl))) {
      syncLevels.push({ id: `sl-${Date.now()}`, price: parseFloat(sl), amount: finalAmount, displayAmount: 100, type: 'SL' });
    }
    if (tp !== '' && !isNaN(parseFloat(tp))) {
      syncLevels.push({ id: `tp-${Date.now()}`, price: parseFloat(tp), amount: finalAmount, displayAmount: 100, type: 'TP' });
    }

    const fullPayload = {
      ...data,
      price: activeTab === 'add' && buyQtyNum > 0 ? newAvgPrice : (currentPosFromCtx?.price || data.price),
      amount: finalAmount,
      sl: sl !== '' ? parseFloat(sl) : null,
      tp: tp !== '' ? parseFloat(tp) : null,
      levels: syncLevels,
      operationType: activeTab === 'manage' ? 'REDUCE' : 'ADD',
      sellAmount: sellQty,
      buyAmount: buyQtyNum
    };

    if (activeTab === 'manage' && sellQty > 0) {
      setPendingOrder(fullPayload);
      setShowPartialConfirm(true);
    } else {
      onConfirm(fullPayload);
      onClose();
    }
  };

  return (
    <>
      <style>{`input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } input[type=number] { -moz-appearance: textfield; }`}</style>

      <div className="fixed z-[500] pointer-events-none" style={{ left: position.x, top: position.y }}>
        <div className={`bg-white dark:bg-slate-900 w-[280px] rounded-[2.5rem] p-6 shadow-2xl border dark:border-slate-800 pointer-events-auto transition-transform duration-200 animate-in fade-in zoom-in-95 ${isDragging ? 'scale-105 opacity-90 cursor-grabbing' : ''}`}>

          {/* HEADER */}
          <div onMouseDown={handleMouseDown} className="flex justify-between items-start mb-4 cursor-grab active:cursor-grabbing select-none text-left">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest">UNIT #{data.displayIndex || data.tradeNumber}</span>
                <h2 className="text-xl font-black dark:text-white italic uppercase tracking-tighter leading-none">{data.symbol}</h2>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Quick Execution</span>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border dark:border-slate-800">
              {['manage', 'add'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-400'}`}>
                  {tab === 'manage' ? 'Reduce' : 'Add'}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border dark:border-slate-800">
              <div className="flex justify-between items-center mb-1 text-left">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{activeTab === 'manage' ? 'Sell Qty' : 'Buy Amount'}</label>
                <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">${currentPrice.toFixed(2)}</p>
              </div>
              <input type="number" step="0.001" value={activeTab === 'manage' ? tradeAmount : addAmount} onChange={(e) => activeTab === 'manage' ? setTradeAmount(e.target.value) : setAddAmount(e.target.value)} className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 py-1 text-xl font-mono dark:text-white outline-none focus:border-blue-500 transition-colors" placeholder="0.000" />

              {activeTab === 'manage' && (
                <div className="mt-3">
                  <input type="range" min="0" max="100" step="1" value={sliderVal} onChange={(e) => {
                    const pct = parseInt(e.target.value);
                    setSliderVal(pct);
                    setTradeAmount(round3(data.amount * (pct / 100)));
                  }} className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border dark:border-slate-800">
                  <label className="text-[7px] font-black text-rose-500 uppercase block mb-1">Stop Loss</label>
                  <input type="number" step="0.01" value={sl} onChange={e => setSl(e.target.value)} className="w-full bg-transparent font-mono text-[10px] text-rose-500 outline-none" placeholder="0.00" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border dark:border-slate-800">
                  <label className="text-[7px] font-black text-emerald-500 uppercase block mb-1">Take Profit</label>
                  <input type="number" step="0.01" value={tp} onChange={e => setTp(e.target.value)} className="w-full bg-transparent font-mono text-[10px] text-emerald-500 outline-none" placeholder="0.00" />
                </div>
              </div>

              <button
                onClick={() => {
                  // Předáme aktuální stav do Advanced modalu skrze data objekt
                  onOpenAdvanced({
                    ...data,
                    initialX: position.x,
                    initialY: position.y,
                    sl: sl,
                    tp: tp
                  });
                  onClose();
                }}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-950 border dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 group hover:border-blue-500/50 transition-all"
              >
                <span className="text-[7px] font-black text-slate-400 group-hover:text-blue-500 uppercase tracking-widest italic">Open Advanced Strategy</span>
                <svg className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border dark:border-slate-800 flex justify-between items-center">
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Risk : Reward</span>
              </div>
              <div className="flex items-center font-mono font-black text-[11px] gap-1 leading-none">
                {rrrValue !== null ? (rrrValue === "INVALID" ? <span className="text-rose-500 text-[9px] animate-pulse">Invalid</span> : <span className={rrrColor}>1:{rrrValue}</span>) : <span className="text-slate-500 text-[9px]">Set SL/TP</span>}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button onClick={handleMainConfirm} className={`w-full py-4 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] text-white shadow-lg active:scale-95 transition-all ${activeTab === 'manage' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                Confirm {activeTab === 'manage' ? 'Reduce' : 'Add'}
              </button>
              <button onClick={() => setShowCancelConfirm(true)} className="w-full py-3 rounded-xl border border-rose-500/20 text-rose-500 font-black uppercase text-[8px] tracking-widest hover:bg-rose-500/5 transition-all active:scale-95">Market Exit (Full)</button>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal isOpen={showPartialConfirm} symbol={data.symbol} title="Confirm Order?" desc={`Confirm selling units for Trade #${data.displayIndex || data.tradeNumber}.`} btnText="Execute Order" isWarning={false} onClose={() => setShowPartialConfirm(false)} onConfirm={() => { if (pendingOrder) onConfirm(pendingOrder); setShowPartialConfirm(false); onClose(); }} />
      <DeleteConfirmationModal isOpen={showCancelConfirm} symbol={data.symbol} title="Market Exit?" desc="Close entire unit at market price?" btnText="Exit Position" onClose={() => setShowCancelConfirm(false)} onConfirm={() => { closePosition(data.id, currentPrice, 'FULL_CLOSE_MANUAL'); setShowCancelConfirm(false); onClose(); }} />
    </>
  );
};

export default PositionManagerModal;