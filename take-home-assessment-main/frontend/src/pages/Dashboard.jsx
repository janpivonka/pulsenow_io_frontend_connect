import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const portfolio = data?.portfolio;
  const activeAlerts = data?.activeAlerts ?? [];
  const trackedAssets = portfolio?.watchlist ?? [];
  const recentNews = data?.recentNews ?? [];
  const topGainers = data?.topGainers ?? [];
  const topLosers = data?.topLosers ?? [];

  const formatTimestamp = (timestamp) =>
    new Date(timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const getChangeColor = (value) => (value >= 0 ? 'text-green-600' : 'text-red-600');

  const severityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-400 text-black';
      case 'info':
      default:
        return 'bg-blue-400 text-white';
    }
  };

  const categoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'ai':
        return 'bg-purple-500 text-white';
      case 'market':
        return 'bg-green-400 text-white';
      case 'regulatory':
        return 'bg-yellow-400 text-black';
      case 'crypto':
        return 'bg-indigo-400 text-white';
      case 'technology':
        return 'bg-pink-400 text-white';
      case 'macro':
        return 'bg-orange-400 text-white';
      default:
        return 'bg-gray-300 text-black';
    }
  };

  const getArrowSymbol = (value) => (value >= 0 ? '▲' : '▼');

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
        {/* Top Gainers */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform transform hover:scale-105">
          <h2 className="text-lg font-semibold mb-2">Top Gainers</h2>
          {topGainers.length > 0 ? (
            <ul className="space-y-1">
              {topGainers.slice(0, 3).map(asset => (
                <li key={asset.id} className="flex justify-between items-center hover:bg-gray-50 p-1 rounded transition-colors">
                  <span>{asset.symbol} - {asset.name}</span>
                  <span className={getChangeColor(asset.changePercent)}>
                    {asset.changePercent.toFixed(2)}% {getArrowSymbol(asset.changePercent)}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p>—</p>}
        </div>

        {/* Top Losers */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform transform hover:scale-105">
          <h2 className="text-lg font-semibold mb-2">Top Losers</h2>
          {topLosers.length > 0 ? (
            <ul className="space-y-1">
              {topLosers.slice(0, 3).map(asset => (
                <li key={asset.id} className="flex justify-between items-center hover:bg-gray-50 p-1 rounded transition-colors">
                  <span>{asset.symbol} - {asset.name}</span>
                  <span className={getChangeColor(asset.changePercent)}>
                    {asset.changePercent.toFixed(2)}% {getArrowSymbol(asset.changePercent)}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p>—</p>}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform transform hover:scale-105">
        <h2 className="text-lg font-semibold mb-2">Active Alerts</h2>
        {activeAlerts.length > 0 ? (
          <ul className="space-y-1">
            {activeAlerts.slice(0, 5).map(alert => (
              <li key={alert.id} className="flex justify-between items-center hover:bg-gray-50 p-1 rounded transition-colors">
                <span className="font-medium">{alert.message}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded ${severityColor(alert.severity)}`}>
                    {alert.severity ?? 'Info'}
                  </span>
                  <span className="text-gray-400 text-sm">{formatTimestamp(alert.timestamp)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : <p>—</p>}
      </div>

      {/* Tracked Assets */}
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-transform transform hover:scale-105">
        <h2 className="text-lg font-semibold mb-2">Tracked Assets</h2>
        {trackedAssets.length > 0 ? (
          <ul className="space-y-1">
            {trackedAssets.map(symbol => (
              <li key={symbol} className="font-medium hover:text-blue-600 transition-colors">{symbol}</li>
            ))}
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
                className="flex justify-between items-center border-l-4 pl-2 hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#3B82F6' }}
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
    </div>
  );
};

export default Dashboard;
