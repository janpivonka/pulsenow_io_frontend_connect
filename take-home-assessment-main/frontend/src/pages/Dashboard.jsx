import { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Modal from '../components/Modal';
import { useRealTimeData } from '../services/useRealTimeData';

const Dashboard = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const { stocks = [], crypto = [], news = [], portfolio = {} } = useRealTimeData();

  const allAssets = useMemo(() => [...stocks, ...crypto], [stocks, crypto]);

  // 1. DYNAMICKÝ VÝPOČET AKTUÁLNÍHO PORTFOLIA
  const dynamicStats = useMemo(() => {
    if (!portfolio.assets || allAssets.length === 0) {
      return { total: portfolio.totalValue || 0, changePercent: portfolio.totalChangePercent || 0 };
    }

    let currentAssetsValue = 0;
    let totalCost = 0;

    portfolio.assets.forEach(item => {
      const live = allAssets.find(a => a.symbol === item.assetId);
      const price = live?.currentPrice || item.currentPrice;
      currentAssetsValue += price * item.quantity;
      totalCost += item.avgBuyPrice * item.quantity;
    });

    const cash = portfolio.cashBalance || 0;
    const total = currentAssetsValue + cash;
    const cost = totalCost + cash;
    const changePercent = ((total - cost) / cost) * 100;

    return { total, changePercent };
  }, [allAssets, portfolio]);

  // 2. VÝPOČET DAT PRO GRAF S ŽIVÝM KONCEM
  const chartData = useMemo(() => {
    if (!portfolio.assets || allAssets.length === 0) return [];

    // Použijeme časové osy z prvního assetu (všechny mají v mocku 30 dní)
    const timePoints = allAssets[0]?.priceHistory || [];

    const history = timePoints.map((point, index) => {
      let totalValueAtTime = portfolio.cashBalance || 0;

      portfolio.assets.forEach(myAsset => {
        const marketAsset = allAssets.find(a => a.symbol === myAsset.assetId);
        if (marketAsset && marketAsset.priceHistory[index]) {
          totalValueAtTime += marketAsset.priceHistory[index].price * myAsset.quantity;
        }
      });

      return {
        date: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseFloat(totalValueAtTime.toFixed(2))
      };
    });

    // NAHRAZENÍ POSLEDNÍHO BODU ŽIVOU HODNOTOU
    if (history.length > 0) {
      history[history.length - 1] = {
        date: 'LIVE',
        value: parseFloat(dynamicStats.total.toFixed(2))
      };
    }

    return history;
  }, [allAssets, portfolio, dynamicStats.total]);

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

      {/* PORTFOLIO SUMMARY & CHART SECTION */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
        <div className="p-6 md:p-10 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Net Worth</h2>
            <div className="flex flex-wrap items-baseline gap-2 md:gap-6">
              <span className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter">
                ${dynamicStats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className={`text-sm md:text-xl font-bold px-3 py-1 rounded-xl bg-slate-50 ${getChangeColor(dynamicStats.changePercent)}`}>
                {getArrow(dynamicStats.changePercent)} {Math.abs(dynamicStats.changePercent).toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
             <span className="text-[10px] font-black px-3 py-1 bg-blue-50 text-blue-600 rounded-full uppercase">30D Performance</span>
          </div>
        </div>

        {/* CHART AREA */}
        <div className="h-[250px] md:h-[350px] w-full mt-4 -ml-4 pr-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{fontSize: 10, fontWeight: 'bold', fill: '#cbd5e1'}}
                minTickGap={40}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px' }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorValue)"
                isAnimationActive={false} // Zajišťuje okamžitou reakci na Live data
              />
            </AreaChart>
          </ResponsiveContainer>
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
                  <span className="font-bold text-sm md:text-base uppercase">{asset.symbol}</span>
                  <span className={`font-mono font-bold text-xs md:text-sm ${getChangeColor(asset.changePercent)}`}>
                    {getArrow(asset.changePercent)} {Math.abs(asset.changePercent).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* WATCHLIST */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Watchlist</h3>
        <div className="flex flex-wrap gap-2 md:gap-4">
          {trackedAssets.map(asset => (
            <button key={asset.symbol} onClick={() => {setSelectedItem(asset); setSelectedType('asset');}}
              className="px-6 py-3 bg-slate-50 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border border-slate-100 hover:bg-slate-900 hover:text-white">
              {asset.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* INTELLIGENCE FEED */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-blue-600">Intelligence Stream</h3>
        <div className="divide-y divide-slate-50">
          {news.slice(0, 4).map(n => (
            <div key={n.id} onClick={() => {setSelectedItem(n); setSelectedType('news');}}
              className="py-5 first:pt-0 last:pb-0 cursor-pointer group">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{n.category} • {n.source}</span>
              <h4 className="font-bold text-sm md:text-lg leading-tight group-hover:text-blue-600 transition-colors">{n.title}</h4>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && <Modal item={selectedItem} type={selectedType} onClose={() => setSelectedItem(null)} />}
    </div>
  );
};

export default Dashboard;