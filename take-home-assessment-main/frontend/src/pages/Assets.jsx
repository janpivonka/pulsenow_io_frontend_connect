import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../components/Modal';
import { useRealTimeData } from '../services/useRealTimeData';

const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

const Assets = () => {
  const { stocks = [], crypto = [] } = useRealTimeData();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const getChangeColor = (value) => (value >= 0 ? 'text-emerald-600' : 'text-rose-600');
  const getArrow = (value) => (value >= 0 ? '▲' : '▼');

  const filteredAssets = useMemo(() => {
    let assets = (filter === 'stocks' ? stocks : filter === 'crypto' ? crypto : [...stocks, ...crypto]);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      assets = assets.filter(a => a.symbol?.toLowerCase().includes(q) || a.name?.toLowerCase().includes(q));
    }
    return [...assets].sort((a, b) => b.marketCap - a.marketCap);
  }, [stocks, crypto, filter, debouncedSearch]);

  return (
    <div className="space-y-6 md:space-y-10 p-4 md:p-12 max-w-7xl mx-auto text-slate-900">
      <header className="space-y-6">
        <div>
          <p className="text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-1">Global Markets</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">Market Assets</h1>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-full pl-10 pr-4 py-3 md:py-4 bg-white border border-slate-100 rounded-2xl md:rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm md:text-base"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl md:rounded-[1.5rem] overflow-x-auto no-scrollbar">
            {['all', 'stocks', 'crypto'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ASSETS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredAssets.map(asset => (
          <div
            key={asset.symbol}
            onClick={() => setSelectedAsset(asset)}
            className="group bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm active:scale-95 md:hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
          >
            {/* Flex container: Column na mobilu, Row na desktopu */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">

              {/* 1. TICKER (První blok) */}
              <div className="min-w-0 mb-4 md:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-black tracking-tight truncate uppercase">{asset.symbol}</h3>
                </div>
                <p className="text-slate-400 font-bold text-xs md:text-sm truncate uppercase tracking-wider">{asset.name}</p>
              </div>

              {/* 2. PRICE & CHANGE (Na mobilu striktně pod sebou) */}
              <div className="flex flex-col items-start md:items-end pt-4 md:pt-0 border-t md:border-none border-slate-50">
                <p className="text-2xl md:text-2xl font-mono font-black text-slate-900 leading-none mb-1">
                  ${asset.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-sm font-black flex items-center gap-1 ${getChangeColor(asset.changePercent)}`}>
                  {getArrow(asset.changePercent)}
                  {Math.abs(asset.changePercent || 0).toFixed(2)}%
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>

      {selectedAsset && <Modal item={selectedAsset} type="asset" onClose={() => setSelectedAsset(null)} />}
    </div>
  );
};

export default Assets;