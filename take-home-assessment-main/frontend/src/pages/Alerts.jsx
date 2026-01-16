import React, { useState, useMemo, useEffect } from 'react';
import { useRealTimeData } from '../services/useRealTimeData';

// Jednoduchý debounce hook
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

const Alerts = () => {
  const { stocks = [], crypto = [] } = useRealTimeData();
  const [impactFilter, setImpactFilter] = useState('all');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search);

  // Shromáždíme všechny alerty ze všech aktiv do jednoho pole
  const allAlerts = useMemo(() => {
    const assets = [...stocks, ...crypto];
    const alerts = assets.flatMap(asset =>
      (asset.alerts || []).map(alert => ({
        ...alert,
        assetSymbol: asset.symbol,
        assetName: asset.name
      }))
    );
    // Seřadíme od nejnovějších
    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [stocks, crypto]);

  // KOMBINOVANÁ FILTRACE: Impact + Vyhledávání
  const filteredAlerts = useMemo(() => {
    let result = allAlerts;

    if (impactFilter !== 'all') {
      result = result.filter(a => a.impact === impactFilter);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(a =>
        a.assetSymbol.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allAlerts, impactFilter, debouncedSearch]);

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (!stocks.length) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.3em]">Scanning Network...</div>;

  return (
    <div className="space-y-8 p-4 md:p-12 max-w-5xl mx-auto text-slate-900">

      {/* HEADER */}
      <header className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-rose-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Live Monitor</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">System Alerts</h1>
          </div>

          {/* SEARCH BOX */}
          <div className="relative w-full md:w-80">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by symbol or message..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-rose-500 outline-none font-bold text-sm transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
          </div>
        </div>

        {/* IMPACT FILTER */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start">
          {[
            { id: 'all', label: 'All' },
            { id: 'positive', label: 'Bullish' },
            { id: 'negative', label: 'Bearish' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => { setImpactFilter(f.id); setSearch(''); }}
              className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                impactFilter === f.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* ALERTS LIST */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <div
              key={`${alert.assetSymbol}-${index}`}
              className={`group relative bg-white p-6 md:p-8 rounded-[2rem] border-l-[12px] shadow-sm border border-slate-100 transition-all hover:translate-x-1 ${
                alert.impact === 'positive' ? 'border-l-emerald-500' : 'border-l-rose-500'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">{alert.assetSymbol}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      alert.impact === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-slate-700 font-bold leading-tight md:text-lg">
                    {alert.message}
                  </p>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center border-t md:border-none border-slate-50 pt-3 md:pt-0">
                  <span className="text-xs font-black text-slate-300 uppercase tracking-widest md:mb-1">
                    {alert.assetName}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
              {search ? `No alerts found for "${search}"` : "No critical alerts detected"}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="pt-8 text-center border-t border-slate-50">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          Powered by AI Core Real-time Analysis
        </p>
      </div>
    </div>
  );
};

export default Alerts;