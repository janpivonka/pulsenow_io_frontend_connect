import React, { useMemo } from 'react';
import { useRealTimeData } from '../services/useRealTimeData';
import PageHeader from '../components/PageHeader';

const Portfolio = () => {
  const { stocks = [], crypto = [], portfolio = {}, aiCoreInsights = [] } = useRealTimeData();

  const stats = useMemo(() => {
    if (!portfolio || !portfolio.assets) return { myPositions: [], total: 0, pl: 0, plPercent: 0, cash: 0 };

    const allMarketAssets = [...stocks, ...crypto];
    let currentAssetsValue = 0;
    let totalCost = 0;

    const positions = portfolio.assets.map(item => {
      const marketData = allMarketAssets.find(a => a.symbol === item.assetId);
      const currentPrice = marketData?.currentPrice || item.currentPrice;
      const currentValue = currentPrice * item.quantity;
      const positionCost = item.avgBuyPrice * item.quantity;

      currentAssetsValue += currentValue;
      totalCost += positionCost;

      return {
        symbol: item.assetId,
        name: marketData?.name || item.assetId,
        amount: item.quantity,
        avgPrice: item.avgBuyPrice,
        currentPrice,
        currentValue,
        profitLoss: currentValue - positionCost,
        plPercent: item.avgBuyPrice !== 0 ? ((currentPrice - item.avgBuyPrice) / item.avgBuyPrice) * 100 : 0
      };
    }).sort((a, b) => b.currentValue - a.currentValue);

    const cash = portfolio.cashBalance || 0;
    const total = currentAssetsValue + cash;
    const cost = totalCost + cash;
    const totalPL = total - cost;

    return {
      myPositions: positions, total, pl: totalPL, plPercent: cost !== 0 ? (totalPL / cost) * 100 : 0, cash
    };
  }, [stocks, crypto, portfolio]);

  const getChangeColor = (val) => val >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';

  if (!portfolio || !portfolio.assets) {
    return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-xs dark:text-slate-500">Syncing Terminal...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-10 p-2 md:p-12 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* HEADER & NET WORTH */}
      <PageHeader badge="Institutional Account" title="Portfolio">
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm w-full md:min-w-[350px] transition-colors mt-4 md:mt-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 md:text-right">Live Net Worth</p>
          <div className="md:text-right">
            <div className="text-3xl md:text-5xl font-black tracking-tighter italic leading-none mb-2 dark:text-white truncate">
              ${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-bold flex items-center md:justify-end gap-2 ${getChangeColor(stats.pl)}`}>
              <span>{stats.pl >= 0 ? '▲' : '▼'} ${Math.abs(stats.pl).toLocaleString()}</span>
              <span className="opacity-40 font-black">({stats.plPercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Market Value', val: `$${(stats.total - stats.cash).toLocaleString()}` },
          { label: 'Cash Reserve', val: `$${stats.cash.toLocaleString()}` },
          { label: 'Positions', val: stats.myPositions.length },
          { label: 'Risk Profile', val: 'Aggressive' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">{s.label}</p>
            <p className="text-sm md:text-xl font-black italic uppercase leading-none dark:text-slate-200 truncate">{s.val}</p>
          </div>
        ))}
      </div>

      {/* POSITIONS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
        <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
          <h2 className="font-black text-lg md:text-xl tracking-tight uppercase italic dark:text-white">Holdings</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* TABLE FOR DESKTOP */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-8 py-6">Asset</th>
                <th className="px-8 py-6 text-right">Holdings</th>
                <th className="px-8 py-6 text-right">Value</th>
                <th className="px-8 py-6 text-right">Profit/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {stats.myPositions.map((pos) => (
                <tr key={pos.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-black text-lg uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 italic dark:text-slate-100">{pos.symbol}</div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">{pos.name}</div>
                  </td>
                  <td className="px-8 py-6 text-right font-mono font-bold text-slate-500 dark:text-slate-400">{pos.amount.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="font-black text-lg">${pos.currentValue.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Avg: ${pos.avgPrice.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className={`font-black text-lg ${getChangeColor(pos.profitLoss)}`}>{pos.profitLoss >= 0 ? '+' : '-'}${Math.abs(pos.profitLoss).toLocaleString()}</div>
                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded mt-1 inline-block ${pos.profitLoss >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>{pos.plPercent.toFixed(2)}%</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARDS FOR MOBILE */}
        <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
          {stats.myPositions.map((pos) => (
            <div key={pos.symbol} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-black text-xl italic uppercase text-blue-600 dark:text-blue-400">{pos.symbol}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pos.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg">${pos.currentValue.toLocaleString()}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Current Value</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Holdings</p>
                  <p className="font-mono font-bold text-sm">{pos.amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Profit/Loss</p>
                  <div className={`font-bold text-sm ${getChangeColor(pos.profitLoss)}`}>
                    {pos.profitLoss >= 0 ? '+' : '-'}${Math.abs(pos.profitLoss).toLocaleString()} ({pos.plPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI STRATEGY */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <h2 className="font-black text-lg md:text-xl tracking-tight uppercase italic dark:text-white">AI Core Strategy</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {aiCoreInsights.slice(0, 3).map(insight => (
            <div key={insight.id} className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white border border-slate-800 hover:border-blue-900 transition-all shadow-xl group">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <span className="text-[8px] font-black bg-blue-600 px-2 py-0.5 rounded uppercase tracking-widest">{insight.type}</span>
                <span className="text-[10px] font-mono text-blue-400 font-bold">{((insight.confidence || 0.9) * 100).toFixed(0)}%</span>
              </div>
              <h3 className="text-lg font-black italic uppercase leading-tight mb-2 group-hover:text-blue-400 transition-colors">{insight.title}</h3>
              <p className="text-slate-400 text-[10px] md:text-xs italic opacity-80 leading-relaxed">"{insight.description}"</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-6 md:py-10 opacity-20 font-black uppercase tracking-[0.3em] text-[8px] md:text-[9px] dark:text-slate-500">
        Terminal Pulse V3.2 • Secure Institutional Feed
      </footer>
    </div>
  );
};

export default Portfolio;