import { useState, useMemo, useEffect } from 'react';
import Modal from '../components/Modal';
import { useRealTimeData } from '../services/useRealTimeData';

const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useMemo(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

const Assets = () => {
  const { stocks, crypto } = useRealTimeData();
  const [filter, setFilter] = useState('all');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const getChangeColor = (value) => (value >= 0 ? 'text-green-600' : 'text-red-600');

  const handleSort = (field) => {
    // pouze Symbol a Name se třídí
    if (!['symbol', 'name'].includes(field)) return;

    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (!['symbol', 'name'].includes(field)) return ''; // bez ikony pro ne-tříditelné
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '⬆️' : '⬇️';
  };

  const filteredAssets = useMemo(() => {
    let assets = [];
    if (filter === 'stocks') assets = stocks.map(a => ({ ...a, __type: 'Stock' }));
    else if (filter === 'crypto') assets = crypto.map(a => ({ ...a, __type: 'Crypto' }));
    else assets = [
      ...stocks.map(a => ({ ...a, __type: 'Stock' })),
      ...crypto.map(a => ({ ...a, __type: 'Crypto' }))
    ];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      assets = assets.filter(a => a.symbol?.toLowerCase().includes(q) || a.name?.toLowerCase().includes(q));
    }

    if (sortField) {
      assets = [...assets].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    return assets;
  }, [stocks, crypto, filter, debouncedSearch, sortField, sortOrder]);

  // správný způsob pro Escape a body overflow
  useEffect(() => {
    if (!selectedAsset) return;

    const onKey = (e) => { if (e.key === 'Escape') setSelectedAsset(null); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedAsset]);

  return (
    <div className="w-full max-w-full p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold">Assets</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by symbol or name…"
        className="w-full md:w-1/3 px-3 py-2 border rounded-lg"
      />

      <div className="flex gap-2">
        {['all', 'stocks', 'crypto'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium ${filter === f ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {f === 'all' ? 'All' : f === 'stocks' ? 'Stocks' : 'Crypto'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-md shadow">
        <table className="min-w-[700px] w-full bg-white divide-y text-center">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {[
                ['symbol', 'Symbol'],
                ['name', 'Name'],
                ['currentPrice', 'Price'],
                ['changePercent', 'Change %'],
                ['volume', 'Volume']
              ].map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`px-4 py-2 cursor-pointer ${['symbol','name'].includes(field) ? 'cursor-pointer' : ''}`}
                >
                  {label} <span>{getSortIcon(field)}</span>
                </th>
              ))}
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
                <td className={`px-4 py-2 ${getChangeColor(asset.changePercent ?? 0)}`}>
                  ${asset.currentPrice?.toLocaleString() ?? '—'}
                </td>
                <td className={`px-4 py-2 ${getChangeColor(asset.changePercent ?? 0)}`}>
                  {asset.changePercent?.toFixed(2) ?? '—'}% {asset.changePercent >= 0 ? '▲' : '▼'}
                </td>
                <td className="px-4 py-2">{asset.volume?.toLocaleString() ?? '—'}</td>
              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">No assets found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedAsset && (
        <Modal item={selectedAsset} type="asset" onClose={() => setSelectedAsset(null)} />
      )}
    </div>
  );
};

export default Assets;
