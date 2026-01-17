import React, { useState, useMemo } from 'react';
import { useRealTimeData } from '../services/useRealTimeData';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';

const Alerts = () => {
  const { stocks = [], crypto = [] } = useRealTimeData();
  const [impactFilter, setImpactFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Sjednocení dat a extrakce alertů
  const allAlerts = useMemo(() => {
    const assets = [...stocks, ...crypto];
    return assets.flatMap(asset =>
      (asset.alerts || []).map(alert => ({
        ...alert,
        assetSymbol: asset.symbol,
        assetName: asset.name,
        fullAsset: asset
      }))
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [stocks, crypto]);

  // Filtrování podle dopadu a vyhledávání
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(a => {
      const matchesImpact = impactFilter === 'all' || a.impact === impactFilter;
      const matchesSearch =
        a.assetSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.message.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesImpact && matchesSearch;
    });
  }, [allAlerts, impactFilter, searchTerm]);

  if (!stocks.length) {
    return (
      <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.3em] text-xs dark:text-slate-500">
        Scanning Network...
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 p-2 md:p-12 max-w-5xl mx-auto text-slate-900 dark:text-slate-100 transition-colors duration-300">

      <PageHeader badge="Live Monitor" title="System Alerts">
        <div className="mt-4 md:mt-0 w-full md:w-80">
          <SearchInput onSearch={setSearchTerm} placeholder="Filter signals..." />
        </div>
      </PageHeader>

      {/* IMPACT FILTER - Responzivní přepínač */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl md:rounded-2xl w-full sm:w-fit border border-transparent dark:border-slate-800 transition-colors">
        {['all', 'positive', 'negative'].map((f) => (
          <button
            key={f}
            onClick={() => setImpactFilter(f)}
            className={`flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${
              impactFilter === f
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {f === 'all' ? 'Signals' : f === 'positive' ? 'Bullish' : 'Bearish'}
          </button>
        ))}
      </div>

      {/* ALERT LIST */}
      <div className="space-y-3 md:space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <div
              key={`${alert.assetSymbol}-${index}`}
              onClick={() => setSelectedAsset(alert.fullAsset)}
              className={`group bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 border-l-[6px] md:border-l-[12px] shadow-sm transition-all active:scale-[0.98] hover:translate-x-1 md:hover:translate-x-2 cursor-pointer ${
                alert.impact === 'positive'
                  ? 'border-l-emerald-500 dark:border-l-emerald-600'
                  : 'border-l-rose-500 dark:border-l-rose-600'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                      {alert.assetSymbol}
                    </span>

                    {/* FIXED BADGE COLORS FOR DARK MODE */}
                    <span className={`text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                      alert.impact === 'positive'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                    }`}>
                      {alert.type}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-200 font-bold leading-tight text-sm md:text-lg italic">
                    "{alert.message}"
                  </p>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between pt-3 md:pt-0 border-t md:border-none border-slate-50 dark:border-slate-800 transition-colors">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {alert.assetName}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 font-mono mt-0.5">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest text-xs italic">
              No matching signals detected
            </p>
          </div>
        )}
      </div>

      {/* ASSET MODAL CONNECTION */}
      {selectedAsset && (
        <Modal
          item={selectedAsset}
          type="asset"
          onClose={() => setSelectedAsset(null)}
        />
      )}

      <footer className="text-center pt-10 border-t border-slate-50 dark:border-slate-900/50 opacity-30 font-black uppercase tracking-[0.4em] text-[8px] md:text-[9px]">
        AI Core Terminal • Secure Monitoring Active
      </footer>
    </div>
  );
};

export default Alerts;