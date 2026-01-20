import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealTimeData } from '../services/useRealTimeData';
import { useTrading } from '../services/TradingContext';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal'; // Import tvého modalu

const Portfolio = () => {
  const navigate = useNavigate();
  const { stocks = [], crypto = [], portfolio = {}, aiCoreInsights = [] } = useRealTimeData();
  const { positions: contextPositions = [], history = [] } = useTrading();

  // STAVY
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null); // Pro otevírání modalu

  const stats = useMemo(() => {
    const allMarketAssets = [...stocks, ...crypto];
    let currentAssetsValue = 0;
    let totalCost = 0;

    const computedPositions = contextPositions.map((item, index) => {
      const marketData = allMarketAssets.find(a => a.symbol === item.symbol);
      const currentPrice = marketData?.currentPrice || item.price || 0;
      const currentValue = currentPrice * item.amount;
      const positionCost = item.price * item.amount;

      currentAssetsValue += currentValue;
      totalCost += positionCost;

      return {
        key: item.id || `${item.symbol}-${index}`,
        id: item.id,
        symbol: item.symbol,
        name: marketData?.name || item.symbol,
        amount: item.amount,
        avgPrice: item.price,
        currentPrice,
        currentValue,
        profitLoss: currentValue - positionCost,
        plPercent: item.price !== 0 ? ((currentPrice - item.price) / item.price) * 100 : 0,
        tradeNumber: item.tradeNumber,
        // Uložíme si referenci na full data pro modal
        fullData: marketData
      };
    }).sort((a, b) => b.tradeNumber - a.tradeNumber);

    const totalRealizedPL = history.reduce((sum, trade) => sum + (trade.pl || 0), 0);
    const cash = portfolio.cashBalance || 0;
    const total = currentAssetsValue + cash;
    const cost = totalCost + cash;
    const totalUnrealizedPL = total - cost;

    return {
      myPositions: computedPositions,
      total,
      unrealizedPL: totalUnrealizedPL,
      realizedPL: totalRealizedPL,
      plPercent: cost !== 0 ? (totalUnrealizedPL / cost) * 100 : 0,
      cash
    };
  }, [stocks, crypto, portfolio, contextPositions, history]);

  const getChangeColor = (val) => val >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';

  const getActionStyle = (type) => {
    const t = type?.toUpperCase() || '';
    if (t.includes('PROFIT')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (t.includes('LOSS')) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (t.includes('PARTIAL')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';
  };

  const renderUnitTag = (item) => {
    const unitId = item.tradeNumber || item.displayId;
    if (!unitId) return null;
    return (
      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono shadow-sm border border-slate-800 dark:border-slate-200">
        #{unitId}
      </span>
    );
  };

  const displayedHistory = showAllHistory ? history : history.slice(0, 3);

  if (!stats) return null;

  return (
    <div className="space-y-6 md:space-y-10 p-2 md:p-12 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* 1. HEADER & NET WORTH */}
      <PageHeader badge="Institutional Account" title="Portfolio Overview">
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm w-full md:min-w-[350px] transition-colors mt-4 md:mt-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 md:text-right">Live Net Worth</p>
          <div className="md:text-right">
            <div className="text-3xl md:text-5xl font-black tracking-tighter italic leading-none mb-2 dark:text-white truncate">
              ${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-bold flex items-center md:justify-end gap-2 ${getChangeColor(stats.unrealizedPL)}`}>
              <span>Floating: {stats.unrealizedPL >= 0 ? '▲' : '▼'} ${Math.abs(stats.unrealizedPL).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="opacity-40 font-black">({stats.plPercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* 2. QUICK STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl transition-all hover:scale-[1.02]">
          <p className="text-[8px] md:text-[9px] font-black uppercase text-blue-500 tracking-widest mb-1">Realized P/L</p>
          <p className={`text-sm md:text-xl font-black italic uppercase leading-none truncate ${getChangeColor(stats.realizedPL)}`}>
            {stats.realizedPL >= 0 ? '+' : ''}${stats.realizedPL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        {[
          { label: 'Market Value', val: `$${(stats.total - stats.cash).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: 'Cash Reserve', val: `$${stats.cash.toLocaleString()}` },
          { label: 'Risk Profile', val: 'Aggressive' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">{s.label}</p>
            <p className="text-sm md:text-xl font-black italic uppercase leading-none dark:text-slate-200 truncate">{s.val}</p>
          </div>
        ))}
      </div>

      {/* 3. ACTIVE HOLDINGS */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
        <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
          <h2 className="font-black text-lg md:text-xl tracking-tight uppercase italic dark:text-white">Active Holdings</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Live Feed</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-8 py-6">Unit / Asset</th>
                <th className="px-8 py-6 text-right">Holdings</th>
                <th className="px-8 py-6 text-right">Value</th>
                <th className="px-8 py-6 text-right">Profit/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {stats.myPositions.map((pos) => (
                <tr
                  key={pos.key}
                  onClick={() => setSelectedAsset(pos.fullData || pos)} // NOVÁ FUNKCE
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer" // PŘIDÁN CURSOR
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {renderUnitTag(pos)}
                      <div>
                        <div className="font-black text-lg uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 italic dark:text-slate-100 leading-none">
                          {pos.symbol}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">
                          {pos.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-mono font-bold text-slate-500 dark:text-slate-400">{pos.amount.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="font-black text-lg">${pos.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Avg: ${pos.avgPrice.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className={`font-black text-lg ${getChangeColor(pos.profitLoss)}`}>
                      {pos.profitLoss >= 0 ? '+' : '-'}${Math.abs(pos.profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded mt-1 inline-block ${pos.profitLoss >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>
                      {pos.plPercent.toFixed(2)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. TRADE HISTORY SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
        <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/10 dark:bg-slate-800/10">
          <h2 className="font-black text-lg md:text-xl tracking-tight uppercase italic text-slate-400">Trade History</h2>
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic opacity-60">Settled Orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/30 dark:bg-slate-800/20 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-8 py-4">Unit</th>
                <th className="px-8 py-4">Instrument</th>
                <th className="px-8 py-4">Action</th>
                <th className="px-8 py-4 text-right">Size</th>
                <th className="px-8 py-4 text-right">Realized P/L</th>
                <th className="px-8 py-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {history.length === 0 ? (
                <tr><td colSpan="6" className="px-8 py-10 text-center text-[10px] font-black uppercase text-slate-400 opacity-30">No archive data available</td></tr>
              ) : (
                displayedHistory.map((trade) => (
                  <tr key={trade.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-8 py-4">{renderUnitTag(trade)}</td>
                    <td className="px-8 py-4 font-black italic uppercase dark:text-slate-300">{trade.symbol}</td>
                    <td className="px-8 py-4">
                      <span className={`text-[8px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${getActionStyle(trade.type)}`}>
                        {trade.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right font-mono text-xs font-bold text-slate-500">{trade.amount.toLocaleString()}</td>
                    <td className={`px-8 py-4 text-right font-mono text-xs font-bold ${getChangeColor(trade.pl)}`}>
                      {trade.pl >= 0 ? '+' : ''}${trade.pl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-4 text-right text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {history.length > 3 && (
            <div className="p-6 text-center bg-slate-50/50 dark:bg-slate-800/30">
              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {showAllHistory ? 'Show Less' : `View All Activity (${history.length})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. AI INSIGHTS */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <h2 className="font-black text-xl tracking-tight uppercase italic dark:text-white">AI Analysis</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiCoreInsights.slice(0, 3).map(insight => (
            <div
              key={insight.id}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/alerts'); // NAVIGACE NA ALERTS
              }}
              className="bg-slate-900 rounded-[2rem] p-8 text-white border border-slate-800 hover:border-blue-500 hover:scale-[1.02] cursor-pointer transition-all shadow-xl group"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[8px] font-black bg-blue-600 px-2 py-0.5 rounded uppercase tracking-widest">{insight.type}</span>
                <span className="text-[10px] font-mono text-blue-400 font-bold">{((insight.confidence || 0.9) * 100).toFixed(0)}%</span>
              </div>
              <h3 className="text-lg font-black italic uppercase mb-2 group-hover:text-blue-400 transition-colors">{insight.title}</h3>
              <p className="text-slate-400 text-xs italic opacity-80 leading-relaxed">"{insight.description}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* RENDER MODALU */}
      {selectedAsset && (
        <Modal
          item={selectedAsset}
          type="asset"
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

export default Portfolio;