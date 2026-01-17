import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
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

  const [timeframe, setTimeframe] = useState('1s');
  const [amount, setAmount] = useState('1.0');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState<any>(null);

  const { stocks, crypto } = useRealTimeData();
  const { positions, placeOrder, closePosition } = useTrading();

  const item = stocks?.find(s => s.symbol === symbol) || crypto?.find(c => c.symbol === symbol);

  const currentPrice = item?.liveTicks?.length
    ? item.liveTicks[item.liveTicks.length - 1].close
    : (item?.currentPrice || 0);

  const currentPos = positions.find(p => p.symbol === symbol);
  const totalHeld = currentPos ? currentPos.amount : 0;
  const avgEntry = currentPos ? currentPos.price : 0;
  const currentPL = totalHeld * (currentPrice - avgEntry);
  const plPercent = avgEntry > 0 ? ((currentPrice - avgEntry) / avgEntry) * 100 : 0;

  const handleOpenOrder = () => {
    setConfirmDetails({
      symbol,
      amount: parseFloat(amount),
      price: currentPrice,
      type: orderType,
      isLiquidate: false
    });
    setShowConfirm(true);
  };

  const handleOpenLiquidate = () => {
    setConfirmDetails({
      symbol,
      totalHeld: totalHeld,
      amount: totalHeld,
      price: currentPrice,
      avgPrice: avgEntry,
      type: 'sell',
      isLiquidate: true
    });
    setShowConfirm(true);
  };

  const handleExecute = async (finalData: any) => {
    try {
      if (finalData.isLiquidate) {
        // DŮLEŽITÉ: Předáváme cenu pro historii v obou případech
        if (finalData.amount >= totalHeld) {
          await closePosition(symbol, finalData.price);
        } else {
          // Částečné uzavření - TradingContext by měl mít logiku pro zápis částečného prodeje do historie
          await placeOrder({
            symbol: finalData.symbol,
            amount: finalData.amount,
            price: finalData.price,
            type: 'sell'
          });
        }
      } else {
        await placeOrder(finalData);
      }
    } catch (error) {
      console.error("Execution failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(241, 245, 249, 0.08)' },
      },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: true },
      rightPriceScale: { borderVisible: false },
    });

    seriesRef.current = chart.addCandlestickSeries({
      upColor: '#10b981', downColor: '#ef4444', borderVisible: false,
      wickUpColor: '#10b981', wickDownColor: '#ef4444',
    });

    volumeRef.current = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    chart.priceScale('').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !volumeRef.current || !item) return;
    if (timeframe === '1s' && item.liveTicks) {
      seriesRef.current.setData(item.liveTicks);
      volumeRef.current.setData(item.liveTicks.map((t: any) => ({
        time: t.time,
        value: t.volume,
        color: t.close >= t.open ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
      })));
    } else if (item.dailyHistory) {
      seriesRef.current.setData(item.dailyHistory);
    }
  }, [item, timeframe]);

  return (
    <div className="w-full space-y-6">
      <OrderConfirmation
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleExecute}
        details={confirmDetails || {}}
      />

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-grow space-y-4">
          {totalHeld > 0 && (
            <div className="bg-blue-600/5 dark:bg-blue-500/5 border border-blue-500/20 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-8">
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest opacity-70">Holding</span>
                  <span className="text-base font-black dark:text-white italic">{totalHeld.toLocaleString()} {symbol}</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest opacity-70">Avg Entry</span>
                  <span className="text-base font-mono font-bold dark:text-slate-300">${avgEntry.toLocaleString()}</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest opacity-70">Unrealized P/L</span>
                  <span className={`text-base font-black italic ${currentPL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {currentPL >= 0 ? '+' : ''}${currentPL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    <span className="text-[10px] ml-1.5 opacity-60">({plPercent.toFixed(2)}%)</span>
                  </span>
                </div>
              </div>
              <button
                onClick={handleOpenLiquidate}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20"
              >
                Liquidate
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
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Quantity</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-5 text-sm font-mono dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Est. Total</span>
              <span className="text-sm font-mono font-bold dark:text-white">${(currentPrice * parseFloat(amount || "0")).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <button onClick={handleOpenOrder} className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-white transition-all transform active:scale-95 shadow-2xl ${orderType === 'buy' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
            {totalHeld > 0 ? (orderType === 'buy' ? 'Add Position' : 'Reduce Position') : `Execute ${orderType} Order`}
          </button>
        </div>
      </div>
    </div>
  );
}