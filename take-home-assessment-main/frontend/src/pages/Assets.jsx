import { useEffect, useState } from 'react';
import { getStocks, getCrypto } from '../services/api';

const Assets = () => {
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stocksRes = await getStocks();
        const cryptoRes = await getCrypto();
        setStocks(stocksRes.data ?? []);
        setCrypto(cryptoRes.data ?? []);
      } catch (err) {
        console.error('Error fetching assets:', err);
        setError('Failed to load assets.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getChangeColor = (value) => (value >= 0 ? 'text-green-600' : 'text-red-600');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAssets = (() => {
    let assets;
    if (filter === 'stocks') assets = stocks;
    else if (filter === 'crypto') assets = crypto;
    else assets = [...stocks, ...crypto];

    if (sortField) {
      assets = [...assets].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return sortOrder === 'asc'
          ? (aVal ?? 0) - (bVal ?? 0)
          : (bVal ?? 0) - (aVal ?? 0);
      });
    }

    return assets;
  })();

  if (loading) return <p>Loading assets...</p>;
  if (error) return <p>{error}</p>;

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '⬆️' : '⬇️';
  };

  return (
    <div className="w-full max-w-full p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Assets</h1>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4 transition-all duration-300">
        {['all', 'stocks', 'crypto'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 min-w-0 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-300 truncate whitespace-nowrap
              ${filter === f ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            {f === 'all' ? 'All' : f === 'stocks' ? 'Stocks Only' : 'Crypto Only'}
          </button>
        ))}
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto w-full shadow-sm rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scroll-smooth">
        <table className="min-w-[600px] w-full table-auto bg-white divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 shadow-md z-10">
            <tr>
              <th
                className="px-4 py-2 text-left font-medium cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort('symbol')}
              >
                Symbol <span className="ml-1">{getSortIcon('symbol')}</span>
              </th>
              <th
                className="px-4 py-2 text-left font-medium cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort('name')}
              >
                Name <span className="ml-1">{getSortIcon('name')}</span>
              </th>
              <th
                className="px-4 py-2 text-right font-medium cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort('currentPrice')}
              >
                Price <span className="ml-1">{getSortIcon('currentPrice')}</span>
              </th>
              <th
                className="px-4 py-2 text-right font-medium cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort('changePercent')}
              >
                Change % <span className="ml-1">{getSortIcon('changePercent')}</span>
              </th>
              <th
                className="px-4 py-2 text-right font-medium cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort('volume')}
              >
                Volume <span className="ml-1">{getSortIcon('volume')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-4 py-2 font-medium">{asset.symbol}</td>
                <td className="px-4 py-2 truncate">{asset.name}</td>
                <td className="px-4 py-2 text-right">
                  {asset.currentPrice !== undefined
                    ? `$${asset.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : '—'}
                </td>
                <td className={`px-4 py-2 text-right ${getChangeColor(asset.changePercent ?? 0)}`}>
                  {asset.changePercent !== undefined ? asset.changePercent.toFixed(2) + '%' : '—'}
                </td>
                <td className="px-4 py-2 text-right">
                  {asset.volume !== undefined ? asset.volume.toLocaleString() : '—'}
                </td>
              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                  No assets to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assets;
