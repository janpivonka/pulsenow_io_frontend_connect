import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TradingChart from "./TradingChart";
import { useRealTimeData } from "../services/useRealTimeData";

const Modal = ({ item: initialItem, type: initialType, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { stocks = [], crypto = [] } = useRealTimeData();

  const [activeItem, setActiveItem] = useState(initialItem);
  const [activeType, setActiveType] = useState(initialType);

  useEffect(() => {
    setActiveItem(initialItem);
    setActiveType(initialType);
  }, [initialItem, initialType]);

  const allAssets = [...stocks, ...crypto];
  const isAsset = activeType === 'asset';
  const liveAsset = isAsset
    ? allAssets.find(s => s.symbol === activeItem?.symbol) || activeItem
    : null;

  if (!activeItem) return null;

  const getChangeColor = (value) => (value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400");
  const getArrowSymbol = (value) => (value >= 0 ? "▲" : "▼");

  const handleAssetClick = (symbol) => {
    const asset = allAssets.find(a => a.symbol === symbol);
    if (asset) {
      setActiveItem(asset);
      setActiveType('asset');
    }
  };

  const goToAlerts = () => {
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (location.pathname !== '/alerts') navigate('/alerts');
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-end md:items-center justify-center z-[100] p-0 md:p-4 transition-all"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-900 rounded-t-[2.5rem] md:rounded-[3rem] w-full max-w-6xl shadow-2xl flex flex-col h-[92vh] md:max-h-[90vh] overflow-hidden border-t md:border border-white/10 dark:border-slate-800 transition-colors"
      >
        {/* TOP NAV BAR - Kompaktnější na mobilu */}
        <div className="flex justify-between items-center px-6 md:px-10 py-4 md:py-6 border-b border-slate-50 dark:border-slate-800 shrink-0">
          <div className="flex-1">
            {activeType === 'asset' && initialType === 'news' && (
              <button
                onClick={() => { setActiveItem(initialItem); setActiveType('news'); }}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all"
              >
                ← <span className="hidden md:inline">Back to News</span>
              </button>
            )}
          </div>

          {/* Drážka pro mobilní "pull-to-close" vizuál */}
          <div className="md:hidden w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full absolute left-1/2 -translate-x-1/2 top-3" />

          <button
            onClick={onClose}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full transition-all"
          >
            ✕
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 md:p-12 overflow-y-auto no-scrollbar pb-20 md:pb-12">
          {isAsset ? (
            <div className="space-y-8 md:space-y-12">
              {/* ASSET HEADER */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 dark:border-slate-800 pb-8 md:pb-10">
                <div className="space-y-2 md:space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight dark:text-white">
                      {liveAsset.name}
                    </h2>
                    <span className="text-xl md:text-2xl font-black text-slate-300 dark:text-slate-700 uppercase">{liveAsset.symbol}</span>
                  </div>
                  <span className="px-3 py-1 text-[9px] md:text-[10px] font-black rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 uppercase tracking-widest inline-block">
                    {liveAsset.sector || "Digital Asset"}
                  </span>
                </div>

                <div className="text-left md:text-right">
                  <div className={`text-4xl md:text-6xl font-mono font-black tracking-tighter ${getChangeColor(liveAsset.changePercent)}`}>
                    ${liveAsset.currentPrice?.toLocaleString(undefined, {
                      minimumFractionDigits: liveAsset.currentPrice < 1 ? 4 : 2
                    })}
                  </div>
                  <div className={`text-sm md:text-lg font-black flex items-center md:justify-end gap-2 mt-1 ${getChangeColor(liveAsset.changePercent)}`}>
                    {getArrowSymbol(liveAsset.changePercent)}
                    {Math.abs(liveAsset.changeAmount || 0).toFixed(2)} ({liveAsset.changePercent?.toFixed(2)}%)
                  </div>
                </div>
              </div>

              {/* CHART AREA - Menší padding na mobilu */}
              <div className="rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-slate-50 dark:bg-slate-950 p-2 md:p-4 border dark:border-slate-800">
                <TradingChart symbol={liveAsset.symbol} />
              </div>

              {/* STATS & ALERTS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Metrics */}
                <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/40 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 space-y-6 md:space-y-8 border dark:border-slate-800">
                  <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Fundamentals</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                    {[
                      { label: "Market Cap", value: `$${(liveAsset.marketCap / 1e9).toFixed(2)}B` },
                      { label: "Volume 24h", value: liveAsset.volume?.toLocaleString() },
                      { label: "Sentiment", value: `${(liveAsset.sentiment?.overall * 100).toFixed(0)}% Bullish` },
                      { label: "Volatility", value: liveAsset.keyMetrics?.beta || "1.24" }
                    ].map((stat, i) => (
                      <div key={i} className="flex justify-between items-center py-3 border-b border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
                        <span className="font-black text-sm md:text-base text-slate-900 dark:text-white">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alert Panel */}
                <div className="bg-slate-900 dark:bg-slate-950 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 text-white border border-slate-800 flex flex-col justify-between gap-8 md:min-h-[400px]">
                  <div className="space-y-6">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Alert Signals</h3>
                    <div className="space-y-5">
                      {liveAsset.alerts?.slice(0, 3).map((alert, i) => (
                        <div key={i} className="space-y-2 border-l-2 border-blue-900/50 pl-4">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${alert.impact === 'positive' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{alert.type}</span>
                          <p className="text-xs md:text-sm font-bold leading-snug italic text-slate-300">"{alert.message}"</p>
                        </div>
                      ))}
                      {!liveAsset.alerts?.length && <p className="text-slate-500 text-[10px] italic uppercase tracking-widest text-center py-4">Safe / No Signals</p>}
                    </div>
                  </div>

                  <button
                    onClick={goToAlerts}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                  >
                    View All Signals <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* --- NEWS VIEW --- */
            <div className="max-w-4xl mx-auto py-2">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                  {activeItem.category}
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{activeItem.source}</span>
              </div>
              <h2 className="text-3xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 md:mb-10 leading-tight tracking-tighter uppercase italic">{activeItem.title}</h2>
              <div className="max-w-none">
                <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic border-l-4 md:border-l-8 border-blue-500 pl-4 md:pl-8 mb-8 md:mb-12">
                  {activeItem.summary}
                </p>
                <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 mb-6 tracking-widest">Related Terminals</h4>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {activeItem.affectedAssets?.map(symbol => (
                      <button
                        key={symbol}
                        onClick={() => handleAssetClick(symbol)}
                        className="px-4 py-3 md:px-6 md:py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-500 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase italic transition-all flex items-center gap-2 shadow-sm"
                      >
                        <span className="opacity-30 text-[10px]">TKR</span> {symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;