import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, IPriceLine } from 'lightweight-charts';
import { useRealTimeData } from '../services/useRealTimeData';
import { useTrading } from '../services/TradingContext';

interface TradingChartProps {
  symbol: string;
}

const getPositionColor = (id: string) => {
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#06b6d4', '#10b981', '#6366f1', '#f43f5e',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function TradingChart({ symbol }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const activeLinesRef = useRef<IPriceLine[]>([]);
  const previewLineRef = useRef<IPriceLine | null>(null);

  const [timeframe, setTimeframe] = useState('1s');
  const [amount, setAmount] = useState('1.000');
  const [limitPrice, setLimitPrice] = useState('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [execMode, setExecMode] = useState<'market' | 'limit'>('market');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLines, setShowLines] = useState(true);

  // STAVY PRO EDITACI A DIALOGY
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [tempEditPrice, setTempEditPrice] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const { stocks, crypto } = useRealTimeData();
  const { positions, pendingOrders, setPendingOrders, placeOrder, openMarketOrder, openPositionManager, openAdvancedManager } = useTrading();

  const item = stocks?.find(s => s.symbol === symbol) || crypto?.find(c => c.symbol === symbol);
  const roundTo3 = (val: number) => Math.round(val * 1000) / 1000;

  const symbolPositions = positions
    .filter(p => p.symbol === symbol)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const symbolPending = (pendingOrders || [])
    .filter((p: any) => p.symbol === symbol);

  const currentPrice = item?.liveTicks?.length
    ? item.liveTicks[item.liveTicks.length - 1].close
    : (item?.currentPrice || 0);

  useEffect(() => {
    if (execMode === 'limit' && !limitPrice && currentPrice) {
      setLimitPrice(currentPrice.toString());
    }
  }, [execMode, currentPrice]);

  const totalHoldings = roundTo3(symbolPositions.reduce((sum, p) => sum + p.amount, 0));
  const totalPL = symbolPositions.reduce((sum, p) => sum + (p.amount * (currentPrice - p.price)), 0);

  const avgEntryPrice = totalHoldings > 0
    ? symbolPositions.reduce((sum, p) => sum + (p.amount * p.price), 0) / totalHoldings
    : currentPrice;

  const inputAmountNum = parseFloat(amount) || 0;
  const isAddingToPosition = totalHoldings > 0 && orderType === 'buy';
  let newAveragePrice = avgEntryPrice;

  if (isAddingToPosition && inputAmountNum > 0) {
    newAveragePrice = ((avgEntryPrice * totalHoldings) + (currentPrice * inputAmountNum)) / (totalHoldings + inputAmountNum);
  }

  const handleSaveEdit = (id: string) => {
    const newPrice = parseFloat(tempEditPrice);
    if (isNaN(newPrice) || newPrice <= 0) return;

    setPendingOrders((prev: any) => prev.map((p: any) =>
      p.id === id ? { ...p, price: newPrice } : p
    ));
    setEditingOrderId(null);
    showToast("Order price updated successfully");
  };

  const confirmDelete = () => {
    if (!orderToDelete) return;
    setPendingOrders((prev: any) => prev.filter((x: any) => x.id !== orderToDelete.id));
    setOrderToDelete(null);
    showToast("Limit order cancelled");
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const updateChartLines = () => {
    if (!seriesRef.current) return;
    const series = seriesRef.current;
    activeLinesRef.current.forEach(line => series.removePriceLine(line));
    activeLinesRef.current = [];
    if (previewLineRef.current) {
      series.removePriceLine(previewLineRef.current);
      previewLineRef.current = null;
    }
    if (!showLines) return;

    symbolPositions.forEach((pos, index) => {
      const unitLabel = `U${index + 1}`;
      const posColor = getPositionColor(pos.id);
      activeLinesRef.current.push(series.createPriceLine({
        price: pos.price, color: posColor, lineWidth: 2, lineStyle: 0, axisLabelVisible: true, title: `${unitLabel} ENTRY`
      }));
      const rawLevels = pos.levels?.length > 0 ? pos.levels : [
        ...(pos.sl ? [{ price: pos.sl, type: 'SL' }] : []),
        ...(pos.tp ? [{ price: pos.tp, type: 'TP' }] : [])
      ];
      const sortedTPs = [...rawLevels].filter((l: any) => l.type === 'TP').sort((a: any, b: any) => a.price - b.price);
      const sortedSLs = [...rawLevels].filter((l: any) => l.type === 'SL').sort((a: any, b: any) => b.price - a.price);
      sortedTPs.forEach((l: any, i: number) => {
        activeLinesRef.current.push(series.createPriceLine({
          price: l.price, color: '#10b981', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: `${unitLabel} TP${i + 1}`
        }));
      });
      sortedSLs.forEach((l: any, i: number) => {
        activeLinesRef.current.push(series.createPriceLine({
          price: l.price, color: '#ef4444', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: `${unitLabel} SL${i + 1}`
        }));
      });
    });

    symbolPending.forEach((p: any) => {
      activeLinesRef.current.push(series.createPriceLine({
        price: p.price, color: '#f59e0b', lineWidth: 1, lineStyle: 3, axisLabelVisible: true, title: `LIMIT ${p.type.toUpperCase()}`
      }));
    });

    if (isAddingToPosition && inputAmountNum > 0 && execMode === 'market') {
      previewLineRef.current = series.createPriceLine({
        price: newAveragePrice, color: '#fbbf24', lineWidth: 1, lineStyle: 3, axisLabelVisible: true, title: 'PREVIEW AVG'
      });
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth, height: 400,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#64748b', fontSize: 11 },
      grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(241, 245, 249, 0.08)' } },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: true },
      rightPriceScale: { borderVisible: false },
    });
    seriesRef.current = chart.addCandlestickSeries({ upColor: '#10b981', downColor: '#ef4444', borderVisible: false });
    chartRef.current = chart;
    return () => chart.remove();
  }, [symbol]);

  useEffect(() => {
    if (!seriesRef.current || !item) return;
    const history = timeframe === '1s' ? item.liveTicks : item.dailyHistory;
    if (history && history.length > 0) {
      seriesRef.current.setData(history);
      if (currentPrice > 0) {
        const lastStaticBar = history[history.length - 1];
        seriesRef.current.update({
          ...lastStaticBar,
          close: currentPrice,
          high: Math.max(lastStaticBar.high, currentPrice),
          low: Math.min(lastStaticBar.low, currentPrice),
        });
      }
    }
    updateChartLines();
  }, [item, timeframe, positions, pendingOrders, currentPrice, amount, orderType, showLines, execMode]);

  const handleExecute = () => {
    if (execMode === 'market') {
      openMarketOrder(symbol, orderType, currentPrice);
    } else {
      const p = parseFloat(limitPrice);
      if (isNaN(p) || p <= 0) return;
      placeOrder({ symbol, type: orderType, amount: inputAmountNum, limitPrice: p, isLimit: true });
      showToast(`${orderType.toUpperCase()} Limit order placed`);
    }
  };

  return (
    <div className="w-full space-y-6 text-left relative">

      {/* CSS PRO SKRYTÍ ŠIPEK V INPUTECH */}
      <style dangerouslySetInnerHTML={{ __html: `
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}} />

      {/* NOTIFIKACE (TOAST) */}
      {notification && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in zoom-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">{notification}</span>
          </div>
        </div>
      )}

      {/* POTVRZOVACÍ DIALOG PRO SMAZÁNÍ */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter">Cancel Order?</h3>
                <p className="text-slate-500 text-xs font-medium mt-1">Are you sure you want to cancel this {orderToDelete.type} limit order at ${orderToDelete.price}?</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setOrderToDelete(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors">No, Keep</button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors">Yes, Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-grow space-y-4">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-2 ml-2">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-black italic dark:text-white uppercase tracking-tighter">{symbol}</span>
              <div className="flex flex-col">
                <span className={`text-lg font-mono font-bold leading-none ${item?.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5 font-mono">Real-time Feed</span>
              </div>
            </div>

            {symbolPositions.length > 0 && (
              <div className="flex gap-6 bg-slate-50 dark:bg-slate-900/50 px-6 py-2 rounded-2xl border dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Total P/L</span>
                  <span className={`text-xs font-black italic ${totalPL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {totalPL >= 0 ? '+' : ''}${Math.abs(totalPL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-400 transition-colors">
                  {isExpanded ? 'Hide' : `Show ${symbolPositions.length} Units`}
                </button>
              </div>
            )}
          </div>

          {/* POSITIONS & PENDING LIST */}
          {isExpanded && (symbolPositions.length > 0 || symbolPending.length > 0) && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">

              {/* PENDING ORDERS */}
              {symbolPending.map((p: any) => {
                const isEditing = editingOrderId === p.id;
                return (
                  <div key={p.id} className="bg-amber-500/5 border border-amber-500/20 rounded-[1.8rem] p-4 flex items-center justify-between border-l-4 border-l-amber-500">
                     <div className="flex items-center gap-5">
                        <div className="flex flex-col min-w-[65px]">
                          <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Pending Limit</span>
                          <span className="text-sm font-black dark:text-white italic leading-none mt-1">{p.amount} <span className="text-[9px] opacity-40 uppercase">{symbol}</span></span>
                        </div>
                        <div className="flex flex-col border-l border-amber-500/20 pl-5">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Trigger at</span>
                          {isEditing ? (
                            <input
                              type="number"
                              value={tempEditPrice}
                              autoFocus
                              onChange={(e) => setTempEditPrice(e.target.value)}
                              className="bg-white dark:bg-slate-800 border border-amber-500/50 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-amber-600 outline-none w-24 mt-1 appearance-none shadow-sm"
                            />
                          ) : (
                            <span className="text-sm font-mono font-bold dark:text-white leading-none mt-1">${p.price.toFixed(2)}</span>
                          )}
                        </div>
                     </div>
                     <div className="flex gap-1.5">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSaveEdit(p.id)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[7px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md">Save</button>
                            <button onClick={() => setEditingOrderId(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-xl text-[7px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingOrderId(p.id); setTempEditPrice(p.price.toString()); }}
                              className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-[7px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setOrderToDelete(p)}
                              className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-[7px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                     </div>
                  </div>
                );
              })}

              {/* ACTIVE POSITIONS */}
              {symbolPositions.map((pos, index) => {
                const pnl = pos.amount * (currentPrice - pos.price);
                const posColor = getPositionColor(pos.id);
                return (
                  <div key={pos.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.8rem] p-4 flex items-center justify-between shadow-sm border-l-4 transition-all" style={{ borderLeftColor: posColor }}>
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col min-w-[65px]">
                        <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: posColor }}>Unit #{index + 1}</span>
                        <span className="text-sm font-black dark:text-white italic leading-none mt-1">{roundTo3(pos.amount)} <span className="text-[9px] opacity-40 uppercase">{symbol}</span></span>
                      </div>
                      <div className="flex flex-col border-l dark:border-slate-800 pl-5 min-w-[85px]">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">P/L</span>
                        <span className={`text-sm font-black italic mt-1 ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>${Math.abs(pnl).toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col border-l dark:border-slate-800 pl-5">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Entry</span>
                        <span className="text-sm font-mono font-bold dark:text-white mt-1">${pos.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border dark:border-slate-800">
                      <button onClick={() => openPositionManager({ ...pos, displayIndex: index + 1, initialTab: 'add' }, currentPrice)} className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl text-[7px] font-black uppercase transition-all">Add</button>
                      <button onClick={() => openAdvancedManager({ ...pos, displayIndex: index + 1 }, currentPrice)} className="px-3 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-[7px] font-black uppercase transition-all">Manage</button>
                      <button onClick={() => openPositionManager({ ...pos, displayIndex: index + 1, initialTab: 'close' }, currentPrice)} className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-[7px] font-black uppercase transition-all">Close</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CHART AREA */}
          <div className="relative group">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <div className="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
                {['1s', '1d'].map(tf => (
                  <button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${timeframe === tf ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}>
                    {tf}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowLines(!showLines)} className={`flex items-center gap-2 px-3 py-1 rounded-xl text-[9px] font-black uppercase transition-all backdrop-blur-md border shadow-xl ${showLines ? 'bg-blue-500 text-white' : 'bg-white/80 text-slate-500'}`}>
                {showLines ? 'Lines On' : 'Lines Off'}
              </button>
            </div>
            <div ref={containerRef} className="w-full h-[400px] bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50" />
          </div>
        </div>

        {/* SIDEBAR EXECUTION */}
        <div className="w-full xl:w-80 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl self-start sticky top-4">
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-6 border dark:border-slate-800">
            <button onClick={() => setOrderType('buy')} className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all ${orderType === 'buy' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>Buy</button>
            <button onClick={() => setOrderType('sell')} className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all ${orderType === 'sell' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}>Sell</button>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1 mb-6">
            <button onClick={() => setExecMode('market')} className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg transition-all ${execMode === 'market' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-500' : 'text-slate-400'}`}>Market</button>
            <button onClick={() => setExecMode('limit')} className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg transition-all ${execMode === 'limit' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-500' : 'text-slate-400'}`}>Limit</button>
          </div>

          <div className="space-y-4 mb-8">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Quantity</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-mono dark:text-white outline-none focus:border-blue-500/50 transition-colors appearance-none" />
            </div>

            {execMode === 'limit' && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Limit Price</label>
                <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl px-6 py-4 text-sm font-mono text-amber-600 outline-none focus:border-amber-500 transition-colors appearance-none" />
              </div>
            )}
          </div>

          <button onClick={handleExecute} className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-white shadow-2xl transition-all transform active:scale-95 ${orderType === 'buy' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
             {execMode === 'limit' ? `Set ${orderType} Limit` : `Execute ${orderType}`}
          </button>
        </div>
      </div>
    </div>
  );
}