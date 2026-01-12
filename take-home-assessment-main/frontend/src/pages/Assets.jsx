import { useEffect, useMemo, useState } from 'react';
import { getStocks, getCrypto } from '../services/api';

/* ---------------- utils ---------------- */

const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};

/* ---------------- component ---------------- */

const Assets = () => {
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState('all');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const [selectedAsset, setSelectedAsset] = useState(null);

  /* ---------------- data fetch ---------------- */

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

  /* ---------------- helpers ---------------- */

  const getChangeColor = (value) =>
    value >= 0 ? 'text-green-600' : 'text-red-600';

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '⬆️' : '⬇️';
  };

  /* ---------------- derived data ---------------- */

  const filteredAssets = useMemo(() => {
    let assets = [];

    if (filter === 'stocks') {
      assets = stocks.map(a => ({ ...a, __type: 'Stock' }));
    } else if (filter === 'crypto') {
      assets = crypto.map(a => ({ ...a, __type: 'Crypto' }));
    } else {
      assets = [
        ...stocks.map(a => ({ ...a, __type: 'Stock' })),
        ...crypto.map(a => ({ ...a, __type: 'Crypto' })),
      ];
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      assets = assets.filter(
        a =>
          a.symbol?.toLowerCase().includes(q) ||
          a.name?.toLowerCase().includes(q)
      );
    }

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
  }, [stocks, crypto, filter, debouncedSearch, sortField, sortOrder]);

  /* ---------------- modal behavior ---------------- */

  useEffect(() => {
    if (!selectedAsset) return;

    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedAsset(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedAsset]);

  /* ---------------- render ---------------- */

  if (loading) return <p>Loading assets...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full max-w-full p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold">Assets</h1>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by symbol or name…"
        className="w-full md:w-1/3 px-3 py-2 border rounded-lg"
      />

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'stocks', 'crypto'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f === 'all' ? 'All' : f === 'stocks' ? 'Stocks' : 'Crypto'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md shadow">
        <table className="min-w-[700px] w-full bg-white divide-y">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {[
                ['symbol', 'Symbol'],
                ['name', 'Name'],
                ['currentPrice', 'Price'],
                ['changePercent', 'Change %'],
                ['volume', 'Volume'],
              ].map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="px-4 py-2 cursor-pointer text-left"
                >
                  {label} <span>{getSortIcon(field)}</span>
                </th>
              ))}
              <th className="px-4 py-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => (
              <tr
                key={`${asset.__type}-${asset.id}`}
                onClick={() => setSelectedAsset(asset)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-2 font-medium">{asset.symbol}</td>
                <td className="px-4 py-2">{asset.name}</td>
                <td className="px-4 py-2 text-right">
                  {asset.currentPrice
                    ? `$${asset.currentPrice.toLocaleString()}`
                    : '—'}
                </td>
                <td
                  className={`px-4 py-2 text-right ${getChangeColor(
                    asset.changePercent ?? 0
                  )}`}
                >
                  {asset.changePercent?.toFixed(2) ?? '—'}%
                </td>
                <td className="px-4 py-2 text-right">
                  {asset.volume?.toLocaleString() ?? '—'}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      asset.__type === 'Stock'
                        ? 'bg-green-200'
                        : 'bg-purple-200'
                    }`}
                  >
                    {asset.__type}
                  </span>
                </td>
              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No assets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-md space-y-3"
          >
            <h2 className="text-xl font-bold">
              {selectedAsset.name} ({selectedAsset.symbol})
            </h2>

            <p>Type: {selectedAsset.__type}</p>
            <p>Price: ${selectedAsset.currentPrice}</p>
            <p>Change: {selectedAsset.changePercent?.toFixed(2)}%</p>
            <p>Volume: {selectedAsset.volume?.toLocaleString()}</p>

            <button
              onClick={() => setSelectedAsset(null)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
