import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'asset' | 'news'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboard();
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setSelectedItem(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedItem]);

  const formatTimestamp = (timestamp) =>
    new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const getChangeColor = (value) =>
    value >= 0 ? 'text-green-700' : 'text-red-700';

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

  const portfolio = data?.portfolio;
  const trackedAssets = portfolio?.watchlist ?? [];
  const recentNews = data?.recentNews ?? [];
  const topGainers = data?.topGainers ?? [];
  const topLosers = data?.topLosers ?? [];

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
        {[{ title: 'Top Gainers', list: topGainers }, { title: 'Top Losers', list: topLosers }].map(({ title, list }) => (
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
                      {asset.changePercent.toFixed(2)}% {getArrowSymbol(asset.changePercent)}
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
            {trackedAssets.map(symbol => {
              const asset = [...topGainers, ...topLosers].find(a => a.symbol === symbol);
              return (
                <li
                  key={symbol}
                  className="font-medium hover:text-blue-600 transition-colors cursor-pointer"
                  onClick={() => asset && (setSelectedItem(asset), setSelectedType('asset'))}
                >
                  {symbol}
                </li>
              );
            })}
          </ul>
        ) : <p>—</p>}
      </div>

      {/* Recent News */}
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform transform hover:scale-105">
        <h2 className="text-lg font-semibold mb-2">Recent News</h2>
        {recentNews.length > 0 ? (
          <ul className="space-y-2">
            {recentNews.map(news => (
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
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedItem(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-md space-y-3 relative shadow-lg"
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            {selectedType === 'asset' && (
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{selectedItem.name} ({selectedItem.symbol})</h2>
                <p className={`px-3 py-1 rounded ${selectedItem.changePercent >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  Price: ${selectedItem.currentPrice}
                </p>
                <p className={`px-3 py-1 rounded ${selectedItem.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Change: {selectedItem.changePercent?.toFixed(2)}% {getArrowSymbol(selectedItem.changePercent)}
                </p>
                <p className="bg-gray-50 px-3 py-1 rounded">Volume: {selectedItem.volume?.toLocaleString()}</p>
              </div>
            )}

            {selectedType === 'news' && (
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{selectedItem.title}</h2>
                <p className="text-sm text-gray-500 mb-2">{selectedItem.source} | {formatTimestamp(selectedItem.timestamp)}</p>
                <p className="bg-gray-50 px-3 py-1 rounded">{selectedItem.summary ?? 'No summary available.'}</p>
                <p className="bg-yellow-50 px-3 py-1 rounded">Impact: {selectedItem.impact ?? '—'}</p>
                <p className="bg-purple-50 px-3 py-1 rounded">Affected Assets: {(selectedItem.affectedAssets ?? []).join(', ') || '—'}</p>
                <p className="bg-indigo-50 px-3 py-1 rounded">Sentiment: {selectedItem.sentiment ?? '—'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
