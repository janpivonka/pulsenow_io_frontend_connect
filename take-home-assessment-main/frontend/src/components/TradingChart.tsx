import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { useRealTimeData } from '../services/useRealTimeData';

export default function TradingChart({ symbol }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const volumeRef = useRef(null);
  const [timeframe, setTimeframe] = useState('1s');

  const { stocks, crypto } = useRealTimeData();
  const item = stocks?.find(s => s.symbol === symbol) || crypto?.find(c => c.symbol === symbol);

  // 1. INICIALIZACE GRAFU
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 450,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b', // slate-500
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(241, 245, 249, 0.08)' },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      handleScale: { axisPressedMouseMove: true },
      handleScroll: { mouseWheel: true },
    });

    seriesRef.current = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    volumeRef.current = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '', // Overlay režim
    });

    chart.priceScale('').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;

    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // 2. AKTUALIZACE DAT
  useEffect(() => {
    if (!seriesRef.current || !volumeRef.current || !item) return;

    if (timeframe === '1s') {
      seriesRef.current.setData(item.liveTicks);
      volumeRef.current.setData(item.liveTicks.map(t => ({
        time: t.time,
        value: t.volume,
        color: t.close >= t.open ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
      })));
    } else {
      const history = [...item.dailyHistory];
      const lastTick = item.liveTicks[item.liveTicks.length - 1];

      if (lastTick) {
        const lastDay = { ...history[history.length - 1] };
        lastDay.close = lastTick.close;
        lastDay.high = Math.max(lastDay.high, lastTick.close);
        lastDay.low = Math.min(lastDay.low, lastTick.close);

        seriesRef.current.setData(history.slice(0, -1));
        seriesRef.current.update(lastDay);

        const volData = history.slice(0, -1).map(d => ({
          time: d.time,
          value: d.volume,
          color: d.close >= d.open ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
        }));
        volumeRef.current.setData(volData);
        volumeRef.current.update({
          time: lastDay.time,
          value: lastDay.volume,
          color: lastDay.close >= lastDay.open ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
        });
      }
    }
  }, [item, timeframe]);

  const handleTfChange = (tf) => {
    setTimeframe(tf);
    setTimeout(() => chartRef.current.timeScale().fitContent(), 100);
  };

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-slate-800 shadow-2xl relative overflow-hidden group">
      {/* Vizuální akcent na pozadí */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Ovládací panel grafu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10 px-2">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            {['1s', '1d'].map(tf => (
              <button
                key={tf}
                onClick={() => handleTfChange(tf)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Live Feed</span>
            <span className="text-[9px] font-mono text-emerald-500 font-bold animate-pulse uppercase">Network Connected</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Pulse Engine v3</span>
        </div>
      </div>

      {/* Kontejner pro graf */}
      <div
        ref={containerRef}
        className="w-full relative z-10 rounded-xl overflow-hidden"
      />

      {/* Legenda pod grafem */}
      <div className="mt-4 flex justify-between items-center px-4">
        <div className="flex gap-4">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Bullish Signal</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Bearish Signal</span>
           </div>
        </div>
      </div>
    </div>
  );
}