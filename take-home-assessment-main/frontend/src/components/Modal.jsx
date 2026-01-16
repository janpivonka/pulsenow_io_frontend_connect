import React from "react";
import TradingChart from "./TradingChart";
import { useRealTimeData } from "../services/useRealTimeData";

const Modal = ({ item: initialItem, type, onClose }) => {
  const { stocks = [], crypto = [] } = useRealTimeData();

  // Najdeme živá data pouze pokud jde o aktivum (asset)
  const isAsset = type === 'asset';
  const liveItem = isAsset
    ? [...stocks, ...crypto].find(s => s.symbol === initialItem?.symbol) || initialItem
    : initialItem; // Pro zprávy (news) použijeme data tak, jak jsou

  if (!liveItem) return null;

  const getChangeColor = (value) => (value >= 0 ? "text-emerald-600" : "text-rose-600");
  const getArrowSymbol = (value) => (value >= 0 ? "▲" : "▼");

  const formatAlertDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((new Date() - date) / (1000 * 60));
    return diffInMinutes < 60 && diffInMinutes >= 0 ? `${diffInMinutes}m ago` :
      date.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-[2.5rem] w-full max-w-6xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/20"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 z-10 transition-all hover:rotate-90"
        >
          <span className="text-3xl">✕</span>
        </button>

        <div className="p-10 overflow-y-auto space-y-10 text-slate-900">

          {/* --- ZOBRAZENÍ PRO AKTIVA (STOCKS/CRYPTO) --- */}
          {isAsset ? (
            <>
              {/* HEADER */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-5xl font-black tracking-tighter">{liveItem.name}</h2>
                    <span className="text-2xl font-bold text-slate-300">{liveItem.symbol}</span>
                  </div>
                  <span className="inline-flex px-4 py-1.5 text-sm font-bold rounded-full bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100">
                    {liveItem.sector || "Digital Asset"}
                  </span>
                </div>
                <div className="text-left md:text-right">
                  <div className={`text-5xl font-mono font-black ${getChangeColor(liveItem.changePercent)}`}>
                    ${liveItem.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xl font-bold flex items-center md:justify-end gap-2 mt-2 ${getChangeColor(liveItem.changePercent)}`}>
                    {getArrowSymbol(liveItem.changePercent)}
                    {Math.abs(liveItem.changeAmount || 0).toFixed(2)} ({liveItem.changePercent?.toFixed(2)}%)
                  </div>
                </div>
              </div>

              {/* STATS STRIP */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Volume 24h", value: liveItem.volume?.toLocaleString() },
                  { label: "Market Cap", value: `$${(liveItem.marketCap / 1e9).toFixed(2)}B` },
                  { label: "Sentiment", value: `${(liveItem.sentiment?.overall * 100).toFixed(0)}% Bullish` },
                  { label: "Volatility (Beta)", value: liveItem.keyMetrics?.beta || "1.24" }
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* CHART */}
              <div className="w-full bg-[#0f172a] p-8 rounded-[2rem] shadow-2xl border border-slate-800">
                <TradingChart symbol={liveItem.symbol} />
              </div>

              {/* FOOTER GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
                <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6 border border-slate-100">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    Key Metrics
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {liveItem.keyMetrics && Object.entries(liveItem.keyMetrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-slate-200/50">
                        <span className="text-slate-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-bold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                   <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                    Active Alerts
                   </h3>
                   {liveItem.alerts?.length > 0 ? (
                     <div className="space-y-4">
                       {liveItem.alerts.map((alert) => (
                         <div key={alert.id} className={`p-5 rounded-2xl border-l-[6px] shadow-sm bg-white ${
                           alert.impact === 'positive' ? 'border-l-emerald-500' : 'border-l-rose-500'
                         }`}>
                           <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{alert.type}</span>
                             <span className="text-[10px] font-bold text-slate-400 font-mono">{formatAlertDate(alert.timestamp)}</span>
                           </div>
                           <p className="text-sm font-bold text-slate-800 leading-tight">{alert.message}</p>
                         </div>
                       ))}
                     </div>
                   ) : <p className="text-slate-400 italic">No alerts.</p>}
                </div>
              </div>
            </>
          ) : (
            /* --- ZOBRAZENÍ PRO ZPRÁVY (NEWS) --- */
            <div className="max-w-3xl mx-auto py-12">
              <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                {liveItem.category || 'Market Intelligence'}
              </span>
              <h2 className="text-5xl font-black text-slate-900 mt-8 mb-6 leading-[1.1] tracking-tighter">
                {liveItem.title}
              </h2>
              <div className="flex items-center gap-6 text-slate-400 mb-12 pb-8 border-b border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Source</span>
                  <span className="font-bold text-slate-600">{liveItem.source}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">Published</span>
                  <span className="font-bold text-slate-600">{new Date(liveItem.timestamp).toLocaleString('en-US')}</span>
                </div>
              </div>
              <div className="prose prose-slate prose-xl">
                <p className="text-2xl text-slate-600 leading-relaxed font-medium">
                  {liveItem.summary || "No detailed content available for this news item."}
                </p>
                <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-widest">Affected Assets</h4>
                  <div className="flex gap-2">
                    {liveItem.affectedAssets?.map(asset => (
                      <span key={asset} className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700">
                        {asset}
                      </span>
                    )) || "General Market"}
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