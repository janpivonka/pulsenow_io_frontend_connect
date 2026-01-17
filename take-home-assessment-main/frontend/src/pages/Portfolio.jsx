import React, { useMemo } from 'react';
import { useRealTimeData } from '../services/useRealTimeData';
import PageHeader from '../components/PageHeader';

const Portfolio = () => {
  const { stocks = [], crypto = [], portfolio = {}, aiCoreInsights = [] } = useRealTimeData();

  // 1. HLAVNÍ VÝPOČETNÍ LOGIKA
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
      myPositions: positions,
      total,
      pl: totalPL,
      plPercent: cost !== 0 ? (totalPL / cost) * 100 : 0,
      cash
    };
  }, [stocks, crypto, portfolio]);

  const getChangeColor = (val) => val >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';

  if (!portfolio || !portfolio.assets) {
    return (
      <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-xs dark:text-slate-500">
        Syncing Terminal...
      </div>
    );
  }

  return (
    <div className="space-y-10 p-4 md:p-12 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* HEADER S INTEGRACÍ NET WORTH BOXU */}
      <PageHeader badge="Institutional Account" title="Portfolio">
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm min-w-[300px] transition-colors">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 text-right">Live Net Worth</p>
          <div className="text-right">
            <div className="text-4xl md:text-5xl font-black tracking-tighter italic leading-none mb-2 dark:text-white">
              ${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-bold flex items-center justify-end gap-2 ${getChangeColor(stats.pl)}`}>
              <span>{stats.pl >= 0 ? '▲' : '▼'} ${Math.abs(stats.pl).toLocaleString()}</span>
              <span className="opacity-40 font-black">({stats.plPercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* QUICK STATS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Market Value', val: `$${(stats.total - stats.cash).toLocaleString()}` },
          { label: 'Cash Reserve', val: `$${stats.cash.toLocaleString()}` },
          { label: 'Active Positions', val: stats.myPositions.length },
          { label: 'Risk Profile', val: 'Aggressive' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-blue-100 dark:hover:border-blue-900 transition-colors">
            <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-1">{s.label}</p>
            <p className="text-xl font-black italic uppercase leading-none dark:text-slate-200">{s.val}</p>
          </div>
        ))}
      </div>

      {/* POSITIONS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
          <h2 className="font-black text-xl tracking-tight uppercase italic dark:text-white">Active Holdings</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-xs">Live Engine</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-8 py-6">Asset</th>
                <th className="px-8 py-6 text-right">Holdings</th>
                <th className="px-8 py-6 text-right">Market Value</th>
                <th className="px-8 py-6 text-right">P/L Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {stats.myPositions.map((pos) => (
                <tr key={pos.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-black text-lg uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors italic leading-none dark:text-slate-100">{pos.symbol}</div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1">{pos.name}</div>
                  </td>
                  <td className="px-8 py-6 text-right font-mono font-bold text-slate-500 dark:text-slate-400">
                    {pos.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="font-black text-lg leading-none dark:text-slate-100">${pos.currentValue.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter mt-1">Avg: ${pos.avgPrice.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className={`font-black text-lg leading-none ${getChangeColor(pos.profitLoss)}`}>
                      {pos.profitLoss >= 0 ? '+' : '-'}${Math.abs(pos.profitLoss).toLocaleString()}
                    </div>
                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded mt-1 inline-block ${pos.profitLoss >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                      {pos.plPercent.toFixed(2)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI STRATEGY SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <h2 className="font-black text-xl tracking-tight uppercase italic dark:text-white">AI Core Strategy</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiCoreInsights.slice(0, 3).map(insight => (
            <div key={insight.id} className="bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 dark:border-blue-900/30 hover:border-blue-900 transition-all shadow-xl group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-black bg-blue-600 px-2 py-1 rounded uppercase tracking-widest">{insight.type}</span>
                <span className="text-[10px] font-mono text-blue-400 font-bold">CONF: {((insight.confidence || 0.9) * 100).toFixed(0)}%</span>
              </div>
              <h3 className="text-xl font-black italic uppercase leading-tight mb-2 group-hover:text-blue-400 transition-colors">{insight.title}</h3>
              <p className="text-slate-400 text-xs italic opacity-80">"{insight.description}"</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center pt-10 border-t border-slate-50 dark:border-slate-900 opacity-20 font-black uppercase tracking-[0.4em] text-[9px] dark:text-slate-500">
        Terminal Pulse V3.2 • Secure Institutional Feed
      </footer>
    </div>
  );
};

export default Portfolio;