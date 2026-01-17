import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, IPriceLine } from 'lightweight-charts';
import { useRealTimeData } from '../services/useRealTimeData';
import { useTrading } from '../services/TradingContext';
import OrderConfirmation from './OrderConfirmation';

interface TradingChartProps {
  symbol: string;
}

export default function TradingChart({ symbol }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const entryLineRef = useRef<IPriceLine | null>(null);
  const slLineRef = useRef<IPriceLine | null>(null);
  const tpLineRef = useRef<IPriceLine | null>(null);

  const [timeframe, setTimeframe] = useState('1s');
  const [amount, setAmount] = useState('1.0');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState<any>(null);

  const { stocks, crypto } = useRealTimeData();
  const { positions, placeOrder, closePosition } = useTrading();

  const item = stocks?.find(s => s.symbol === symbol) || crypto?.find(c => c.symbol === symbol);
  const currentPos = positions.find(p => p.symbol === symbol);

  const currentPrice = item?.liveTicks?.length
    ? item.liveTicks[item.liveTicks.length - 1].close
    : (item?.currentPrice || 0);

  const totalHeld = currentPos ? currentPos.amount : 0;
  const avgEntry = currentPos ? currentPos.price : 0;
  const unrealizedPL = totalHeld * (currentPrice - avgEntry);
  const plPercent = avgEntry > 0 ? ((currentPrice - avgEntry) / avgEntry) * 100 : 0;

  const inputAmount = parseFloat(amount) || 0;
  const projectedAvgPrice = (orderType === 'buy' && totalHeld > 0)
    ? ((avgEntry * totalHeld) + (currentPrice * inputAmount)) / (totalHeld + inputAmount)
    : avgEntry;

  const updateChartLines = () => {
    if (!seriesRef.current) return;
    const series = seriesRef.current;
    const drawLine = (ref: React.MutableRefObject<IPriceLine | null>, price: number | undefined | null, options: any) => {
      if (ref.current) { series.removePriceLine(ref.current); ref.current = null; }
      if (price && price > 0) {
        ref.current = series.createPriceLine({ lineWidth: 2, lineStyle: 2, axisLabelVisible: true, price: price, ...options });
      }
    };
    drawLine(entryLineRef, avgEntry, { color: '#3b82f6', title: 'ENTRY' });
    drawLine(slLineRef, currentPos?.sl, { color: '#ef4444', title: 'STOP LOSS' });
    drawLine(tpLineRef, currentPos?.tp, { color: '#10b981', title: 'TAKE PROFIT' });
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
    volumeRef.current = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: '' });
    chartRef.current = chart;
    return () => { chart.remove(); chartRef.current = null; seriesRef.current = null; };
  }, [symbol]);

  useEffect(() => {
    if (!seriesRef.current || !item) return;
    if (timeframe === '1s' && item.liveTicks) { seriesRef.current.setData(item.liveTicks); }
    else if (item.dailyHistory) { seriesRef.current.setData(item.dailyHistory); }
    const timer = setTimeout(updateChartLines, 50);
    return () => clearTimeout(timer);
  }, [item, timeframe, currentPos, symbol]);

  const handleOpenOrder = () => {
    setConfirmDetails({
      symbol, amount: inputAmount, price: currentPrice, type: orderType,
      isLiquidate: false, sl: currentPos?.sl, tp: currentPos?.tp
    });
    setShowConfirm(true);
  };

  const handleOpenModify = () => {
    setConfirmDetails({
      symbol,
      totalHeld,
      amount: 0,
      price: currentPrice,
      avgPrice: avgEntry,
      sl: currentPos?.sl,
      tp: currentPos?.tp,
      type: 'buy',
      isLiquidate: true
    });
    setShowConfirm(true);
  };

  const handleExecute = async (finalData: any) => {
    if (finalData.type === 'sell' && finalData.amount >= totalHeld && totalHeld > 0) {
      await closePosition(symbol, finalData.price);
    } else {
      await placeOrder(finalData);
    }
  };

  return (
    <div className="w-full space-y-6 text-left">
      <OrderConfirmation isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleExecute} details={confirmDetails || {}} />
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-grow space-y-4">
          {totalHeld > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm animate-in slide-in-from-top duration-500">
              <div className="flex items-center gap-10">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Position</span>
                  <span className="text-base font-black dark:text-white italic">{totalHeld.toLocaleString()} {symbol}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Unrealized P/L</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-lg font-black italic ${unrealizedPL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {unrealizedPL >= 0 ? '+' : ''}${Math.abs(unrealizedPL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-[10px] font-bold ${unrealizedPL >= 0 ? 'text-emerald-500/50' : 'text-rose-500/50'}`}>
                      {plPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-6 border-l dark:border-slate-800 pl-10 ml-2">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">SL</span>
                      <span className="text-xs font-mono font-bold dark:text-slate-400">{currentPos?.sl ? `$${currentPos.sl}` : 'None'}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">TP</span>
                      <span className="text-xs font-mono font-bold dark:text-slate-400">{currentPos?.tp ? `$${currentPos.tp}` : 'None'}</span>
                   </div>
                </div>
              </div>
              <button onClick={handleOpenModify} className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
                Modify Position
              </button>
            </div>
          )}
          <div ref={containerRef} className="w-full h-[400px] bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-inner" />
        </div>
        <div className="w-full xl:w-80 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl self-start">
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-8 border dark:border-slate-800">
            <button onClick={() => setOrderType('buy')} className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all ${orderType === 'buy' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>Buy</button>
            <button onClick={() => setOrderType('sell')} className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all ${orderType === 'sell' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}>Sell</button>
          </div>
          <div className="space-y-6 mb-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Quantity</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-5 text-sm font-mono dark:text-white focus:outline-none" />
            </div>
          </div>
          <button onClick={handleOpenOrder} className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-white transition-all transform active:scale-95 shadow-2xl ${orderType === 'buy' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
             {totalHeld > 0 ? (orderType === 'buy' ? 'Add' : 'Reduce') : `Execute ${orderType}`}
          </button>
        </div>
      </div>
    </div>
  );
}