import React, { useMemo } from 'react';
import { useRealTimeData } from '../services/useRealTimeData';

const Portfolio = () => {
  const { stocks = [], crypto = [], portfolio = {}, aiCoreInsights = [] } = useRealTimeData();

  // 1. HLAVNÍ VÝPOČETNÍ LOGIKA
  const { myPositions, dynamicTotalValue, totalProfitLoss, totalProfitLossPercent } = useMemo(() => {
    if (!portfolio.assets) return { myPositions: [], dynamicTotalValue: 0, totalProfitLoss: 0, totalProfitLossPercent: 0 };

    const allMarketAssets = [...stocks, ...crypto];
    let currentAssetsValue = 0;
    let totalCost = 0;

    const positions = portfolio.assets.map(item => {
      const marketData = allMarketAssets.find(a => a.symbol === item.assetId);
      const currentPrice = marketData?.currentPrice || item.currentPrice;

      const currentValue = currentPrice * item.quantity;
      const positionCost = item.avgBuyPrice * item.quantity;
      const profitLoss = currentValue - positionCost;
      const profitLossPercent = (profitLoss / positionCost) * 100;

      currentAssetsValue += currentValue;
      totalCost += positionCost;

      return {
        symbol: item.assetId,
        name: marketData?.name || item.assetId,
        amount: item.quantity,
        avgPrice: item.avgBuyPrice,
        currentPrice: currentPrice,
        currentValue: currentValue,
        profitLoss: profitLoss,
        profitLossPercent: profitLossPercent
      };
    }).sort((a, b) => b.currentValue - a.currentValue);

    const cash = portfolio.cashBalance || 0;
    const total = currentAssetsValue + cash;
    const cost = totalCost + cash;
    const totalPL = total - cost;
    const totalPLPercent = cost !== 0 ? (totalPL / cost) * 100 : 0;

    return {
      myPositions: positions,
      dynamicTotalValue: total,
      totalProfitLoss: totalPL,
      totalProfitLossPercent: totalPLPercent
    };
  }, [stocks, crypto, portfolio]);

  const getChangeColor = (val) => val >= 0 ? 'text-emerald-600' : 'text-rose-600';

  if (!portfolio.assets) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest">Syncing Terminal...</div>;

  return (
    <div className="space-y-10 p-4 md:p-12 max-w-7xl mx-auto text-slate-900">

      {/* HEADER & DYNAMIC TOTAL VALUE */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Institutional Account</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">Portfolio</h1>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex-1 md:flex-none min-w-[320px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Live Net Worth</p>
          <div className="flex flex-col">
            <span className="text-4xl md:text-5xl font-black tracking-tighter mb-1">
              ${dynamicTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`flex items-center gap-2 font-bold text-sm ${getChangeColor(totalProfitLoss)}`}>
              <span>{totalProfitLoss >= 0 ? '▲' : '▼'} ${Math.abs(totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="opacity-50 font-black">({totalProfitLossPercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </header>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Market Value', val: `$${(dynamicTotalValue - (portfolio.cashBalance || 0)).toLocaleString()}` },
          { label: 'Cash Reserve', val: `$${(portfolio.cashBalance || 0).toLocaleString()}` },
          { label: 'Positions', val: myPositions.length },
          { label: 'Risk Profile', val: 'Aggressive' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">{s.label}</p>
            <p className="text-xl font-black italic uppercase">{s.val}</p>
          </div>
        ))}
      </div>

      {/* POSITIONS TABLE */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="font-black text-xl tracking-tight uppercase italic">Active Holdings</h2>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Engine</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Asset</th>
                <th className="px-8 py-5 text-right">Holdings</th>
                <th className="px-8 py-5 text-right">Live Price</th>
                <th className="px-8 py-5 text-right">Market Value</th>
                <th className="px-8 py-5 text-right">P/L Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myPositions.map((pos) => (
                <tr key={pos.symbol} className="hover:bg-slate-50/80 transition-colors group cursor-default">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-lg uppercase leading-none mb-1 group-hover:text-blue-600 transition-colors">{pos.symbol}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{pos.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-mono font-bold text-slate-600">
                    {pos.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right font-mono font-bold text-slate-600">
                    ${pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="font-black text-lg leading-none mb-1">
                      ${pos.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      Avg: ${pos.avgPrice.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className={`font-black text-lg leading-none mb-1 ${getChangeColor(pos.profitLoss)}`}>
                      {pos.profitLoss >= 0 ? '+' : '-'}${Math.abs(pos.profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block ${pos.profitLoss >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {pos.profitLossPercent.toFixed(2)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI CORE STRATEGY SECTION */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <h2 className="font-black text-xl tracking-tight uppercase italic">AI Core Strategy</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiCoreInsights.length > 0 ? (
            aiCoreInsights
              .filter(ins => {
                const insightSymbol = (ins.asset || ins.assetId || "").toUpperCase();
                const isMarketWide = insightSymbol === 'MARKET_WIDE' || insightSymbol === 'MARKET';
                const isOwned = myPositions.some(p => p.symbol.toUpperCase() === insightSymbol);
                return isMarketWide || isOwned;
              })
              .map(insight => (
                <div key={insight.id} className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group transition-all hover:-translate-y-1 shadow-2xl border border-slate-800">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all" />

                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black px-2 py-1 bg-blue-600 rounded-md uppercase tracking-widest text-white">
                        {(insight.type || 'ANALYSIS').replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-400/10 px-2 py-1 rounded-lg">
                        CONF: {((insight.confidence || 0.85) * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div>
                      <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">
                        Target: {insight.asset || insight.assetId}
                      </div>
                      <h3 className="text-xl font-black leading-tight group-hover:text-blue-400 transition-colors">
                        {insight.title}
                      </h3>
                    </div>

                    <p className="text-slate-400 text-xs font-medium leading-relaxed italic">
                      "{insight.description}"
                    </p>

                    {(insight.actionable || insight.isActionable) && (
                      <div className="pt-2 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Execute Signal Available</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No matching AI signals detected...</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center pt-10 border-t border-slate-50">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
          Quantum Portfolio Engine • Terminal V3.2 • Secure encrypted feed
        </p>
      </footer>
    </div>
  );
};

export default Portfolio;