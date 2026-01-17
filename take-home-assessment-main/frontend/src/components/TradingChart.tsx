import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { useRealTimeData } from '../services/useRealTimeData';
import { useTrading } from '../services/TradingContext';
import OrderConfirmation from './OrderConfirmation';

export default function TradingChart({ symbol }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const volumeRef = useRef<any>(null);

  const [timeframe, setTimeframe] = useState('1s');
  const [amount, setAmount] = useState('1.0');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');

  // Stav pro potvrzovací okno
  const [showConfirm, setShowConfirm] = useState(false);

  const { stocks, crypto } = useRealTimeData();
  const { placeOrder } = useTrading();

  const item = stocks?.find(s => s.symbol === symbol) || crypto?.find(c => c.symbol === symbol);
  const currentPrice = item?.liveTicks[item.liveTicks.length - 1]?.close || 0;

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
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !volumeRef.current || !item) return;
    if (timeframe === '1s') {
      seriesRef.current.setData(item.liveTicks);
      volumeRef.current.setData(item.liveTicks.map(t => ({
        time: t.time, value: t.volume,
        color: t.close >= t.open ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
      })));
    } else {
      seriesRef.current.setData(item.dailyHistory);
    }
  }, [item, timeframe]);

  const handleConfirmTrade = () => {
    placeOrder({
      symbol: symbol,
      amount: parseFloat(amount),
      price: currentPrice,
      type: orderType
    });
    setShowConfirm(false);
  };

  return (
    <div className="w-full">
      {/* POTVRZOVACÍ OKNO - Zobrazí se přes všechno */}
      <OrderConfirmation
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmTrade}
        details={{ symbol, amount: parseFloat(amount), price: currentPrice, type: orderType }}
      />

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700 shadow-sm">
              {['1s', '1d'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                    timeframe === tf ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                > {tf} </button>
              ))}
            </div>
          </div>
          <div ref={containerRef} className="w-full" />
        </div>

        {/* TERMINAL PANEL */}
        <div className="w-full xl:w-72 bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-6">
            <button
              onClick={() => setOrderType('buy')}
              className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all ${orderType === 'buy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400'}`}
            > Buy </button>
            <button
              onClick={() => setOrderType('sell')}
              className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all ${orderType === 'sell' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400'}`}
            > Sell </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase ml-2 tracking-widest">Quantity</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm font-mono mt-1 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
              />
            </div>

            <div className="flex justify-between items-center px-2">
              <span className="text-[9px] font-black text-slate-400 uppercase">Total Value</span>
              <span className="text-xs font-mono font-bold dark:text-white">${(currentPrice * parseFloat(amount || "0")).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-white transition-all transform active:scale-95 ${
              orderType === 'buy' ? 'bg-emerald-500 shadow-xl shadow-emerald-500/10' : 'bg-rose-500 shadow-xl shadow-rose-500/10'
            }`}
          > Execute {orderType} </button>
        </div>
      </div>
    </div>
  );
}