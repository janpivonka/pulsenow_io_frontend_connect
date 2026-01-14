import { useEffect, useState } from 'react';
import { getStocks, getCrypto, getNews, getPortfolio } from '../services/api';
import Modal from '../components/Modal';

const Dashboard = () => {
  const [data, setData] = useState({
    portfolio: null,
    topGainers: [],
    topLosers: [],
    recentNews: [],
  });
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'asset' | 'news'

  // --- Fetch all dashboard data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksRes, cryptoRes, newsRes, portfolioRes] = await Promise.all([
          getStocks(),
          getCrypto(),
          getNews(),
          getPortfolio(),
        ]);

        const stocksData = stocksRes.data;
        const cryptoData = cryptoRes.data;

        // Top Gainers / Top Losers
        const combinedAssets = [...stocksData, ...cryptoData];
        const topGainers = combinedAssets
          .sort((a, b) => b.changePercent - a.changePercent)
          .slice(0, 5)
          .map(item => ({
            ...item,
            __type: stocksData.find(s => s.id === item.id) ? 'Stock' : 'Crypto',
          }));

        const topLosers = combinedAssets
          .sort((a, b) => a.changePercent - b.changePercent)
          .slice(0, 5)
          .map(item => ({
            ...item,
            __type: stocksData.find(s => s.id === item.id) ? 'Stock' : 'Crypto',
          }));

        setStocks(stocksData);
        setCrypto(cryptoData);
        setData({
          portfolio: portfolioRes.data,
          topGainers,
          topLosers,
          recentNews: newsRes.data,
        });
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Modal Esc key handling ---
  useEffect(() => {
    if (!selectedItem) return;
    document.body.style.overflow = 'hidden';
    const onKey = e => { if (e.key === 'Escape') setSelectedItem(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedItem]);

  // --- Helpers ---
  const formatTimestamp = (timestamp) =>
    new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const getChangeColor = (value) => value >= 0 ? 'text-green-700' : 'text-red-700';

  const categoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'ai': return 'bg-purple-200 text-purple-800';
      case 'market': return 'bg-green-200 text-green-800';
      case 'regulatory': return 'bg-yellow-200 text-yellow-800';
      case 'crypto': return 'bg-indigo-200 text-indigo-800';
      case 'technology': return 'bg-pink-200 text-pink-800';
      case 'macro': return 'bg-orange-200 text-orange-800';
      case 'earnings': return 'bg-green-100 text-green-900';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getArrowSymbol = (value) => (value >= 0 ? '▲' : '▼');

  const portfolio = data.portfolio;

  // Tracked assets (watchlist)
  const trackedAssets = (portfolio?.watchlist ?? [])
    .map(sym => {
      const stock = stocks.find(s => s.symbol === sym);
      if (stock) return { ...stock, __type: 'Stock' };
      const cryptoAsset = crypto.find(c => c.symbol === sym);
      if (cryptoAsset) return { ...cryptoAsset, __type: 'Crypto' };
      return null;
    })
    .filter(Boolean);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {/* Portfolio Summary */}
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform transform hover:scale-105 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Total Portfolio Value</h2>
          <p className="text-2xl mt-2">
            {portfolio?.totalValue?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '—'}
          </p>
          <p className={`mt-1 ${getChangeColor(portfolio?.totalChange)}`}>
            {portfolio?.totalChange?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '—'} (
            {portfolio?.totalChangePercent?.toFixed(2) ?? '—'}%) {getArrowSymbol(portfolio?.totalChange)}
          </p>
        </div>
      </div>

      {/* Top Gainers & Losers */}
      <div className="grid md:grid-cols-2 gap-6">
        {[{ title: 'Top Gainers', list: data.topGainers }, { title: 'Top Losers', list: data.topLosers }].map(({ title, list }) => (
          <div key={title} className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform transform hover:scale-105">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            {list.length > 0 ? (
              <ul className="space-y-1">
                {list.map(asset => (
                  <li
                    key={asset.id}
                    className="flex justify-between items-center hover:bg-gray-50 p-1 rounded transition-colors cursor-pointer"
                    onClick={() => { setSelectedItem(asset); setSelectedType('asset'); }}
                  >
                    <span>{asset.symbol} - {asset.name}</span>
                    <span className={`font-semibold ${getChangeColor(asset.changePercent)}`}>
                      {asset.changePercent?.toFixed(2)}% {getArrowSymbol(asset.changePercent)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p>—</p>}
          </div>
        ))}
      </div>

      {/* Tracked Assets */}
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform transform hover:scale-105">
        <h2 className="text-lg font-semibold mb-2">Tracked Assets</h2>
        {trackedAssets.length > 0 ? (
          <ul className="space-y-1">
            {trackedAssets.map(asset => (
              <li
                key={asset.id}
                className="font-medium hover:text-blue-600 transition-colors cursor-pointer"
                onClick={() => { setSelectedItem(asset); setSelectedType('asset'); }}
              >
                {asset.symbol}
              </li>
            ))}
          </ul>
        ) : <p>—</p>}
      </div>

      {/* Recent News */}
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform transform hover:scale-105">
        <h2 className="text-lg font-semibold mb-2">Recent News</h2>
        {data.recentNews.length > 0 ? (
          <ul className="space-y-2">
            {data.recentNews.map(news => (
              <li
                key={news.id}
                className="flex justify-between items-center border-l-4 pl-2 hover:bg-gray-50 transition-colors cursor-pointer"
                style={{ borderColor: '#3B82F6' }}
                onClick={() => { setSelectedItem(news); setSelectedType('news'); }}
              >
                <div>
                  <span className={`px-2 py-1 text-xs rounded ${categoryColor(news.category)}`}>
                    {news.category ?? 'General'}
                  </span>
                  <p className="font-medium">{news.title}</p>
                  <p className="text-sm text-gray-500">{news.source}</p>
                </div>
                <span className="text-gray-400 text-sm">{formatTimestamp(news.timestamp)}</span>
              </li>
            ))}
          </ul>
        ) : <p>—</p>}
      </div>

      {/* Modal */}
      {selectedItem && (
        <Modal item={selectedItem} type={selectedType} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

export default Dashboard;
