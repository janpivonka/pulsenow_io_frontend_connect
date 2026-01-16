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

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#94a3b8' },
      grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
      timeScale: { timeVisible: true, secondsVisible: true },
    });

    seriesRef.current = chart.addCandlestickSeries({
      upColor: '#10b981', downColor: '#ef4444', borderVisible: false,
      wickUpColor: '#10b981', wickDownColor: '#ef4444'
    });

    volumeRef.current = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    chart.priceScale('').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    chartRef.current = chart;

    return () => chart.remove();
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !volumeRef.current || !item) return;

    if (timeframe === '1s') {
      // Vykreslíme celou dostupnou vteřinovou historii
      seriesRef.current.setData(item.liveTicks);
      volumeRef.current.setData(item.liveTicks.map(t => ({
        time: t.time,
        value: t.volume,
        color: t.close >= t.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
      })));
    } else {
      // Denní graf s živým koncem
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
          color: d.close >= d.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
        }));
        volumeRef.current.setData(volData);
        volumeRef.current.update({
          time: lastDay.time,
          value: lastDay.volume,
          color: lastDay.close >= lastDay.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
        });
      }
    }
  }, [item, timeframe]);

  const handleTfChange = (tf) => {
    setTimeframe(tf);
    setTimeout(() => chartRef.current.timeScale().fitContent(), 50);
  };

  return (
    <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex gap-2">
          {['1s', '1d'].map(tf => (
            <button
              key={tf}
              onClick={() => handleTfChange(tf)}
              className={`px-5 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                timeframe === tf ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-slate-600 font-mono">LIVE_ENGINE_READY</div>
      </div>
      <div ref={containerRef} />
    </div>
  );
}