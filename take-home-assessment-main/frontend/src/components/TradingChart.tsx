import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, IPriceLine } from 'lightweight-charts';
import { useRealTimeData } from '../services/useRealTimeData';
import { useTrading } from '../services/TradingContext';

interface TradingChartProps {
  symbol: string;
}

export default function TradingChart({ symbol }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const activeLinesRef = useRef<IPriceLine[]>([]);
  const previewLineRef = useRef<IPriceLine | null>(null);

  const [timeframe, setTimeframe] = useState('1s');
  const [amount, setAmount] = useState('1.0');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');

  const { stocks, crypto } = useRealTimeData();
  const { positions, openMarketOrder, openPositionManager } = useTrading(); // Použití globálních funkcí

  const item = stocks?.find(s => s.symbol === symbol) || crypto?.find(c => c.symbol === symbol);
  const symbolPositions = positions.filter(p => p.symbol === symbol);

  const currentPrice = item?.liveTicks?.length
    ? item.liveTicks[item.liveTicks.length - 1].close
    : (item?.currentPrice || 0);

  // --- VÝPOČET PRŮMĚRNÉ CENY PRO PREVIEW ---
  const currentHoldings = symbolPositions.reduce((sum, p) => sum + p.amount, 0);
  const currentWeightedValue = symbolPositions.reduce((sum, p) => sum + (p.amount * p.price), 0);
  const inputAmountNum = parseFloat(amount) || 0;
  const isAddingToPosition = currentHoldings > 0 && orderType === 'buy';

  let newAveragePrice = currentPrice;
  let priceShift = 0;
  let existingAverage = currentHoldings > 0 ? currentWeightedValue / currentHoldings : currentPrice;

  if (isAddingToPosition && inputAmountNum > 0) {
    newAveragePrice = (currentWeightedValue + (inputAmountNum * currentPrice)) / (currentHoldings + inputAmountNum);
    priceShift = newAveragePrice - existingAverage;
  } else if (currentHoldings > 0) {
    newAveragePrice = existingAverage;
  }

  // --- AKTUALIZACE LINIÍ V GRAFU ---
  const updateChartLines = () => {
    if (!seriesRef.current) return;
    const series = seriesRef.current;

    activeLinesRef.current.forEach(line => series.removePriceLine(line));
    activeLinesRef.current = [];
    if (previewLineRef.current) {
      series.removePriceLine(previewLineRef.current);
      previewLineRef.current = null;
    }

    symbolPositions.forEach((pos) => {
      const color = pos.type === 'sell' ? '#f43f5e' : '#3b82f6';
      activeLinesRef.current.push(series.createPriceLine({
        price: pos.price, color: color, lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'ENTRY'
      }));
      if (pos.sl) {
        activeLinesRef.current.push(series.createPriceLine({
          price: pos.sl, color: '#ef4444', lineWidth: 1, lineStyle: 3, axisLabelVisible: true, title: 'SL'
        }));
      }
      if (pos.tp) {
        activeLinesRef.current.push(series.createPriceLine({
          price: pos.tp, color: '#10b981', lineWidth: 1, lineStyle: 3, axisLabelVisible: true, title: 'TP'
        }));
      }
    });

    if (isAddingToPosition && inputAmountNum > 0) {
      previewLineRef.current = series.createPriceLine({
        price: newAveragePrice, color: '#fbbf24', lineWidth: 1, lineStyle: 3, axisLabelVisible: true, title: 'PREVIEW'
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

    if (timeframe === '1s' && item.liveTicks) {
      seriesRef.current.setData(item.liveTicks);
    } else if (timeframe === '1d' && item.dailyHistory) {
      const data = [...item.dailyHistory];
      if (data.length > 0) {
        const lastCandle = { ...data[data.length - 1] };
        lastCandle.close = currentPrice;
        if (currentPrice > lastCandle.high) lastCandle.high = currentPrice;
        if (currentPrice < lastCandle.low) lastCandle.low = currentPrice;
        data[data.length - 1] = lastCandle;
      }
      seriesRef.current.setData(data);
    }
    updateChartLines();
  }, [item, timeframe, positions, currentPrice, amount, orderType]);

  return (
    <div className="w-full space-y-6 text-left">
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-grow space-y-4">

          {/* HEADER */}
          <div className="flex items-center gap-4 mb-2 ml-2">
             <span className="text-2xl font-black italic dark:text-white uppercase tracking-tighter">{symbol}</span>
             <div className="flex flex-col">
               <span className={`text-lg font-mono font-bold leading-none ${item?.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                 ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
               </span>
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Live Data Feed</span>
             </div>
          </div>

          {/* ACTIVE POSITIONS LIST */}
          <div className="space-y-2">
            {symbolPositions.map((pos) => {
              const pnl = pos.amount * (currentPrice - pos.price);
              const pnlPct = (pnl / (pos.amount * pos.price)) * 100;
              return (
                <div key={pos.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col min-w-[80px]">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Holdings</span>
                      <span className="text-sm font-black dark:text-white italic leading-none mt-1">{pos.amount.toLocaleString()} {symbol}</span>
                    </div>
                    <div className="flex flex-col border-l dark:border-slate-800 pl-6">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">P/L Tracking</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-sm font-black italic leading-none ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-[9px] font-bold ${pnl >= 0 ? 'text-emerald-500/50' : 'text-rose-500/50'}`}>
                          {pnlPct.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 border-l dark:border-slate-800 pl-6 text-left">
                       <div className="flex flex-col">
                          <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest">SL</span>
                          <span className="text-[10px] font-mono font-bold dark:text-slate-400 leading-none mt-1">{pos.sl ? `$${pos.sl}` : '—'}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">TP</span>
                          <span className="text-[10px] font-mono font-bold dark:text-slate-400 leading-none mt-1">{pos.tp ? `$${pos.tp}` : '—'}</span>
                       </div>
                    </div>
                  </div>
                  {/* Tlačítko Manage nyní volá globální openPositionManager */}
                  <button
                    onClick={() => openPositionManager(pos, currentPrice)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-500 dark:text-slate-400 hover:text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                  >
                    Manage
                  </button>
                </div>
              );
            })}
          </div>

          {/* CHART AREA */}
          <div className="relative group">
            <div className="absolute top-4 left-4 z-10 flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
              {['1s', '1d'].map(tf => (
                <button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${timeframe === tf ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}>
                  {tf}
                </button>
              ))}
            </div>
            <div ref={containerRef} className="w-full h-[400px] bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-inner" />
          </div>
        </div>

        {/* SIDEBAR EXECUTION PANEL */}
        <div className="w-full xl:w-80 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl self-start sticky top-4">
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-8 border dark:border-slate-800">
            <button onClick={() => setOrderType('buy')} className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all ${orderType === 'buy' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>Buy</button>
            <button onClick={() => setOrderType('sell')} className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all ${orderType === 'sell' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}>Sell</button>
          </div>

          <div className="space-y-6 mb-8 text-left">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Market Quantity</label>
              <input
                type="number" step="0.001" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-5 text-sm font-mono dark:text-white outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800/50 space-y-3">
              <div className="flex justify-between items-center text-left">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Est. Avg Price</span>
                <span className="text-xs font-mono font-bold dark:text-white">${newAveragePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {isAddingToPosition && inputAmountNum > 0 && (
                <div className="flex justify-between items-center pt-2 border-t dark:border-slate-800/50">
                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Preview Shift</span>
                  <span className={`text-[10px] font-bold ${priceShift >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{priceShift >= 0 ? '↑' : '↓'} ${Math.abs(priceShift).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tlačítko Execute nyní volá globální openMarketOrder */}
          <button
            onClick={() => openMarketOrder(symbol, orderType, currentPrice)}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-white shadow-2xl transition-all transform active:scale-95 ${orderType === 'buy' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
          >
             Execute {orderType}
          </button>
        </div>
      </div>
    </div>
  );
}