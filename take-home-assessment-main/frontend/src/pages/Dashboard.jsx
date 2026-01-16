import { useEffect, useState, useMemo } from 'react';
import Modal from '../components/Modal';
import { useRealTimeData } from '../services/useRealTimeData';

const Dashboard = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const { stocks = [], crypto = [], news = [], portfolio = {} } = useRealTimeData();
  const allAssets = useMemo(() => [...stocks, ...crypto], [stocks, crypto]);

  const topGainers = useMemo(() => allAssets.filter(a => a.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 3), [allAssets]);
  const topLosers = useMemo(() => allAssets.filter(a => a.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 3), [allAssets]);
  const trackedAssets = useMemo(() => (portfolio?.watchlist || []).map(sym => allAssets.find(a => a.symbol === sym)).filter(Boolean), [portfolio, allAssets]);

  const getChangeColor = (val) => val >= 0 ? 'text-emerald-600' : 'text-rose-600';
  const getArrow = (val) => val >= 0 ? '▲' : '▼';

  if (!stocks.length) return <div className="p-20 text-center font-black animate-pulse text-xs tracking-[0.5em]">INITIALIZING...</div>;

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-12 max-w-7xl mx-auto text-slate-900">
      <header>
        <p className="text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-1">Market Overview</p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter">Dashboard</h1>
      </header>

      {/* PORTFOLIO STATS - Flex-wrap pro mobil */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Net Worth</h2>
        <div className="flex flex-wrap items-baseline gap-2 md:gap-6">
          <span className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter">
            ${portfolio?.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <div className={`text-sm md:text-xl font-bold px-3 py-1 rounded-xl bg-slate-50 ${getChangeColor(portfolio.totalChangePercent)}`}>
            {getArrow(portfolio.totalChangePercent)} {portfolio.totalChangePercent?.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* GAINERS / LOSERS */}
        {[
          { title: 'Top Gainers', list: topGainers, color: 'text-emerald-600' },
          { title: 'Top Losers', list: topLosers, color: 'text-rose-600' }
        ].map((sec) => (
          <div key={sec.title} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${sec.color}`}>{sec.title}</h3>
            <div className="space-y-1">
              {sec.list.map(asset => (
                <div key={asset.symbol} onClick={() => {setSelectedItem(asset); setSelectedType('asset');}}
                  className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all">
                  <span className="font-bold text-sm md:text-base">{asset.symbol}</span>
                  <span className={`font-mono font-bold text-xs md:text-sm ${getChangeColor(asset.changePercent)}`}>
                    {getArrow(asset.changePercent)} {Math.abs(asset.changePercent).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* WATCHLIST - Lepší wrap na mobilu */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Watchlist</h3>
        <div className="flex flex-wrap gap-2 md:gap-4">
          {trackedAssets.map(asset => (
            <button key={asset.symbol} onClick={() => {setSelectedItem(asset); setSelectedType('asset');}}
              className="flex-1 md:flex-none px-4 py-3 bg-slate-50 rounded-xl font-black text-xs transition-all border border-slate-100 active:bg-slate-900 active:text-white">
              {asset.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* NEWS - Skrytí času na extra malých displejích */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Intelligence</h3>
        <div className="divide-y divide-slate-50">
          {news.slice(0, 4).map(n => (
            <div key={n.id} onClick={() => {setSelectedItem(n); setSelectedType('news');}}
              className="py-4 first:pt-0 last:pb-0 cursor-pointer group">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">{n.category}</span>
              <h4 className="font-bold text-sm md:text-base leading-tight group-hover:text-blue-600 transition-colors">{n.title}</h4>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && <Modal item={selectedItem} type={selectedType} onClose={() => setSelectedItem(null)} />}
    </div>
  );
};

export default Dashboard;