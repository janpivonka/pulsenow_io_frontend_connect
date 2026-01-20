import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTrading } from '../services/TradingContext';
import { useRealTimeData } from '../services/useRealTimeData';
import TradeSuccessModal from './TradeSuccessModal';

const AdvancedPositionModal = ({ isOpen, onClose, onConfirm, data }) => {
  const { positions } = useTrading();
  const { stocks, crypto } = useRealTimeData();

  // Reference pro plynulý pohyb mimo hlavní React render cyklus
  const modalRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasInitialized = useRef(false);

  const [levels, setLevels] = useState([]);
  const [amount, setAmount] = useState('100');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const liveItem = stocks?.find(s => s.symbol === data?.symbol) || crypto?.find(c => c.symbol === data?.symbol);
  const currentPrice = liveItem?.liveTicks?.length
    ? liveItem.liveTicks[liveItem.liveTicks.length - 1].close
    : (liveItem?.currentPrice || data?.currentPrice || 0);

  // --- PLYNULÝ POHYB (DOM Manipulace místo State) ---
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    isDraggingRef.current = true;
    dragOffset.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y
    };
    modalRef.current.style.transition = 'none'; // Vypne animace během tažení
    modalRef.current.style.cursor = 'grabbing';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !modalRef.current) return;

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      posRef.current = { x: newX, y: newY };

      // Použijeme transform pro maximální plynulost (využívá GPU)
      modalRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current && modalRef.current) {
        isDraggingRef.current = false;
        modalRef.current.style.cursor = 'grab';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // --- INICIALIZACE ---
  useEffect(() => {
    if (isOpen && data && !hasInitialized.current) {
      const currentPos = positions.find(p => p.id === data.id) || data;
      let initialLevels = [...(currentPos.levels || [])];

      if (initialLevels.length === 0) {
        if (data.sl) initialLevels.push({ id: `sl-${Date.now()}`, price: parseFloat(data.sl), amount: currentPos.amount, displayAmount: 100, type: 'SL' });
        if (data.tp) initialLevels.push({ id: `tp-${Date.now()}`, price: parseFloat(data.tp), amount: currentPos.amount, displayAmount: 100, type: 'TP' });
      }

      setLevels(initialLevels.sort((a, b) => b.price - a.price));
      setPrice(currentPrice.toFixed(2));

      // Nastavení startovní pozice
      const startX = data.initialX || (window.innerWidth / 2 - 140);
      const startY = data.initialY || 150;
      posRef.current = { x: startX, y: startY };

      if (modalRef.current) {
        modalRef.current.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
      }

      hasInitialized.current = true;
    }

    if (!isOpen) {
      hasInitialized.current = false;
    }
  }, [isOpen, data, currentPrice]);

  const handleAddOrUpdate = (type) => {
    const priceNum = parseFloat(price);
    if (!priceNum) return;

    const newLevel = {
      id: editingId || Date.now(),
      price: priceNum,
      amount: (data.amount * (parseFloat(amount) / 100)),
      displayAmount: parseFloat(amount),
      type: type
    };

    if (editingId) {
      setLevels(prev => prev.map(l => l.id === editingId ? newLevel : l).sort((a, b) => b.price - a.price));
      setEditingId(null);
    } else {
      setLevels(prev => [...prev, newLevel].sort((a, b) => b.price - a.price));
    }
  };

  const handleFinalSave = () => {
    const finalSl = levels.find(l => l.type === 'SL' && l.displayAmount === 100)?.price || null;
    const finalTp = levels.find(l => l.type === 'TP' && l.displayAmount === 100)?.price || null;

    onConfirm({ ...data, levels, sl: finalSl, tp: finalTp });
    setSuccessData([{ symbol: data.symbol, type: `Strategy Updated`, pl: 0 }]);
  };

  if (!isOpen || !data) return null;

  return (
    <>
      {/* Wrapper s nulovými souřadnicemi, pozici řeší transform v modalRef */}
      <div
        ref={modalRef}
        className={`fixed top-0 left-0 z-[510] pointer-events-none select-none ${successData ? 'opacity-0 scale-95' : 'opacity-100'} transition-[opacity,scale] duration-300`}
        style={{ willChange: 'transform' }}
      >
        <div className="bg-white dark:bg-slate-900 w-[280px] rounded-[2.5rem] p-6 shadow-2xl border dark:border-slate-800 pointer-events-auto">

          {/* HEADER - Tady začíná drag */}
          <div onMouseDown={handleMouseDown} className="flex justify-between items-start mb-4 cursor-grab active:cursor-grabbing text-left">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest">STRATEGY #{data.displayIndex || data.tradeNumber}</span>
                <h2 className="text-xl font-black dark:text-white italic uppercase tracking-tighter leading-none">{data.symbol}</h2>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 block italic">Advanced Planning</span>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border transition-colors ${editingId ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'}`}>
              <div className="flex justify-between items-center mb-1 text-left">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{editingId ? 'Editing Level' : 'Target Price'}</label>
                <p className="text-[8px] text-blue-500 font-bold tracking-tighter">${currentPrice.toFixed(2)}</p>
              </div>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 py-1 text-xl font-mono dark:text-white outline-none focus:border-blue-500 transition-colors" />
              <div className="mt-4 flex gap-1.5">
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} onClick={() => setAmount(pct.toString())} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black transition-all ${amount === pct.toString() ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border dark:border-slate-700'}`}>{pct}%</button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleAddOrUpdate('TP')} className="flex-1 bg-emerald-500 py-3 rounded-xl text-white font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">{editingId ? 'Update' : 'Add Profit'}</button>
              <button onClick={() => handleAddOrUpdate('SL')} className="flex-1 bg-rose-500 py-3 rounded-xl text-white font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">{editingId ? 'Update' : 'Add Stop'}</button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-800 overflow-hidden">
              <div className="max-h-[120px] overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
                {levels.map(l => (
                  <div key={l.id} onClick={() => setEditingId(l.id) || setPrice(l.price.toString()) || setAmount(l.displayAmount.toString())} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${editingId === l.id ? 'bg-blue-100/50 dark:bg-blue-900/20 border-blue-400' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-4 rounded-full ${l.type === 'TP' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div className="flex flex-col text-left">
                        <span className="dark:text-white font-mono font-black text-[10px] leading-none">${l.price}</span>
                        <span className="text-[7px] font-bold text-slate-400 uppercase mt-1">{l.displayAmount}%</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setLevels(levels.filter(x => x.id !== l.id)); }} className="text-slate-300 hover:text-rose-500 font-bold text-xs p-1">×</button>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleFinalSave} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">Confirm Strategy</button>
          </div>
        </div>
      </div>
      <TradeSuccessModal isOpen={!!successData} data={successData} onClose={onClose} />
    </>
  );
};

export default AdvancedPositionModal;