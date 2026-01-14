import React from 'react';

const Modal = ({ item, type, onClose }) => {
  const getChangeColor = (value) => value >= 0 ? 'text-green-700' : 'text-red-700';
  const getArrowSymbol = (value) => value >= 0 ? '▲' : '▼';

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-lg p-6 w-full max-w-md space-y-3 relative shadow-lg text-left"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
        >
          ✖
        </button>

        {type === 'asset' && (
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{item.name} ({item.symbol})</h2>

            <p className={`inline-block px-2 py-1 text-xs rounded ${
              item.__type === 'Stock' ? 'bg-green-200 text-green-800' : 'bg-purple-200 text-purple-800'
            }`}>
              {item.__type}
            </p>

            <p className={`px-3 py-1 rounded ${item.changePercent >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              Price: ${item.currentPrice?.toLocaleString() ?? '—'}
            </p>

            <p className={`px-3 py-1 rounded ${item.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Change: {item.changePercent?.toFixed(2) ?? '—'}% {getArrowSymbol(item.changePercent)}
            </p>

            <p className="bg-gray-50 px-3 py-1 rounded">
              Volume: {item.volume?.toLocaleString() ?? '—'}
            </p>
          </div>
        )}

        {type === 'news' && (
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{item.title}</h2>
            <p className="text-sm text-gray-500 mb-2">
              {item.source} | {new Date(item.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            <p className="bg-gray-50 px-3 py-1 rounded">{item.summary ?? 'No summary available.'}</p>
            <p className="bg-yellow-50 px-3 py-1 rounded">Impact: {item.impact ?? '—'}</p>
            <p className="bg-purple-50 px-3 py-1 rounded">Affected Assets: {(item.affectedAssets ?? []).join(', ') || '—'}</p>
            <p className="bg-indigo-50 px-3 py-1 rounded">Sentiment: {item.sentiment ?? '—'}</p>
          </div>
        )}
      </div>

      {/* Fade-in animation */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Modal;
