import React, { useState, useMemo } from 'react';
import { useRealTimeData } from '../services/useRealTimeData';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';

const Alerts = () => {
  const { stocks = [], crypto = [] } = useRealTimeData();
  const [impactFilter, setImpactFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Stav pro vybrané aktivum pro Modal
  const [selectedAsset, setSelectedAsset] = useState(null);

  const allAlerts = useMemo(() => {
    const assets = [...stocks, ...crypto];
    const alerts = assets.flatMap(asset =>
      (asset.alerts || []).map(alert => ({
        ...alert,
        assetSymbol: asset.symbol,
        assetName: asset.name,
        fullAsset: asset
      }))
    );
    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [stocks, crypto]);

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(a => {
      const matchesImpact = impactFilter === 'all' || a.impact === impactFilter;
      const matchesSearch =
        a.assetSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.message.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesImpact && matchesSearch;
    });
  }, [allAlerts, impactFilter, searchTerm]);

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (!stocks.length) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.3em] text-xs dark:text-slate-500">Scanning Network...</div>;

  return (
    <div className="space-y-10 p-4 md:p-12 max-w-5xl mx-auto text-slate-900 dark:text-slate-100 transition-colors duration-300">

      <PageHeader badge="Live Monitor" title="System Alerts">
        <SearchInput onSearch={setSearchTerm} placeholder="Symbol or keyword..." />
      </PageHeader>

      {/* IMPACT FILTER */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit border border-transparent dark:border-slate-800 transition-colors">
        {['all', 'positive', 'negative'].map((f) => (
          <button
            key={f}
            onClick={() => setImpactFilter(f)}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              impactFilter === f
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {f === 'all' ? 'All Signals' : f === 'positive' ? 'Bullish' : 'Bearish'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <div
              key={`${alert.assetSymbol}-${index}`}
              onClick={() => setSelectedAsset(alert.fullAsset)}
              className={`group bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border-l-[12px] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:translate-x-2 cursor-pointer active:scale-[0.98] ${
                alert.impact === 'positive'
                  ? 'border-l-emerald-500 dark:border-l-emerald-600'
                  : 'border-l-rose-500 dark:border-l-rose-600'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black tracking-tighter uppercase italic group-hover:text-blue-600 dark:group-hover:text-blue-400 dark:text-white transition-colors">
                      {alert.assetSymbol}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md transition-colors ${
                      alert.impact === 'positive'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                    }`}>
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-bold leading-tight text-lg italic">
                    "{alert.message}"
                  </p>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end border-t md:border-none border-slate-50 dark:border-slate-800 pt-4 md:pt-0 transition-colors">
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{alert.assetName}</span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono mt-1">{formatTime(alert.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest text-xs">No signals matching your search</p>
          </div>
        )}
      </div>

      {selectedAsset && (
        <Modal
          item={selectedAsset}
          type="asset"
          onClose={() => setSelectedAsset(null)}
        />
      )}

      <footer className="text-center pt-10 border-t border-slate-50 dark:border-slate-800 opacity-20 dark:opacity-40 font-black uppercase tracking-[0.4em] text-[9px] transition-colors">
        AI Core Terminal • Monitoring Active
      </footer>
    </div>
  );
};

export default Alerts;