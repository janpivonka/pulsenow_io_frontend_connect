import React, { useState, useEffect, useRef } from 'react';
import { useTrading } from '../services/TradingContext';
import { useRealTimeData } from '../services/useRealTimeData';

// --- NAVÁZANÝ VYLEPŠENÝ DELETE MODAL ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, symbol }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[2rem] p-6 shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-200">
        <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-rose-500 text-xl">⚠️</span>
        </div>
        <h3 className="text-center text-sm font-black dark:text-white uppercase tracking-widest mb-2">Close Position?</h3>
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-6">
          Are you sure you want to exit all {symbol} holdings at market price?
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-rose-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
          >
            Yes, Close Position
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-[9px] font-black uppercase text-slate-400 tracking-widest"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

// --- HLAVNÍ POSITION MANAGER ---
const PositionManagerModal = ({ isOpen, onClose, onConfirm, data }) => {
  const { closePosition, positions } = useTrading();
  const { stocks, crypto } = useRealTimeData();

  // --- DRAG LOGIC ---
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasInitialized = useRef(false);

  const [activeTab, setActiveTab] = useState('manage');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [tradeAmount, setTradeAmount] = useState(0);
  const [sliderVal, setSliderVal] = useState(0);
  const [addAmount, setAddAmount] = useState(0);
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');

  // --- AUTO-CLOSE & PERSISTENT POSITION LOGIC ---
  useEffect(() => {
    if (isOpen && data) {
      // 1. Kontrola, zda pozice stále existuje (pokud ne, zavři modal - SL/TP hit)
      const currentPos = positions.find(p => p.id === data.id || p.symbol === data.symbol);
      if (!currentPos) {
        onClose();
        return;
      }

      // 2. Inicializace pozice a hodnot (pouze jednou při otevření)
      if (!hasInitialized.current) {
        setTradeAmount(0); setSliderVal(0); setAddAmount(0);
        setSl(data.sl || ''); setTp(data.tp || '');
        setActiveTab('manage'); setShowCancelConfirm(false);
        setPosition({ x: window.innerWidth - 320, y: 100 });
        hasInitialized.current = true;
      }
    } else {
      hasInitialized.current = false;
    }
  }, [isOpen, data, positions, onClose]);

  // --- ŽIVÁ DATA ---
  const liveItem = stocks?.find(s => s.symbol === data?.symbol) || crypto?.find(c => c.symbol === data?.symbol);
  const currentPrice = liveItem?.liveTicks?.length
    ? liveItem.liveTicks[liveItem.liveTicks.length - 1].close
    : (liveItem?.currentPrice || data?.currentPrice || 0);

  if (!isOpen || !data) return null;

  // --- MOUSE DRAG HANDLERS ---
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
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

  // --- VÝPOČTY ---
  const round3 = (num) => Math.round(num * 1000) / 1000;
  const currentPL = (currentPrice - data.price) * (activeTab === 'manage' ? tradeAmount : 0);
  const buyQty = parseFloat(addAmount || 0);
  const newTotalQty = data.amount + buyQty;
  const newAvgPrice = ((data.price * data.amount) + (currentPrice * buyQty)) / newTotalQty;
  const priceShift = newAvgPrice - data.price;

  // --- OPRAVENÉ RRR ---
  const calculateRRR = () => {
    const stopLoss = parseFloat(sl);
    const takeProfit = parseFloat(tp);
    const entry = activeTab === 'add' ? newAvgPrice : parseFloat(data.price);
    if (!stopLoss || !takeProfit || isNaN(stopLoss) || isNaN(takeProfit)) return null;

    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(takeProfit - entry);
    if (risk <= 0 || reward <= 0) return "INVALID";
    return round3(reward / risk);
  };

  const rrrValue = calculateRRR();
  const rrrColor = (rrrValue === "INVALID" || rrrValue < 1) ? 'text-rose-500' : 'text-emerald-500';

  const handleSliderChange = (pct) => {
    const calculated = round3(data.amount * (pct / 100));
    setSliderVal(pct);
    setTradeAmount(calculated);
  };

  const handleAmountInputChange = (val) => {
    let num = parseFloat(val) || 0;
    if (num > data.amount) num = data.amount;
    const rounded = round3(num);
    setTradeAmount(rounded);
    if (data.amount > 0) setSliderVal((rounded / data.amount) * 100);
  };

  return (
    <>
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div
        className="fixed z-[200] pointer-events-none"
        style={{ left: position.x, top: position.y }}
      >
        <div className={`bg-white dark:bg-slate-900 w-[280px] rounded-[2.5rem] p-6 shadow-2xl border dark:border-slate-800 pointer-events-auto transition-transform duration-200 animate-in fade-in zoom-in-95 ${isDragging ? 'scale-105 opacity-90 cursor-grabbing' : ''}`}>

          <div
            onMouseDown={handleMouseDown}
            className="flex justify-between items-start mb-4 cursor-grab active:cursor-grabbing select-none"
          >
            <div>
               <h2 className="text-xl font-black dark:text-white italic uppercase tracking-tighter leading-none">{data.symbol}</h2>
               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Live Manager</span>
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
                <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Market: ${currentPrice.toFixed(2)}</p>
              </div>

              <input
                type="number" step="0.001"
                value={activeTab === 'manage' ? tradeAmount : addAmount}
                onChange={(e) => activeTab === 'manage' ? handleAmountInputChange(e.target.value) : setAddAmount(e.target.value)}
                className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 py-1 text-xl font-mono dark:text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="0.000"
              />

              {activeTab === 'manage' ? (
                <div className="mt-3">
                  <input type="range" min="0" max="100" step="1" value={sliderVal} onChange={(e) => handleSliderChange(parseInt(e.target.value))} className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2" />
                  <div className="flex justify-between px-1">
                    {[0, 25, 50, 75, 100].map(pct => (
                      <button key={pct} onClick={() => handleSliderChange(pct)} className="text-[7px] font-black text-slate-400 hover:text-blue-500">{pct}%</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex justify-between items-end border-t dark:border-slate-800 pt-3 text-left">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-amber-500 uppercase italic leading-none mb-1">Preview Shift</span>
                    <span className={`text-[11px] font-mono font-black ${priceShift >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {priceShift >= 0 ? '↑' : '↓'} ${Math.abs(priceShift).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[7px] font-black text-slate-400 uppercase italic leading-none mb-1">New Average</span>
                    <span className="text-[11px] font-mono font-black text-amber-500">
                      ${newAvgPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'manage' && (
                <div className="mt-3 flex justify-between items-center pt-2 border-t dark:border-slate-800 text-left">
                  <span className="text-[8px] font-black text-slate-400 uppercase">Est. P/L</span>
                  <span className={`text-[10px] font-mono font-bold ${currentPL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                     ${currentPL.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border dark:border-slate-800">
                  <label className="text-[7px] font-black text-rose-500 uppercase block mb-1">Stop Loss</label>
                  <input type="number" step="0.01" value={sl} onChange={e => setSl(e.target.value)} className="w-full bg-transparent font-mono text-[10px] text-rose-500 outline-none placeholder:text-rose-500/30" placeholder="0.00" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border dark:border-slate-800">
                  <label className="text-[7px] font-black text-emerald-500 uppercase block mb-1">Take Profit</label>
                  <input type="number" step="0.01" value={tp} onChange={e => setTp(e.target.value)} className="w-full bg-transparent font-mono text-[10px] text-emerald-500 outline-none placeholder:text-emerald-500/30" placeholder="0.00" />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border dark:border-slate-800 flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Risk : Reward</span>
                <div className="flex items-center font-mono font-black text-[11px] gap-1 leading-none">
                  {rrrValue !== null ? (
                    rrrValue === "INVALID" ? (
                      <span className="text-rose-500 text-[9px] uppercase tracking-tighter animate-pulse">Invalid Plan</span>
                    ) : (
                      <>
                        <span className="text-slate-400 font-bold">1</span>
                        <span className="text-slate-400 text-[9px]">:</span>
                        <span className={rrrColor}>{rrrValue}</span>
                      </>
                    )
                  ) : (
                    <span className="text-slate-500 text-[9px] uppercase tracking-tighter font-bold">Set SL & TP</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onConfirm({ symbol: data.symbol, id: data.id, amount: activeTab === 'manage' ? tradeAmount : parseFloat(addAmount), price: currentPrice, type: activeTab === 'manage' ? 'sell' : 'buy', sl: sl ? parseFloat(sl) : null, tp: tp ? parseFloat(tp) : null })}
                className={`w-full py-4 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] text-white shadow-lg active:scale-95 transition-all ${activeTab === 'manage' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}
              >
                Confirm Changes
              </button>

              <button onClick={() => setShowCancelConfirm(true)} className="w-full py-3 rounded-xl border border-rose-500/20 text-rose-500 font-black uppercase text-[8px] tracking-widest hover:bg-rose-500/5 transition-all active:scale-95">
                Market Exit (Full)
              </button>

              <button onClick={onClose} className="w-full py-2 text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] hover:text-slate-600 mt-0.5">
                Cancel / Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showCancelConfirm}
        symbol={data.symbol}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          closePosition(data.id || data.symbol, currentPrice, 'FULL_CLOSE_MANUAL');
          setShowCancelConfirm(false); // Zavře potvrzovací modal
          onClose();            // Zavře hlavní manager
        }}
      />
    </>
  );
};

export default PositionManagerModal;