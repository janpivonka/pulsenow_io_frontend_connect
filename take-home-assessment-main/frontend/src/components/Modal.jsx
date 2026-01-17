import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importujeme navigaci
import TradingChart from "./TradingChart";
import { useRealTimeData } from "../services/useRealTimeData";

const Modal = ({ item: initialItem, type: initialType, onClose }) => {
  const navigate = useNavigate(); // Hook pro navigaci
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

  const getChangeColor = (value) => (value >= 0 ? "text-emerald-600" : "text-rose-600");
  const getArrowSymbol = (value) => (value >= 0 ? "▲" : "▼");

  const handleAssetClick = (symbol) => {
    const asset = allAssets.find(a => a.symbol === symbol);
    if (asset) {
      setActiveItem(asset);
      setActiveType('asset');
    }
  };

  // Funkce pro odchod do globálních alertů
  const goToAlerts = () => {
    onClose(); // Zavřeme modal
    navigate('/alerts'); // Přesměrujeme (případně můžeš přidat query params pro filtr)
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-[3rem] w-full max-w-6xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20"
      >

        {/* TOP NAV BAR */}
        <div className="flex justify-between items-center px-10 py-6 border-b border-slate-50 min-h-[80px]">
          <div className="flex-1">
            {activeType === 'asset' && initialType === 'news' && (
              <button
                onClick={() => { setActiveItem(initialItem); setActiveType('news'); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-600 group shadow-lg"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                Back to News
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all hover:rotate-90"
          >
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 md:p-12 overflow-y-auto no-scrollbar">
          {isAsset ? (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-50 pb-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">
                      {liveAsset.name}
                    </h2>
                    <span className="text-2xl font-black text-blue-600/30 uppercase">{liveAsset.symbol}</span>
                  </div>
                  <span className="px-4 py-1.5 text-[10px] font-black rounded-xl bg-blue-50 text-blue-600 uppercase tracking-widest inline-block">
                    {liveAsset.sector || "Digital Asset"}
                  </span>
                </div>

                <div className="text-left md:text-right">
                  <div className={`text-5xl md:text-6xl font-mono font-black tracking-tighter ${getChangeColor(liveAsset.changePercent)}`}>
                    ${liveAsset.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`text-lg font-black flex items-center md:justify-end gap-2 mt-2 ${getChangeColor(liveAsset.changePercent)}`}>
                    {getArrowSymbol(liveAsset.changePercent)}
                    {Math.abs(liveAsset.changeAmount || 0).toFixed(2)} ({liveAsset.changePercent?.toFixed(2)}%)
                  </div>
                </div>
              </div>

              <TradingChart symbol={liveAsset.symbol} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-4">
                <div className="lg:col-span-2 bg-slate-50 rounded-[2.5rem] p-10 space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Fundamental Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {[
                      { label: "Market Cap", value: `$${(liveAsset.marketCap / 1e9).toFixed(2)}B` },
                      { label: "Volume 24h", value: liveAsset.volume?.toLocaleString() },
                      { label: "Sentiment", value: `${(liveAsset.sentiment?.overall * 100).toFixed(0)}% Bullish` },
                      { label: "Volatility", value: liveAsset.keyMetrics?.beta || "1.24" }
                    ].map((stat, i) => (
                      <div key={i} className="flex justify-between items-center py-3 border-b border-slate-200/50">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                        <span className="font-black text-slate-900">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ALERT PANEL S PROKLIKEM */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white border border-slate-800 flex flex-col justify-between min-h-[400px]">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-8">Alert Signals</h3>
                    <div className="space-y-6">
                      {liveAsset.alerts?.slice(0, 3).map((alert, i) => (
                        <div key={i} className="space-y-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${alert.impact === 'positive' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{alert.type}</span>
                          <p className="text-sm font-bold leading-snug italic text-slate-200">"{alert.message}"</p>
                        </div>
                      ))}
                      {!liveAsset.alerts?.length && <p className="text-slate-500 text-xs italic">No critical signals detected.</p>}
                    </div>
                  </div>

                  <button
                    onClick={goToAlerts}
                    className="mt-10 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                  >
                    View All Network Alerts
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* --- NEWS VIEW --- */
            <div className="max-w-4xl mx-auto py-4">
              <div className="flex items-center gap-4 mb-8">
                <span className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {activeItem.category}
                </span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{activeItem.source}</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-10 leading-[1.05] tracking-tighter uppercase italic">{activeItem.title}</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-2xl text-slate-600 leading-relaxed font-medium italic border-l-8 border-blue-500 pl-8 mb-12">{activeItem.summary}</p>
                <div className="mt-12 pt-12 border-t border-slate-100">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-[0.3em]">Related Terminals</h4>
                  <div className="flex flex-wrap gap-3">
                    {activeItem.affectedAssets?.map(symbol => (
                      <button
                        key={symbol}
                        onClick={() => handleAssetClick(symbol)}
                        className="px-6 py-4 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-2xl font-black text-sm uppercase italic tracking-tighter transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
                      >
                        <span className="text-xs opacity-30">VIEW</span> {symbol} <span className="text-blue-500 text-lg">→</span>
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