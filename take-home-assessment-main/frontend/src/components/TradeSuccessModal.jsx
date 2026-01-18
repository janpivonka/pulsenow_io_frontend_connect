import React from 'react';
import { useNavigate } from 'react-router-dom';

const TradeSuccessModal = ({ isOpen, onClose, data }) => {
  const navigate = useNavigate();
  if (!isOpen || !data || data.length === 0) return null;

  const exitTrade = data.find(item => item.pl !== null && item.pl !== undefined);
  const isPositive = exitTrade ? exitTrade.pl >= 0 : true;

  // Pomocná funkce pro ikony podle typu akce
  const getActionIcon = (type) => {
    if (type.includes('INCREASED')) return '➕';
    if (type.includes('SELL') || type.includes('EXIT')) return '📉';
    if (type.includes('PROTECTION') || type.includes('MODIFIED')) return '⚙️';
    if (type.includes('OPENED')) return '🚀';
    return '✨';
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-300">

        <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          <span className="text-2xl">{exitTrade ? (isPositive ? '💰' : '📉') : '✅'}</span>
        </div>

        <h3 className="text-xl font-black italic uppercase dark:text-white tracking-tighter mb-1">
          Update Confirmed
        </h3>
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">
          {data[0]?.symbol} • Market Order
        </p>

        <div className="space-y-2 mb-8 text-left">
          {data.map((item, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border dark:border-slate-800 flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm opacity-70">{getActionIcon(item.type)}</span>
                <div>
                  {/* HLAVNÍ AKCE - Větší a výraznější */}
                  <p className="text-[11px] font-black uppercase dark:text-white leading-tight tracking-tight">
                    {item.type}
                  </p>
                  {/* DOPLŇUJÍCÍ INFO - Menší a šedé */}
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {item.pl !== null ? 'Order Executed' : 'System Updated'}
                  </p>
                </div>
              </div>

              {item.pl !== null && (
                <div className={`text-sm font-mono font-black ${item.pl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {item.pl >= 0 ? '+' : ''}${item.pl.toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {exitTrade && (
            <button
              onClick={() => { navigate('/portfolio'); onClose(); }}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase italic tracking-tighter hover:scale-[1.02] transition-transform shadow-xl"
            >
              Go to Portfolio
            </button>
          )}
          <button
            onClick={onClose}
            className={`w-full font-black uppercase italic tracking-tighter transition-all ${exitTrade ? 'py-2 text-[10px] text-slate-400 hover:text-slate-600' : 'py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl'}`}
          >
            {exitTrade ? 'Close & Stay' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeSuccessModal;