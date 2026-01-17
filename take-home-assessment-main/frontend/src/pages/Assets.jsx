import React, { useState, useMemo } from 'react';
import Modal from '../components/Modal';
import { useRealTimeData } from '../services/useRealTimeData';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';

const Assets = () => {
  const { stocks = [], crypto = [] } = useRealTimeData();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const getChangeColor = (value) => (value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400');
  const getArrow = (value) => (value >= 0 ? '▲' : '▼');

  const filteredAssets = useMemo(() => {
    let assets = (filter === 'stocks' ? stocks : filter === 'crypto' ? crypto : [...stocks, ...crypto]);

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      assets = assets.filter(a =>
        a.symbol?.toLowerCase().includes(q) ||
        a.name?.toLowerCase().includes(q)
      );
    }
    return [...assets].sort((a, b) => b.marketCap - a.marketCap);
  }, [stocks, crypto, filter, searchTerm]);

  return (
    <div className="space-y-10 p-4 md:p-12 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* HEADER S INTEGROVANÝM VYHLEDÁVÁNÍM */}
      <PageHeader badge="Global Markets" title="Market Assets">
        <SearchInput onSearch={setSearchTerm} placeholder="Ticker or company..." />
      </PageHeader>

      {/* TABS FILTER */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[1.5rem] w-fit overflow-hidden border border-transparent dark:border-slate-800 transition-colors">
        {['all', 'stocks', 'crypto'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ASSETS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map(asset => (
          <div
            key={asset.symbol}
            onClick={() => setSelectedAsset(asset)}
            className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/10 hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-white">
                    {asset.symbol}
                  </h3>
                  {asset.isHot && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
                </div>
                <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest truncate">
                  {asset.name}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-mono font-black text-slate-900 dark:text-slate-100 leading-none mb-2">
                  ${asset.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className={`text-[11px] font-black flex items-center justify-end gap-1 px-2 py-0.5 rounded-lg ${asset.changePercent >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                  {getArrow(asset.changePercent)}
                  {Math.abs(asset.changePercent || 0).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Jemné pozadí pro vizuální hloubku */}
            <div className="absolute -right-4 -bottom-4 text-slate-50 dark:text-slate-800/50 font-black text-6xl select-none opacity-40 dark:opacity-20 group-hover:text-blue-50 dark:group-hover:text-blue-900 transition-colors italic">
              {asset.symbol.slice(0, 2)}
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {filteredAssets.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-sm italic">
              No matching assets found for "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {selectedAsset && <Modal item={selectedAsset} type="asset" onClose={() => setSelectedAsset(null)} />}
    </div>
  );
};

export default Assets;