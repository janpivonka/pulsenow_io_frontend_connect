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
    <div className="space-y-6 md:space-y-10 p-2 md:p-12 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* HEADER - PageHeader by měl vnitřně zvládat stackování search inputu na mobilu */}
      <PageHeader badge="Global Markets" title="Market Assets">
        <div className="mt-4 md:mt-0 w-full md:w-72 lg:w-96">
          <SearchInput onSearch={setSearchTerm} placeholder="Ticker or company..." />
        </div>
      </PageHeader>

      {/* TABS FILTER - Přidán scroll pro velmi malé displeje */}
      <div className="overflow-x-auto no-scrollbar -mx-2 px-2 md:mx-0 md:px-0">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 md:p-1.5 rounded-2xl md:rounded-[1.5rem] w-fit border border-transparent dark:border-slate-800 transition-colors">
          {['all', 'stocks', 'crypto'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 md:px-8 py-2 md:py-2.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ASSETS GRID - 1 sloupec na mobilu, 2 na tabletu, 3 na desktopu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredAssets.map(asset => (
          <div
            key={asset.symbol}
            onClick={() => setSelectedAsset(asset)}
            className="group bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/10 hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-white">
                    {asset.symbol}
                  </h3>
                  {asset.isHot && (
                    <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" title="Trending" />
                  )}
                </div>
                <p className="text-slate-400 dark:text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest truncate pr-2">
                  {asset.name}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xl md:text-2xl font-mono font-black text-slate-900 dark:text-slate-100 leading-none mb-2">
                  ${asset.currentPrice?.toLocaleString(undefined, {
                    minimumFractionDigits: asset.currentPrice < 1 ? 4 : 2
                  })}
                </p>
                <div className={`text-[10px] md:text-[11px] font-black inline-flex items-center justify-end gap-1 px-2 py-0.5 rounded-lg ${
                  asset.changePercent >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                }`}>
                  {getArrow(asset.changePercent)}
                  {Math.abs(asset.changePercent || 0).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Jemné pozadí - na mobilu o něco menší */}
            <div className="absolute -right-2 -bottom-2 md:-right-4 md:-bottom-4 text-slate-50 dark:text-slate-800/40 font-black text-5xl md:text-6xl select-none opacity-40 dark:opacity-30 group-hover:text-blue-50 dark:group-hover:text-blue-900 transition-colors italic uppercase">
              {asset.symbol.slice(0, 2)}
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {filteredAssets.length === 0 && (
          <div className="col-span-full py-12 md:py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] md:rounded-[3rem]">
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs md:text-sm italic">
              No matching assets found
            </p>
          </div>
        )}
      </div>

      {selectedAsset && <Modal item={selectedAsset} type="asset" onClose={() => setSelectedAsset(null)} />}
    </div>
  );
};

export default Assets;